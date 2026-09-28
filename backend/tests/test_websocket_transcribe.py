import pytest
import json
from fastapi.testclient import TestClient
from app.core.security import create_access_token

@pytest.mark.asyncio
async def test_websocket_auth_rejection():
    from app.main import app
    client = TestClient(app)
    
    # 1. No token -> rejected
    with pytest.raises(Exception):
        with client.websocket_connect("/ws/user-123"):
            pass

    # 2. Invalid token -> rejected
    with pytest.raises(Exception):
        with client.websocket_connect("/ws/user-123?token=invalid.token.here"):
            pass

@pytest.mark.asyncio
async def test_websocket_session_and_transcript_flow(monkeypatch):
    from app.main import app
    from app.services.transcribe import MockTranscribeService
    import app.api.ws as ws_module

    # Inject mock transcribe service
    mock_stt = MockTranscribeService(
        partial_texts=["I am go", "I am going to"],
        final_text="I am going to the market"
    )
    monkeypatch.setattr(ws_module, "get_transcribe_service", lambda: mock_stt)

    valid_token = create_access_token({"sub": "user-123", "email": "test@example.com"})
    client = TestClient(app)

    with client.websocket_connect(f"/ws/user-123?token={valid_token}") as ws:
        # Start session
        ws.send_json({"type": "session_start", "topic": "daily-life", "sessionId": "sess-123"})

        # Initial state should be IDLE
        init_state = ws.receive_json()
        assert init_state["type"] == "voice_state"
        assert init_state["state"] == "IDLE"

        # Send binary audio frame
        ws.send_bytes(b"\x00\x01\x02\x03" * 100)

        # Receive first partial transcript
        msg1 = ws.receive_json()
        assert msg1["type"] == "transcript"
        assert msg1["isPartial"] is True
        assert msg1["text"] == "I am go"

        # Receive second partial transcript
        msg2 = ws.receive_json()
        assert msg2["type"] == "transcript"
        assert msg2["isPartial"] is True
        assert msg2["text"] == "I am going to"

        # Receive final transcript
        msg3 = ws.receive_json()
        assert msg3["type"] == "transcript"
        assert msg3["isPartial"] is False
        assert msg3["text"] == "I am going to the market"

        # State should transition to PROCESSING
        state_msg = ws.receive_json()
        assert state_msg["type"] == "voice_state"
        assert state_msg["state"] == "PROCESSING"
