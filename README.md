# MemoryOS — Your AI-Powered Second Brain

> **Self-hosted NotebookLM + Mem.ai**, built on Groq (Llama 3.3 70B), Supabase pgvector, and Next.js 14.

![Stack](https://img.shields.io/badge/LLM-Groq%20Llama%203.3%2070B-orange)
![Stack](https://img.shields.io/badge/Embeddings-Supabase%20gte--small-blue)
![Stack](https://img.shields.io/badge/DB-Supabase%20pgvector-green)
![Stack](https://img.shields.io/badge/Frontend-Next.js%2014-black)

---

## Features

- **Universal ingestion** — PDF, DOCX, TXT, MD, URLs, voice memos, plain notes
- **Streaming RAG chat** — Groq's Llama 3.3 70B with real-time token streaming via SSE
- **Hybrid search** — BM25 + pgvector cosine similarity fused via Reciprocal Rank Fusion
- **Knowledge Graph** — D3 force-directed graph connecting memories by shared tags
- **MCP server** — Connect Claude Desktop, Cursor, or Zed directly to your memories
- **Chrome Extension** — Save any page with right-click → "Save to MemoryOS"
- **Background agents** — Research agent (Tavily), daily digest agent (Groq)
- **Zero embedding cost** — Supabase gte-small Edge Function (free tier)
- **Supabase Auth** — Email/password + magic link, RLS on every table

---

## Tech Stack

| Layer | Technology |
|---|---|
| LLM | Groq `llama-3.3-70b-versatile` |
| Embeddings | Supabase Edge Function `gte-small` (384d, free) |
| Database | Supabase PostgreSQL + `pgvector` |
| Auth | Supabase Auth |
| Storage | Supabase Storage |
| Realtime | Supabase Realtime (job status) |
| Frontend | Next.js 14 (App Router), TypeScript, Tailwind |
| Animations | Framer Motion |
| Backend | FastAPI (Python 3.11), async everywhere |
| Search | Hybrid BM25 + cosine via RRF |
| Workers | Celery + Upstash Redis |
| Observability | Langfuse |
| Voice | OpenAI Whisper (local, free) |
| MCP | Official `mcp` Python SDK, SSE transport |

---

## Quick Start

### Prerequisites

- Node.js 18+ and Python 3.11+
- [Supabase](https://supabase.com) project (free)
- [Groq API key](https://console.groq.com) (free)
- [Upstash Redis](https://upstash.com) (free) for Celery

### 1. Clone & Configure

```bash
git clone <repo> memoryos && cd memoryos
cp .env.example .env
# Fill in GROQ_API_KEY, SUPABASE_URL, SUPABASE_SERVICE_KEY, etc.
```

### 2. Database Setup

In your Supabase Dashboard → SQL Editor, run:
```sql
-- paste contents of supabase/migrations/001_initial.sql
```

Then deploy the embedding Edge Function:
```bash
supabase functions deploy embed
```

### 3. Backend

```bash
cd backend
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000

# In a separate terminal — Celery worker:
celery -A app.tasks.celery_app worker --loglevel=info
```

### 4. Frontend

```bash
cd frontend
npm install
npm run dev   # http://localhost:3000
```

### 5. Docker (all-in-one)

```bash
docker-compose up -d
```

---

## Environment Variables

See [`.env.example`](.env.example) for all required variables.

| Variable | Description |
|---|---|
| `GROQ_API_KEY` | Groq API key — primary LLM |
| `SUPABASE_URL` | Your Supabase project URL |
| `SUPABASE_SERVICE_KEY` | Service role key (backend only) |
| `SUPABASE_ANON_KEY` | Anon key (frontend safe) |
| `REDIS_URL` | Upstash Redis URL (for Celery) |
| `LANGFUSE_*` | Optional — LLM observability |
| `TAVILY_API_KEY` | Optional — research agent |

---

## MCP Integration (Claude Desktop)

Add to `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "memoryos": {
      "url": "https://your-backend.railway.app/mcp/sse",
      "headers": {
        "Authorization": "Bearer <your_memoryos_api_key>"
      }
    }
  }
}
```

Your API key is in Settings → API Key in the MemoryOS app.

### Available MCP Tools

| Tool | Description |
|---|---|
| `search_memory` | Semantic + keyword search across all memories |
| `add_memory` | Save new text to your memory bank |
| `list_memories` | List recent memories, filter by tag |

---

## Deployment

| Service | Platform |
|---|---|
| Frontend | Vercel (zero config, push to deploy) |
| Backend + Celery | Railway (`Dockerfile` provided) |
| Database + Auth + Embeddings | Supabase (free tier) |
| Redis | Upstash (free tier) |

**Estimated monthly cost on free tiers: $0**

---

## Architecture

```
Browser / Claude Desktop / Extension
       │
       ▼
  Next.js (Vercel)
  ├── App Router pages
  ├── Supabase Auth middleware
  └── API proxy → FastAPI
              │
              ▼
         FastAPI (Railway)
         ├── /chat/stream  ← SSE streaming RAG
         ├── /upload/*     ← Ingestion triggers
         ├── /memories     ← CRUD
         ├── /search       ← Hybrid BM25 + vector
         ├── /agents/*     ← Background agent triggers
         └── /mcp/sse      ← MCP SSE server
              │
              ├── Groq (llama-3.3-70b-versatile) ← LLM
              ├── Supabase DB (pgvector) ← Chunks + embeddings
              ├── Supabase Storage ← Files + audio
              └── Celery + Redis ← Background ingestion
                        │
                        ▼
               Supabase Edge Function
               └── gte-small embeddings (384d)
```

---

## Project Structure

```
memoryos/
├── frontend/          Next.js 14 app (TypeScript + Tailwind)
├── backend/           FastAPI + Celery workers
│   └── app/
│       ├── routers/   HTTP endpoints
│       ├── services/  LLM, embeddings, ingestion, retrieval
│       ├── agents/    Research, digest, sync agents
│       ├── mcp/       MCP SSE server
│       └── tasks/     Celery task definitions
├── supabase/
│   ├── migrations/    SQL schema (pgvector + RLS)
│   └── functions/     embed Edge Function (gte-small)
├── extension/         Chrome MV3 extension
└── docker-compose.yml Local dev stack
```

---

## License

MIT — build your second brain.
