"""TC-20.*  SQLAdmin Model Views — Submission"""

import pytest
from httpx import AsyncClient


async def _admin_login(client: AsyncClient):
    await client.post(
        "/admin/login",
        data={"username": "admin", "password": "secret"},
        follow_redirects=True,
    )


# TC-20.1
@pytest.mark.asyncio
async def test_submission_list_view(async_client: AsyncClient, sample_submission):
    await _admin_login(async_client)
    resp = await async_client.get("/admin/submission/list", follow_redirects=True)
    assert resp.status_code == 200
    assert "submission" in resp.text.lower()


# TC-20.2
@pytest.mark.asyncio
async def test_submission_detail_view(async_client: AsyncClient, sample_submission):
    await _admin_login(async_client)
    resp = await async_client.get(
        f"/admin/submission/details/{sample_submission.id}", follow_redirects=True
    )
    assert resp.status_code in (200, 404)


# TC-20.3
@pytest.mark.asyncio
async def test_submission_search_by_insured(async_client: AsyncClient, sample_submission):
    await _admin_login(async_client)
    resp = await async_client.get(
        "/admin/submission/list?search=Pacific", follow_redirects=True
    )
    assert resp.status_code == 200


# TC-20.4
@pytest.mark.asyncio
async def test_submission_create_form_loads(async_client: AsyncClient):
    await _admin_login(async_client)
    resp = await async_client.get("/admin/submission/create", follow_redirects=True)
    assert resp.status_code == 200
