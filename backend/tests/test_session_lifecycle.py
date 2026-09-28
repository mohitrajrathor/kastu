import pytest
import boto3
import time
from moto import mock_aws
from fastapi.testclient import TestClient
from app.core.security import create_access_token
from app.core.config import get_settings

settings = get_settings()

@pytest.fixture
def dynamo_with_sessions():
    with mock_aws():
        dynamodb = boto3.resource("dynamodb", region_name="ap-south-1")
        # users
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
        # sessions
        dynamodb.create_table(
            TableName=settings.dynamodb_table_sessions,
            KeySchema=[
                {"AttributeName": "userId", "KeyType": "HASH"},
                {"AttributeName": "sessionId#startedAt", "KeyType": "RANGE"}
            ],
            AttributeDefinitions=[
                {"AttributeName": "userId", "AttributeType": "S"},
                {"AttributeName": "sessionId#startedAt", "AttributeType": "S"}
            ],
            BillingMode="PAY_PER_REQUEST"
        )
        # ws_connections
        dynamodb.create_table(
            TableName=settings.dynamodb_table_ws_connections,
            KeySchema=[{"AttributeName": "connectionId", "KeyType": "HASH"}],
            AttributeDefinitions=[{"AttributeName": "connectionId", "AttributeType": "S"}],
            BillingMode="PAY_PER_REQUEST"
        )
        yield dynamodb

@pytest.mark.asyncio
async def test_session_lifecycle_and_persistence(dynamo_with_sessions, monkeypatch):
    from app.main import app
    from app.services.transcribe import MockTranscribeService
    from app.services.agent import MockBedrockAgentService
    import app.api.ws as ws_module

    mock_stt = MockTranscribeService(partial_texts=[], final_text="Hello Kastu")
    monkeypatch.setattr(ws_module, "get_transcribe_service", lambda: mock_stt)

    mock_agent = MockBedrockAgentService(response_text="Hello! Nice to meet you.", suggestions=[])
    monkeypatch.setattr(ws_module, "get_agent_service", lambda: mock_agent)

    valid_token = create_access_token({"sub": "user-lifecycle", "email": "learner@example.com"})
    client = TestClient(app)

    with client.websocket_connect(f"/ws/user-lifecycle?token={valid_token}") as ws:
        # Start session
        session_id = "sess-lifecycle-1"
        ws.send_json({"type": "session_start", "topic": "daily-life", "sessionId": session_id})
        assert ws.receive_json()["type"] == "voice_state"

        # Verify ws_connections table has active record
        ws_table = dynamo_with_sessions.Table(settings.dynamodb_table_ws_connections)
        connections = ws_table.scan().get("Items", [])
        assert len(connections) >= 1

        # Simulate speaking 1 turn
        ws.send_bytes(b"\x00\x01\x02\x03" * 50)
        assert ws.receive_json()["type"] == "transcript"
        assert ws.receive_json()["type"] == "voice_state"
        assert ws.receive_json()["type"] == "agent_text"
        assert ws.receive_json()["type"] == "voice_state"  # SPEAKING
        # Read audio chunk
        ws.receive_bytes()
        assert ws.receive_json()["type"] == "voice_state"  # IDLE

        # End session
        ws.send_json({"type": "session_end", "sessionId": session_id})
        summary_msg = ws.receive_json()
        assert summary_msg["type"] == "session_summary"
        assert summary_msg["sessionId"] == session_id
        assert summary_msg["turnCount"] >= 1
        assert "durationSeconds" in summary_msg

        # Verify DynamoDB sessions table has saved record
        sessions_table = dynamo_with_sessions.Table(settings.dynamodb_table_sessions)
        records = sessions_table.query(
            KeyConditionExpression="userId = :uid",
            ExpressionAttributeValues={":uid": "user-lifecycle"}
        ).get("Items", [])
        assert len(records) == 1
        rec = records[0]
        assert rec["mode"] == "conversation"
        assert rec["topic"] == "daily-life"
        assert rec["turnCount"] >= 1
        assert rec["durationSeconds"] >= 0
