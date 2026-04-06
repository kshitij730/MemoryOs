-- supabase/migrations/004_public_memories.sql

ALTER TABLE memories ADD COLUMN is_public BOOLEAN DEFAULT FALSE;
ALTER TABLE memories ADD COLUMN public_slug TEXT UNIQUE;

-- Policies for public access
CREATE POLICY "Public can view public memories"
ON memories FOR SELECT
TO anon
USING (is_public = TRUE);

-- Policies for chunks (public retrieval)
CREATE POLICY "Public can view chunks of public memories"
ON chunks FOR SELECT
TO anon
USING (EXISTS (
  SELECT 1 FROM memories
  WHERE memories.id = chunks.memory_id
  AND memories.is_public = TRUE
));
