// lib/api.ts — Typed API client for the FastAPI backend
// All requests include the Supabase auth token automatically.

import { createClient } from '@/lib/supabase'

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000'

async function getAuthHeader(): Promise<Record<string, string>> {
    const supabase = createClient()
    const { data: { session } } = await supabase.auth.getSession()
    const token = session?.access_token
    return token ? { Authorization: `Bearer ${token}` } : {}
}

async function request<T>(
    path: string,
    options: RequestInit = {}
): Promise<T> {
    const authHeaders = await getAuthHeader()
    const res = await fetch(`${BACKEND_URL}${path}`, {
        ...options,
        headers: {
            'Content-Type': 'application/json',
            ...authHeaders,
            ...options.headers,
        },
    })
    if (!res.ok) {
        const error = await res.json().catch(() => ({ detail: res.statusText }))
        throw new Error(error.detail || `HTTP ${res.status}`)
    }
    return res.json()
}

// ── Memories ─────────────────────────────────────────────────
export const memoriesApi = {
    list: (params?: { source_type?: string; tag?: string; search?: string; space_id?: string; limit?: number; offset?: number }) => {
        const p = new URLSearchParams()
        if (params) {
            Object.entries(params).forEach(([key, val]) => {
                if (val !== undefined) p.append(key, val.toString())
            })
        }
        return request<{ memories: import('@/lib/types').Memory[]; offset: number; limit: number }>(
            `/memories?${p.toString()}`
        )
    },
    get: (id: string) =>
        request<import('@/lib/types').Memory>(`/memories/${id}`),
    update: (id: string, body: { title?: string; tags?: string[]; summary?: string }) =>
        request<import('@/lib/types').Memory>(`/memories/${id}`, {
            method: 'PATCH', body: JSON.stringify(body),
        }),
    delete: (id: string) =>
        request<{ ok: boolean }>(`/memories/${id}`, { method: 'DELETE' }),
    publish: (id: string) =>
        request<import('@/lib/types').Memory>(`/memories/${id}/publish`, { method: 'POST' }),
    unpublish: (id: string) =>
        request<import('@/lib/types').Memory>(`/memories/${id}/unpublish`, { method: 'POST' }),
    related: (id: string) =>
        request<import('@/lib/types').Memory[]>(`/memories/${id}/related`),
}

// ── Chat ─────────────────────────────────────────────────────
export const chatApi = {
    sessions: (space_id?: string) =>
        request<import('@/lib/types').ChatSession[]>(`/chat/sessions${space_id ? `?space_id=${space_id}` : ''}`),
    createSession: (title?: string, space_id?: string) =>
        request<import('@/lib/types').ChatSession>('/chat/sessions', {
            method: 'POST', body: JSON.stringify({ title, space_id }),
        }),
    messages: (sessionId: string) =>
        request<import('@/lib/types').ChatMessage[]>(`/chat/sessions/${sessionId}/messages`),
    deleteSession: (sessionId: string) =>
        request<{ ok: boolean }>(`/chat/sessions/${sessionId}`, { method: 'DELETE' }),
}

// ── Upload ────────────────────────────────────────────────────
export const uploadApi = {
    url: (body: { url: string; title?: string; tags?: string[]; space_id?: string }) =>
        request<{ memory_id: string; job_id: string }>('/upload/url', {
            method: 'POST', body: JSON.stringify(body),
        }),
    note: (body: { title: string; content: string; tags?: string[]; space_id?: string }) =>
        request<{ memory_id: string; job_id: string }>('/upload/note', {
            method: 'POST', body: JSON.stringify(body),
        }),
    file: async (file: File, title: string, tags: string[], space_id?: string) => {
        const authHeaders = await getAuthHeader()
        const form = new FormData()
        form.append('file', file)
        form.append('title', title)
        form.append('tags', tags.join(','))
        if (space_id) form.append('space_id', space_id)
        const res = await fetch(`${BACKEND_URL}/upload/file`, {
            method: 'POST',
            headers: authHeaders,
            body: form,
        })
        if (!res.ok) {
            const err = await res.json().catch(() => ({ detail: res.statusText }))
            throw new Error(err.detail || `HTTP ${res.status}`)
        }
        return res.json() as Promise<{ memory_id: string; job_id: string }>
    },
}

