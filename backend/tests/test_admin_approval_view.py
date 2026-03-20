"""TC-12.*  SQLAdmin Model Views — Approval"""

import pytest
from httpx import AsyncClient


async def _admin_login(client: AsyncClient):
    await client.post(
        "/admin/login",
        data={"username": "admin", "password": "secret"},
        follow_redirects=True,
    )


# TC-12.1
@pytest.mark.asyncio
async def test_approval_list_view(async_client: AsyncClient):
    await _admin_login(async_client)
    resp = await async_client.get("/admin/approval/list", follow_redirects=True)
    assert resp.status_code == 200


# TC-12.2
@pytest.mark.asyncio
async def test_approval_search(async_client: AsyncClient, sample_quote, db_session):
    from core.models import Approval

    appr = Approval(
        quote_id=sample_quote.id,
        workflow_id="wf-001",
        stage="initial",
        status="pending",
        approver="reviewer@test.com",
    )
    db_session.add(appr)
    await db_session.commit()

    await _admin_login(async_client)
    resp = await async_client.get(
        f"/admin/approval/list?search={sample_quote.id}", follow_redirects=True
    )
    assert resp.status_code == 200
