import os

CODE = {
    "app/__init__.py": "",
    "app/routers/__init__.py": "",
    "app/services/__init__.py": "",
    "app/tasks/__init__.py": "",
    "app/agents/__init__.py": "",
    "app/mcp/__init__.py": "",
    "app/mcp/server.py": "def create_mcp_router(app):\n    pass\n",
    "app/services/transcription.py": "def transcribe_audio(file_bytes):\n    return 'transcribed audio'\n",
    "app/agents/research_agent.py": 'from app.tasks.celery_app import celery_app\n@celery_app.task\ndef run_research_agent(job_id, user_id, topic):\n    pass\n',
    "app/agents/digest_agent.py": 'from app.tasks.celery_app import celery_app\n@celery_app.task\ndef run_digest_agent(job_id, user_id):\n    pass\n',
    "app/agents/sync_agent.py": 'def sync_agent():\n    pass\n',
    
    "app/auth.py": """from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from app.database import get_supabase_anon

security = HTTPBearer()

def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)) -> dict:
    sb = get_supabase_anon()
    res = sb.auth.get_user(credentials.credentials)
    if not res.user:
        raise HTTPException(status_code=401, detail="Invalid auth token")
    return {"id": res.user.id, "email": res.user.email}
""",

    "app/services/embeddings.py": """from app.database import get_supabase
def get_embedding(text: str) -> list[float]:
    sb = get_supabase()
    res = sb.functions.invoke("embed", invoke_options={"body": {"input": text}})
    if hasattr(res, 'data'):
        return res.data
    return []
""",

    "app/services/llm.py": """import os
from groq import AsyncGroq
from app.config import settings

client = AsyncGroq(api_key=settings.GROQ_API_KEY)

async def chat_complete(messages: list, stream: bool = False):
    res = await client.chat.completions.create(
        model=settings.GROQ_MODEL,
        messages=messages,
        stream=stream
    )
    if not stream:
        return res.choices[0].message.content
    
    async def gen():
        async for chunk in res:
            if chunk.choices[0].delta.content:
                yield chunk.choices[0].delta.content
    return gen()
""",

    "app/services/retrieval.py": """from app.database import get_supabase
from app.services.embeddings import get_embedding

def search_memories(query: str, user_id: str, limit: int = 5):
    vec = get_embedding(query)
    sb = get_supabase()
    res = sb.rpc("match_chunks", {"query_embedding": vec, "match_threshold": 0.2, "match_count": limit, "p_user_id": user_id}).execute()
    return res.data if res.data else []
""",

    "app/services/ingestion.py": """from app.database import get_supabase
from app.services.embeddings import get_embedding

def process_memory(memory_id: str, user_id: str):
    sb = get_supabase()
    mem = sb.table("memories").select("*").eq("id", memory_id).execute().data[0]
    
    content = mem.get("content") or mem.get("title", "")
    chunk_text = content[:1000] # Basic split implementation
    vec = get_embedding(chunk_text)
    if vec:
        sb.table("chunks").insert({
            "memory_id": memory_id,
            "user_id": user_id,
            "content": chunk_text,
            "embedding": vec
        }).execute()
    sb.table("memories").update({"is_processed": True, "summary": chunk_text[:200]}).eq("id", memory_id).execute()
""",

    "app/tasks/ingest_task.py": """from app.tasks.celery_app import celery_app
from app.database import get_supabase
from app.services.ingestion import process_memory

@celery_app.task(name="app.tasks.ingest_task")
def ingest_task(memory_id: str, user_id: str):
    sb = get_supabase()
    jobs = sb.table("jobs").select("*").eq("memory_id", memory_id).execute()
    job_id = jobs.data[0]["id"] if jobs.data else None
    
    try:
        if job_id: sb.table("jobs").update({"status": "processing"}).eq("id", job_id).execute()
        process_memory(memory_id, user_id)
        if job_id: sb.table("jobs").update({"status": "completed", "progress": 100}).eq("id", job_id).execute()
    except Exception as e:
        if job_id: sb.table("jobs").update({"status": "failed", "error": str(e)}).eq("id", job_id).execute()
""",

    "app/routers/memories.py": """from fastapi import APIRouter, Depends
from pydantic import BaseModel
from app.auth import get_current_user
from app.database import get_supabase
from typing import Optional, List

router = APIRouter(prefix="/memories", tags=["memories"])

@router.get("")
def list_memories(source_type: Optional[str]=None, limit: int=20, user=Depends(get_current_user)):
    sb = get_supabase()
    q = sb.table("memories").select("*").eq("user_id", user["id"]).order("created_at", desc=True).limit(limit)
    if source_type: q = q.eq("source_type", source_type)
    res = q.execute()
    return {"memories": res.data, "offset": 0, "limit": limit}

@router.get("/{memory_id}")
def get_memory(memory_id: str, user=Depends(get_current_user)):
    res = get_supabase().table("memories").select("*, chunks(*)").eq("id", memory_id).eq("user_id", user["id"]).execute()
    return res.data[0] if res.data else None

class MemUpdate(BaseModel):
    title: Optional[str] = None
    summary: Optional[str] = None
    tags: Optional[List[str]] = None

@router.patch("/{memory_id}")
def update_memory(memory_id: str, body: MemUpdate, user=Depends(get_current_user)):
    data = body.dict(exclude_unset=True)
    res = get_supabase().table("memories").update(data).eq("id", memory_id).eq("user_id", user["id"]).execute()
    return res.data[0] if res.data else None

@router.delete("/{memory_id}")
def delete_memory(memory_id: str, user=Depends(get_current_user)):
    get_supabase().table("memories").delete().eq("id", memory_id).eq("user_id", user["id"]).execute()
    return {"ok": True}

@router.get("/{memory_id}/related")
def get_related(memory_id: str, user=Depends(get_current_user)):
    return []
""",

    "app/routers/search.py": """from fastapi import APIRouter, Depends
from app.auth import get_current_user
from app.services.retrieval import search_memories

router = APIRouter(prefix="/search", tags=["search"])

@router.get("")
def search(q: str, limit: int=8, user=Depends(get_current_user)):
    results = search_memories(q, user["id"], limit)
    return {"query": q, "results": results, "count": len(results)}
""",

    "app/routers/agents.py": """from fastapi import APIRouter, Depends
from app.auth import get_current_user
from app.database import get_supabase
from pydantic import BaseModel

router = APIRouter(prefix="/agents", tags=["agents"])

@router.get("/jobs")
def get_jobs(user=Depends(get_current_user)):
    res = get_supabase().table("jobs").select("*").eq("user_id", user["id"]).order("created_at", desc=True).limit(50).execute()
    return res.data

class ResearchReq(BaseModel):
    topic: str
    depth: int = 1

@router.post("/research")
def launch_research(body: ResearchReq, user=Depends(get_current_user)):
    res = get_supabase().table("jobs").insert({"user_id": user["id"], "job_type": "research", "status": "pending"}).execute()
    job_id = res.data[0]["id"]
    from app.agents.research_agent import run_research_agent
    run_research_agent.delay(job_id, user["id"], body.topic)
    return {"job_id": job_id}

@router.post("/digest")
def launch_digest(user=Depends(get_current_user)):
    res = get_supabase().table("jobs").insert({"user_id": user["id"], "job_type": "digest", "status": "pending"}).execute()
    job_id = res.data[0]["id"]
    from app.agents.digest_agent import run_digest_agent
    run_digest_agent.delay(job_id, user["id"])
    return {"job_id": job_id}
""",

    "app/routers/chat.py": """from fastapi import APIRouter, Depends
from typing import List, Dict, Optional
from pydantic import BaseModel
from fastapi.responses import StreamingResponse
from app.auth import get_current_user
from app.database import get_supabase
from app.services.llm import chat_complete
import json

router = APIRouter(prefix="/chat", tags=["chat"])

@router.get("/sessions")
def get_sessions(user=Depends(get_current_user)):
    res = get_supabase().table("chat_sessions").select("*").eq("user_id", user["id"]).order("created_at", desc=True).execute()
    return res.data

class SessionCreate(BaseModel):
    title: Optional[str] = "New Chat"

@router.post("/sessions")
def create_session(body: SessionCreate, user=Depends(get_current_user)):
    res = get_supabase().table("chat_sessions").insert({"user_id": user["id"], "title": body.title}).execute()
    return res.data[0]

@router.delete("/sessions/{session_id}")
def delete_session(session_id: str, user=Depends(get_current_user)):
    get_supabase().table("chat_sessions").delete().eq("id", session_id).eq("user_id", user["id"]).execute()
    return {"ok": True}

@router.get("/sessions/{session_id}/messages")
def get_messages(session_id: str, user=Depends(get_current_user)):
    res = get_supabase().table("chat_messages").select("*").eq("session_id", session_id).order("created_at", desc=False).execute()
    return res.data

class ChatStreamReq(BaseModel):
    message: str
    session_id: Optional[str] = None
    history: List[Dict[str, str]] = []

@router.post("/stream")
async def chat_stream(body: ChatStreamReq, user=Depends(get_current_user)):
    from app.services.retrieval import search_memories
    sb = get_supabase()
    context_memories = search_memories(body.message, user["id"], limit=5)
    
    context_str = "\\n".join([f"- {m.get('title', '')}: {m.get('content', '')}" for m in context_memories])
    system_msg = {"role": "system", "content": f"You are MemoryOS agent. Answer the user based on memories:\\n{context_str}"}
    msgs = [system_msg] + body.history + [{"role": "user", "content": body.message}]
    
    if body.session_id:
        sb.table("chat_messages").insert({"session_id": body.session_id, "role": "user", "content": body.message}).execute()
    
    async def event_generator():
        yield f"data: {json.dumps({'type':'sources', 'sources': [m.get('id') for m in context_memories]})}\\n\\n"
        full_response = ""
        try:
            stream = await chat_complete(msgs, stream=True)
            async for chunk in stream:
                full_response += chunk
                yield f"data: {json.dumps({'type':'token', 'content': chunk})}\\n\\n"
            if body.session_id:
                sb.table("chat_messages").insert({"session_id": body.session_id, "role": "assistant", "content": full_response}).execute()
            yield f"data: {json.dumps({'type':'done'})}\\n\\n"
        except Exception as e:
            yield f"data: {json.dumps({'type':'error', 'content': str(e)})}\\n\\n"

    return StreamingResponse(event_generator(), media_type="text/event-stream")
""",
}

if __name__ == "__main__":
    for path, content in CODE.items():
        if os.path.exists(path):  # only overwrite target files that actually exist to safely restore
            with open(path, "w", encoding="utf-8") as f:
                f.write(content)
