from app.database import get_supabase
from app.services.embeddings import get_embedding
from typing import Optional, List

def search_memories(query: str, user_id: str, limit: int = 5, space_id: Optional[str] = None):
    vec = get_embedding(query)
    sb = get_supabase()
    # 1. Vector search with space_id filtering
    res = sb.rpc("match_chunks_with_space", {
        "query_embedding": vec, 
        "match_threshold": 0.2, 
        "match_count": limit, 
        "match_user_id": user_id,
        "match_space_id": space_id
    }).execute()
    
    chunks = res.data if res.data else []
    if not chunks: return []
    
    # 2. Enrich with memory titles
    memory_ids = list(set([c["memory_id"] for c in chunks]))
    mems_res = sb.table("memories").select("id, title, source_type").in_("id", memory_ids).execute()
    mems_map = {m["id"]: m for m in mems_res.data}
    
    for c in chunks:
        mem = mems_map.get(c["memory_id"], {})
        c["title"] = mem.get("title", "Untitled")
        c["source_type"] = mem.get("source_type", "note")
        
    return chunks
