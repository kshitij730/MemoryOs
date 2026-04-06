'use client'
// components/chat-interface.tsx — Premium streaming chat UI 
import { useRef, useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import type { ChatMessage, SourceReference } from '@/lib/types'
import { Send, Sparkles, BookOpen, User, Reply, ArrowUpRight } from 'lucide-react'
import { useMediaQuery } from '@/lib/hooks/use-media-query'

interface ChatInterfaceProps {
    sessionId: string
    messages: ChatMessage[]
    isLoading: boolean
    streamingContent: string
    error: string | null
    onSendMessage: (content: string) => void
    onToggleSources: () => void
    sourcesCount: number
}

// Custom Markdown Component for Premium Typography
const MarkdownContent = ({ content }: { content: string }) => {
    return (
        <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={{
                p: ({ children }) => <p className="mb-4 last:mb-0 leading-relaxed font-serif text-lg tracking-wide text-text-1">{children}</p>,
                ul: ({ children }) => <ul className="list-disc pl-6 mb-4 space-y-2 text-text-2">{children}</ul>,
                ol: ({ children }) => <ol className="list-decimal pl-6 mb-4 space-y-2 text-text-2">{children}</ol>,
                li: ({ children }) => <li className="text-sm font-ui">{children}</li>,
                h3: ({ children }) => <h3 className="font-serif text-xl text-accent-light mt-6 mb-3">{children}</h3>,
                strong: ({ children }) => <strong className="text-white font-semibold">{children}</strong>,
                code: ({ children }) => <code className="bg-bg-3 px-1.5 py-0.5 rounded text-accent-light font-mono text-xs">{children}</code>,
                // Citation badges
                text: ({ value }) => {
                    if (typeof value !== 'string') return value
                    const parts = value.split(/(\[\d+\])/g)
                    return (
                        <>
                            {parts.map((part, i) => {
                                if (/^\[\d+\]$/.test(part)) {
                                    return (
                                        <motion.span
                                            key={i}
                                            whileHover={{ scale: 1.1 }}
                                            className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-accent-bg border border-accent/30 text-[10px] text-accent-light font-bold mx-1 align-top mt-1 cursor-pointer"
                                        >
                                            {part.slice(1, -1)}
                                        </motion.span>
                                    )
                                }
                                return part
                            })}
                        </>
                    )
                }
            }}
        >
            {content}
        </ReactMarkdown>
    )
}

export function ChatInterface({
    messages, isLoading, streamingContent, error,
    onSendMessage, onToggleSources, sourcesCount
}: ChatInterfaceProps) {
    const isMobile = useMediaQuery('(max-width: 767px)')
    const [input, setInput] = useState('')
    const messagesEndRef = useRef<HTMLDivElement>(null)
    const textareaRef = useRef<HTMLTextAreaElement>(null)

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, [messages, streamingContent])

    useEffect(() => {
        const ta = textareaRef.current
        if (!ta) return
        ta.style.height = 'auto'
        ta.style.height = `${Math.min(ta.scrollHeight, 240)}px`
    }, [input])

    const handleSend = () => {
        const content = input.trim()
        if (!content || isLoading) return
        setInput('')
        onSendMessage(content)
    }

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') handleSend()
    }

    return (
        <div className="flex flex-col h-full bg-bg-0 relative">
            {/* Header */}
            <div className={`flex items-center justify-between px-6 md:px-8 py-4 border-b border-border bg-bg-0/60 backdrop-blur-xl sticky top-0 md:top-0 z-30 ${isMobile ? 'mt-16' : ''}`}>
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-accent/10 rounded-xl">
                        <Sparkles size={18} className="text-accent" />
                    </div>
                    <div>
                        <h1 className="text-sm font-semibold tracking-tight text-text-1">Intelligence</h1>
                        <p className="text-[10px] text-text-3 font-medium uppercase tracking-[0.1em] hidden md:block">Session • Grounded Knowledge</p>
                    </div>
                </div>
                {sourcesCount > 0 && (
                    <button onClick={onToggleSources}
                        className="flex items-center gap-2 text-xs font-semibold px-4 py-2 rounded-full bg-accent text-white hover:bg-accent-light transition-all shadow-lg shadow-accent/20">
                        <BookOpen size={14} />
                        <span className="hidden sm:inline">{sourcesCount} {sourcesCount === 1 ? 'Source' : 'Sources'}</span>
                        <span className="sm:hidden">{sourcesCount}</span>
                    </button>
                )}
            </div>

            {/* Chat Content */}
            <div className="flex-1 overflow-y-auto px-4 md:px-8 py-6 md:py-10 space-y-8 md:space-y-12 pb-32">
                {messages.length === 0 && !isLoading && (
                    <div className="flex flex-col items-center justify-center min-h-[400px] text-center max-w-xl mx-auto py-10 px-4">
                        <div className="w-16 h-16 md:w-20 md:h-20 bg-accent-bg border border-accent/20 rounded-[24px] md:rounded-[28px] flex items-center justify-center mb-8 rotate-3 shadow-2xl shadow-accent/10">
                            <Sparkles size={32} className="text-accent" />
                        </div>
                        <h2 className="font-serif text-3xl md:text-4xl text-text-1 mb-4 leading-tight italic">What should I recall?</h2>
                        <p className="text-text-3 text-sm font-ui leading-relaxed mb-10 px-4">Searching your personal repository — citeable and verified.</p>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 w-full">
                            {["Tell me about qubits", "Summarize contracts", "Explain the SOP details"].map((s) => (
                                <button key={s} onClick={() => onSendMessage(s)}
                                    className="flex items-center justify-between px-5 py-4 rounded-2xl bg-bg-1 border border-border text-left text-xs font-semibold text-text-2 hover:bg-bg-2 hover:border-accent/40 hover:text-text-1 transition-all group">
                                    {s}
                                    <ArrowUpRight size={14} className="opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all shrink-0 ml-2" />
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                <AnimatePresence initial={false}>
                    {messages.map((msg) => (
                        <motion.div
                            key={msg.id}
                            initial={{ opacity: 0, y: 15 }}
                            animate={{ opacity: 1, y: 0 }}
                            className={`flex w-full ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                        >
                            {msg.role === 'user' ? (
                                <div className="max-w-[90%] md:max-w-[70%] bg-accent-bg border border-accent/20 rounded-[20px] rounded-br-[4px] px-4 py-3 md:px-5 md:py-4 shadow-xl shadow-accent/5">
                                    <p className="text-text-1 text-sm font-medium leading-relaxed">{msg.content}</p>
                                </div>
                            ) : (
                                <div className="w-full max-w-4xl flex gap-3 md:gap-6">
                                    {!isMobile && (
                                        <div className="w-10 h-10 rounded-2xl bg-bg-1 border border-border flex items-center justify-center shrink-0 shadow-sm mt-1">
                                            <Sparkles size={18} className="text-accent" />
                                        </div>
                                    )}
                                    <div className="flex-1 min-w-0 pt-1">
                                        <div className="prose-container overflow-x-hidden">
                                            <MarkdownContent content={msg.content} />
                                        </div>
                                        {msg.sources && msg.sources.length > 0 && (
                                            <div className="mt-6 pt-6 border-t border-border flex flex-wrap gap-2">
                                                {msg.sources.map((s, idx) => (
                                                    <button key={idx} className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-bg-1 border border-border text-[9px] font-bold text-text-3 hover:text-text-1 hover:border-accent/30 transition-all max-w-full">
                                                        <span className="text-accent font-serif text-xs shrink-0">[{s.index}]</span>
                                                        <span className="truncate">{s.title}</span>
                                                    </button>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </motion.div>
                    ))}
                </AnimatePresence>

                {/* Streaming Output */}
                {isLoading && streamingContent && (
                    <div className="w-full max-w-4xl flex gap-3 md:gap-6">
                        {!isMobile && (
                            <div className="w-10 h-10 rounded-2xl bg-bg-1 border border-border flex items-center justify-center shrink-0 shadow-sm mt-1">
                                <Sparkles size={18} className="text-accent animate-pulse" />
                            </div>
                        )}
                        <div className="flex-1 min-w-0 pt-1">
                            <MarkdownContent content={streamingContent} />
                            <motion.span
                                animate={{ opacity: [0, 1, 0] }}
                                transition={{ duration: 0.8, repeat: Infinity, ease: "steps(2)" }}
                                className="inline-block w-2 h-5 bg-accent ml-2 align-middle -mt-1 rounded-sm"
                            />
                        </div>
                    </div>
                )}

                {/* Typing Indicator */}
                {isLoading && !streamingContent && (
                    <div className="flex gap-1.5 pl-4 md:pl-16 h-8 items-center">
                        {[0, 0.2, 0.4].map((d, i) => (
                            <motion.div key={i}
                                animate={{ y: [0, -6, 0], opacity: [0.3, 1, 0.3] }}
                                transition={{ duration: 1.2, repeat: Infinity, delay: d }}
                                className="w-1.5 h-1.5 rounded-full bg-accent"
                            />
                        ))}
                    </div>
                )}

                <div ref={messagesEndRef} className="h-4" />
            </div>

            {/* Premium Input Section */}
            <div className={`fixed md:relative bottom-16 md:bottom-0 left-0 right-0 px-4 md:px-8 pb-4 md:pb-10 pt-4 bg-gradient-to-t from-bg-0 via-bg-0/90 to-transparent z-40`}>
                <div className="max-w-4xl mx-auto relative">
                    <div className="bg-bg-1 border border-border rounded-[24px] md:rounded-3xl p-1.5 md:p-2.5 transition-all duration-300 focus-within:border-accent/50 focus-within:ring-4 focus-within:ring-accent/5 shadow-2xl">
                        <textarea
                            ref={textareaRef}
                            id="chat-input"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder="Ask anything..."
                            disabled={isLoading}
                            rows={1}
                            className="w-full bg-transparent text-text-1 text-sm font-ui placeholder:text-text-3 placeholder:font-medium p-3 md:p-4 pr-14 md:pr-16 resize-none outline-none leading-relaxed min-h-[50px] md:min-h-[58px]"
                        />
                        <div className="absolute right-4 md:right-6 bottom-4 md:bottom-6 flex items-center gap-3">
                            <span className="hidden md:block text-[10px] font-bold text-text-3 uppercase tracking-widest mr-2">Cmd + Enter</span>
                            <button
                                id="chat-send-btn"
                                onClick={handleSend}
                                disabled={!input.trim() || isLoading}
                                className={`w-9 h-9 md:w-10 md:h-10 rounded-xl md:rounded-2xl flex items-center justify-center transition-all duration-300 ${input.trim() && !isLoading
                                    ? 'bg-accent text-white shadow-xl shadow-accent/20'
                                    : 'bg-bg-3 text-text-3 cursor-not-allowed'
                                    }`}
                            >
                                <Send size={isMobile ? 16 : 18} />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
