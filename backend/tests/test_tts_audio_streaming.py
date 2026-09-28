import pytest
from fastapi.testclient import TestClient
from app.core.security import create_access_token

@pytest.mark.asyncio
async def test_tts_audio_stream_and_speaking_state(monkeypatch):
    from app.main import app
    from app.services.transcribe import MockTranscribeService
    from app.services.agent import MockBedrockAgentService
    from app.services.tts import MockTTSService
    import app.api.ws as ws_module

    # Mock STT
    mock_stt = MockTranscribeService(
        partial_texts=[],
        final_text="Good morning"
    )
    monkeypatch.setattr(ws_module, "get_transcribe_service", lambda: mock_stt)

    # Mock Agent
    mock_agent = MockBedrockAgentService(
        response_text="Good morning! How are you feeling today?",
        suggestions=[]
    )
    monkeypatch.setattr(ws_module, "get_agent_service", lambda: mock_agent)

    # Mock TTS service yielding audio frames
    mock_tts = MockTTSService(audio_chunks=[b"RIFF_FAKE_AUDIO_1", b"RIFF_FAKE_AUDIO_2"])
    monkeypatch.setattr(ws_module, "get_tts_service", lambda: mock_tts)

    valid_token = create_access_token({"sub": "user-789", "email": "learner@example.com"})
    client = TestClient(app)

    with client.websocket_connect(f"/ws/user-789?token={valid_token}") as ws:
        ws.send_json({"type": "session_start", "topic": "daily-life", "sessionId": "sess-789"})
        assert ws.receive_json()["type"] == "voice_state"

        # Send user audio
        ws.send_bytes(b"\x00\x01\x02\x03" * 50)

        # Transcribe message
        t_msg = ws.receive_json()
        assert t_msg["type"] == "transcript"

        # Processing state
        p_state = ws.receive_json()
        assert p_state["type"] == "voice_state" and p_state["state"] == "PROCESSING"

        # Agent text message
        agent_msg = ws.receive_json()
        assert agent_msg["type"] == "agent_text"

        # Voice state transitions to SPEAKING
        sp_state = ws.receive_json()
        assert sp_state["type"] == "voice_state" and sp_state["state"] == "SPEAKING"

        # Receive binary audio frames from TTS
        audio_frame1 = ws.receive_bytes()
        assert audio_frame1 == b"RIFF_FAKE_AUDIO_1"
        audio_frame2 = ws.receive_bytes()
        assert audio_frame2 == b"RIFF_FAKE_AUDIO_2"

        # Final state transitions back to IDLE
        idle_state = ws.receive_json()
        assert idle_state["type"] == "voice_state" and idle_state["state"] == "IDLE"
