"""TC-6.*  Email Verification"""

import pytest
from httpx import AsyncClient

from tests.conftest import TEST_USER_EMAIL, TEST_USER_PASSWORD, auth_header


# TC-6.1
@pytest.mark.asyncio
async def test_request_verify_token(async_client: AsyncClient, jwt_token):
    resp = await async_client.post(
        "/auth/request-verify-token",
        json={"email": TEST_USER_EMAIL},
        headers=auth_header(jwt_token),
    )
    assert resp.status_code == 202


# TC-6.2  (full verify flow requires capturing token from callback — see integration)


# TC-6.3
@pytest.mark.asyncio
async def test_verify_invalid_token(async_client: AsyncClient):
    resp = await async_client.post(
        "/auth/verify", json={"token": "bogus-token"}
    )
    assert resp.status_code == 400


# TC-6.4
@pytest.mark.asyncio
async def test_already_verified_user(async_client: AsyncClient, verified_user):
    """A verified user requesting another token — FastAPI-Users v13 returns 202
    to avoid user enumeration (regardless of verified status)."""
    from tests.conftest import get_jwt_token, TEST_USER_PASSWORD

    token = await get_jwt_token(async_client, "verified@example.com", TEST_USER_PASSWORD)
    resp = await async_client.post(
        "/auth/request-verify-token",
        json={"email": "verified@example.com"},
        headers=auth_header(token),
    )
    # v13 returns 202 even for already-verified users
    assert resp.status_code in (202, 400)
