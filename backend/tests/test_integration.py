"""TC-16.*  Integration — Auth + Existing Endpoints"""

import pytest
from httpx import AsyncClient

from tests.conftest import (
    TEST_USER_EMAIL,
    TEST_USER_PASSWORD,
    auth_header,
    get_jwt_token,
)


# TC-16.1 — Register → login → verify profile round-trip
@pytest.mark.asyncio
async def test_register_login_profile(async_client: AsyncClient):
    # Register
    resp = await async_client.post(
        "/auth/register",
        json={"email": "int@example.com", "password": "Str0ng!Pass"},
    )
    assert resp.status_code == 201
    user_id = resp.json()["id"]

    # Login
    token = await get_jwt_token(async_client, "int@example.com", "Str0ng!Pass")
    assert token

    # Profile
    resp = await async_client.get("/users/me", headers=auth_header(token))
    assert resp.status_code == 200
    assert resp.json()["id"] == user_id


# TC-16.5 — Workflow submit (stub) still works
@pytest.mark.asyncio
async def test_workflow_submit_works(async_client: AsyncClient):
    resp = await async_client.post(
        "/api/workflow/submit",
        json={"quote_id": "test-123", "submitted_by": "tester"},
    )
    assert resp.status_code == 200
    assert resp.json()["status"] == "submitted"
