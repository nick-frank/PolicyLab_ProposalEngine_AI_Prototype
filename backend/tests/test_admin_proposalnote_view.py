"""TC-28.*  SQLAdmin Model Views — Proposal Note"""

import pytest
from httpx import AsyncClient


async def _admin_login(client: AsyncClient):
    await client.post(
        "/admin/login",
        data={"username": "admin", "password": "secret"},
        follow_redirects=True,
    )


# TC-28.1
@pytest.mark.asyncio
async def test_proposalnote_list_view(async_client: AsyncClient, sample_proposal_note):
    await _admin_login(async_client)
    resp = await async_client.get("/admin/proposal-note/list", follow_redirects=True)
    assert resp.status_code == 200
    assert "proposal note" in resp.text.lower() or "proposal-note" in resp.text.lower()


# TC-28.2
@pytest.mark.asyncio
async def test_proposalnote_search_by_body(async_client: AsyncClient, sample_proposal_note):
    await _admin_login(async_client)
    resp = await async_client.get(
        "/admin/proposal-note/list?search=rating", follow_redirects=True
    )
    assert resp.status_code == 200
