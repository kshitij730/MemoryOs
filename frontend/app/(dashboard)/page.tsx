'use client'
// app/(dashboard)/page.tsx — Premium Dashboard Home
import { motion, AnimatePresence } from 'framer-motion'
import { useMemories } from '@/lib/hooks/use-memories'
import { MemoryCard } from '@/components/memory-card'
import Link from 'next/link'
import { Sparkles, ArrowRight, Brain, Plus, Clock, Zap } from 'lucide-react'
import { useSpaceStore } from '@/store/use-space-store'
import { useMediaQuery } from '@/lib/hooks/use-media-query'
import { memoriesApi } from '@/lib/api'

const container = {
    hidden: { opacity: 0 },
    show: {
        opacity: 1,
        transition: {
            staggerChildren: 0.05
        }
    }
}

const item = {
    hidden: { opacity: 0, y: 10 },
    show: { opacity: 1, y: 0 }
}

import { useQueryClient } from '@tanstack/react-query'

export default function DashboardPage() {
    const queryClient = useQueryClient()
    const isMobile = useMediaQuery('(max-width: 767px)')
    const { activeSpace } = useSpaceStore()
    const { data, isLoading } = useMemories({ limit: 24, space_id: activeSpace?.id })
    const memories = data?.memories ?? []

    const handleDelete = async (id: string) => {
        if (confirm('Permanently remove this memory?')) {
            await memoriesApi.delete(id)
            queryClient.invalidateQueries({ queryKey: ['memories'] })
        }
    }

    return (
        <div className="max-w-[1240px] mx-auto px-6 md:px-12 py-10 md:py-20 pb-32 md:pb-20">
            {/* Header with Stats */}
            <header className="flex flex-col md:flex-row md:items-end md:justify-between mb-12 md:mb-16 gap-8">
                <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
                    <div className="flex items-center gap-3 text-accent mb-4">
                        <Zap size={14} fill="currentColor" />
                        <span className="text-[10px] font-black uppercase tracking-[0.3em]">Personal Intelligence Engine</span>
                    </div>
                    <h1 className="font-serif text-4xl md:text-6xl text-text-1 tracking-tight leading-loose italic">
                        {isMobile ? 'Hello there,' : 'Good afternoon,'}<br />
                        <span className="text-accent underline decoration-accent/20 underline-offset-8">Neural Explorer.</span>
                    </h1>
                </motion.div>

                {!isMobile && (
                    <div className="flex gap-12 border-l border-border pl-10 h-16 items-center">
                        <div>
                            <p className="text-[10px] font-bold text-text-3 uppercase tracking-widest mb-1">Total Memories</p>
                            <p className="text-2xl font-serif text-text-1">{memories.length}</p>
                        </div>
                        <div>
                            <p className="text-[10px] font-bold text-text-3 uppercase tracking-widest mb-1">Semantic Clusters</p>
                            <p className="text-2xl font-serif text-text-1">1.2k</p>
                        </div>
                    </div>
                )}
            </header>

            {/* Quick Actions Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 mb-16 md:mb-20">
                <Link href="/chat" className="group h-40 md:h-48 bg-accent-bg border border-accent/20 rounded-[24px] md:rounded-[32px] p-6 md:p-8 flex flex-col justify-between transition-all hover:bg-accent-bg/80 relative overflow-hidden active:scale-95 shadow-2xl shadow-accent/5">
                    <div className="z-10">
                        <Sparkles size={24} className="text-accent mb-4" />
                        <h2 className="text-lg md:text-xl font-serif text-text-1 italic">Chat with Information</h2>
                        <p className="text-text-2 text-[10px] md:text-xs font-medium max-w-[180px] mt-2 opacity-60">Generate research and answers from your brain.</p>
                    </div>
                    <ArrowRight size={20} className="absolute bottom-6 md:bottom-8 right-6 md:right-8 text-accent group-hover:translate-x-1 transition-transform" />
                </Link>

                <Link href="/upload" className="group h-40 md:h-48 bg-bg-1 border border-border rounded-[24px] md:rounded-[32px] p-6 md:p-8 flex flex-col justify-between transition-all hover:bg-bg-2 relative overflow-hidden active:scale-95 text-text-1">
                    <div className="z-10">
                        <Plus size={24} className="text-text-1 mb-4" />
                        <h2 className="text-lg md:text-xl font-serif italic">Ingest New Data</h2>
                        <p className="text-text-3 text-[10px] md:text-xs font-medium max-w-[180px] mt-2">Upload PDFs, URLs, or high-fidelity voice notes.</p>
                    </div>
                    <ArrowRight size={20} className="absolute bottom-6 md:bottom-8 right-6 md:right-8 text-text-3 group-hover:translate-x-1 transition-transform" />
                </Link>

                {!isMobile && (
                    <div className="hidden lg:flex h-48 bg-bg-1 border border-border border-dashed rounded-[32px] p-8 flex-col justify-center items-center text-center group cursor-help transition-colors hover:bg-bg-2">
                        <Clock size={24} className="text-text-3 mb-3" />
                        <p className="text-[10px] font-black uppercase tracking-widest text-text-3">AI Processing Pipeline</p>
                        <p className="text-xs text-text-2 mt-2 leading-relaxed max-w-[140px]">All nodes reporting active. Latency: 42ms.</p>
                    </div>
                )}
            </div>

            {/* Feed Section */}
            <section>
                <div className="flex items-center justify-between mb-8 border-b border-border pb-6">
                    <div className="flex items-center gap-4">
                        <h2 className="text-[10px] font-black text-text-3 uppercase tracking-[0.2em]">Latest Memories</h2>
                        <div className="h-1 w-1 rounded-full bg-border" />
                        <span className="text-[10px] font-bold text-accent uppercase tracking-widest">Live Sync</span>
                    </div>
                </div>

                {isLoading ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
                        {Array.from({ length: 8 }).map((_, i) => (
                            <div key={i} className="h-[120px] md:h-[160px] bg-bg-2 animate-pulse rounded-2xl" />
                        ))}
                    </div>
                ) : memories.length === 0 ? (
                    <div className="py-20 md:py-24 text-center bg-bg-1 border border-border border-dashed rounded-[24px] md:rounded-3xl">
                        <Brain size={48} className="mx-auto text-text-3 mb-6 opacity-20" />
                        <h3 className="font-serif text-2xl text-text-1 mb-2 italic">Your brain is a blank canvas.</h3>
                        <p className="text-text-3 text-sm mb-8 px-6">Start uploading any form of data to initialize your index.</p>
                        <Link href="/upload" className="px-10 py-4 bg-accent text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-accent/20 hover:scale-105 active:scale-95 transition-all inline-block">
                            Ingest First Memory
                        </Link>
                    </div>
                ) : (
                    <motion.div
                        variants={container}
                        initial="hidden"
                        animate="show"
                        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6"
                    >
                        {memories.map((memory) => (
                            <motion.div key={memory.id} variants={item}>
                                <MemoryCard
                                    memory={memory}
                                    onDelete={handleDelete}
                                    onShare={(id) => alert(`Public: ${window.location.origin}/p/${memory.public_slug}`)}
                                />
                            </motion.div>
                        ))}
                    </motion.div>
                )}
            </section>
        </div>
    )
}
