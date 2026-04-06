-- Add Memory Spaces table
CREATE TABLE public.spaces (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  icon TEXT DEFAULT 'brain',
  color TEXT DEFAULT '#7c3aed',
  is_default BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.spaces ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can see their own spaces." ON public.spaces
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own spaces." ON public.spaces
  FOR ALL USING (auth.uid() = user_id);

-- Alter existing tables to add space_id
ALTER TABLE public.memories ADD COLUMN space_id UUID REFERENCES public.spaces(id);
ALTER TABLE public.chat_sessions ADD COLUMN space_id UUID REFERENCES public.spaces(id);

-- Create index for faster filtering
CREATE INDEX idx_memories_space_id ON public.memories(space_id);
CREATE INDEX idx_chat_sessions_space_id ON public.chat_sessions(space_id);

-- Trigger to handle updated_at
CREATE TRIGGER set_spaces_updated_at
BEFORE UPDATE ON public.spaces
FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Trigger for default space on user creation
CREATE OR REPLACE FUNCTION public.handle_new_user_space()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.spaces (user_id, name, description, is_default, icon, color)
  VALUES (NEW.id, 'Personal', 'My personal knowledge and memories.', TRUE, 'brain', '#7c3aed');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recreate match_chunks with space_id filtering
CREATE OR REPLACE FUNCTION public.match_chunks_with_space(
  query_embedding vector(1536),
  match_threshold float,
  match_count int,
  match_user_id uuid,
  match_space_id uuid DEFAULT NULL
)
RETURNS TABLE (
  id uuid,
  memory_id uuid,
  content text,
  metadata jsonb,
  similarity float
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    c.id,
    c.memory_id,
    c.content,
    c.metadata,
    1 - (c.embedding <=> query_embedding) AS similarity
  FROM public.chunks c
  JOIN public.memories m ON c.memory_id = m.id
  WHERE (1 - (c.embedding <=> query_embedding) > match_threshold)
    AND m.user_id = match_user_id
    AND (match_space_id IS NULL OR m.space_id = match_space_id)
  ORDER BY c.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;
