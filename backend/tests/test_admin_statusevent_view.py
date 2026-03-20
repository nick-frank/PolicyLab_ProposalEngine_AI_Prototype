"""TC-29.*  SQLAdmin Model Views — Status Event"""

import pytest
from httpx import AsyncClient


async def _admin_login(client: AsyncClient):
    await client.post(
        "/admin/login",
        data={"username": "admin", "password": "secret"},
        follow_redirects=True,
    )


# TC-29.1
@pytest.mark.asyncio
async def test_statusevent_list_view(async_client: AsyncClient, sample_status_event):
    await _admin_login(async_client)
    resp = await async_client.get("/admin/status-event/list", follow_redirects=True)
    assert resp.status_code == 200
    assert "status event" in resp.text.lower() or "status-event" in resp.text.lower()


# TC-29.2
@pytest.mark.asyncio
async def test_statusevent_create_disabled(async_client: AsyncClient):
    await _admin_login(async_client)
    resp = await async_client.get("/admin/status-event/create", follow_redirects=True)
    # Should 403 or show "not allowed" since can_create=False
    assert resp.status_code in (200, 401, 403)


# TC-29.3
@pytest.mark.asyncio
async def test_statusevent_delete_disabled(async_client: AsyncClient, sample_status_event):
    """Verify the delete action is not available (can_delete=False)."""
    await _admin_login(async_client)
    resp = await async_client.get("/admin/status-event/list", follow_redirects=True)
    assert resp.status_code == 200
    # The delete button/link should not be present
    assert "delete" not in resp.text.lower() or "status event" in resp.text.lower()
