"""
Audit Logger for tracking all quote processing operations
"""

import json
from pathlib import Path
from datetime import datetime
from typing import Any, Dict, List

class AuditLogger:
    """Logs all operations performed during quote processing"""

    def __init__(self, quote_id: str):
        self.quote_id = quote_id
        self.events: List[Dict[str, Any]] = []
        self.start_time = datetime.utcnow()
        self.cell_updates = []
        self.errors = []

    def log_event(self, event_type: str, details: Dict[str, Any]):
        """Log a general event"""
        event = {
            "timestamp": datetime.utcnow().isoformat(),
            "event_type": event_type,
            "details": details,
            "duration_ms": (datetime.utcnow() - self.start_time).total_seconds() * 1000
        }
        self.events.append(event)

    def log_cell_update(self, cell_ref: str, old_value: Any, new_value: Any, sheet_name: str):
        """Log a cell update"""
        update = {
            "timestamp": datetime.utcnow().isoformat(),
            "event_type": "cell_updated",
            "sheet": sheet_name,
            "cell_reference": cell_ref,
            "old_value": self._serialize_value(old_value),
            "new_value": self._serialize_value(new_value),
            "duration_ms": (datetime.utcnow() - self.start_time).total_seconds() * 1000
        }
        self.cell_updates.append(update)
        self.events.append(update)

    def log_formula_calculation(self, cell_ref: str, formula: str, result: Any):
        """Log formula calculation"""
        event = {
            "timestamp": datetime.utcnow().isoformat(),
            "event_type": "formula_calculated",
            "details": {
                "cell_reference": cell_ref,
                "formula": formula,
                "result": self._serialize_value(result)
            },
            "duration_ms": (datetime.utcnow() - self.start_time).total_seconds() * 1000
        }
        self.events.append(event)

    def log_error(self, error_message: str):
        """Log an error"""
        error = {
            "timestamp": datetime.utcnow().isoformat(),
            "event_type": "error_occurred",
            "error_message": error_message,
            "duration_ms": (datetime.utcnow() - self.start_time).total_seconds() * 1000
        }
        self.errors.append(error)
        self.events.append(error)

    def _serialize_value(self, value: Any) -> Any:
        """Serialize value for JSON storage"""
        if value is None:
            return None
        if isinstance(value, (str, int, float, bool)):
            return value
        if isinstance(value, datetime):
            return value.isoformat()
        try:
            return str(value)
        except:
            return "<<unserializable>>"

    async def save(self, filepath: Path):
        """Save audit log to file"""
        audit_data = {
            "quote_id": self.quote_id,
            "start_time": self.start_time.isoformat(),
            "end_time": datetime.utcnow().isoformat(),
            "total_duration_ms": (datetime.utcnow() - self.start_time).total_seconds() * 1000,
            "events": self.events,
            "summary": {
                "total_events": len(self.events),
                "total_cells_updated": len(self.cell_updates),
                "total_errors": len(self.errors),
                "sheets_modified": list(set([u.get("sheet") for u in self.cell_updates if u.get("sheet")]))
            }
        }

        with open(filepath, "w") as f:
            json.dump(audit_data, f, indent=2)

    def get_summary(self) -> Dict[str, Any]:
        """Get summary of audit log"""
        return {
            "quote_id": self.quote_id,
            "total_events": len(self.events),
            "total_cells_updated": len(self.cell_updates),
            "total_errors": len(self.errors),
            "duration_ms": (datetime.utcnow() - self.start_time).total_seconds() * 1000
        }