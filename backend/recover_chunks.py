import sys
from app.database import get_supabase
from app.services.ingestion import process_memory

def recover_chunks():
    sb = get_supabase()
    # Find all processed memories
    mems = sb.table("memories").select("id, user_id").eq("is_processed", True).execute()
    print(f"Checking {len(mems.data)} processed memories for missing chunks...")
    
    for m in mems.data:
        memory_id = m["id"]
        user_id = m["user_id"]
        
        # Check chunk count
        chunks = sb.table("chunks").select("id").eq("memory_id", memory_id).execute()
        
        if len(chunks.data) == 0:
            print(f"Memory {memory_id} has 0 chunks! Re-processing...")
            try:
                process_memory(memory_id, user_id)
                print("Done processing.")
            except Exception as e:
                print(f"Failed: {e}")

if __name__ == "__main__":
    recover_chunks()
