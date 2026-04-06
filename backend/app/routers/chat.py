from fastapi import APIRouter, Depends
from typing import List, Dict, Optional
from pydantic import BaseModel
from fastapi.responses import StreamingResponse
from app.auth import get_current_user
from app.database import get_supabase
from app.services.llm import chat_complete
from app.services.retrieval import search_memories
import json

router = APIRouter(prefix="/chat", tags=["chat"])

@router.get("/sessions")
def get_sessions(space_id: Optional[str] = None, user=Depends(get_current_user)):
    q = get_supabase().table("chat_sessions").select("*").eq("user_id", user["id"]).order("created_at", desc=True)
    if space_id: q = q.eq("space_id", space_id)
    res = q.execute()
    return res.data

class SessionCreate(BaseModel):
    title: Optional[str] = "New Chat"
    space_id: Optional[str] = None

@router.post("/sessions")
def create_session(body: SessionCreate, user=Depends(get_current_user)):
    res = get_supabase().table("chat_sessions").insert({
        "user_id": user["id"], 
        "title": body.title,
        "space_id": body.space_id
    }).execute()
    return res.data[0]

@router.delete("/sessions/{session_id}")
def delete_session(session_id: str, user=Depends(get_current_user)):
    get_supabase().table("chat_sessions").delete().eq("id", session_id).eq("user_id", user["id"]).execute()
    return {"ok": True}

@router.get("/sessions/{session_id}/messages")
def get_messages(session_id: str, user=Depends(get_current_user)):
    res = get_supabase().table("chat_messages").select("*").eq("session_id", session_id).order("created_at", desc=False).execute()
    return res.data

async def auto_rename_session(session_id: str, user_msg: str):
    sb = get_supabase()
    # Check if session is still 'New Chat'
    sess = sb.table("chat_sessions").select("title").eq("id", session_id).execute().data
    if sess and sess[0]["title"] == "New Chat":
        prompt = f"Generate a short (3-5 words) descriptive title for a chat that starts with this message: '{user_msg}'. Return ONLY the title string, no quotes."
        new_title = await chat_complete([{"role": "user", "content": prompt}])
        new_title = new_title.strip().strip('"').strip("'")
        sb.table("chat_sessions").update({"title": new_title}).eq("id", session_id).execute()

class ChatStreamReq(BaseModel):
    message: str
    session_id: Optional[str] = None
    space_id: Optional[str] = None
    history: List[Dict[str, str]] = []

@router.post("/stream")
async def chat_stream(body: ChatStreamReq, user=Depends(get_current_user)):
    sb = get_supabase()
    context_memories = search_memories(body.message, user["id"], limit=5, space_id=body.space_id)
    
    # Pre-calculate sources for SSE
    sources = []
    for i, m in enumerate(context_memories):
        sources.append({
            "index": i + 1,
            "chunk_id": m.get("id"),
            "memory_id": m.get("memory_id"),
            "title": m.get("title", "Untitled"),
            "source_type": m.get("source_type"),
            "snippet": m.get("content", "")[:300] + "...",
            "similarity": m.get("similarity", 0)
        })

    # Build context with indices for citation
    context_items = []
    for i, m in enumerate(context_memories):
        context_items.append(f"[{i+1}] {m.get('title', 'Unknown')}: {m.get('content', '')}")
    context_str = "\n\n".join(context_items)

    system_prompt = f"""You are MemoryOS, a premium AI personal memory assistant. 
Your goal is to help the user recall and synthesize information from their saved memories.

RULES:
1. TONE: Be concise, direct, and sophisticated. Use a personal tone (e.g., "You mentioned...", "According to your document..."). 
2. NO PREAMBLE: Do NOT start with "Sure," "I'll break down," or "Here is the information." Just answer directly.
3. CITATIONS: Use numerical citations like [1], [2] at the end of relevant sentences to attribute information to the specific memory index.
4. FORMATTING: Use clean Markdown (bolding, lists) to make information scannable. Avoid overly long paragraphs.
5. GROUNDING: Only answer based on the provided context. If no relevant info exists, say you don't recall that in their brain.

CONTEXT MEMORIES:
{context_str}"""

    msgs = [{"role": "system", "content": system_prompt}] + body.history + [{"role": "user", "content": body.message}]
    
    if body.session_id:
        sb.table("chat_messages").insert({"session_id": body.session_id, "role": "user", "content": body.message}).execute()
        # Optional renaming for first session message
        if not body.history:
            import asyncio
            asyncio.create_task(auto_rename_session(body.session_id, body.message))
    
    async def event_generator():
        yield f"data: {json.dumps({'type':'sources', 'sources': sources})}\n\n"
        full_response = ""
        try:
            stream = await chat_complete(msgs, stream=True)
            async for chunk in stream:
                full_response += chunk
                yield f"data: {json.dumps({'type':'token', 'content': chunk})}\n\n"
            
            # Save assistant message
            if body.session_id:
                sb.table("chat_messages").insert({
                    "session_id": body.session_id, 
                    "role": "assistant", 
                    "content": full_response,
                    "sources": sources
                }).execute()
            yield f"data: {json.dumps({'type':'done'})}\n\n"
        except Exception as e:
            yield f"data: {json.dumps({'type':'error', 'content': str(e)})}\n\n"

    return StreamingResponse(event_generator(), media_type="text/event-stream")
