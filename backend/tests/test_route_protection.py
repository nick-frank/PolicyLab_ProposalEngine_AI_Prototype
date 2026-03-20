"""TC-13.*  Route Protection (Phase 1 — Optional Auth)"""

import pytest
from httpx import AsyncClient

from tests.conftest import auth_header


# TC-13.3
@pytest.mark.asyncio
async def test_health_no_auth(async_client: AsyncClient):
    resp = await async_client.get("/api/health")
    assert resp.status_code == 200


# TC-13.4
@pytest.mark.asyncio
async def test_root_no_auth(async_client: AsyncClient):
    resp = await async_client.get("/")
    assert resp.status_code == 200
    assert resp.json()["status"] == "healthy"


# TC-13.5
@pytest.mark.asyncio
async def test_workflow_status_no_auth(async_client: AsyncClient):
    resp = await async_client.get("/api/workflow/status")
    assert resp.status_code == 200
