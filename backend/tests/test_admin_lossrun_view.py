"""TC-26.*  SQLAdmin Model Views — Loss Run"""

import pytest
from httpx import AsyncClient


async def _admin_login(client: AsyncClient):
    await client.post(
        "/admin/login",
        data={"username": "admin", "password": "secret"},
        follow_redirects=True,
    )


# TC-26.1
@pytest.mark.asyncio
async def test_lossrun_list_view(async_client: AsyncClient, sample_loss_run):
    await _admin_login(async_client)
    resp = await async_client.get("/admin/loss-run/list", follow_redirects=True)
    assert resp.status_code == 200
    assert "loss run" in resp.text.lower() or "loss-run" in resp.text.lower()


# TC-26.2
@pytest.mark.asyncio
async def test_lossrun_search_by_carrier(async_client: AsyncClient, sample_loss_run):
    await _admin_login(async_client)
    resp = await async_client.get(
        "/admin/loss-run/list?search=Hartford", follow_redirects=True
    )
    assert resp.status_code == 200
