from fastapi import APIRouter, Depends
from app.auth import get_current_user
from app.services.retrieval import search_memories

router = APIRouter(prefix="/search", tags=["search"])

@router.get("")
def search(q: str, limit: int=8, user=Depends(get_current_user)):
    results = search_memories(q, user["id"], limit)
    return {"query": q, "results": results, "count": len(results)}
