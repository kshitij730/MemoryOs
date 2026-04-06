'use client'
// components/flashcard-viewer.tsx — Anki-style flip cards with 3D animation
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, ChevronRight, RotateCcw, Check, X, Download, Loader2, Sparkles, Brain } from 'lucide-react'
import { Flashcard } from '@/lib/types'
import { flashcardsApi } from '@/lib/api'

interface FlashcardViewerProps {
    cards: Flashcard[]
    onReview?: (cardId: string, gotIt: boolean) => void
    onClose?: () => void
}

export function FlashcardViewer({ cards, onReview, onClose }: FlashcardViewerProps) {
    const [index, setIndex] = useState(0)
    const [isFlipped, setIsFlipped] = useState(false)
    const [direction, setDirection] = useState(0)
    const [reviewed, setReviewed] = useState<Set<string>>(new Set())

    const currentCard = cards[index]

    const handleNext = () => {
        if (index < cards.length - 1) {
            setDirection(1)
            setIndex(index + 1)
            setIsFlipped(false)
        }
    }

    const handlePrev = () => {
        if (index > 0) {
            setDirection(-1)
            setIndex(index - 1)
            setIsFlipped(false)
        }
    }

    const handleFlip = () => setIsFlipped(!isFlipped)

    const handleReview = async (gotIt: boolean) => {
        const cardId = currentCard.id
        if (reviewed.has(cardId)) return

        setReviewed(prev => new Set(prev).add(cardId))
        onReview?.(cardId, gotIt)

        // Auto-next after a short delay
        setTimeout(handleNext, 600)
    }

    const exportToCSV = () => {
        const headers = "Question,Answer,Difficulty\n"
        const rows = cards.map(c => `"${c.question.replace(/"/g, '""')}","${c.answer.replace(/"/g, '""')}","${c.difficulty}"`).join("\n")
        const blob = new Blob([headers + rows], { type: 'text/csv' })
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `flashcards-${new Date().toISOString().slice(0, 10)}.csv`
        a.click()
    }

    if (!currentCard) return null

    return (
        <div className="flex flex-col items-center gap-8 w-full max-w-2xl mx-auto py-10">
            {/* Progress */}
            <div className="w-full flex items-center justify-between px-4">
                <div className="flex items-center gap-4">
                    <span className="text-[10px] font-black text-text-3 uppercase tracking-widest">Progress</span>
                    <div className="w-32 h-1 bg-bg-3 rounded-full overflow-hidden">
                        <motion.div
                            className="h-full bg-accent"
                            animate={{ width: `${((index + 1) / cards.length) * 100}%` }}
                        />
                    </div>
                    <span className="text-[10px] font-bold text-text-2">{index + 1} / {cards.length}</span>
                </div>

                <button onClick={exportToCSV} className="flex items-center gap-2 p-2 hover:bg-bg-3 rounded-xl text-text-3 hover:text-text-1 transition-all">
                    <Download size={16} />
                    <span className="text-[10px] font-black uppercase tracking-widest">Export Anki</span>
                </button>
            </div>

            {/* Card Container */}
            <div className="relative w-full h-[400px] perspective-1000">
                <AnimatePresence mode="wait" custom={direction}>
                    <motion.div
                        key={index}
                        custom={direction}
                        initial={{ opacity: 0, x: direction * 50 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: direction * -50 }}
                        transition={{ duration: 0.3 }}
                        className="w-full h-full cursor-pointer preserve-3d"
                        onClick={handleFlip}
                    >
                        <motion.div
                            className="relative w-full h-full preserve-3d transition-all duration-500"
                            animate={{ rotateY: isFlipped ? 180 : 0 }}
                            style={{ transformStyle: 'preserve-3d' }}
                        >
                            {/* Front */}
                            <div className="absolute inset-0 backface-hidden bg-bg-1 border border-border rounded-[32px] p-12 flex flex-col items-center justify-center text-center shadow-2xl">
                                <span className="absolute top-8 left-8 text-[10px] font-black text-accent/40 uppercase tracking-[0.2em]">Question</span>
                                <h2 className="font-serif text-3xl italic text-text-1 leading-tight select-none">
                                    {currentCard.question}
                                </h2>
                                <div className="absolute bottom-8 text-[10px] font-bold text-text-3 flex items-center gap-2">
                                    <RotateCcw size={12} />
                                    Click to reveal answer
                                </div>
                            </div>

                            {/* Back */}
                            <div
                                className="absolute inset-0 backface-hidden bg-bg-2 border border-accent/20 rounded-[32px] p-12 flex flex-col items-center justify-center text-center shadow-2xl overflow-hidden"
                                style={{ transform: 'rotateY(180deg)', backfaceVisibility: 'hidden' }}
                            >
                                <div className="absolute -top-10 -right-10 w-40 h-40 bg-accent/5 rounded-full blur-3xl" />
                                <span className="absolute top-8 left-8 text-[10px] font-black text-accent uppercase tracking-[0.2em]">Verification</span>

                                <div className="flex-1 flex flex-col items-center justify-center">
                                    <p className="text-lg font-ui text-text-2 leading-relaxed mb-6 select-none">
                                        {currentCard.answer}
                                    </p>

                                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent-bg border border-accent/20 text-[10px] font-black text-accent uppercase tracking-widest">
                                        Difficulty: {currentCard.difficulty}
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                </AnimatePresence>
            </div>

            {/* Controls */}
            <div className="flex items-center gap-4">
                <button
                    onClick={handlePrev}
                    disabled={index === 0}
                    className="p-4 rounded-full bg-bg-1 border border-border text-text-3 hover:text-text-1 disabled:opacity-20 transition-all"
                >
                    <ChevronLeft size={24} />
                </button>

                {isFlipped ? (
                    <div className="flex gap-4 animate-in fade-in zoom-in-95 duration-300">
                        <button
                            onClick={(e) => { e.stopPropagation(); handleReview(false) }}
                            className="flex items-center gap-3 px-8 py-4 rounded-2xl bg-error/10 border border-error/20 text-error font-black text-[10px] uppercase tracking-widest hover:bg-error/20 transition-all"
                        >
                            <X size={16} /> Review Again
                        </button>
                        <button
                            onClick={(e) => { e.stopPropagation(); handleReview(true) }}
                            className="flex items-center gap-3 px-8 py-4 rounded-2xl bg-success/10 border border-success/20 text-success font-black text-[10px] uppercase tracking-widest hover:bg-success/20 transition-all"
                        >
                            <Check size={16} /> I Got It
                        </button>
                    </div>
                ) : (
                    <div className="w-[300px] text-center text-text-3 text-[10px] font-bold uppercase tracking-widest">
                        Verify your recall
                    </div>
                )}

                <button
                    onClick={handleNext}
                    disabled={index === cards.length - 1}
                    className="p-4 rounded-full bg-bg-1 border border-border text-text-3 hover:text-text-1 disabled:opacity-20 transition-all"
                >
                    <ChevronRight size={24} />
                </button>
            </div>

            <style jsx global>{`
                .perspective-1000 { perspective: 1000px; }
                .preserve-3d { transform-style: preserve-3d; }
                .backface-hidden { backface-visibility: hidden; }
            `}</style>
        </div>
    )
}
