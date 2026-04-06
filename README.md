# 🧠 MemoryOS: The Synaptic Personal Knowledge Engine

MemoryOS is a high-fidelity, self-hosted intelligence layer designed to function as a "Second Brain." It goes beyond simple note-taking by utilizing a multi-modal ingestion pipeline and a hybrid neural search engine to make your personal data instantly retrievable and actionable.

---

## 🛠️ Comprehensive Tech Stack

### 💻 Frontend (The Command Center)
*   ⚛️ **Next.js 14**: Utilizing App Router for server-side performance and React 18 for seamless UI.
*   TypeScript: Strict typing for robust, error-free development.
*   🌈 **Tailwind CSS**: Custom utility-first styling for a premium glassmorphic aesthetic.
*   🎭 **Framer Motion**: Fluid, physics-based micro-interactions and transitions.
*   🏗️ **Shadcn UI**: High-end accessible component architecture.
*   🔄 **SWR / React Query**: Efficient data fetching and optimistic state updates.

### ⚙️ Backend (The Neural Core)
*   ⚡ **FastAPI**: High-performance, asynchronous Python framework for orchestrating services.
*   🧠 **Groq (Llama 3.3 70B)**: The ultra-low latency LLM power house for real-time interaction.
*   🏗️ **Pydantic V2**: Data validation and serialization at the speed of C++.
*   📦 **SQLAlchemy / Supabase-Py**: High-level abstraction for vector-enabled PostgreSQL operations.
*   🐝 **Celery / Redis**: Distributed task queue for heavy lifting (Ingestion & Agents).
*   🕒 **FastAPI BackgroundTasks**: Light-weight, in-process task execution for free-tier optimization.

### 🗄️ Infrastructure (The Memory Bank)
*   📐 **Supabase (PostgreSQL)**: Core relational storage with absolute data integrity.
*   🔍 **pgvector**: High-dimensional vector space for semantic similarity searches.
*   🛰️ **Supabase Edge Functions**: Running `gte-small` models for zero-cost client-side embeddings.
*   ☁️ **Supabase Storage**: Secure object storage for multi-modal files (PDFs, Audio).
*   🔒 **Supabase Auth**: JWT-based secure authentication with Row Level Security (RLS).

---

## � Core Functions & Features

### 1. 📥 Multi-Modal Ingestion Pipeline
MemoryOS processes data from diverse sources with dedicated logic for each:
*   📄 **Documents**: Deep parsing of PDF, DOCX, TXT, and Markdown files. Chunks are intelligently split using recursive character separators to preserve semantic context.
*   🌐 **URL Ingestion**: Headless scraping of web pages, extracting the meaningful body text while discarding noise like ads and navbars.
*   🎙️ **Voice Memories**: Integrated transcription (Whisper/Groq) that turns audio notes into searchable text memories.
*   📝 **Instant Notes**: Quick-capture interface for thoughts, formatted instantly with Markdown.

### 2. 🔍 Hybrid Neural Search (RRF Logic)
We don't just rely on keywords. Our search engine uses **Reciprocal Rank Fusion (RRF)**:
*   **Vector Search**: Finds matches based on "meaning" using 384-dimensional cosine similarity.
*   **Keyword Search**: Uses BM25/Fuzzy matching for exact terms, names, and dates.
*   **Fused Ranking**: Combines both scores to bubble up the most contextually relevant information.

### 3. � Streaming RAG Chat
The chat interface isn't just an LLM; it's a **Retrieval Augmented Generation** system:
*   **Contextual Grounding**: For every query, the system retrieves relevant chunks from your history.
*   **Zero-Hallucination**: The LLM is strictly instructed to answer based *only* on the retrieved context.
*   **Source Citations**: Every claim made by the AI is linked to the original document or memory.
*   **SSE Streaming**: Real-time token streaming for a natural, snappy conversation experience.

### 4. 🧩 Automated Intelligence (Agents)
*   💡 **Flashcard Generator**: Background tasks analyze new memories and generate spaced-repetition cards (Q&A) to help you actually learn what you save.
*   📊 **Analytics Engine**: Real-time tracking of your "Knowledge Growth" – visualizing what categories you are learning most.
*   🕵️ **Research Agent**: Integrated with **Tavily** to browse the web and supplement your internal knowledge with latest external research.

### 5. 🔌 Connectivity (MCP)
MemoryOS implements the **Model Context Protocol**:
*   **External Integration**: Use your memories inside Claude Desktop or Cursor.
*   **SSE Transport**: Secure, real-time connection between your local environment and your cloud-hosted memory bank.

---

## 🚀 Deployment & Operations

### 📦 Frontend (Vercel)
The UI is optimized for Vercel's Edge Network:
*   Zero-config deployment from the `/frontend` directory.
*   Automatic SSL and Global CDN.

### 🏗️ Backend (Render / Railway)
Modular backend setup:
*   **API Service**: Runs the FastAPI app.
*   **Worker Service**: (Optional) Runs Celery for high-volume ingestion.
*   **Configurable**: Simple `USE_CELERY` toggle to switch between a monolith (Render Free) and distributed (Railway) setup.

---

## 🎨 UI/UX Philosophy
MemoryOS is designed to feel like a "Premium OS for your mind":
*   **Glassmorphism**: Translucent panels that give a depth of field effect.
*   **Dark Mode First**: Optimized for long-session readability.
*   **Micro-animations**: Subtle feedback when saving, searching, or chatting to make the app feel alive.

---

## 🛠️ Security Architecture
*   **RLS (Row Level Security)**: Your memories are isolated at the database level. Even if a backend bug occurs, User A can never access User B's data.
*   **Encrypted Secrets**: All API keys and tokens are stored in environment-safe variables.
*   **No Data Training**: Your personal data stays on *your* instance. We never use your knowledge base to train public models.

---

## � Project Structure
```text
memoryos/
├── 📁 frontend/       # Next.js 14, Tailwind, Framer Motion
├── 📁 backend/        # FastAPI, Celery, Llama Index (Custom)
│   ├── 📁 app/
│   │   ├── 📁 routers/   # API Endpoints
│   │   ├── 📁 services/  # Core logic (RAG, Search, Ingestion)
│   │   ├── 📁 agents/    # AI Background Agents
│   │   └── 📁 tasks/     # Background Jobs
├── 📁 supabase/       # SQL Migrations & Edge Functions
└── 📁 extension/      # Chrome Capture Extension (Manifest V3)
```

---

### ⚖️ License
MIT License. Built with ❤️ for the curious minds.
