from fastapi import APIRouter, HTTPException, Depends, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel, EmailStr
from datetime import datetime, timezone
import uuid

from app.core.config import get_settings
from app.core.security import hash_password, verify_password, create_access_token, decode_access_token
from app.services.dynamo import get_dynamodb_resource

router = APIRouter(prefix="/api/auth", tags=["auth"])
security = HTTPBearer(auto_error=False)
settings = get_settings()

class RegisterRequest(BaseModel):
    email: EmailStr
    password: str

class LoginRequest(BaseModel):
    email: EmailStr
    password: str

class AuthResponse(BaseModel):
    userId: str
    token: str
    expiresIn: int

class UserResponse(BaseModel):
    userId: str
    email: str

def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)) -> UserResponse:
    if not credentials:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Missing authorization header")
    payload = decode_access_token(credentials.credentials)
    if not payload or "sub" not in payload:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid or expired token")
    return UserResponse(userId=payload["sub"], email=payload.get("email", ""))

@router.post("/register", status_code=status.HTTP_201_CREATED, response_model=AuthResponse)
async def register(req: RegisterRequest):
    dynamodb = get_dynamodb_resource()
    table = dynamodb.Table(settings.dynamodb_table_users)

    # Check if email exists via email-index GSI
    resp = table.query(
        IndexName="email-index",
        KeyConditionExpression="email = :email",
        ExpressionAttributeValues={":email": req.email}
    )
    if resp.get("Items"):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Email already exists")

    user_id = str(uuid.uuid4())
    now = datetime.now(timezone.utc).isoformat()
    pwd_hash = hash_password(req.password)

    table.put_item(
        Item={
            "userId": user_id,
            "email": req.email,
            "passwordHash": pwd_hash,
            "createdAt": now,
            "lastLoginAt": now
        }
    )

    token = create_access_token({"sub": user_id, "email": req.email})
    return AuthResponse(userId=user_id, token=token, expiresIn=settings.jwt_expiry_seconds)

@router.post("/login", response_model=AuthResponse)
async def login(req: LoginRequest):
    dynamodb = get_dynamodb_resource()
    table = dynamodb.Table(settings.dynamodb_table_users)

    resp = table.query(
        IndexName="email-index",
        KeyConditionExpression="email = :email",
        ExpressionAttributeValues={":email": req.email}
    )
    items = resp.get("Items", [])
    if not items:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")

    user_item = items[0]
    if not verify_password(req.password, user_item["passwordHash"]):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")

    now = datetime.now(timezone.utc).isoformat()
    table.update_item(
        Key={"userId": user_item["userId"]},
        UpdateExpression="SET lastLoginAt = :now",
        ExpressionAttributeValues={":now": now}
    )

    token = create_access_token({"sub": user_item["userId"], "email": req.email})
    return AuthResponse(userId=user_item["userId"], token=token, expiresIn=settings.jwt_expiry_seconds)

@router.post("/logout")
async def logout(current_user: UserResponse = Depends(get_current_user)):
    return {"message": "logged out"}

@router.get("/me", response_model=UserResponse)
async def me(current_user: UserResponse = Depends(get_current_user)):
    return current_user
