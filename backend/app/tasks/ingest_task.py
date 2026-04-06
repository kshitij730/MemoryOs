import asyncio
from app.tasks.celery_app import celery_app
from app.database import get_supabase
from app.services.ingestion import process_memory

@celery_app.task(name="app.tasks.ingest_task")
def ingest_task(memory_id: str, user_id: str):
    sb = get_supabase()
    jobs = sb.table("jobs").select("*").eq("memory_id", memory_id).execute()
    job_id = jobs.data[0]["id"] if jobs.data else None
    
    try:
        if job_id: sb.table("jobs").update({"status": "running"}).eq("id", job_id).execute()
        asyncio.run(process_memory(memory_id, user_id))
        if job_id: sb.table("jobs").update({"status": "done", "progress": 100}).eq("id", job_id).execute()
    except Exception as e:
        if job_id: sb.table("jobs").update({"status": "failed", "error": str(e)}).eq("id", job_id).execute()
