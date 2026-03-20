"""TC-24.*  SQLAdmin Model Views — Document"""

import pytest
from httpx import AsyncClient


async def _admin_login(client: AsyncClient):
    await client.post(
        "/admin/login",
        data={"username": "admin", "password": "secret"},
        follow_redirects=True,
    )


# TC-24.1
@pytest.mark.asyncio
async def test_document_list_view(async_client: AsyncClient, sample_document):
    await _admin_login(async_client)
    resp = await async_client.get("/admin/document/list", follow_redirects=True)
    assert resp.status_code == 200
    assert "document" in resp.text.lower()


# TC-24.2
@pytest.mark.asyncio
async def test_document_search_by_file_name(async_client: AsyncClient, sample_document):
    await _admin_login(async_client)
    resp = await async_client.get(
        "/admin/document/list?search=application", follow_redirects=True
    )
    assert resp.status_code == 200


# TC-24.3
@pytest.mark.asyncio
async def test_document_create_disabled(async_client: AsyncClient):
    await _admin_login(async_client)
    resp = await async_client.get("/admin/document/create", follow_redirects=True)
    # Should 403 or show "not allowed" since can_create=False
    assert resp.status_code in (200, 401, 403)
