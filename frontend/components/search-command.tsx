'use client'
import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { searchApi } from '@/lib/api'
import { Search, FileText, Link2, PenLine, Mic, Bot, X, Loader2, CornerDownLeft, Command } from 'lucide-react'
import type { SearchResult } from '@/lib/types'

const SOURCE_ICONS: Record<string, React.ElementType> = {
    document: FileText, url: Link2, note: PenLine, voice: Mic, agent: Bot,
}

interface SearchCommandProps {
    open: boolean
    onClose: () => void
}

import { useSpaceStore } from '@/store/use-space-store'

export function SearchCommand({ open, onClose }: SearchCommandProps) {
    const router = useRouter()
    const { activeSpace } = useSpaceStore()
    const [query, setQuery] = useState('')
    const [results, setResults] = useState<SearchResult[]>([])
    const [isLoading, setIsLoading] = useState(false)
    const [selected, setSelected] = useState(0)

    const search = useCallback(async (q: string) => {
        if (!q.trim()) { setResults([]); return }
        setIsLoading(true)
        try {
            const data = await searchApi.query(q, 8, activeSpace?.id)
            setResults(data.results || [])
            setSelected(0)
        } catch { /* silent */ }
        setIsLoading(false)
    }, [activeSpace?.id])

    useEffect(() => {
        const timer = setTimeout(() => search(query), 300)
        return () => clearTimeout(timer)
    }, [query, search])

    const handleSelect = (result: SearchResult) => {
        router.push(`/memories/${result.memory_id}`)
        onClose()
    }

    useEffect(() => {
        const handler = (e: KeyboardEvent) => {
            if (!open) return
            if (e.key === 'Escape') { onClose(); return }
            if (e.key === 'ArrowDown') { e.preventDefault(); setSelected((s) => Math.min(s + 1, results.length - 1)) }
            if (e.key === 'ArrowUp') { e.preventDefault(); setSelected((s) => Math.max(s - 1, 0)) }
            if (e.key === 'Enter' && results[selected]) { handleSelect(results[selected]) }
        }
        window.addEventListener('keydown', handler)
        return () => window.removeEventListener('keydown', handler)
    }, [open, results, selected, onClose])

    return (
        <AnimatePresence>
            {open && (
                <div className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh] px-4">
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-bg-0/60 backdrop-blur-md"
                    />

                    {/* Palette */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.98, y: -8 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.98, y: -8 }}
                        transition={{ duration: 0.2, ease: [0.23, 1, 0.32, 1] }}
                        className="w-full max-w-2xl bg-bg-1 border border-border shadow-2xl rounded-3xl overflow-hidden relative"
                    >
                        {/* Search Input */}
                        <div className="flex items-center gap-4 px-6 py-5 border-b border-border bg-bg-1">
                            {isLoading ? (
                                <Loader2 size={18} className="text-accent animate-spin" />
                            ) : (
                                <Search size={18} className="text-text-3" />
                            )}
                            <input
                                autoFocus
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                placeholder="Search through your brain..."
                                className="flex-1 bg-transparent text-text-1 text-base font-ui placeholder:text-text-3 outline-none"
                            />
                            <div className="flex items-center gap-1 opacity-40">
                                <span className="text-[10px] bg-bg-3 px-1.5 py-0.5 rounded border border-border text-text-3">ESC</span>
                            </div>
                        </div>

                        {/* Results Body */}
                        <div className="max-h-[60vh] overflow-y-auto scrollbar-none py-3">
                            {results.length === 0 && !query && (
                                <div className="py-20 text-center flex flex-col items-center">
                                    <div className="w-12 h-12 bg-bg-2 rounded-xl flex items-center justify-center mb-4 text-text-3">
                                        <Command size={24} />
                                    </div>
                                    <p className="text-text-2 text-sm font-medium">Type to search across all memories</p>
                                    <p className="text-text-3 text-xs mt-1">Files, URLs, notes, and research data</p>
                                </div>
                            )}

                            {results.map((result, i) => {
                                const Icon = SOURCE_ICONS[result.memory?.source_type || 'note'] || PenLine
                                const active = selected === i
                                return (
                                    <button
                                        key={result.id}
                                        onClick={() => handleSelect(result)}
                                        onMouseEnter={() => setSelected(i)}
                                        className={`w-full group flex items-start gap-4 px-6 py-4 text-left transition-all relative ${active ? 'bg-accent/5' : 'hover:bg-bg-2'
                                            }`}
                                    >
                                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-all ${active ? 'bg-accent text-white scale-110 shadow-lg shadow-accent/20' : 'bg-bg-3 text-text-3'
                                            }`}>
                                            <Icon size={18} />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-3">
                                                <h3 className={`text-sm font-bold truncate ${active ? 'text-text-1' : 'text-text-2'}`}>
                                                    {result.memory?.title || 'Untitled Memory'}
                                                </h3>
                                                <span className="tag-pill bg-bg-3 py-0 px-1.5 opacity-50 uppercase text-[9px] font-black">{result.memory?.source_type}</span>
                                            </div>
                                            <p className={`text-xs mt-1 line-clamp-1 leading-relaxed ${active ? 'text-text-2' : 'text-text-3'}`}>
                                                {result.content}
                                            </p>
                                        </div>
                                        {active && (
                                            <div className="flex items-center gap-1.5 text-accent animate-fade-in pr-2">
                                                <span className="text-[10px] font-bold uppercase tracking-widest">Select</span>
                                                <CornerDownLeft size={14} strokeWidth={3} />
                                            </div>
                                        )}
                                    </button>
                                )
                            })}
                        </div>

                        {/* Footer Shortcuts */}
                        <div className="px-6 py-4 bg-bg-2 border-t border-border flex items-center justify-between text-[10px] font-bold text-text-3 uppercase tracking-[0.15em]">
                            <div className="flex gap-6">
                                <span className="flex items-center gap-2"><span className="p-1 bg-bg-3 border border-border rounded leading-none text-text-2">↑↓</span> Move</span>
                                <span className="flex items-center gap-2"><span className="p-1 bg-bg-3 border border-border rounded leading-none text-text-2">↵</span> Select</span>
                            </div>
                            <div className="italic opacity-50">MemoryOS Semantic Index</div>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    )
}
