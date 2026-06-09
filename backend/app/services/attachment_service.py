import os
import uuid
from fastapi import UploadFile, HTTPException
from app.config import settings

async def save_attachment(file: UploadFile) -> dict:
    ext = os.path.splitext(file.filename or "")[1].lower()

    if ext not in settings.ALLOWED_ATTACHMENT_EXTENSIONS:
        raise HTTPException(
            status_code=400,
            detail="Only PDF, DOCX, XLSX and PPTX attachments are allowed",
        )

    content = await file.read()
    max_bytes = settings.MAX_ATTACHMENT_MB * 1024 * 1024

    if len(content) > max_bytes:
        raise HTTPException(
            status_code=400,
            detail=f"Attachment must be under {settings.MAX_ATTACHMENT_MB} MB",
        )

    os.makedirs(settings.UPLOADS_DIR, exist_ok=True)

    stored = f"{uuid.uuid4().hex}{ext}"
    path = os.path.join(settings.UPLOADS_DIR, stored)

    with open(path, "wb") as f:
        f.write(content)

    return {
        "original_filename": file.filename,
        "stored_filename": stored,
        "file_path": path,
        "content_type": file.content_type,
        "size_bytes": len(content),
    }