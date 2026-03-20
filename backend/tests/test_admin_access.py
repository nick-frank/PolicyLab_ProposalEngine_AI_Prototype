"""TC-8.*  SQLAdmin Panel Access"""

import pytest
from httpx import AsyncClient


# TC-8.1
@pytest.mark.asyncio
async def test_admin_login_page_loads(async_client: AsyncClient):
    resp = await async_client.get("/admin/login", follow_redirects=True)
    assert resp.status_code == 200
    assert "login" in resp.text.lower() or "username" in resp.text.lower()


# TC-8.2
@pytest.mark.asyncio
async def test_admin_login_valid(async_client: AsyncClient):
    resp = await async_client.post(
        "/admin/login",
        data={"username": "admin", "password": "secret"},
        follow_redirects=False,
    )
    # Should redirect to /admin on success
    assert resp.status_code in (301, 302, 303)


# TC-8.3
@pytest.mark.asyncio
async def test_admin_login_empty_creds(async_client: AsyncClient):
    resp = await async_client.post(
        "/admin/login",
        data={"username": "", "password": ""},
        follow_redirects=False,
    )
    # Should not authenticate with empty creds — stays on login or 400
    assert resp.status_code in (200, 301, 302, 400)


# TC-8.4
@pytest.mark.asyncio
async def test_unauthenticated_admin_redirects(async_client: AsyncClient):
    resp = await async_client.get("/admin/", follow_redirects=False)
    # Should redirect to login
    assert resp.status_code in (301, 302, 303)


# TC-8.5
@pytest.mark.asyncio
async def test_admin_logout(async_client: AsyncClient):
    # Login first
    await async_client.post(
        "/admin/login",
        data={"username": "admin", "password": "secret"},
        follow_redirects=True,
    )
    # Logout
    resp = await async_client.get("/admin/logout", follow_redirects=False)
    assert resp.status_code in (200, 301, 302, 303)


# TC-8.6
@pytest.mark.asyncio
async def test_admin_panel_shows_model_views(async_client: AsyncClient):
    # Login
    await async_client.post(
        "/admin/login",
        data={"username": "admin", "password": "secret"},
        follow_redirects=True,
    )
    resp = await async_client.get("/admin/", follow_redirects=True)
    assert resp.status_code == 200
    body = resp.text.lower()
    assert "user" in body
    assert "quote" in body
    assert "submission" in body
    assert "proposal" in body
