"""TC-25.*  SQLAdmin Model Views — Structured Field"""

import pytest
from httpx import AsyncClient


async def _admin_login(client: AsyncClient):
    await client.post(
        "/admin/login",
        data={"username": "admin", "password": "secret"},
        follow_redirects=True,
    )


# TC-25.1
@pytest.mark.asyncio
async def test_structuredfield_list_view(async_client: AsyncClient, sample_structured_field):
    await _admin_login(async_client)
    resp = await async_client.get("/admin/structured-field/list", follow_redirects=True)
    assert resp.status_code == 200
    assert "structured field" in resp.text.lower() or "structured-field" in resp.text.lower()


# TC-25.2
@pytest.mark.asyncio
async def test_structuredfield_search_by_field_name(async_client: AsyncClient, sample_structured_field):
    await _admin_login(async_client)
    resp = await async_client.get(
        "/admin/structured-field/list?search=Named+Insured", follow_redirects=True
    )
    assert resp.status_code == 200
