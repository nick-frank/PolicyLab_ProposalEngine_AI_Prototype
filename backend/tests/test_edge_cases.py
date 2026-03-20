"""TC-17.*  Error & Edge Cases"""

import pytest
from httpx import AsyncClient


# TC-17.2
@pytest.mark.asyncio
async def test_sql_injection_in_email(async_client: AsyncClient):
    resp = await async_client.post(
        "/auth/register",
        json={
            "email": "'; DROP TABLE user;--@evil.com",
            "password": "StrongP@ss1",
        },
    )
    assert resp.status_code == 422  # Invalid email


# TC-17.5
@pytest.mark.asyncio
async def test_jwt_token_on_cookie_logout(async_client: AsyncClient, jwt_token):
    """JWT token used on cookie logout endpoint should not crash."""
    from tests.conftest import auth_header

    resp = await async_client.post(
        "/auth/cookie/logout", headers=auth_header(jwt_token)
    )
    # Should not be a 500 — graceful handling
    assert resp.status_code < 500


# TC-17.6
@pytest.mark.asyncio
async def test_very_long_password(async_client: AsyncClient):
    resp = await async_client.post(
        "/auth/register",
        json={"email": "long@example.com", "password": "A" * 10000},
    )
    # Should either register or reject gracefully (not 500)
    assert resp.status_code in (201, 400, 422)


# TC-17.7
@pytest.mark.asyncio
async def test_unicode_in_user_fields(async_client: AsyncClient):
    resp = await async_client.post(
        "/auth/register",
        json={
            "email": "tanaka@example.jp",
            "password": "StrongP@ss1",
            "full_name": "\u7530\u4e2d\u592a\u90ce",
        },
    )
    assert resp.status_code == 201
    assert resp.json()["full_name"] == "\u7530\u4e2d\u592a\u90ce"
