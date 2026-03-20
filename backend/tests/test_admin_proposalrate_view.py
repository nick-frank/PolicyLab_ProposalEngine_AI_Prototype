"""TC-22.*  SQLAdmin Model Views — Proposal Rate"""

import pytest
from httpx import AsyncClient


async def _admin_login(client: AsyncClient):
    await client.post(
        "/admin/login",
        data={"username": "admin", "password": "secret"},
        follow_redirects=True,
    )


# TC-22.1
@pytest.mark.asyncio
async def test_proposalrate_list_view(async_client: AsyncClient, sample_proposal_rate):
    await _admin_login(async_client)
    resp = await async_client.get("/admin/proposal-rate/list", follow_redirects=True)
    assert resp.status_code == 200
    assert "proposal rate" in resp.text.lower() or "proposal-rate" in resp.text.lower()


# TC-22.2
@pytest.mark.asyncio
async def test_proposalrate_search_by_class_code(async_client: AsyncClient, sample_proposal_rate):
    await _admin_login(async_client)
    resp = await async_client.get(
        "/admin/proposal-rate/list?search=236220", follow_redirects=True
    )
    assert resp.status_code == 200
