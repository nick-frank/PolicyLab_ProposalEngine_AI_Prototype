"""
SQLAdmin configuration: authentication backend & model views.
"""

from sqladmin import Admin, ModelView
from sqladmin.authentication import AuthenticationBackend as SQLAdminAuth
from starlette.requests import Request

from core.config import settings
from core.models import Quote, AuditLog, Approval, User


# ---------------------------------------------------------------------------
# Admin authentication (session-based)
# ---------------------------------------------------------------------------

class AdminAuth(SQLAdminAuth):
    """Simple session-based admin auth.  MVP: accepts any non-empty
    username/password pair.  Wire into FastAPI-Users' cookie backend
    for production."""

    async def login(self, request: Request) -> bool:
        form = await request.form()
        username = form.get("username")
        password = form.get("password")
        if username and password:
            request.session.update({"token": "authenticated"})
            return True
        return False

    async def logout(self, request: Request) -> bool:
        request.session.clear()
        return True

    async def authenticate(self, request: Request) -> bool:
        return bool(request.session.get("token"))


# ---------------------------------------------------------------------------
# Model views
# ---------------------------------------------------------------------------

class UserAdmin(ModelView, model=User):
    column_list = [
        User.id, User.email, User.full_name, User.role,
        User.is_active, User.is_superuser, User.is_verified,
    ]
    column_searchable_list = [User.email, User.full_name]
    column_sortable_list = [User.email, User.role, User.is_active]
    column_details_exclude_list = [User.hashed_password]
    form_excluded_columns = [User.hashed_password]
    can_create = True
    can_edit = True
    can_delete = True
    name = "User"
    name_plural = "Users"
    icon = "fa-solid fa-user"


class QuoteAdmin(ModelView, model=Quote):
    column_list = [
        Quote.id, Quote.insured_name, Quote.deal_number,
        Quote.status, Quote.technical_premium, Quote.bound_premium,
        Quote.created_at, Quote.created_by,
    ]
    column_searchable_list = [Quote.insured_name, Quote.deal_number]
    column_sortable_list = [Quote.created_at, Quote.status, Quote.insured_name]
    column_details_exclude_list = [Quote.input_data, Quote.output_data]
    can_create = False
    can_delete = True
    name = "Quote"
    name_plural = "Quotes"
    icon = "fa-solid fa-file-invoice-dollar"


class AuditLogAdmin(ModelView, model=AuditLog):
    column_list = [
        AuditLog.id, AuditLog.quote_id, AuditLog.event_type,
        AuditLog.user, AuditLog.timestamp, AuditLog.duration_ms,
    ]
    column_searchable_list = [AuditLog.quote_id, AuditLog.event_type]
    column_sortable_list = [AuditLog.timestamp, AuditLog.event_type]
    can_create = False
    can_edit = False
    can_delete = False
    name = "Audit Log"
    name_plural = "Audit Logs"
    icon = "fa-solid fa-clock-rotate-left"


class ApprovalAdmin(ModelView, model=Approval):
    column_list = [
        Approval.id, Approval.quote_id, Approval.stage,
        Approval.status, Approval.approver, Approval.created_at,
    ]
    column_searchable_list = [Approval.quote_id, Approval.approver]
    column_sortable_list = [Approval.created_at, Approval.status]
    name = "Approval"
    name_plural = "Approvals"
    icon = "fa-solid fa-check-circle"


# ---------------------------------------------------------------------------
# Setup helper — called from main.py
# ---------------------------------------------------------------------------

def setup_admin(app, engine) -> Admin:
    authentication_backend = AdminAuth(secret_key=settings.SECRET_KEY)
    admin = Admin(
        app,
        engine,
        authentication_backend=authentication_backend,
        title="GL Rater Admin",
        base_url="/admin",
    )
    admin.add_view(UserAdmin)
    admin.add_view(QuoteAdmin)
    admin.add_view(AuditLogAdmin)
    admin.add_view(ApprovalAdmin)
    return admin
