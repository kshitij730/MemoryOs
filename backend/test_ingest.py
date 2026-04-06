import sys
from app.tasks.ingest_task import ingest_task

# I will pass memory_id and user_id that are pending
memory_id = "fbe3d249-14a0-43b5-bd9c-afbadfa58a60"
user_id = "5cbdac0a-1d13-43da-aab3-97b0a8277be9"

try:
    print("Executing ingest_task locally...")
    ingest_task(memory_id, user_id)
    print("Done")
except Exception as e:
    import traceback
    traceback.print_exc()
