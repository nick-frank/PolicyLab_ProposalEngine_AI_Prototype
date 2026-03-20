"""
Seed the initial superuser on first startup.
"""

from typing import Optional

from fastapi_users_db_sqlalchemy import SQLAlchemyUserDatabase
from sqlalchemy.ext.asyncio import async_sessionmaker

from core.database import AsyncSessionLocal
from core.models import User
from core.users import UserCreate, UserManager

SUPERUSER_EMAIL = "admin@proposalengine.com"
SUPERUSER_PASSWORD = "changeme123!"


async def create_first_superuser(
    session_maker: Optional[async_sessionmaker] = None,
) -> None:
    """Create the initial admin user if none exists.

    Args:
        session_maker: Override session factory (used by tests).
                       Defaults to AsyncSessionLocal from core.database.
    """
    factory = session_maker or AsyncSessionLocal
    async with factory() as session:
        user_db = SQLAlchemyUserDatabase(session, User)
        existing = await user_db.get_by_email(SUPERUSER_EMAIL)
        if existing is not None:
            return

        manager = UserManager(user_db)
        await manager.create(
            UserCreate(
                email=SUPERUSER_EMAIL,
                password=SUPERUSER_PASSWORD,
                is_superuser=True,
                is_verified=True,
                full_name="System Admin",
                role="admin",
            )
        )
        await session.commit()
        print(f"Created initial superuser: {SUPERUSER_EMAIL}")
