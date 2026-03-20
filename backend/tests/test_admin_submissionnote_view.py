"""TC-27.*  SQLAdmin Model Views — Submission Note"""

import pytest
from httpx import AsyncClient


async def _admin_login(client: AsyncClient):
    await client.post(
        "/admin/login",
        data={"username": "admin", "password": "secret"},
        follow_redirects=True,
    )


# TC-27.1
@pytest.mark.asyncio
async def test_submissionnote_list_view(async_client: AsyncClient, sample_submission_note):
    await _admin_login(async_client)
    resp = await async_client.get("/admin/submission-note/list", follow_redirects=True)
    assert resp.status_code == 200
    assert "submission note" in resp.text.lower() or "submission-note" in resp.text.lower()


# TC-27.2
@pytest.mark.asyncio
async def test_submissionnote_search_by_subject(async_client: AsyncClient, sample_submission_note):
    await _admin_login(async_client)
    resp = await async_client.get(
        "/admin/submission-note/list?search=Application", follow_redirects=True
    )
    assert resp.status_code == 200
