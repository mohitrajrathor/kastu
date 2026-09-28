import boto3
from typing import Any, Optional
from datetime import datetime, timezone
import logging
from app.core.config import get_settings
from app.core.security import hash_password

logger = logging.getLogger(__name__)
settings = get_settings()

def get_dynamodb_resource():
    kwargs = {"region_name": settings.aws_region}
    if settings.aws_access_key_id and settings.aws_secret_access_key:
        kwargs["aws_access_key_id"] = settings.aws_access_key_id
        kwargs["aws_secret_access_key"] = settings.aws_secret_access_key
    return boto3.resource("dynamodb", **kwargs)

def init_tables(dynamodb=None):
    """Ensures DynamoDB tables exist (used on startup/testing)"""
    if dynamodb is None:
        dynamodb = get_dynamodb_resource()
    existing_tables = [t.name for t in dynamodb.tables.all()]

    # Users table
    if settings.dynamodb_table_users not in existing_tables:
        dynamodb.create_table(
            TableName=settings.dynamodb_table_users,
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

    # Sessions table
    if settings.dynamodb_table_sessions not in existing_tables:
        dynamodb.create_table(
            TableName=settings.dynamodb_table_sessions,
            KeySchema=[
                {"AttributeName": "userId", "KeyType": "HASH"},
                {"AttributeName": "sessionId#startedAt", "KeyType": "RANGE"}
            ],
            AttributeDefinitions=[
                {"AttributeName": "userId", "AttributeType": "S"},
                {"AttributeName": "sessionId#startedAt", "AttributeType": "S"}
            ],
            BillingMode="PAY_PER_REQUEST"
        )

    # Grammar errors table
    if settings.dynamodb_table_grammar_errors not in existing_tables:
        dynamodb.create_table(
            TableName=settings.dynamodb_table_grammar_errors,
            KeySchema=[
                {"AttributeName": "userId", "KeyType": "HASH"},
                {"AttributeName": "timestamp", "KeyType": "RANGE"}
            ],
            AttributeDefinitions=[
                {"AttributeName": "userId", "AttributeType": "S"},
                {"AttributeName": "timestamp", "AttributeType": "S"}
            ],
            BillingMode="PAY_PER_REQUEST"
        )

    # WebSocket connections table
    if settings.dynamodb_table_ws_connections not in existing_tables:
        dynamodb.create_table(
            TableName=settings.dynamodb_table_ws_connections,
            KeySchema=[{"AttributeName": "connectionId", "KeyType": "HASH"}],
            AttributeDefinitions=[{"AttributeName": "connectionId", "AttributeType": "S"}],
            BillingMode="PAY_PER_REQUEST"
        )


def seed_dev_user(dynamodb=None) -> Optional[dict]:
    """Provisions a default developer user account for instant testing if not already present."""
    if dynamodb is None:
        dynamodb = get_dynamodb_resource()
    table = dynamodb.Table(settings.dynamodb_table_users)

    try:
        resp = table.query(
            IndexName="email-index",
            KeyConditionExpression="email = :email",
            ExpressionAttributeValues={":email": settings.dev_user_email}
        )
        if resp.get("Items"):
            logger.info("Developer user %s already exists in %s", settings.dev_user_email, settings.dynamodb_table_users)
            return resp["Items"][0]
    except Exception as e:
        logger.warning("Could not query %s for existing dev user: %s", settings.dynamodb_table_users, e)

    try:
        user_id = "dev-user-00000000-0000-0000-0000-000000000000"
        now = datetime.now(timezone.utc).isoformat()
        pwd_hash = hash_password(settings.dev_user_password)
        item = {
            "userId": user_id,
            "email": settings.dev_user_email,
            "passwordHash": pwd_hash,
            "createdAt": now,
            "lastLoginAt": now,
            "role": "developer"
        }
        table.put_item(Item=item)
        logger.info("Seeded developer test account: %s in %s", settings.dev_user_email, settings.dynamodb_table_users)
        return item
    except Exception as e:
        logger.warning("Failed to seed developer test account: %s", e)
        return None
