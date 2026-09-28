from fastapi import APIRouter
from pydantic import BaseModel
from typing import List

router = APIRouter(prefix="/api/topics", tags=["topics"])

class Topic(BaseModel):
    id: str
    title: str
    description: str
    difficulty: str
    promptContext: str

DEFAULT_TOPICS: List[Topic] = [
    Topic(
        id="daily-life",
        title="Daily Life & Routines",
        description="Talk about your day, morning habits, work-life balance, and weekend plans.",
        difficulty="Beginner",
        promptContext="Focus on everyday activities, habits, hobbies, and simple conversational English."
    ),
    Topic(
        id="travel-adventure",
        title="Travel & Culture",
        description="Discuss favorite destinations, unforgettable trips, cuisines, and dream vacations.",
        difficulty="Intermediate",
        promptContext="Explore travel memories, cultural differences, recommendations, and exciting experiences."
    ),
    Topic(
        id="tech-innovation",
        title="Technology & Future",
        description="Share thoughts on artificial intelligence, social media, remote work, and tech trends.",
        difficulty="Advanced",
        promptContext="Engage in deep dialogue about emerging technology, future work trends, and societal impacts."
    ),
    Topic(
        id="workplace-communication",
        title="Professional Workplace",
        description="Practice meeting updates, project presentations, negotiation, and teamwork.",
        difficulty="Intermediate",
        promptContext="Simulate realistic professional conversations, status updates, and business discussions."
    )
]

@router.get("", response_model=List[Topic])
async def list_topics():
    return DEFAULT_TOPICS
