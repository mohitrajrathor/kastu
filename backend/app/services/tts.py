import asyncio
import logging
from abc import ABC, abstractmethod
from typing import AsyncIterator, List, Optional
import boto3

from app.core.config import get_settings

logger = logging.getLogger(__name__)
settings = get_settings()

class BaseTTSService(ABC):
    @abstractmethod
    def synthesize_stream(self, text: str) -> AsyncIterator[bytes]:
        pass

class MockTTSService(BaseTTSService):
    def __init__(self, audio_chunks: Optional[List[bytes]] = None):
        self.audio_chunks = audio_chunks if audio_chunks is not None else [b"\x00\x00\x00\x00" * 10]

    async def synthesize_stream(self, text: str) -> AsyncIterator[bytes]:
        for chunk in self.audio_chunks:
            await asyncio.sleep(0.01)
            yield chunk

class AmazonPollyTTSService(BaseTTSService):
    """
    AWS Polly Neural TTS Service adapter.
    Streams synthesized audio chunks to minimize latency.
    """
    def __init__(self):
        self.voice_id = settings.tts_voice_id
        self.region = settings.aws_region

    async def synthesize_stream(self, text: str) -> AsyncIterator[bytes]:
        try:
            kwargs = {"region_name": self.region}
            if settings.aws_access_key_id and settings.aws_secret_access_key:
                kwargs["aws_access_key_id"] = settings.aws_access_key_id
                kwargs["aws_secret_access_key"] = settings.aws_secret_access_key

            polly = boto3.client("polly", **kwargs)
            # AWS Polly Neural synthesize_speech
            response = polly.synthesize_speech(
                Engine="neural",
                OutputFormat="mp3",
                Text=text,
                VoiceId=self.voice_id
            )

            audio_stream = response.get("AudioStream")
            if audio_stream:
                # Read chunks of 4KB
                while True:
                    chunk = audio_stream.read(4096)
                    if not chunk:
                        break
                    yield chunk
                    await asyncio.sleep(0.005)

        except Exception as e:
            logger.error(f"Polly synthesis failed: {e}")
            # Fallback empty or silence chunk
            yield b""

def get_tts_service() -> BaseTTSService:
    if settings.environment == "test" or not settings.aws_access_key_id:
        return MockTTSService()
    return AmazonPollyTTSService()
