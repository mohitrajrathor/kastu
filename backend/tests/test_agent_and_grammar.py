import pytest
import boto3
from moto import mock_aws
from fastapi.testclient import TestClient
from app.core.security import create_access_token
from app.core.config import get_settings

settings = get_settings()

@pytest.fixture
def dynamo_with_errors_table():
    with mock_aws():
        dynamodb = boto3.resource("dynamodb", region_name="ap-south-1")
        # Users
        dynamodb.create_table(
            TableName=settings.dynamodb_table_users,
            KeySchema=[{"AttributeName": "userId", "KeyType": "HASH"}],
            AttributeDefinitions=[
                {"AttributeName": "userId", "AttributeType": "S"},
                {"AttributeName": "email", "AttributeType": "S"}
            ],
            GlobalSecondaryIndexes=[
                {
                    "IndexName": "email-index",
                    "KeySchema": [{"AttributeName": "email", "KeyType": "HASH"}],
                    "Projection": {"ProjectionType": "ALL"}
                }
            ],
            BillingMode="PAY_PER_REQUEST"
        )
        # Grammar errors
        dynamodb.create_table(
            TableName=settings.dynamodb_table_grammar_errors,
            KeySchema=[
                {"AttributeName": "userId", "KeyType": "HASH"},
                {"AttributeName": "timestamp", "KeyType": "RANGE"}
            ],
            AttributeDefinitions=[
                {"AttributeName": "userId", "AttributeType": "S"},
                {"AttributeName": "timestamp", "AttributeType": "S"}
            ],
            BillingMode="PAY_PER_REQUEST"
        )
        yield dynamodb

@pytest.mark.asyncio
async def test_agent_generates_dialogue_and_grammar_suggestions(dynamo_with_errors_table, monkeypatch):
    from app.main import app
    from app.services.transcribe import MockTranscribeService
    from app.services.agent import MockBedrockAgentService
    import app.api.ws as ws_module

    # Mock Transcribe returning utterance with a grammar error
    mock_stt = MockTranscribeService(
        partial_texts=["I am go"],
        final_text="I am go to the market"
    )
    monkeypatch.setattr(ws_module, "get_transcribe_service", lambda: mock_stt)

    # Mock Bedrock Agent returning dual output
    mock_agent = MockBedrockAgentService(
        response_text="Going to the market sounds nice! What will you buy?",
        suggestions=[
            {
                "original": "I am go to the market",
                "corrected": "I am going to the market",
                "error_type": "verb_form",
                "explanation": "Use present continuous 'going' after 'am'."
            }
        ]
    )
    monkeypatch.setattr(ws_module, "get_agent_service", lambda: mock_agent)

    valid_token = create_access_token({"sub": "user-456", "email": "learner@example.com"})
    client = TestClient(app)

    with client.websocket_connect(f"/ws/user-456?token={valid_token}") as ws:
        # Start session
        ws.send_json({"type": "session_start", "topic": "daily-life", "sessionId": "sess-456"})
        assert ws.receive_json()["type"] == "voice_state"

        # Send audio chunk
        ws.send_bytes(b"\x01\x02\x03\x04" * 50)

        # Transcript partial & final
        msg1 = ws.receive_json()
        assert msg1["type"] == "transcript" and msg1["isPartial"] is True
        msg2 = ws.receive_json()
        assert msg2["type"] == "transcript" and msg2["isPartial"] is False
        assert msg2["text"] == "I am go to the market"

        # State -> PROCESSING
        state1 = ws.receive_json()
        assert state1["type"] == "voice_state" and state1["state"] == "PROCESSING"

        # Agent response text message
        agent_msg = ws.receive_json()
        assert agent_msg["type"] == "agent_text"
        assert "Going to the market" in agent_msg["text"]

        # Grammar suggestion message
        sugg_msg = ws.receive_json()
        assert sugg_msg["type"] == "suggestion"
        assert len(sugg_msg["corrections"]) == 1
        assert sugg_msg["corrections"][0]["original"] == "I am go to the market"

        # Verify DynamoDB grammar_errors table has record
        table = dynamo_with_errors_table.Table(settings.dynamodb_table_grammar_errors)
        records = table.query(
            KeyConditionExpression="userId = :uid",
            ExpressionAttributeValues={":uid": "user-456"}
        ).get("Items", [])
        assert len(records) == 1
        assert records[0]["original"] == "I am go to the market"
        assert records[0]["corrected"] == "I am going to the market"

@pytest.mark.asyncio
async def test_guardrail_violation_fallback(dynamo_with_errors_table, monkeypatch):
    from app.main import app
    from app.services.transcribe import MockTranscribeService
    from app.services.agent import MockBedrockAgentService
    import app.api.ws as ws_module

    mock_stt = MockTranscribeService(
        partial_texts=[],
        final_text="unsafe speech content"
    )
    monkeypatch.setattr(ws_module, "get_transcribe_service", lambda: mock_stt)

    # Agent with guardrail intervention
    mock_agent = MockBedrockAgentService(
        response_text="Let's keep our conversation focused on our practice topic. What would you like to talk about?",
        suggestions=[],
        guardrail_triggered=True
    )
    monkeypatch.setattr(ws_module, "get_agent_service", lambda: mock_agent)

    valid_token = create_access_token({"sub": "user-456", "email": "learner@example.com"})
    client = TestClient(app)

    with client.websocket_connect(f"/ws/user-456?token={valid_token}") as ws:
        ws.send_json({"type": "session_start", "topic": "daily-life", "sessionId": "sess-456"})
        assert ws.receive_json()["type"] == "voice_state"

        ws.send_bytes(b"\x01\x02\x03\x04" * 50)
        assert ws.receive_json()["type"] == "transcript"
        assert ws.receive_json()["type"] == "voice_state"

        # Agent returns safe fallback without error exposure
        agent_msg = ws.receive_json()
        assert agent_msg["type"] == "agent_text"
        assert "focused on our practice topic" in agent_msg["text"]

        # No grammar errors logged
        table = dynamo_with_errors_table.Table(settings.dynamodb_table_grammar_errors)
        records = table.query(
            KeyConditionExpression="userId = :uid",
            ExpressionAttributeValues={":uid": "user-456"}
        ).get("Items", [])
        assert len(records) == 0
