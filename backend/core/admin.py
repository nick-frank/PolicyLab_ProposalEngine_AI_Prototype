"""
SQLAdmin configuration: authentication backend & model views.
"""

from sqladmin import Admin, ModelView
from sqladmin.authentication import AuthenticationBackend as SQLAdminAuth
from starlette.requests import Request

from core.config import settings
from core.models import (
    Quote, AuditLog, Approval, User,
    Submission, Proposal, ProposalRate, ProposalForm,
    Document, StructuredField, LossRun,
    SubmissionNote, ProposalNote, StatusEvent,
)


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


class SubmissionAdmin(ModelView, model=Submission):
    column_list = [
        Submission.id, Submission.reference_number, Submission.insured_name,
        Submission.status, Submission.broker_name, Submission.estimated_premium,
        Submission.received_at,
    ]
    column_searchable_list = [Submission.reference_number, Submission.insured_name, Submission.broker_name]
    column_sortable_list = [Submission.received_at, Submission.status, Submission.insured_name, Submission.estimated_premium]
    can_create = True
    can_edit = True
    can_delete = True
    name = "Submission"
    name_plural = "Submissions"
    icon = "fa-solid fa-inbox"


class ProposalAdmin(ModelView, model=Proposal):
    column_list = [
        Proposal.id, Proposal.submission_id, Proposal.name,
        Proposal.version, Proposal.status, Proposal.rating_type,
        Proposal.total_premium, Proposal.created_at,
    ]
    column_searchable_list = [Proposal.name, Proposal.submission_id]
    column_sortable_list = [Proposal.created_at, Proposal.status, Proposal.total_premium]
    column_details_exclude_list = [Proposal.policy_details, Proposal.output_data, Proposal.validation_results]
    can_create = False
    can_edit = True
    can_delete = True
    name = "Proposal"
    name_plural = "Proposals"
    icon = "fa-solid fa-file-contract"


class ProposalRateAdmin(ModelView, model=ProposalRate):
    column_list = [
        ProposalRate.id, ProposalRate.proposal_id, ProposalRate.row_index,
        ProposalRate.class_code, ProposalRate.class_code_description,
        ProposalRate.territory, ProposalRate.technical_premium,
    ]
    column_searchable_list = [ProposalRate.class_code, ProposalRate.class_code_description]
    column_sortable_list = [ProposalRate.row_index, ProposalRate.class_code]
    can_create = False
    can_edit = True
    can_delete = True
    name = "Proposal Rate"
    name_plural = "Proposal Rates"
    icon = "fa-solid fa-table-list"


class ProposalFormAdmin(ModelView, model=ProposalForm):
    column_list = [
        ProposalForm.id, ProposalForm.proposal_id, ProposalForm.form_number,
        ProposalForm.form_name, ProposalForm.form_type,
        ProposalForm.is_included, ProposalForm.sort_order,
    ]
    column_searchable_list = [ProposalForm.form_number, ProposalForm.form_name]
    column_sortable_list = [ProposalForm.sort_order, ProposalForm.form_number]
    can_create = True
    can_edit = True
    can_delete = True
    name = "Proposal Form"
    name_plural = "Proposal Forms"
    icon = "fa-solid fa-file-lines"


class DocumentAdmin(ModelView, model=Document):
    column_list = [
        Document.id, Document.submission_id, Document.file_name,
        Document.file_type, Document.file_size,
        Document.uploaded_at, Document.extraction_status,
    ]
    column_searchable_list = [Document.file_name, Document.file_type]
    column_sortable_list = [Document.uploaded_at, Document.extraction_status]
    can_create = False
    can_edit = True
    can_delete = True
    name = "Document"
    name_plural = "Documents"
    icon = "fa-solid fa-file-arrow-up"


class StructuredFieldAdmin(ModelView, model=StructuredField):
    column_list = [
        StructuredField.id, StructuredField.submission_id,
        StructuredField.field_group, StructuredField.field_name,
        StructuredField.extracted_value, StructuredField.confidence,
    ]
    column_searchable_list = [StructuredField.field_name, StructuredField.field_group]
    column_sortable_list = [StructuredField.field_group, StructuredField.confidence]
    can_create = False
    can_edit = True
    can_delete = False
    name = "Structured Field"
    name_plural = "Structured Fields"
    icon = "fa-solid fa-brain"


