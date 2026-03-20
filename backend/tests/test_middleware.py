"""TC-15.*  Middleware & Configuration"""

import pytest
from httpx import AsyncClient


# TC-15.1
@pytest.mark.asyncio
async def test_session_middleware_active(async_client: AsyncClient):
    """Session middleware running — admin login sets session cookie."""
    resp = await async_client.post(
        "/admin/login",
        data={"username": "admin", "password": "secret"},
        follow_redirects=False,
    )
    # A session cookie should be set
    cookie_headers = [
        v for k, v in resp.headers.multi_items() if k.lower() == "set-cookie"
    ]
    assert len(cookie_headers) > 0


# TC-15.2
@pytest.mark.asyncio
async def test_cors_allows_authorization_header(async_client: AsyncClient):
    resp = await async_client.options(
        "/api/health",
        headers={
            "Origin": "http://localhost:3000",
            "Access-Control-Request-Method": "GET",
            "Access-Control-Request-Headers": "Authorization",
        },
    )
    assert resp.status_code == 200
    allowed = resp.headers.get("access-control-allow-headers", "")
    assert "authorization" in allowed.lower() or "*" in allowed


# TC-15.3
@pytest.mark.asyncio
async def test_cors_origin(async_client: AsyncClient):
    resp = await async_client.options(
        "/api/health",
        headers={
            "Origin": "http://localhost:3000",
            "Access-Control-Request-Method": "GET",
        },
    )
    origin = resp.headers.get("access-control-allow-origin", "")
    assert "localhost:3000" in origin or origin == "*"


# TC-15.4
@pytest.mark.asyncio
async def test_jwt_uses_secret_key(async_client: AsyncClient):
    """Indirectly verify SECRET_KEY by decoding a valid token."""
    import jwt
    from core.config import settings

    # Register + login
    await async_client.post(
        "/auth/register",
        json={"email": "jwtcheck@example.com", "password": "Strong1!"},
    )
    resp = await async_client.post(
        "/auth/jwt/login",
        data={"username": "jwtcheck@example.com", "password": "Strong1!"},
    )
    token = resp.json()["access_token"]

    # Decode with the configured secret
    payload = jwt.decode(token, settings.SECRET_KEY, algorithms=["HS256"],
                         audience=["fastapi-users:auth"])
    assert "sub" in payload
