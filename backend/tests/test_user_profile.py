"""TC-7.*  User Profile (/users/me, /users/{id})"""

import pytest
from httpx import AsyncClient

from tests.conftest import (
    TEST_USER_EMAIL,
    TEST_USER_PASSWORD,
    SUPERUSER_EMAIL,
    SUPERUSER_PASSWORD,
    auth_header,
    get_jwt_token,
)


# TC-7.1
@pytest.mark.asyncio
async def test_get_current_user(async_client: AsyncClient, jwt_token):
    resp = await async_client.get("/users/me", headers=auth_header(jwt_token))
    assert resp.status_code == 200
    body = resp.json()
    assert body["email"] == TEST_USER_EMAIL
    assert "hashed_password" not in body
    assert "full_name" in body
    assert "role" in body


# TC-7.2
@pytest.mark.asyncio
async def test_update_own_profile(async_client: AsyncClient, jwt_token):
    resp = await async_client.patch(
        "/users/me",
        json={"full_name": "New Name"},
        headers=auth_header(jwt_token),
    )
    assert resp.status_code == 200
    assert resp.json()["full_name"] == "New Name"


# TC-7.3
@pytest.mark.asyncio
async def test_update_own_password(async_client: AsyncClient, jwt_token):
    resp = await async_client.patch(
        "/users/me",
        json={"password": "BrandNewP@ss1"},
        headers=auth_header(jwt_token),
    )
    assert resp.status_code == 200

    # Verify new password works
    new_token = await get_jwt_token(async_client, TEST_USER_EMAIL, "BrandNewP@ss1")
    assert new_token


# TC-7.4
@pytest.mark.asyncio
async def test_non_superuser_cannot_escalate(async_client: AsyncClient, jwt_token):
    resp = await async_client.patch(
        "/users/me",
        json={"is_superuser": True},
        headers=auth_header(jwt_token),
    )
    # Should either ignore or 403
    if resp.status_code == 200:
        assert resp.json()["is_superuser"] is False


# TC-7.5
@pytest.mark.asyncio
async def test_superuser_get_other_user(
    async_client: AsyncClient, superuser_token, registered_user
):
    user_id = registered_user["id"]
    resp = await async_client.get(
        f"/users/{user_id}", headers=auth_header(superuser_token)
    )
    assert resp.status_code == 200
    assert resp.json()["email"] == TEST_USER_EMAIL


# TC-7.6
@pytest.mark.asyncio
async def test_non_superuser_cannot_get_other(
    async_client: AsyncClient, jwt_token, superuser
):
    resp = await async_client.get(
        f"/users/{superuser.id}", headers=auth_header(jwt_token)
    )
    assert resp.status_code in (401, 403)


# TC-7.7
@pytest.mark.asyncio
async def test_superuser_update_other_user(
    async_client: AsyncClient, superuser_token, registered_user
):
    user_id = registered_user["id"]
    resp = await async_client.patch(
        f"/users/{user_id}",
        json={"role": "admin"},
        headers=auth_header(superuser_token),
    )
    assert resp.status_code == 200
    assert resp.json()["role"] == "admin"


# TC-7.8
@pytest.mark.asyncio
async def test_superuser_delete_user(
    async_client: AsyncClient, superuser_token, registered_user
):
    user_id = registered_user["id"]
    resp = await async_client.delete(
        f"/users/{user_id}", headers=auth_header(superuser_token)
    )
    assert resp.status_code == 204


# TC-7.9
@pytest.mark.asyncio
async def test_non_superuser_cannot_delete(
    async_client: AsyncClient, jwt_token, superuser
):
    resp = await async_client.delete(
        f"/users/{superuser.id}", headers=auth_header(jwt_token)
    )
    assert resp.status_code in (401, 403)
