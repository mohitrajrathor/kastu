import pytest
from httpx import AsyncClient, ASGITransport
from moto import mock_aws
import boto3
import os

@pytest.fixture(autouse=True)
def aws_credentials():
    os.environ["AWS_ACCESS_KEY_ID"] = "testing"
    os.environ["AWS_SECRET_ACCESS_KEY"] = "testing"
    os.environ["AWS_SECURITY_TOKEN"] = "testing"
    os.environ["AWS_SESSION_TOKEN"] = "testing"
    os.environ["AWS_DEFAULT_REGION"] = "ap-south-1"

@pytest.fixture
def dynamodb_mock():
    with mock_aws():
        dynamodb = boto3.resource("dynamodb", region_name="ap-south-1")
        # Create users table
        dynamodb.create_table(
            TableName="users",
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
        yield dynamodb

@pytest.mark.asyncio
async def test_auth_registration_and_login_flow(dynamodb_mock):
    from app.main import app
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        # 1. Register new user
        reg_payload = {"email": "learner@example.com", "password": "StrongPassword123!"}
        reg_resp = await ac.post("/api/auth/register", json=reg_payload)
        assert reg_resp.status_code == 201
        reg_data = reg_resp.json()
        assert "userId" in reg_data
        assert "token" in reg_data
        user_id = reg_data["userId"]

        # Verify DynamoDB record has bcrypt hash, not plain password
        table = dynamodb_mock.Table("users")
        user_item = table.get_item(Key={"userId": user_id}).get("Item")
        assert user_item is not None
        assert user_item["email"] == "learner@example.com"
        assert user_item["passwordHash"].startswith("$2b$") or user_item["passwordHash"].startswith("$2a$")
        assert "StrongPassword123!" not in user_item["passwordHash"]

        # 2. Duplicate registration returns 400
        dup_resp = await ac.post("/api/auth/register", json=reg_payload)
        assert dup_resp.status_code == 400
        assert "Email already exists" in dup_resp.json()["detail"]

        # 3. Login with correct credentials
        login_resp = await ac.post("/api/auth/login", json=reg_payload)
        assert login_resp.status_code == 200
        login_data = login_resp.json()
        assert "token" in login_data
        assert login_data["expiresIn"] == 1800
        token = login_data["token"]

        # 4. Login with invalid credentials returns 401
        bad_login = await ac.post("/api/auth/login", json={"email": "learner@example.com", "password": "WrongPassword"})
        assert bad_login.status_code == 401
        assert "Invalid credentials" in bad_login.json()["detail"]

        # 5. Access protected /api/auth/me
        me_resp = await ac.get("/api/auth/me", headers={"Authorization": f"Bearer {token}"})
        assert me_resp.status_code == 200
        assert me_resp.json()["email"] == "learner@example.com"
        assert me_resp.json()["userId"] == user_id

        # 6. Access protected route without token returns 401
        unauth_resp = await ac.get("/api/auth/me")
        assert unauth_resp.status_code == 401

@pytest.mark.asyncio
async def test_get_topics():
    from app.main import app
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        resp = await ac.get("/api/topics")
        assert resp.status_code == 200
        topics = resp.json()
        assert len(topics) >= 3
        assert any(t["id"] == "daily-life" for t in topics)
        assert any("title" in t and "difficulty" in t for t in topics)
