-- supabase/migrations/003_flashcards.sql

CREATE TABLE flashcards (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  memory_id UUID REFERENCES memories(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  difficulty TEXT DEFAULT 'medium', -- easy, medium, hard
  times_reviewed INTEGER DEFAULT 0,
  last_reviewed TIMESTAMPTZ,
  next_review TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE flashcards ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can manage their own flashcards"
ON flashcards FOR ALL
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- Index for learning/retrieval
CREATE INDEX idx_flashcards_user_next_review ON flashcards(user_id, next_review);
CREATE INDEX idx_flashcards_memory_id ON flashcards(memory_id);
