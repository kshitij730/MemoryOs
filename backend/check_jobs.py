import os
import sys

from app.config import settings
from supabase import create_client

def inspect_jobs():
    sb = create_client(settings.SUPABASE_URL, settings.SUPABASE_SERVICE_KEY)
    
    # Get recent jobs
    print("----- RECENT JOBS -----")
    jobs = sb.table("jobs").select("*").order("created_at", desc=True).limit(5).execute()
    for j in jobs.data:
        print(f"[{j['status']}] job_id={j['id']} memory_id={j['memory_id']} error={j.get('error')}")

    # Check the specific memory's processed status
    print("\n----- RECENT MEMORIES -----")
    mems = sb.table("memories").select("id, title, is_processed, source_type").order("created_at", desc=True).limit(5).execute()
    for m in mems.data:
        print(f"Memory: {m['title']} | is_processed={m['is_processed']} | type={m['source_type']}")

if __name__ == "__main__":
    inspect_jobs()
