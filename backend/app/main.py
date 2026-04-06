from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.routers import chat, upload, memories, search, agents, spaces, flashcards, public, analytics

app = FastAPI(title="MemoryOS API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.FRONTEND_URL, "http://localhost:3000", "http://127.0.0.1:3000", "https://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(chat.router)
app.include_router(upload.router)
app.include_router(memories.router)
app.include_router(public.router)
app.include_router(analytics.router)
app.include_router(search.router)
app.include_router(agents.router)
app.include_router(spaces.router)
app.include_router(flashcards.router)

try:
    from app.mcp.server import create_mcp_router
    create_mcp_router(app)
except ImportError:
    pass

@app.get("/")
def health(): return {"status": "ok"}