class LossRunAdmin(ModelView, model=LossRun):
    column_list = [
        LossRun.id, LossRun.submission_id, LossRun.policy_year,
        LossRun.carrier, LossRun.premium, LossRun.claim_count,
        LossRun.loss_ratio, LossRun.sort_order,
    ]
    column_searchable_list = [LossRun.carrier, LossRun.policy_year]
    column_sortable_list = [LossRun.sort_order, LossRun.policy_year]
    can_create = True
    can_edit = True
    can_delete = True
    name = "Loss Run"
    name_plural = "Loss Runs"
    icon = "fa-solid fa-chart-line"


class SubmissionNoteAdmin(ModelView, model=SubmissionNote):
    column_list = [
        SubmissionNote.id, SubmissionNote.submission_id,
        SubmissionNote.note_type, SubmissionNote.subject,
        SubmissionNote.author_id, SubmissionNote.created_at,
    ]
    column_searchable_list = [SubmissionNote.subject, SubmissionNote.body]
    column_sortable_list = [SubmissionNote.created_at, SubmissionNote.note_type]
    can_create = True
    can_edit = True
    can_delete = True
    name = "Submission Note"
    name_plural = "Submission Notes"
    icon = "fa-solid fa-note-sticky"


class ProposalNoteAdmin(ModelView, model=ProposalNote):
    column_list = [
        ProposalNote.id, ProposalNote.proposal_id,
        ProposalNote.body, ProposalNote.author_id,
        ProposalNote.created_at,
    ]
    column_searchable_list = [ProposalNote.body]
    column_sortable_list = [ProposalNote.created_at]
    can_create = True
    can_edit = True
    can_delete = True
    name = "Proposal Note"
    name_plural = "Proposal Notes"
    icon = "fa-solid fa-comment"


class StatusEventAdmin(ModelView, model=StatusEvent):
    column_list = [
        StatusEvent.id, StatusEvent.submission_id,
        StatusEvent.from_status, StatusEvent.to_status,
        StatusEvent.actor_name, StatusEvent.occurred_at,
    ]
    column_searchable_list = [StatusEvent.to_status, StatusEvent.actor_name]
    column_sortable_list = [StatusEvent.occurred_at, StatusEvent.to_status]
    can_create = False
    can_edit = False
    can_delete = False
    name = "Status Event"
    name_plural = "Status Events"
    icon = "fa-solid fa-timeline"


class AuditLogAdmin(ModelView, model=AuditLog):
    column_list = [
        AuditLog.id, AuditLog.quote_id, AuditLog.submission_id,
        AuditLog.proposal_id, AuditLog.event_type,
        AuditLog.user, AuditLog.timestamp, AuditLog.duration_ms,
    ]
    column_searchable_list = [AuditLog.quote_id, AuditLog.submission_id, AuditLog.event_type]
    column_sortable_list = [AuditLog.timestamp, AuditLog.event_type]
    can_create = False
    can_edit = False
    can_delete = False
    name = "Audit Log"
    name_plural = "Audit Logs"
    icon = "fa-solid fa-clock-rotate-left"


class ApprovalAdmin(ModelView, model=Approval):
    column_list = [
        Approval.id, Approval.quote_id, Approval.proposal_id,
        Approval.stage, Approval.status, Approval.approver,
        Approval.created_at,
    ]
    column_searchable_list = [Approval.quote_id, Approval.proposal_id, Approval.approver]
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
        title="ProposalEngine Admin",
        base_url="/admin",
    )
    admin.add_view(UserAdmin)
    admin.add_view(QuoteAdmin)
    admin.add_view(SubmissionAdmin)
    admin.add_view(SubmissionNoteAdmin)
    admin.add_view(DocumentAdmin)
    admin.add_view(StructuredFieldAdmin)
    admin.add_view(LossRunAdmin)
    admin.add_view(ProposalAdmin)
    admin.add_view(ProposalRateAdmin)
    admin.add_view(ProposalFormAdmin)
    admin.add_view(ProposalNoteAdmin)
    admin.add_view(StatusEventAdmin)
    admin.add_view(AuditLogAdmin)
    admin.add_view(ApprovalAdmin)
    return admin
