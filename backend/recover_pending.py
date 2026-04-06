import asyncio
from app.database import get_supabase
from app.services.ingestion import process_memory

async def recover_all_pending():
    sb = get_supabase()
    # Let's target even the memories marked as processed but that have NO content (stuck with empty content)
    mems = sb.table("memories").select("*").execute()
    stuck = [m for m in mems.data if not m.get("content") or m.get("content") == "No content extracted."]
    
    print(f"Found {len(stuck)} memories with missing content.")
    for m in stuck:
        memory_id = m["id"]
        user_id = m["user_id"]
        try:
            print(f"Processing memory {m['title']} ({memory_id})...")
            await process_memory(memory_id, user_id)
            print("Done.")
        except Exception as e:
            print(f"Failed to process {memory_id}: {e}")

if __name__ == "__main__":
    asyncio.run(recover_all_pending())
