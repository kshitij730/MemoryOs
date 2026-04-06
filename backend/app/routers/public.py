from fastapi import APIRouter, HTTPException
from app.database import get_supabase

router = APIRouter(prefix="/public", tags=["public"])

@router.get("/{slug}")
def get_public_memory(slug: str):
    sb = get_supabase()
    
    # 1. Fetch memory by slug and ensure it's public
    res = sb.table("memories").select("*, chunks(*)").eq("public_slug", slug).eq("is_public", True).execute()
    
    if not res.data:
        raise HTTPException(status_code=404, detail="Shared memory not found or is no longer public")
    
    return res.data[0]
