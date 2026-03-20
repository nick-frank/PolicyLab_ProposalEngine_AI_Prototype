"""TC-23.*  SQLAdmin Model Views — Proposal Form"""

import pytest
from httpx import AsyncClient


async def _admin_login(client: AsyncClient):
    await client.post(
        "/admin/login",
        data={"username": "admin", "password": "secret"},
        follow_redirects=True,
    )


# TC-23.1
@pytest.mark.asyncio
async def test_proposalform_list_view(async_client: AsyncClient, sample_proposal_form):
    await _admin_login(async_client)
    resp = await async_client.get("/admin/proposal-form/list", follow_redirects=True)
    assert resp.status_code == 200
    assert "proposal form" in resp.text.lower() or "proposal-form" in resp.text.lower()


# TC-23.2
@pytest.mark.asyncio
async def test_proposalform_search_by_form_number(async_client: AsyncClient, sample_proposal_form):
    await _admin_login(async_client)
    resp = await async_client.get(
        "/admin/proposal-form/list?search=CG+00+01", follow_redirects=True
    )
    assert resp.status_code == 200
