'use client'
// app/(dashboard)/chat/[sessionId]/page.tsx — Active chat with streaming
import { useParams } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { chatApi } from '@/lib/api'
import { useChat } from '@/lib/hooks/use-chat'
import { ChatInterface } from '@/components/chat-interface'
import { SourcePanel } from '@/components/source-panel'
import type { SourceReference } from '@/lib/types'

import { useSpaceStore } from '@/store/use-space-store'

export default function ChatSessionPage() {
    const { sessionId } = useParams<{ sessionId: string }>()
    const { activeSpace } = useSpaceStore()
    const [showSources, setShowSources] = useState(false)
    const [activeSources, setActiveSources] = useState<SourceReference[]>([])

    const { data: initialMessages = [] } = useQuery({
        queryKey: ['chat-messages', sessionId],
        queryFn: () => chatApi.messages(sessionId),
    })

    const {
        messages, setMessages, sources, isLoading, streamingContent, error, sendMessage,
    } = useChat({ sessionId, spaceId: activeSpace?.id })

    // Seed messages from DB on initial load
    useEffect(() => {
        if (initialMessages.length > 0 && messages.length === 0) {
            setMessages(initialMessages)
        }
    }, [initialMessages, messages.length, setMessages])

    // Show sources panel when sources arrive
    useEffect(() => {
        if (sources.length > 0) {
            setActiveSources(sources)
            setShowSources(true)
        }
    }, [sources])

    return (
        <div className="flex h-full">
            <div className="flex-1 flex flex-col min-w-0">
                <ChatInterface
                    sessionId={sessionId}
                    messages={messages}
                    isLoading={isLoading}
                    streamingContent={streamingContent}
                    error={error}
                    onSendMessage={sendMessage}
                    onToggleSources={() => setShowSources(!showSources)}
                    sourcesCount={activeSources.length}
                />
            </div>
            {showSources && (
                <SourcePanel
                    sources={activeSources}
                    onClose={() => setShowSources(false)}
                />
            )}
        </div>
    )
}
