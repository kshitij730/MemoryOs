import uuid
import os
from typing import Optional
from fastapi import APIRouter, Depends, File, Form, UploadFile, HTTPException
from pydantic import BaseModel

from app.auth import get_current_user
from app.database import get_supabase
from app.config import settings

router = APIRouter(prefix="/upload", tags=["upload"])

ALLOWED_EXTENSIONS = {".pdf", ".docx", ".txt", ".md", ".mp3", ".wav", ".m4a", ".ogg", ".webm"}
MAX_FILE_SIZE = 50 * 1024 * 1024  # 50 MB

def _create_job_and_queue(memory_id: str, user_id: str) -> str:
    supabase = get_supabase()
    job_result = supabase.table("jobs").insert({
        "user_id": user_id,
        "memory_id": memory_id,
        "job_type": "ingest",
        "status": "pending",
        "progress": 0,
    }).execute()
    job_id = job_result.data[0]["id"]

    from app.tasks.ingest_task import ingest_task
    ingest_task.delay(memory_id, user_id)

    return job_id

@router.post("/file")
async def upload_file(
    file: UploadFile = File(...),
    title: str = Form(...),
    tags: str = Form(""),
    space_id: Optional[str] = Form(None),
    user: dict = Depends(get_current_user),
):
    ext = os.path.splitext(file.filename or "")[-1].lower()
    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(status_code=400, detail=f"File type {ext} not allowed.")

    file_bytes = await file.read()
    if len(file_bytes) > MAX_FILE_SIZE:
        raise HTTPException(status_code=400, detail="File exceeds 50MB limit")

    audio_exts = {".mp3", ".wav", ".m4a", ".ogg", ".webm"}
    source_type = "voice" if ext in audio_exts else "document"

    supabase = get_supabase()
    file_path = f"{user['id']}/{uuid.uuid4()}{ext}"
    supabase.storage.from_(settings.SUPABASE_BUCKET).upload(
        file_path, file_bytes, {"content-type": file.content_type or "application/octet-stream"}
    )

    tag_list = [t.strip() for t in tags.split(",") if t.strip()]
    memory_result = supabase.table("memories").insert({
        "user_id": user["id"],
        "title": title or file.filename,
        "source_type": source_type,
        "file_path": file_path,
        "tags": tag_list,
        "space_id": space_id,
        "metadata": {"filename": file.filename, "size_bytes": len(file_bytes)},
    }).execute()
    
    memory_id = memory_result.data[0]["id"]
    job_id = _create_job_and_queue(memory_id, user["id"])
    return {"memory_id": memory_id, "job_id": job_id, "status": "queued"}

class URLRequest(BaseModel):
    url: str
    title: str | None = None
    tags: list[str] = []
    space_id: str | None = None

@router.post("/url")
def upload_url(body: URLRequest, user: dict = Depends(get_current_user)):
    if not body.url.startswith(("http://", "https://")):
        raise HTTPException(status_code=400, detail="Invalid URL")

    supabase = get_supabase()
    memory_result = supabase.table("memories").insert({
        "user_id": user["id"],
        "title": body.title or body.url,
        "source_type": "url",
        "source_url": body.url,
        "tags": body.tags,
        "space_id": body.space_id,
    }).execute()
    memory_id = memory_result.data[0]["id"]
    job_id = _create_job_and_queue(memory_id, user["id"])
    return {"memory_id": memory_id, "job_id": job_id, "status": "queued"}

class NoteRequest(BaseModel):
    title: str
    content: str
    tags: list[str] = []
    space_id: str | None = None

@router.post("/note")
def upload_note(body: NoteRequest, user: dict = Depends(get_current_user)):
    if not body.content.strip():
         raise HTTPException(status_code=400, detail="Note content cannot be empty")

    supabase = get_supabase()
    memory_result = supabase.table("memories").insert({
         "user_id": user["id"],
         "title": body.title,
         "content": body.content,
         "source_type": "note",
         "tags": body.tags,
         "space_id": body.space_id,
    }).execute()
    memory_id = memory_result.data[0]["id"]
    job_id = _create_job_and_queue(memory_id, user["id"])
    return {"memory_id": memory_id, "job_id": job_id, "status": "queued"}
