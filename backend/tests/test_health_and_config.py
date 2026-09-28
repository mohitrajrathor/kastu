import pytest
from httpx import AsyncClient, ASGITransport
import os

@pytest.mark.asyncio
async def test_health_check_returns_ok():
    from app.main import app
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        response = await ac.get("/api/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "ok"
    assert "version" in data
    assert "environment" in data

@pytest.mark.asyncio
async def test_config_loads_defaults_and_env():
    from app.core.config import get_settings
    settings = get_settings()
    assert settings.app_name == "Kastu"
    assert settings.jwt_secret is not None
    assert settings.aws_region == "ap-south-1"

@pytest.mark.asyncio
async def test_root_serves_html():
    from app.main import app
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        response = await ac.get("/")
    assert response.status_code == 200
    assert "html" in response.headers.get("content-type", "")

