'use client'
// app/(dashboard)/chat/page.tsx — Chat session list
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { chatApi } from '@/lib/api'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { MessageSquare, Plus, Trash2, Loader2 } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { useSpaceStore } from '@/store/use-space-store'

export default function ChatListPage() {
    const router = useRouter()
    const qc = useQueryClient()

    const { activeSpace } = useSpaceStore()
    const { data: sessions = [], isLoading } = useQuery({
        queryKey: ['chat-sessions', activeSpace?.id],
        queryFn: () => chatApi.sessions(activeSpace?.id),
    })

    const createSession = useMutation({
        mutationFn: () => chatApi.createSession('New Chat', activeSpace?.id),
        onSuccess: (session) => {
            qc.invalidateQueries({ queryKey: ['chat-sessions', activeSpace?.id] })
            router.push(`/chat/${session.id}`)
        },
    })

    const deleteSession = useMutation({
        mutationFn: (id: string) => chatApi.deleteSession(id),
        onSuccess: () => qc.invalidateQueries({ queryKey: ['chat-sessions'] }),
    })

    return (
        <div className="max-w-2xl mx-auto p-8">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="font-serif text-3xl text-text-1 mb-1">Chat</h1>
                    <p className="text-text-2 text-sm">Ask questions about your memories</p>
                </div>
                <button
                    id="new-chat-btn"
                    onClick={() => createSession.mutate()}
                    disabled={createSession.isPending}
                    className="btn-primary"
                >
                    {createSession.isPending ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
                    New chat
                </button>
            </div>

            {isLoading ? (
                <div className="space-y-2">
                    {Array.from({ length: 4 }).map((_, i) => <div key={i} className="skeleton h-16 rounded-xl" />)}
                </div>
            ) : sessions.length === 0 ? (
                <div className="card text-center py-16">
                    <MessageSquare size={40} className="text-text-3 mx-auto mb-4" />
                    <p className="font-serif text-xl text-text-1 mb-2">No conversations yet</p>
                    <p className="text-text-2 text-sm mb-6">Start chatting with your memories</p>
                    <button onClick={() => createSession.mutate()} className="btn-primary">
                        Start a conversation
                    </button>
                </div>
            ) : (
                <motion.div
                    initial="hidden"
                    animate="visible"
                    variants={{ visible: { transition: { staggerChildren: 0.04 } } }}
                    className="space-y-2"
                >
                    {sessions.map((session) => (
                        <motion.div
                            key={session.id}
                            variants={{ hidden: { opacity: 0, y: 8 }, visible: { opacity: 1, y: 0 } }}
                            className="group card-hover flex items-center gap-4"
                        >
                            <div className="w-8 h-8 bg-accent-bg rounded-lg flex items-center justify-center flex-shrink-0">
                                <MessageSquare size={15} className="text-accent-2" />
                            </div>
                            <Link href={`/chat/${session.id}`} className="flex-1 min-w-0">
                                <p className="text-text-1 text-sm font-medium truncate">{session.title}</p>
                                <p className="text-text-3 text-xs mt-0.5">
                                    {formatDistanceToNow(new Date(session.updated_at), { addSuffix: true })}
                                </p>
                            </Link>
                            <button
                                id={`delete-session-${session.id}`}
                                onClick={() => deleteSession.mutate(session.id)}
                                className="opacity-0 group-hover:opacity-100 btn-ghost p-1.5 text-error hover:bg-error/10 transition-opacity"
                            >
                                <Trash2 size={14} />
                            </button>
                        </motion.div>
                    ))}
                </motion.div>
            )}
        </div>
    )
}
