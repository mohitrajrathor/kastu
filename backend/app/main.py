from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pathlib import Path
import os

from app.core.config import get_settings
from app.api.auth import router as auth_router
from app.api.topics import router as topics_router
from app.api.ws import router as ws_router

settings = get_settings()

app = FastAPI(
    title=settings.app_name,
    version=settings.app_version,
    description="Kastu - Spoken English Voice Agent & Real-Time Grammar Assistant"
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router)
app.include_router(topics_router)
app.include_router(ws_router)

@app.get("/api/health")
async def health_check():
    return {
        "status": "ok",
        "app": settings.app_name,
        "version": settings.app_version,
        "environment": settings.environment
    }

# Mount static frontend files if built
frontend_dist = Path(__file__).resolve().parent.parent.parent / "frontend" / "dist"
if frontend_dist.exists() and (frontend_dist / "index.html").exists():
    app.mount("/", StaticFiles(directory=str(frontend_dist), html=True), name="static")
