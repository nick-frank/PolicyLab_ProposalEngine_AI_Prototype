"""TC-4.*  Cookie Authentication"""

import pytest
from httpx import AsyncClient

from tests.conftest import TEST_USER_EMAIL, TEST_USER_PASSWORD


# TC-4.1
@pytest.mark.asyncio
async def test_cookie_login_sets_cookie(async_client: AsyncClient, registered_user):
    resp = await async_client.post(
        "/auth/cookie/login",
        data={"username": TEST_USER_EMAIL, "password": TEST_USER_PASSWORD},
    )
    assert resp.status_code in (200, 204)
    cookie_headers = [
        v for k, v in resp.headers.multi_items() if k.lower() == "set-cookie"
    ]
    assert len(cookie_headers) > 0


# TC-4.2
@pytest.mark.asyncio
async def test_cookie_grants_access(async_client: AsyncClient, registered_user):
    # Login
    resp = await async_client.post(
        "/auth/cookie/login",
        data={"username": TEST_USER_EMAIL, "password": TEST_USER_PASSWORD},
    )
    assert resp.status_code in (200, 204)

    # Extract cookie from response and pass it explicitly
    cookies = {}
    for k, v in resp.headers.multi_items():
        if k.lower() == "set-cookie":
            # Parse "name=value; ..."
            cookie_part = v.split(";")[0]
            name, _, value = cookie_part.partition("=")
            cookies[name.strip()] = value.strip()

    resp2 = await async_client.get("/users/me", cookies=cookies)
    assert resp2.status_code == 200
    assert resp2.json()["email"] == TEST_USER_EMAIL


# TC-4.3
@pytest.mark.asyncio
async def test_cookie_logout(async_client: AsyncClient, registered_user):
    # Login
    resp = await async_client.post(
        "/auth/cookie/login",
        data={"username": TEST_USER_EMAIL, "password": TEST_USER_PASSWORD},
    )
    assert resp.status_code in (200, 204)

    # Extract cookie
    cookies = {}
    for k, v in resp.headers.multi_items():
        if k.lower() == "set-cookie":
            cookie_part = v.split(";")[0]
            name, _, value = cookie_part.partition("=")
            cookies[name.strip()] = value.strip()

    # Logout
    resp2 = await async_client.post("/auth/cookie/logout", cookies=cookies)
    assert resp2.status_code in (200, 204)


# TC-4.4
@pytest.mark.asyncio
async def test_cookie_wrong_password(async_client: AsyncClient, registered_user):
    resp = await async_client.post(
        "/auth/cookie/login",
        data={"username": TEST_USER_EMAIL, "password": "WrongPass"},
    )
    assert resp.status_code == 400
