-- MemoryOS Initial Schema
-- Run this in Supabase SQL Editor

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS vector;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ──────────────────────────────────────────────────────────
-- USERS (auto-populated from Supabase Auth via trigger)
-- ──────────────────────────────────────────────────────────
CREATE TABLE public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  name TEXT,
  avatar_url TEXT,
  api_key TEXT UNIQUE DEFAULT encode(gen_random_bytes(32), 'hex'),
  preferences JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Trigger: auto-insert user on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'name',
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ──────────────────────────────────────────────────────────
-- MEMORIES (parent documents)
-- ──────────────────────────────────────────────────────────
CREATE TABLE public.memories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT,
  summary TEXT,
  source_type TEXT NOT NULL CHECK (source_type IN ('document','url','note','voice','agent')),
  source_url TEXT,
  file_path TEXT,
  tags TEXT[] DEFAULT '{}',
  metadata JSONB DEFAULT '{}',
  is_processed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ──────────────────────────────────────────────────────────
-- CHUNKS (pgvector — gte-small = 384 dimensions)
-- ──────────────────────────────────────────────────────────
CREATE TABLE public.chunks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  memory_id UUID NOT NULL REFERENCES public.memories(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  embedding vector(384),
  chunk_index INTEGER NOT NULL,
  token_count INTEGER,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- IVFFlat index for fast cosine similarity search
CREATE INDEX ON public.chunks
  USING ivfflat (embedding vector_cosine_ops)
  WITH (lists = 100);

-- ──────────────────────────────────────────────────────────
-- CHAT SESSIONS
-- ──────────────────────────────────────────────────────────
CREATE TABLE public.chat_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  title TEXT DEFAULT 'New chat',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ──────────────────────────────────────────────────────────
-- CHAT MESSAGES
-- ──────────────────────────────────────────────────────────
CREATE TABLE public.chat_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id UUID NOT NULL REFERENCES public.chat_sessions(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user','assistant')),
  content TEXT NOT NULL,
  sources JSONB DEFAULT '[]',
  tokens_used INTEGER,
  latency_ms INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ──────────────────────────────────────────────────────────
-- BACKGROUND JOBS (realtime status updates)
-- ──────────────────────────────────────────────────────────
CREATE TABLE public.jobs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  memory_id UUID REFERENCES public.memories(id) ON DELETE CASCADE,
  job_type TEXT NOT NULL CHECK (job_type IN ('ingest','research','sync','digest')),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending','running','done','failed')),
  progress INTEGER DEFAULT 0,
  error TEXT,
  result JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

-- ──────────────────────────────────────────────────────────
-- ROW LEVEL SECURITY (RLS) — users only see their own data
-- ──────────────────────────────────────────────────────────
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.memories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chunks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.jobs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users: own data" ON public.users FOR ALL USING (auth.uid() = id);
CREATE POLICY "Memories: own data" ON public.memories FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Chunks: own data" ON public.chunks FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Sessions: own data" ON public.chat_sessions FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Messages: own session" ON public.chat_messages FOR ALL
  USING (session_id IN (SELECT id FROM public.chat_sessions WHERE user_id = auth.uid()));
CREATE POLICY "Jobs: own data" ON public.jobs FOR ALL USING (auth.uid() = user_id);

-- ──────────────────────────────────────────────────────────
-- RPC: Vector similarity search
-- ──────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION match_chunks(
  query_embedding vector(384),
  match_user_id UUID,
  match_count INT DEFAULT 8,
  match_threshold FLOAT DEFAULT 0.5
)
RETURNS TABLE (
  id UUID,
  memory_id UUID,
  content TEXT,
  metadata JSONB,
  similarity FLOAT
)
LANGUAGE sql STABLE AS $$
  SELECT
    c.id,
    c.memory_id,
    c.content,
    c.metadata,
    1 - (c.embedding <=> query_embedding) AS similarity
  FROM public.chunks c
  WHERE c.user_id = match_user_id
    AND 1 - (c.embedding <=> query_embedding) > match_threshold
  ORDER BY c.embedding <=> query_embedding
  LIMIT match_count;
$$;

-- ──────────────────────────────────────────────────────────
-- updated_at auto-update trigger
-- ──────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_memories_updated_at
  BEFORE UPDATE ON public.memories
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER set_sessions_updated_at
  BEFORE UPDATE ON public.chat_sessions
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER set_users_updated_at
  BEFORE UPDATE ON public.users
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