// ── Spaces ────────────────────────────────────────────────────
export const spacesApi = {
    list: () => request<import('@/lib/types').Space[]>('/spaces/'),
    create: (body: { name: string; description?: string; icon?: string; color?: string }) =>
        request<import('@/lib/types').Space>('/spaces/', {
            method: 'POST', body: JSON.stringify(body),
        }),
    update: (id: string, body: { name?: string; description?: string; icon?: string; color?: string }) =>
        request<import('@/lib/types').Space>(`/spaces/${id}`, {
            method: 'PATCH', body: JSON.stringify(body),
        }),
    delete: (id: string) =>
        request<{ ok: boolean }>(`/spaces/${id}`, { method: 'DELETE' }),
}

// ── Flashcards ────────────────────────────────────────────────
export const flashcardsApi = {
    generate: (memory_id: string) =>
        request<import('@/lib/types').Flashcard[]>(`/flashcards/generate/${memory_id}`, { method: 'POST' }),
    list: (params?: { memory_id?: string; due_only?: boolean }) => {
        const p = new URLSearchParams()
        if (params?.memory_id) p.append('memory_id', params.memory_id)
        if (params?.due_only) p.append('due_only', 'true')
        return request<import('@/lib/types').Flashcard[]>(`/flashcards/?${p.toString()}`)
    },
    review: (id: string, got_it: boolean) =>
        request<{ ok: boolean; next_review: string }>(`/flashcards/${id}/review`, {
            method: 'POST', body: JSON.stringify({ got_it }),
        }),
}

// ── Analytics ──────────────────────────────────────────────────
export const analyticsApi = {
    overview: () =>
        request<{
            total_memories: number;
            total_chunks: number;
            total_chats: number;
            memories_this_week: number;
            top_tags: { tag: string; count: number }[];
            memories_by_type: Record<import('@/lib/types').SourceType, number>;
            memories_by_day: { date: string; count: number }[];
            top_topics: { topic: string; count: number }[];
            avg_chat_latency_ms: number;
            total_tokens_used: number;
        }>(`/analytics/overview`),
}

// ── Public ────────────────────────────────────────────────────
export const publicApi = {
    get: (slug: string) =>
        request<import('@/lib/types').Memory & { chunks: import('@/lib/types').Chunk[] }>(`/public/${slug}`),
}

// ── Search ────────────────────────────────────────────────────
export const searchApi = {
    query: (q: string, limit = 8, space_id?: string) => {
        const p = new URLSearchParams({ q, limit: limit.toString() })
        if (space_id) p.append('space_id', space_id)
        return request<{ query: string; results: import('@/lib/types').SearchResult[]; count: number }>(
            `/search?${p.toString()}`
        )
    },
}

// ── Agents / Jobs ─────────────────────────────────────────────
export const agentsApi = {
    jobs: () => request<import('@/lib/types').Job[]>('/agents/jobs'),
    research: (topic: string, depth?: number) =>
        request<{ job_id: string }>('/agents/research', {
            method: 'POST', body: JSON.stringify({ topic, depth }),
        }),
    digest: () =>
        request<{ job_id: string }>('/agents/digest', { method: 'POST' }),
}

// ── SSE streaming chat ────────────────────────────────────────
export async function streamChat(
    body: { message: string; session_id?: string; space_id?: string; history?: { role: string; content: string }[] },
    onSources: (sources: import('@/lib/types').SourceReference[]) => void,
    onToken: (token: string) => void,
    onDone: () => void,
): Promise<void> {
    const authHeaders = await getAuthHeader()
    const res = await fetch(`${BACKEND_URL}/chat/stream`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authHeaders },
        body: JSON.stringify(body),
    })

    if (!res.ok) throw new Error(`Chat error: ${res.status}`)
    if (!res.body) throw new Error('No response body')

    const reader = res.body.getReader()
    const decoder = new TextDecoder()
    let buffer = ''

    while (true) {
        const { done, value } = await reader.read()
        if (done) break
        buffer += decoder.decode(value, { stream: true })

        const lines = buffer.split('\n')
        buffer = lines.pop() ?? ''

        for (const line of lines) {
            if (!line.startsWith('data: ')) continue
            const raw = line.slice(6).trim()
            if (!raw) continue
            try {
                const event = JSON.parse(raw) as import('@/lib/types').SSEEvent
                if (event.type === 'sources') onSources(event.sources)
                else if (event.type === 'token') onToken(event.content)
                else if (event.type === 'done') onDone()
            } catch { /* skip malformed */ }
        }
    }
}
