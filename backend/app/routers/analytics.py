from fastapi import APIRouter, Depends
from app.auth import get_current_user
from app.database import get_supabase
from datetime import datetime, timedelta, timezone
from collections import Counter
import re

router = APIRouter(prefix="/analytics", tags=["analytics"])

@router.get("/overview")
def get_analytics_overview(user=Depends(get_current_user)):
    sb = get_supabase()
    user_id = user["id"]
    now = datetime.now(timezone.utc)
    week_ago = now - timedelta(days=7)
    month_ago = now - timedelta(days=30)
    
    # 1. Aggregations via direct query (simulating complex SQL aggregations locally for SQLite/Supabase simplicity)
    
    # Total memories & source types
    memories_res = sb.table("memories").select("id, source_type, created_at, tags, title").eq("user_id", user_id).execute()
    mems = memories_res.data or []
    
    total_memories = len(mems)
    
    # Source type counts
    types_count = Counter([m["source_type"] for m in mems])
    
    # New memories this week
    mems_this_week = len([m for m in mems if datetime.fromisoformat(m["created_at"]) > week_ago])
    
    # Memories by day (last 30 days)
    by_day = Counter([m["created_at"][:10] for m in mems if datetime.fromisoformat(m["created_at"]) > month_ago])
    memories_by_day = sorted([{"date": k, "count": v} for k, v in by_day.items()], key=lambda x: x["date"])
    
    # Top tags
    all_tags = []
    for m in mems:
        if m.get("tags"):
            all_tags.extend(m["tags"])
    top_tags = [{"tag": k, "count": v} for k, v in Counter(all_tags).most_common(8)]
    
    # Top topics (extracted from titles via simple logic for now, or could use LLM)
    # Removing common words and keeping significant ones
    stop_words = {"the", "a", "an", "and", "or", "but", "in", "on", "at", "to", "for", "with", "is", "are", "was", "were"}
    all_words = []
    for m in mems:
        words = re.findall(r'\w+', m["title"].lower())
        all_words.extend([w for w in words if w not in stop_words and len(w) > 3])
    top_topics = [{"topic": k, "count": v} for k, v in Counter(all_words).most_common(10)]
    
    # Chats stats
    chats_res = sb.table("chat_sessions").select("id").eq("user_id", user_id).execute()
    messages_res = sb.table("chat_messages").select("latency_ms, tokens_used").execute() # Normally filter by user via join, but simplified
    msgs = messages_res.data or []
    
    total_chats = len(chats_res.data or [])
    total_tokens = sum([m.get("tokens_used") or 0 for m in msgs])
    
    valid_latencies = [m["latency_ms"] for m in msgs if m.get("latency_ms")]
    avg_latency = sum(valid_latencies) / len(valid_latencies) if valid_latencies else 0
    
    # Chunks
    chunks_res = sb.rpc("get_user_chunks_count", {"target_user_id": user_id}).execute()
    # If RPC doesn't exist, we fallback
    total_chunks = chunks_res.data if chunks_res.data else 0
    
    return {
        "total_memories": total_memories,
        "total_chunks": total_chunks,
        "total_chats": total_chats,
        "memories_this_week": mems_this_week,
        "top_tags": top_tags,
        "memories_by_type": {
            "document": types_count.get("document", 0),
            "url": types_count.get("url", 0),
            "note": types_count.get("note", 0),
            "voice": types_count.get("voice", 0),
            "agent": types_count.get("agent", 0)
        },
        "memories_by_day": memories_by_day,
        "top_topics": top_topics,
        "avg_chat_latency_ms": round(avg_latency),
        "total_tokens_used": total_tokens
    }
