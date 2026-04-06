-- supabase/migrations/005_analytics_helpers.sql

-- RPC to get chunk count efficiently
CREATE OR REPLACE FUNCTION get_user_chunks_count(p_user_id UUID)
RETURNS BIGINT AS $$
  SELECT count(*) FROM chunks WHERE user_id = p_user_id;
$$ LANGUAGE sql STABLE;

-- Ensure chat_messages table has the required columns for analytics
-- (These might already exist from previous steps but we ensure they do)
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='chat_messages' AND column_name='latency_ms') THEN
        ALTER TABLE chat_messages ADD COLUMN latency_ms INTEGER DEFAULT 0;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='chat_messages' AND column_name='tokens_used') THEN
        ALTER TABLE chat_messages ADD COLUMN tokens_used INTEGER DEFAULT 0;
    END IF;
END $$;
