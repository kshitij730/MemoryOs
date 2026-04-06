'use client'
// components/topbar.tsx — Display current Memory Space
import { useSpaceStore } from '@/store/use-space-store'
import { motion, AnimatePresence } from 'framer-motion'
import { Brain, BookOpen, Briefcase, GraduationCap, Heart, Globe, Code, FlaskConical, Pencil, Landmark, Palette, Music, ChevronRight } from 'lucide-react'

const SPACE_ICONS: Record<string, React.ElementType> = {
    brain: Brain, book: BookOpen, work: Briefcase, study: GraduationCap,
    personal: Heart, world: Globe, code: Code, science: FlaskConical,
    draft: Pencil, history: Landmark, art: Palette, music: Music,
}

export function Topbar() {
    const { activeSpace } = useSpaceStore()
    const Icon = SPACE_ICONS[activeSpace?.icon || 'brain'] || Brain

    return (
        <header className="h-14 border-b border-border bg-bg-0/60 backdrop-blur-xl flex items-center px-8 justify-between sticky top-0 z-20 overflow-hidden">
            <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 text-text-3 font-bold text-[10px] uppercase tracking-[0.2em] opacity-40">
                    System <ChevronRight size={10} />
                </div>

                <AnimatePresence mode="wait">
                    <motion.div
                        key={activeSpace?.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 10 }}
                        className="flex items-center gap-2.5"
                    >
                        <div
                            className="w-1.5 h-1.5 rounded-full"
                            style={{ backgroundColor: activeSpace?.color || '#7c3aed' }}
                        />
                        <span className="text-sm font-bold text-text-1 tracking-tight">{activeSpace?.name || 'Personal'}</span>
                    </motion.div>
                </AnimatePresence>
            </div>

            <div className="flex items-center gap-4">
                <div className="px-3 py-1 rounded-full bg-accent-bg border border-accent/20 text-accent text-[9px] font-black uppercase tracking-widest">
                    Live Session
                </div>
            </div>
        </header>
    )
}
