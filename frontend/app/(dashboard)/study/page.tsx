'use client'
// app/(dashboard)/study/page.tsx — Spaced Repetition Study Mode
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { flashcardsApi } from '@/lib/api'
import { Flashcard } from '@/lib/types'
import { FlashcardViewer } from '@/components/flashcard-viewer'
import { GraduationCap, Brain, Loader2, Sparkles, CheckCircle } from 'lucide-react'

export default function StudyPage() {
    const [dueCards, setDueCards] = useState<Flashcard[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [stats, setStats] = useState({ reviewed: 0, total: 0 })

    const fetchDueCards = async () => {
        setIsLoading(true)
        try {
            const data = await flashcardsApi.list({ due_only: true })
            setDueCards(data)
            setStats({ reviewed: 0, total: data.length })
        } catch (err) {
            console.error(err)
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        fetchDueCards()
    }, [])

    const handleReview = async (id: string, gotIt: boolean) => {
        try {
            await flashcardsApi.review(id, gotIt)
            setStats(prev => ({ ...prev, reviewed: prev.reviewed + 1 }))
        } catch (err) {
            console.error(err)
        }
    }

    if (isLoading) return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
            <Loader2 className="animate-spin text-accent" size={32} />
            <p className="text-[10px] font-black text-text-3 uppercase tracking-[0.2em]">Assembling due knowledge...</p>
        </div>
    )

    if (dueCards.length === 0) return (
        <div className="max-w-xl mx-auto py-20 px-8 text-center flex flex-col items-center">
            <div className="w-20 h-20 bg-success/10 border border-success/20 rounded-[28px] flex items-center justify-center mb-8 rotate-3 shadow-2xl">
                <CheckCircle size={36} className="text-success" />
            </div>
            <h1 className="font-serif text-4xl text-text-1 mb-4 italic">Neural Sync Complete</h1>
            <p className="text-text-3 text-sm font-ui leading-relaxed mb-8">You have no flashcards due for review today. Your long-term memory is in optimal condition.</p>
            <button
                onClick={fetchDueCards}
                className="px-8 py-4 rounded-2xl bg-bg-2 border border-border text-text-1 font-black text-[10px] uppercase tracking-widest hover:bg-bg-3 transition-all"
            >
                Refresh Queue
            </button>
        </div>
    )

    return (
        <div className="max-w-4xl mx-auto py-12 px-8">
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-8">
                <div>
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 bg-accent rounded-2xl flex items-center justify-center text-white shadow-lg shadow-accent/20">
                            <GraduationCap size={22} />
                        </div>
                        <h1 className="font-serif text-4xl text-text-1 italic tracking-tight">Active Recall</h1>
                    </div>
                    <p className="text-text-3 text-sm max-w-sm">Spaced repetition session for all memories due today. Strength: {Math.round((stats.reviewed / stats.total) * 100)}%</p>
                </div>

                <div className="flex items-center gap-6">
                    <div className="text-center">
                        <p className="text-[10px] font-black text-text-3 uppercase tracking-widest mb-1">Due</p>
                        <p className="text-2xl font-serif text-accent italic">{dueCards.length}</p>
                    </div>
                    <div className="w-px h-8 bg-border" />
                    <div className="text-center">
                        <p className="text-[10px] font-black text-text-3 uppercase tracking-widest mb-1">Reviewed</p>
                        <p className="text-2xl font-serif text-text-1 italic">{stats.reviewed}</p>
                    </div>
                </div>
            </div>

            <FlashcardViewer
                cards={dueCards}
                onReview={handleReview}
            />

            <footer className="mt-20 text-center">
                <p className="text-[10px] font-black text-text-3 uppercase tracking-[0.3em] opacity-40 flex items-center justify-center gap-3">
                    <Brain size={12} className="text-accent" />
                    Optimal learning path verified • Spaced Repetition Engine
                </p>
            </footer>
        </div>
    )
}
