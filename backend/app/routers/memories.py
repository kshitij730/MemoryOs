from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from app.auth import get_current_user
from app.database import get_supabase
from typing import Optional, List
import uuid

router = APIRouter(prefix="/memories", tags=["memories"])

def is_valid_uuid(val: str):
    try:
        uuid.UUID(str(val))
        return True
    except ValueError:
        return False

@router.get("")
def list_memories(source_type: Optional[str]=None, space_id: Optional[str]=None, limit: int=20, user=Depends(get_current_user)):
    sb = get_supabase()
    q = sb.table("memories").select("*").eq("user_id", user["id"]).order("created_at", desc=True).limit(limit)
    if source_type: q = q.eq("source_type", source_type)
    if space_id: q = q.eq("space_id", space_id)
    res = q.execute()
    return {"memories": res.data, "offset": 0, "limit": limit}

@router.get("/{memory_id}")
def get_memory(memory_id: str, user=Depends(get_current_user)):
    if not is_valid_uuid(memory_id):
         raise HTTPException(status_code=400, detail="Invalid memory ID format")
         
    res = get_supabase().table("memories").select("*, memory_chunks(*)").eq("id", memory_id).eq("user_id", user["id"]).execute()
    return res.data[0] if res.data else None

class MemUpdate(BaseModel):
    title: Optional[str] = None
    summary: Optional[str] = None
    tags: Optional[List[str]] = None

@router.patch("/{memory_id}")
def update_memory(memory_id: str, body: MemUpdate, user=Depends(get_current_user)):
    if not is_valid_uuid(memory_id):
         raise HTTPException(status_code=400, detail="Invalid memory ID format")
         
    data = body.dict(exclude_unset=True)
    res = get_supabase().table("memories").update(data).eq("id", memory_id).eq("user_id", user["id"]).execute()
    return res.data[0] if res.data else None

@router.delete("/{memory_id}")
def delete_memory(memory_id: str, user=Depends(get_current_user)):
    if not is_valid_uuid(memory_id):
         raise HTTPException(status_code=400, detail="Invalid memory ID format")
         
    get_supabase().table("memories").delete().eq("id", memory_id).eq("user_id", user["id"]).execute()
    return {"ok": True}

@router.get("/{memory_id}/related")
def get_related(memory_id: str, user=Depends(get_current_user)):
    if not is_valid_uuid(memory_id): return []
    
    sb = get_supabase()
    # 1. Get the current memory's title or summary to use as query
    mem = sb.table("memories").select("title, summary").eq("id", memory_id).execute().data
    if not mem: return []
    
    query = mem[0].get("summary") or mem[0].get("title")
    
    # 2. Vector search for similar memories (simplified for now — normally we'd exclude current ID)
    from app.services.retrieval import search_memories
    results = search_memories(query, user["id"], limit=5)
    
    # Filter out current memory
    related = [r for r in results if str(r.get("memory_id")) != memory_id]
    
    # Fetch memory details for the results
    if not related: return []
    
    related_ids = list(set([r["memory_id"] for r in related]))
    mems = sb.table("memories").select("*").in_("id", related_ids).execute().data
    return mems

@router.post("/{memory_id}/publish")
def publish_memory(memory_id: str, user=Depends(get_current_user)):
    import secrets
    import string
    
    # 1. Generate slug
    alphabet = string.ascii_letters + string.digits
    slug = ''.join(secrets.choice(alphabet) for _ in range(8))
    
    # 2. Update memory
    res = get_supabase().table("memories").update({
        "is_public": True,
        "public_slug": slug
    }).eq("id", memory_id).eq("user_id", user["id"]).execute()
    
    if not res.data:
        raise HTTPException(status_code=404, detail="Memory not found")
        
    return res.data[0]

@router.post("/{memory_id}/unpublish")
def unpublish_memory(memory_id: str, user=Depends(get_current_user)):
    res = get_supabase().table("memories").update({
        "is_public": False
    }).eq("id", memory_id).eq("user_id", user["id"]).execute()
    
    if not res.data:
        raise HTTPException(status_code=404, detail="Memory not found")
        
    return res.data[0]
