"""
Quote Manager for filesystem operations
"""

import json
import shutil
from pathlib import Path
from datetime import datetime
from typing import Dict, Any, List, Optional
import uuid
from core.config import settings

class QuoteManager:
    """Manages quote storage on filesystem"""

    def __init__(self):
        self.quotes_dir = Path(settings.QUOTES_STORAGE_PATH)
        self.quotes_dir.mkdir(parents=True, exist_ok=True)

    async def list_quotes_from_filesystem(
        self,
        page: int = 1,
        limit: int = 20,
        status: Optional[str] = None,
        insured: Optional[str] = None
    ) -> Dict[str, Any]:
        """List quotes from filesystem"""
        quotes = []

        # Read all quote metadata files
        for quote_dir in self.quotes_dir.iterdir():
            if quote_dir.is_dir():
                metadata_file = quote_dir / "metadata.json"
                if metadata_file.exists():
                    with open(metadata_file, "r") as f:
                        metadata = json.load(f)

                        # Apply filters
                        if status and metadata.get("status") != status:
                            continue
                        if insured and insured.lower() not in metadata.get("insured_name", "").lower():
                            continue

                        quotes.append(metadata)

        # Sort by creation date (newest first)
        quotes.sort(key=lambda x: x.get("created_at", ""), reverse=True)

        # Apply pagination
        total = len(quotes)
        start = (page - 1) * limit
        end = start + limit
        paginated_quotes = quotes[start:end]

        return {
            "quotes": paginated_quotes,
            "total": total,
            "page": page,
            "pages": (total + limit - 1) // limit
        }

    async def load_quote_from_filesystem(self, quote_id: str) -> Optional[Dict[str, Any]]:
        """Load quote from filesystem"""
        quote_dir = self.quotes_dir / quote_id

        if not quote_dir.exists():
            return None

        result = {
            "quote_id": quote_id,
            "status": "unknown",
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow()
        }

        # Load metadata
        metadata_file = quote_dir / "metadata.json"
        if metadata_file.exists():
            with open(metadata_file, "r") as f:
                metadata = json.load(f)
                result.update(metadata)

        # Load input data
        input_file = quote_dir / "input.json"
        if input_file.exists():
            with open(input_file, "r") as f:
                result["input_data"] = json.load(f)

        # Load output data
        output_file = quote_dir / "output.json"
        if output_file.exists():
            with open(output_file, "r") as f:
                result["output_data"] = json.load(f)

        return result

    async def create_version_backup(self, quote_id: str):
        """Create a versioned backup of the current quote"""
        quote_dir = self.quotes_dir / quote_id

        if not quote_dir.exists():
            return

        versions_dir = quote_dir / "versions"
        versions_dir.mkdir(exist_ok=True)

        # Get version number
        version_num = len(list(versions_dir.glob("v*_input.json"))) + 1

        # Backup current files
        for filename in ["input.json", "output.json", "metadata.json"]:
            source = quote_dir / filename
            if source.exists():
                dest = versions_dir / f"v{version_num}_{filename}"
                shutil.copy2(source, dest)

        # Create timestamp file
        timestamp_file = versions_dir / f"v{version_num}_timestamp.txt"
        with open(timestamp_file, "w") as f:
            f.write(datetime.utcnow().isoformat())

    async def delete_quote_from_filesystem(self, quote_id: str):
        """Delete quote from filesystem"""
        quote_dir = self.quotes_dir / quote_id

        if quote_dir.exists():
            shutil.rmtree(quote_dir)

    async def archive_old_quotes(self, days: int = 90):
        """Archive quotes older than specified days"""
        archive_dir = self.quotes_dir / "archive"
        archive_dir.mkdir(exist_ok=True)

        cutoff_date = datetime.utcnow().timestamp() - (days * 86400)

        for quote_dir in self.quotes_dir.iterdir():
            if quote_dir.is_dir() and quote_dir.name != "archive":
                metadata_file = quote_dir / "metadata.json"

                if metadata_file.exists():
                    # Check modification time
                    if metadata_file.stat().st_mtime < cutoff_date:
                        # Move to archive
                        dest = archive_dir / quote_dir.name
                        shutil.move(str(quote_dir), str(dest))

    async def get_quote_statistics(self) -> Dict[str, Any]:
        """Get statistics about stored quotes"""
        stats = {
            "total_quotes": 0,
            "by_status": {},
            "by_pl2": {},
            "total_size_mb": 0
        }

        for quote_dir in self.quotes_dir.iterdir():
            if quote_dir.is_dir():
                stats["total_quotes"] += 1

                # Get directory size
                dir_size = sum(f.stat().st_size for f in quote_dir.rglob("*") if f.is_file())
                stats["total_size_mb"] += dir_size / (1024 * 1024)

                # Read metadata for categorization
                metadata_file = quote_dir / "metadata.json"
                if metadata_file.exists():
                    with open(metadata_file, "r") as f:
                        metadata = json.load(f)

                        status = metadata.get("status", "unknown")
                        stats["by_status"][status] = stats["by_status"].get(status, 0) + 1

                        pl2 = metadata.get("pl2_selection", "unknown")
                        stats["by_pl2"][pl2] = stats["by_pl2"].get(pl2, 0) + 1

        return stats