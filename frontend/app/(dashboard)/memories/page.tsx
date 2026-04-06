'use client'
// app/(dashboard)/memories/page.tsx — Premium Memories Gallery
import { useState } from 'react'
import { useMemories } from '@/lib/hooks/use-memories'
import { MemoryCard } from '@/components/memory-card'
import { motion, AnimatePresence } from 'framer-motion'
import { Archive, Search, Filter, SlidersHorizontal, LayoutGrid, List as ListIcon } from 'lucide-react'

const SOURCE_TYPES = ['document', 'url', 'note', 'voice', 'agent'] as const

import { useSpaceStore } from '@/store/use-space-store'

export default function MemoriesPage() {
    const { activeSpace } = useSpaceStore()
    const [filter, setFilter] = useState<string | undefined>()
    const [search, setSearch] = useState('')
    const { data, isLoading } = useMemories({
        source_type: filter,
        search: search || undefined,
        space_id: activeSpace?.id,
        limit: 50,
    })
    const memories = data?.memories ?? []

    return (
        <div className="max-w-[1400px] mx-auto px-6 md:px-12 py-12 md:py-20 h-full flex flex-col">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
                <div>
                    <h1 className="font-serif text-5xl text-text-1 italic tracking-tight mb-3">Archive</h1>
                    <p className="text-text-3 text-sm font-medium uppercase tracking-[0.2em]">Semantic Storage • {memories.length} Items</p>
                </div>

                <div className="flex items-center gap-3">
                    <div className="relative group">
                        <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-text-3 group-focus-within:text-accent transition-colors">
                            <Search size={16} />
                        </div>
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Filter library..."
                            className="h-12 w-full md:w-80 bg-bg-1 border border-border rounded-2xl pl-12 pr-4 text-sm focus:border-accent/40 focus:ring-4 focus:ring-accent/5 outline-none transition-all placeholder:text-text-3"
                        />
                    </div>
                    <button className="w-12 h-12 bg-bg-1 border border-border rounded-2xl flex items-center justify-center text-text-3 hover:text-text-1 transition-all">
                        <SlidersHorizontal size={18} />
                    </button>
                </div>
            </div>

            {/* In-page Navigation / Filters */}
            <div className="flex items-center gap-6 mb-10 overflow-x-auto scrollbar-none border-b border-border pb-4">
                <button
                    onClick={() => setFilter(undefined)}
                    className={`text-[10px] font-black uppercase tracking-[0.3em] transition-all relative py-2 ${!filter ? 'text-accent' : 'text-text-3 hover:text-text-2'
                        }`}
                >
                    All Source
                    {!filter && <motion.div layoutId="nav-line" className="absolute bottom-0 left-0 right-0 h-0.5 bg-accent rounded-full" />}
                </button>
                {SOURCE_TYPES.map((type) => (
                    <button
                        key={type}
                        onClick={() => setFilter(filter === type ? undefined : type)}
                        className={`text-[10px] font-black uppercase tracking-[0.3em] transition-all relative py-2 ${filter === type ? 'text-accent' : 'text-text-3 hover:text-text-2'
                            }`}
                    >
                        {type}s
                        {filter === type && <motion.div layoutId="nav-line" className="absolute bottom-0 left-0 right-0 h-0.5 bg-accent rounded-full" />}
                    </button>
                ))}
            </div>

            {/* Memories Grid or Loading State */}
            <div className="flex-1">
                {isLoading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {Array.from({ length: 12 }).map((_, i) => (
                            <div key={i} className="h-[160px] bg-bg-1 border border-border rounded-2xl animate-pulse" />
                        ))}
                    </div>
                ) : memories.length === 0 ? (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.98 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="py-32 text-center bg-bg-1 border border-border border-dashed rounded-[32px] max-w-2xl mx-auto"
                    >
                        <Archive size={48} className="mx-auto text-text-3 mb-6 opacity-20" />
                        <h3 className="font-serif text-2xl text-text-1 mb-2 italic">Nothing found in the archives.</h3>
                        <p className="text-text-3 text-sm max-w-xs mx-auto">Try refining your search terms or filters to locate specific memories.</p>
                        {filter || search ? (
                            <button onClick={() => { setFilter(undefined); setSearch('') }} className="mt-8 text-[10px] font-black text-accent uppercase tracking-widest hover:underline transition-all">Clear Filters</button>
                        ) : null}
                    </motion.div>
                ) : (
                    <motion.div
                        layout
                        initial="hidden"
                        animate="visible"
                        variants={{ visible: { transition: { staggerChildren: 0.05 } } }}
                        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
                    >
                        <AnimatePresence mode="popLayout">
                            {memories.map((memory) => (
                                <motion.div
                                    layout
                                    key={memory.id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    transition={{ duration: 0.3, ease: [0.23, 1, 0.32, 1] }}
                                >
                                    <MemoryCard memory={memory} />
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </motion.div>
                )}
            </div>
        </div>
    )
}
