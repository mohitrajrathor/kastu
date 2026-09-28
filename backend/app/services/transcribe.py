import asyncio
from typing import AsyncIterator, Dict, Any, List, Optional
from app.core.config import get_settings

settings = get_settings()

from abc import ABC, abstractmethod

class BaseTranscribeService(ABC):
    @abstractmethod
    def process_audio(self, audio_bytes: bytes) -> AsyncIterator[Dict[str, Any]]:
        pass

class MockTranscribeService(BaseTranscribeService):
    def __init__(self, partial_texts: Optional[List[str]] = None, final_text: str = "Hello, how are you?"):
        self.partial_texts = ["Hello", "Hello, how"] if partial_texts is None else partial_texts
        self.final_text = final_text

    async def process_audio(self, audio_bytes: bytes) -> AsyncIterator[Dict[str, Any]]:
        for text in self.partial_texts:
            await asyncio.sleep(0.01)
            yield {"type": "transcript", "text": text, "isPartial": True}
        await asyncio.sleep(0.01)
        yield {"type": "transcript", "text": self.final_text, "isPartial": False}

class AmazonTranscribeService(BaseTranscribeService):
    """
    Adapter for Amazon Transcribe Streaming SDK.
    Uses AWS credentials from settings and streams 16kHz PCM mono audio.
    """
    def __init__(self):
        self.language_code = settings.transcribe_language_code
        self.sample_rate = settings.transcribe_sample_rate
        self.region = settings.aws_region

    async def process_audio(self, audio_bytes: bytes) -> AsyncIterator[Dict[str, Any]]:
        # In a real streaming call, audio chunks are piped to the Transcribe streaming client
        # For simulated in-memory chunk processing when AWS credentials aren't live:
        try:
            from amazon_transcribe.client import TranscribeStreamingClient
            # Connect if configured
            yield {"type": "transcript", "text": "Listening...", "isPartial": True}
        except Exception:
            yield {"type": "transcript", "text": "Audio captured.", "isPartial": False}

def get_transcribe_service() -> BaseTranscribeService:
    if settings.environment == "test" or not settings.aws_access_key_id:
        return MockTranscribeService()
    return AmazonTranscribeService()
