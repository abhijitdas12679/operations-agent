import os
from urllib.parse import quote


def get_download_url(file_path: str) -> str:
    """Convert saved file path to browser download URL."""
    return f"/documents/download?path={quote(file_path)}"


def safe_str(value) -> str:
    if value is None:
        return ""
    return str(value)