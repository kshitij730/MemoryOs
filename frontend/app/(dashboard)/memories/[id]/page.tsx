'use client'
import { use } from 'react'
import { useMemory, useRelatedMemories, useUpdateMemory, useDeleteMemory } from '@/lib/hooks/use-memories'
import { useRouter } from 'next/navigation'
import { useMediaQuery } from '@/lib/hooks/use-media-query'
import { motion, AnimatePresence } from 'framer-motion'
import { MemoryCard } from '@/components/memory-card'
import { formatDistanceToNow } from 'date-fns'
import { ArrowLeft, Loader2, Trash2, ExternalLink, Tag, Brain, Sparkles, RotateCcw, X, Copy } from 'lucide-react'
import Link from 'next/link'
import { useState, useEffect } from 'react'
import { FlashcardViewer } from '@/components/flashcard-viewer'
import { flashcardsApi, memoriesApi } from '@/lib/api'
import { Flashcard } from '@/lib/types'

const SOURCE_ICONS: Record<string, string> = {
    document: '📄', url: '🔗', note: '✏️', voice: '🎙️', agent: '🤖',
}

export default function MemoryDetailPage({ params }: { params: { id: string } }) {
    const isMobile = useMediaQuery('(max-width: 767px)')
    const { id } = params
    const router = useRouter()
    const { data: memory, isLoading } = useMemory(id)
    const [related, setRelated] = useState<Memory[]>([])
    const updateMemory = useUpdateMemory()
    const deleteMemory = useDeleteMemory()
    const [editingTags, setEditingTags] = useState(false)
    const [newTag, setNewTag] = useState('')
    const [isGenerating, setIsGenerating] = useState(false)
    const [flashcards, setFlashcards] = useState<Flashcard[]>([])
    const [showViewer, setShowViewer] = useState(false)

    // Fetch related manually to handle the local state if needed
    const { data: relatedData = [] } = useRelatedMemories(id)
    useEffect(() => {
        if (relatedData) setRelated(relatedData)
    }, [relatedData])

    useEffect(() => {
        if (id) {
            flashcardsApi.list({ memory_id: id }).then(setFlashcards)
        }
    }, [id])

    const handleGenerateFlashcards = async () => {
        setIsGenerating(true)
        try {
            const newCards = await flashcardsApi.generate(id)
            setFlashcards(newCards)
            setShowViewer(true)
        } catch (err) {
            console.error(err)
        } finally {
            setIsGenerating(false)
        }
    }

    if (isLoading) return (
        <div className="p-8 flex items-center gap-2 text-text-2">
            <Loader2 size={18} className="animate-spin" />
            Loading memory...
        </div>
    )
    if (!memory) return (
        <div className="p-8 text-text-2">Memory not found</div>
    )

    const handleDelete = async () => {
        if (!confirm('Delete this memory? This cannot be undone.')) return
        await deleteMemory.mutateAsync(id)
        router.push('/memories')
    }

    const handleAddTag = async () => {
        if (!newTag.trim()) return
        const tags = [...memory.tags, newTag.trim()]
        await updateMemory.mutateAsync({ id, tags })
        setNewTag('')
    }

    const handleRemoveTag = async (tag: string) => {
        const tags = memory.tags.filter((t) => t !== tag)
        await updateMemory.mutateAsync({ id, tags })
    }

    return (
        <div className="max-w-5xl mx-auto px-4 md:px-8 py-8 md:py-16 pb-32">
            {/* Back */}
            <div className={`mb-6 flex items-center justify-between ${isMobile ? 'pt-16' : ''}`}>
                <Link href="/memories" className="flex items-center gap-2 text-text-3 hover:text-text-1 text-[10px] font-black uppercase tracking-widest transition-all w-fit">
                    <ArrowLeft size={14} /> Back
                </Link>
                {isMobile && (
                    <button onClick={handleDelete} className="p-2 text-text-3 hover:text-error transition-colors">
                        <Trash2 size={16} />
                    </button>
                )}
            </div>

            <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
                {/* Main content */}
                <div className="flex-1 min-w-0">
                    <header className="mb-8 md:mb-12">
                        <div className="flex items-start gap-4 mb-4">
                            <div className="w-12 h-12 md:w-16 md:h-16 bg-bg-1 border border-border rounded-[20px] md:rounded-[24px] flex items-center justify-center shrink-0 shadow-lg text-2xl">
                                {SOURCE_ICONS[memory.source_type] || '📌'}
                            </div>
                            <div className="flex-1 min-w-0">
                                <h1 className="font-serif text-3xl md:text-5xl text-text-1 leading-[1.1] mb-2">{memory.title}</h1>
                                <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-[10px] font-black uppercase tracking-wider text-text-3">
                                    <span className="text-accent">{memory.source_type}</span>
                                    <span>{formatDistanceToNow(new Date(memory.created_at), { addSuffix: true })}</span>
                                    {memory.source_url && (
                                        <a href={memory.source_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-text-2 hover:text-accent transition-colors">
                                            <ExternalLink size={12} /> Source
                                        </a>
                                    )}
                                </div>
                            </div>
                        </div>
                    </header>

                    {/* Content Section */}
                    <div className="space-y-10 md:space-y-16">
                        {memory.summary && (
                            <section>
                                <h2 className="text-[10px] font-black text-text-3 uppercase tracking-widest mb-4">AI Synthesis</h2>
                                <div className="bg-accent-bg/10 border border-accent/10 rounded-[24px] p-6 md:p-8 relative overflow-hidden">
                                    <Sparkles className="absolute top-4 right-4 text-accent/20" size={24} />
                                    <p className="text-text-1 text-sm md:text-base leading-relaxed font-serif italic">{memory.summary}</p>
                                </div>
                            </section>
                        )}

                        {memory.content && (
                            <section>
                                <h2 className="text-[10px] font-black text-text-3 uppercase tracking-widest mb-4">Embedded Knowledge</h2>
                                <div className="bg-bg-1 border border-border rounded-[24px] p-6 md:p-8">
                                    <pre className="font-mono text-[11px] md:text-xs text-text-2 whitespace-pre-wrap leading-relaxed">
                                        {memory.content}
                                    </pre>
                                </div>
                            </section>
                        )}
                    </div>
                </div>

                {/* Sidebar area */}
                <div className="w-full lg:w-80 flex-shrink-0 space-y-6">
                    {/* Lab - Generation */}
                    <div className="bg-bg-1 border border-border rounded-[32px] p-8 shadow-xl shadow-accent/5">
                        <div className="flex items-center gap-3 mb-6">
                            <Brain className="text-accent" size={20} />
                            <h3 className="text-[10px] font-black text-text-1 uppercase tracking-widest">Knowledge Lab</h3>
                        </div>

                        {!flashcards || flashcards.length === 0 ? (
                            <div className="space-y-6">
                                <p className="text-xs text-text-3 leading-relaxed">Generate a retrieval practice deck to commit this knowledge to long-term memory.</p>
                                <button
                                    onClick={handleGenerateFlashcards}
                                    disabled={isGenerating}
                                    className="w-full py-4 rounded-2xl bg-accent text-white font-black text-[10px] uppercase tracking-widest shadow-xl shadow-accent/20 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 transition-all flex items-center justify-center gap-2"
                                >
                                    {isGenerating ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
                                    {isGenerating ? 'Synthesizing...' : 'Generate Deck'}
                                </button>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                <div className="flex items-center justify-between px-1">
                                    <span className="text-[10px] font-black text-text-2 uppercase tracking-widest">{flashcards.length} Cards</span>
                                    <button onClick={() => setShowViewer(true)} className="text-[10px] items-center gap-1 font-black text-accent hover:underline uppercase tracking-widest flex">Review <RotateCcw size={10} /></button>
                                </div>
                                <button
                                    onClick={() => setShowViewer(true)}
                                    className="w-full py-4 rounded-2xl bg-bg-2 border border-border text-text-1 font-black text-[10px] uppercase tracking-widest hover:bg-bg-3 transition-colors"
                                >
                                    Open Study Session
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Sharing */}
                    <div className="bg-bg-1 border border-border rounded-[32px] p-8">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-[10px] font-black text-text-3 uppercase tracking-widest">Publicity</h3>
                            <button
                                onClick={async () => {
                                    if (memory.is_public) await memoriesApi.unpublish(id)
                                    else await memoriesApi.publish(id)
                                    router.refresh()
                                }}
                                className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${memory.is_public ? 'bg-accent text-white' : 'bg-bg-3 text-text-3'}`}
                            >
                                <ExternalLink size={16} />
                            </button>
                        </div>
                        {memory.is_public ? (
                            <div className="space-y-4">
                                <div className="flex items-center gap-2 p-3 bg-bg-2 border border-border rounded-xl">
                                    <input readOnly value={`${window.location.origin}/p/${memory.public_slug}`} className="flex-1 bg-transparent text-[10px] font-mono text-text-3 outline-none truncate" />
                                    <button onClick={() => { navigator.clipboard.writeText(`${window.location.origin}/p/${memory.public_slug}`); alert('Copied!') }} className="p-1.5 hover:text-accent transition-colors"><Copy size={12} /></button>
                                </div>
                                <p className="text-[10px] text-text-3 italic px-1">Anyone with this link can explore this memory.</p>
                            </div>
                        ) : (
                            <p className="text-[10px] text-text-3 leading-relaxed px-1">Toggle to generate a permanent public URL for indexing.</p>
                        )}
                    </div>

                    {/* Related Horiz Scroll for Mobile */}
                    {related.length > 0 && (
                        <div className="space-y-4">
                            <h3 className="text-[10px] font-black text-text-3 uppercase tracking-widest px-1">Related Intelligence</h3>
                            <div className="flex overflow-x-auto gap-4 pb-4 md:flex-col scrollbar-none snap-x">
                                {related.map((r) => (
                                    <div key={r.id} className="min-w-[280px] md:min-w-0 snap-center">
                                        <MemoryCard memory={r} compact />
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {!isMobile && (
                        <button onClick={handleDelete} className="w-full py-4 rounded-2xl border border-error/20 text-error/60 hover:bg-error/10 hover:text-error text-[10px] font-black uppercase tracking-widest transition-all">
                            Permanently Delete
                        </button>
                    )}
                </div>
            </div>
        </div>
    )
}
