"""TC-3.*  JWT Authentication"""

import pytest
from httpx import AsyncClient

from tests.conftest import (
    TEST_USER_EMAIL,
    TEST_USER_PASSWORD,
    auth_header,
)


# TC-3.1
@pytest.mark.asyncio
async def test_login_returns_jwt(async_client: AsyncClient, registered_user):
    resp = await async_client.post(
        "/auth/jwt/login",
        data={"username": TEST_USER_EMAIL, "password": TEST_USER_PASSWORD},
    )
    assert resp.status_code == 200
    body = resp.json()
    assert "access_token" in body
    assert body["token_type"] == "bearer"


# TC-3.2
@pytest.mark.asyncio
async def test_login_wrong_password(async_client: AsyncClient, registered_user):
    resp = await async_client.post(
        "/auth/jwt/login",
        data={"username": TEST_USER_EMAIL, "password": "WrongPass"},
    )
    assert resp.status_code == 400


# TC-3.3
@pytest.mark.asyncio
async def test_login_nonexistent_email(async_client: AsyncClient):
    resp = await async_client.post(
        "/auth/jwt/login",
        data={"username": "nobody@example.com", "password": "anything"},
    )
    assert resp.status_code == 400


# TC-3.4
@pytest.mark.asyncio
async def test_login_inactive_user(async_client: AsyncClient, db_session):
    """Inactive user cannot login."""
    from core.users import UserManager, UserCreate
    from fastapi_users_db_sqlalchemy import SQLAlchemyUserDatabase
    from core.models import User

    user_db = SQLAlchemyUserDatabase(db_session, User)
    manager = UserManager(user_db)
    user = await manager.create(
        UserCreate(email="inactive@example.com", password="Passw0rd!")
    )
    # Deactivate
    user.is_active = False
    db_session.add(user)
    await db_session.commit()

    resp = await async_client.post(
        "/auth/jwt/login",
        data={"username": "inactive@example.com", "password": "Passw0rd!"},
    )
    assert resp.status_code == 400


# TC-3.5
@pytest.mark.asyncio
async def test_jwt_grants_access(async_client: AsyncClient, jwt_token):
    resp = await async_client.get("/users/me", headers=auth_header(jwt_token))
    assert resp.status_code == 200
    assert resp.json()["email"] == TEST_USER_EMAIL


# TC-3.6  (skip expiry timing test — hard to test without mocking time)


# TC-3.7
@pytest.mark.asyncio
async def test_malformed_jwt_rejected(async_client: AsyncClient):
    resp = await async_client.get(
        "/users/me", headers={"Authorization": "Bearer garbage123"}
    )
    assert resp.status_code == 401


# TC-3.8
@pytest.mark.asyncio
async def test_missing_auth_header(async_client: AsyncClient):
    resp = await async_client.get("/users/me")
    assert resp.status_code == 401


# TC-3.9
@pytest.mark.asyncio
async def test_jwt_logout(async_client: AsyncClient, jwt_token):
    resp = await async_client.post(
        "/auth/jwt/logout", headers=auth_header(jwt_token)
    )
    # FastAPI-Users JWT logout returns 204 No Content
    assert resp.status_code in (200, 204)
