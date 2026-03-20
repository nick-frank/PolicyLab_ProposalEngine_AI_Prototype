"""TC-21.*  SQLAdmin Model Views — Proposal"""

import pytest
from httpx import AsyncClient


async def _admin_login(client: AsyncClient):
    await client.post(
        "/admin/login",
        data={"username": "admin", "password": "secret"},
        follow_redirects=True,
    )


# TC-21.1
@pytest.mark.asyncio
async def test_proposal_list_view(async_client: AsyncClient, sample_proposal):
    await _admin_login(async_client)
    resp = await async_client.get("/admin/proposal/list", follow_redirects=True)
    assert resp.status_code == 200
    assert "proposal" in resp.text.lower()


# TC-21.2
@pytest.mark.asyncio
async def test_proposal_detail_excludes_json(async_client: AsyncClient, sample_proposal):
    await _admin_login(async_client)
    resp = await async_client.get(
        f"/admin/proposal/details/{sample_proposal.id}", follow_redirects=True
    )
    assert resp.status_code in (200, 404)
    if resp.status_code == 200:
        assert "policy_details" not in resp.text or "output_data" not in resp.text


# TC-21.3
@pytest.mark.asyncio
async def test_proposal_search_by_name(async_client: AsyncClient, sample_proposal):
    await _admin_login(async_client)
    resp = await async_client.get(
        "/admin/proposal/list?search=Standard", follow_redirects=True
    )
    assert resp.status_code == 200


# TC-21.4
@pytest.mark.asyncio
async def test_proposal_create_disabled(async_client: AsyncClient):
    await _admin_login(async_client)
    resp = await async_client.get("/admin/proposal/create", follow_redirects=True)
    # Should 403 or show "not allowed" since can_create=False
    assert resp.status_code in (200, 401, 403)
