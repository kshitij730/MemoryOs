// lib/types.ts — Shared TypeScript types for MemoryOS

export type SourceType = 'document' | 'url' | 'note' | 'voice' | 'agent'
export type JobStatus = 'pending' | 'running' | 'done' | 'failed'
export type JobType = 'ingest' | 'research' | 'sync' | 'digest'
export type MessageRole = 'user' | 'assistant'

export interface Space {
    id: string
    user_id: string
    name: string
    description: string | null
    icon: string
    color: string
    is_default: boolean
    created_at: string
    updated_at: string
}

export interface Memory {
    id: string
    user_id: string
    space_id: string | null
    title: string
    content: string | null
    summary: string | null
    source_type: SourceType
    source_url: string | null
    file_path: string | null
    tags: string[]
    metadata: Record<string, unknown>
    is_processed: boolean
    is_public: boolean
    public_slug: string | null
    created_at: string
    updated_at: string
    chunk_count?: number
}

export interface Chunk {
    id: string
    memory_id: string
    user_id: string
    content: string
    chunk_index: number
    token_count: number | null
    metadata: Record<string, unknown>
    created_at: string
    // Enriched by retrieval
    memory?: Partial<Memory>
    similarity?: number
    rrf_score?: number
}

export interface ChatSession {
    id: string
    user_id: string
    space_id: string | null
    title: string
    created_at: string
    updated_at: string
}

export interface ChatMessage {
    id: string
    session_id: string
    role: MessageRole
    content: string
    sources: SourceReference[]
    tokens_used: number | null
    latency_ms: number | null
    created_at: string
}

export interface SourceReference {
    index: number
    chunk_id: string
    memory_id: string
    title: string
    source_type?: SourceType
    snippet: string
    similarity?: number
}

export interface Job {
    id: string
    user_id: string
    memory_id: string | null
    job_type: JobType
    status: JobStatus
    progress: number
    error: string | null
    result: Record<string, unknown> | null
    created_at: string
    completed_at: string | null
}

export interface User {
    id: string
    email: string
    name: string | null
    avatar_url: string | null
    api_key: string
    preferences: Record<string, unknown>
    created_at: string
}

// SSE event types streamed from /chat/stream
export type SSEEvent =
    | { type: 'sources'; sources: SourceReference[] }
    | { type: 'token'; content: string }
    | { type: 'done'; latency_ms?: number }
    | { type: 'error'; message: string }

// Search result
export interface SearchResult extends Chunk {
    memory: Partial<Memory>
}

// Flashcards
export interface Flashcard {
    id: string
    memory_id: string
    user_id: string
    question: string
    answer: string
    difficulty: 'easy' | 'medium' | 'hard'
    times_reviewed: number
    last_reviewed: string | null
    next_review: string | null
    created_at: string
    // Joined memory info for /study view
    memories?: Partial<Memory>
}
