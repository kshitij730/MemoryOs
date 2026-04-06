'use client'
// lib/hooks/use-chat.ts — SSE streaming chat hook
import { useState, useRef, useCallback } from 'react'
import { streamChat } from '@/lib/api'
import type { ChatMessage, SourceReference } from '@/lib/types'

interface UseChatOptions {
    sessionId?: string
    spaceId?: string
}

export function useChat({ sessionId, spaceId }: UseChatOptions = {}) {
    const [messages, setMessages] = useState<ChatMessage[]>([])
    const [sources, setSources] = useState<SourceReference[]>([])
    const [isLoading, setIsLoading] = useState(false)
    const [streamingContent, setStreamingContent] = useState('')
    const [error, setError] = useState<string | null>(null)
    const abortRef = useRef<AbortController | null>(null)

    const sendMessage = useCallback(
        async (content: string) => {
            if (!content.trim() || isLoading) return

            setError(null)
            setIsLoading(true)
            setStreamingContent('')
            setSources([])

            // Optimistic user message
            const userMessage: ChatMessage = {
                id: crypto.randomUUID(),
                session_id: sessionId || '',
                role: 'user',
                content,
                sources: [],
                tokens_used: null,
                latency_ms: null,
                created_at: new Date().toISOString(),
            }
            setMessages((prev) => [...prev, userMessage])

            const history = messages.map((m) => ({ role: m.role, content: m.content }))

            try {
                let fullContent = ''
                let receivedSources: SourceReference[] = []

                await streamChat(
                    { message: content, session_id: sessionId, space_id: spaceId, history },
                    (s) => {
                        receivedSources = s
                        setSources(s)
                    },
                    (token) => {
                        fullContent += token
                        setStreamingContent((prev) => prev + token)
                    },
                    () => {
                        // Done — convert streaming content to a proper message
                        const assistantMessage: ChatMessage = {
                            id: crypto.randomUUID(),
                            session_id: sessionId || '',
                            role: 'assistant',
                            content: fullContent,
                            sources: receivedSources,
                            tokens_used: null,
                            latency_ms: null,
                            created_at: new Date().toISOString(),
                        }
                        setMessages((prev) => [...prev, assistantMessage])
                        setStreamingContent('')
                        setIsLoading(false)
                    }
                )
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Chat error')
                setIsLoading(false)
                setStreamingContent('')
            }
        },
        [messages, isLoading, sessionId, spaceId]
    )

    const clearMessages = useCallback(() => {
        setMessages([])
        setSources([])
        setStreamingContent('')
        setError(null)
    }, [])

    return {
        messages,
        setMessages,
        sources,
        isLoading,
        streamingContent,
        error,
        sendMessage,
        clearMessages,
    }
}
