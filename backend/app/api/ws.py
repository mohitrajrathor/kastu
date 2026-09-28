import json
import time
import uuid
from datetime import datetime, timezone
from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Query
from typing import Optional, List, Dict, Any

from app.core.config import get_settings
from app.core.security import decode_access_token
from app.services.transcribe import get_transcribe_service
from app.services.agent import get_agent_service, AgentTurnOutput
from app.services.tts import get_tts_service
from app.services.dynamo import get_dynamodb_resource

router = APIRouter(tags=["websocket"])
settings = get_settings()

@router.websocket("/ws/{user_id}")
async def websocket_endpoint(
    websocket: WebSocket,
    user_id: str,
    token: Optional[str] = Query(None)
):
    if not token:
        await websocket.close(code=4001, reason="Missing authentication token")
        return

    payload = decode_access_token(token)
    if not payload or payload.get("sub") != user_id:
        await websocket.close(code=4001, reason="Invalid or expired authentication token")
        return

    await websocket.accept()

    transcribe_service = get_transcribe_service()
    agent_service = get_agent_service()
    tts_service = get_tts_service()
    dynamodb = get_dynamodb_resource()

    connection_id = str(uuid.uuid4())
    session_id: Optional[str] = None
    topic: str = "daily-life"
    history: List[Dict[str, str]] = []
    turn_count: int = 0
    start_time: float = time.time()
    start_iso: str = datetime.now(timezone.utc).isoformat()

    # Track in websocket_connections table
    try:
        ws_table = dynamodb.Table(settings.dynamodb_table_ws_connections)
        ws_table.put_item(
            Item={
                "connectionId": connection_id,
                "userId": user_id,
                "connectedAt": start_iso,
                "ttl": int(time.time() + 1800)
            }
        )
    except Exception:
        pass

    try:
        while True:
            message = await websocket.receive()
            if "text" in message:
                try:
                    data = json.loads(message["text"])
                except Exception:
                    continue

                msg_type = data.get("type")
                if msg_type == "session_start":
                    session_id = data.get("sessionId")
                    topic = data.get("topic", "daily-life")
                    start_time = time.time()
                    start_iso = datetime.now(timezone.utc).isoformat()
                    turn_count = 0
                    await websocket.send_json({
                        "type": "voice_state",
                        "state": "IDLE",
                        "sessionId": session_id
                    })

                elif msg_type == "session_end":
                    duration = max(1, int(time.time() - start_time))
                    # Persist session record
                    try:
                        sessions_table = dynamodb.Table(settings.dynamodb_table_sessions)
                        sessions_table.put_item(
                            Item={
                                "userId": user_id,
                                "sessionId#startedAt": f"{session_id or 'sess'}#{start_iso}",
                                "mode": "conversation",
                                "topic": topic,
                                "durationSeconds": duration,
                                "turnCount": turn_count
                            }
                        )
                    except Exception:
                        pass

                    await websocket.send_json({
                        "type": "session_summary",
                        "sessionId": session_id,
                        "durationSeconds": duration,
                        "turnCount": turn_count
                    })
                    break

            elif "bytes" in message:
                audio_bytes = message["bytes"]
                if not audio_bytes:
                    continue

                async for item in transcribe_service.process_audio(audio_bytes):
                    await websocket.send_json(item)
                    if not item.get("isPartial", True):
                        final_transcript = item.get("text", "")
                        turn_count += 1

                        await websocket.send_json({
                            "type": "voice_state",
                            "state": "PROCESSING",
                            "sessionId": session_id
                        })

                        output: AgentTurnOutput = await agent_service.process_turn(
                            user_id=user_id,
                            topic=topic,
                            transcript=final_transcript,
                            history=history
                        )

                        history.append({"role": "user", "content": final_transcript})
                        history.append({"role": "assistant", "content": output.response})
                        history = history[-6:]

                        await websocket.send_json({
                            "type": "agent_text",
                            "text": output.response,
                            "isFinal": True,
                            "sessionId": session_id
                        })

                        if output.grammar_suggestions:
                            corrections_payload = [
                                {
                                    "original": s.original,
                                    "corrected": s.corrected,
                                    "error_type": s.error_type,
                                    "explanation": s.explanation
                                }
                                for s in output.grammar_suggestions
                            ]
                            await websocket.send_json({
                                "type": "suggestion",
                                "corrections": corrections_payload,
                                "sessionId": session_id
                            })

                            try:
                                errors_table = dynamodb.Table(settings.dynamodb_table_grammar_errors)
                                now = datetime.now(timezone.utc).isoformat()
                                for s in output.grammar_suggestions:
                                    errors_table.put_item(
                                        Item={
                                            "userId": user_id,
                                            "timestamp": f"{now}#{s.original[:20]}",
                                            "sessionId": session_id or "default",
                                            "original": s.original,
                                            "corrected": s.corrected,
                                            "errorType": s.error_type,
                                            "explanation": s.explanation
                                        }
                                    )
                            except Exception:
                                pass

                        if output.response:
                            await websocket.send_json({
                                "type": "voice_state",
                                "state": "SPEAKING",
                                "sessionId": session_id
                            })

                            async for audio_chunk in tts_service.synthesize_stream(output.response):
                                if audio_chunk:
                                    await websocket.send_bytes(audio_chunk)

                            await websocket.send_json({
                                "type": "voice_state",
                                "state": "IDLE",
                                "sessionId": session_id
                            })

    except WebSocketDisconnect:
        pass
    except Exception as e:
        try:
            await websocket.send_json({"type": "error", "code": "WS_ERROR", "message": str(e)})
        except Exception:
            pass
    finally:
        # Cleanup connection
        try:
            ws_table = dynamodb.Table(settings.dynamodb_table_ws_connections)
            ws_table.delete_item(Key={"connectionId": connection_id})
        except Exception:
            pass
