'use client'
// components/space-modal.tsx — Create/Edit memory space
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
    X, Brain, BookOpen, Briefcase, GraduationCap,
    Heart, Globe, Code, FlaskConical, Pencil, Landmark,
    Palette, Music, Check, Loader2
} from 'lucide-react'
import { useSpaceStore } from '@/store/use-space-store'

const ICONS = [
    { name: 'brain', icon: Brain },
    { name: 'book', icon: BookOpen },
    { name: 'work', icon: Briefcase },
    { name: 'study', icon: GraduationCap },
    { name: 'personal', icon: Heart },
    { name: 'world', icon: Globe },
    { name: 'code', icon: Code },
    { name: 'science', icon: FlaskConical },
    { name: 'draft', icon: Pencil },
    { name: 'history', icon: Landmark },
    { name: 'art', icon: Palette },
    { name: 'music', icon: Music },
]

const COLORS = [
    '#7c3aed', '#ec4899', '#f97316', '#10b981',
    '#3b82f6', '#6366f1', '#f59e0b', '#ef4444'
]

export function SpaceModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
    const { createSpace } = useSpaceStore()
    const [name, setName] = useState('')
    const [desc, setDesc] = useState('')
    const [icon, setIcon] = useState('brain')
    const [color, setColor] = useState('#7c3aed')
    const [loading, setLoading] = useState(false)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!name.trim() || loading) return
        setLoading(true)
        try {
            await createSpace(name, desc, icon, color)
            setName('')
            setDesc('')
            onClose()
        } catch (err) {
            console.error(err)
        } finally {
            setLoading(false)
        }
    }

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-bg-0/80 backdrop-blur-sm"
                    />

                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="relative w-full max-w-lg bg-bg-1 border border-border rounded-[32px] overflow-hidden shadow-2xl"
                    >
                        <form onSubmit={handleSubmit} className="p-8">
                            <div className="flex items-center justify-between mb-8">
                                <h2 className="font-serif text-3xl italic text-text-1">New workspace</h2>
                                <button type="button" onClick={onClose} className="p-2 text-text-3 hover:text-text-1 transition-colors">
                                    <X size={20} />
                                </button>
                            </div>

                            <div className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold text-text-3 uppercase tracking-widest">Space Name</label>
                                    <input
                                        autoFocus
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        placeholder="e.g. Thesis Research, Side Project..."
                                        className="w-full bg-bg-2 border border-border rounded-xl px-4 py-3.5 text-sm focus:border-accent/40 outline-none transition-all"
                                    />
                                </div>

                                <div className="space-y-4">
                                    <label className="text-[10px] font-bold text-text-3 uppercase tracking-widest">Select Icon</label>
                                    <div className="grid grid-cols-6 gap-2">
                                        {ICONS.map((item) => (
                                            <button
                                                key={item.name}
                                                type="button"
                                                onClick={() => setIcon(item.name)}
                                                className={`h-11 rounded-xl flex items-center justify-center border transition-all ${icon === item.name
                                                        ? 'bg-accent/10 border-accent text-accent'
                                                        : 'bg-bg-2 border-border text-text-3 hover:border-border-active hover:text-text-2'
                                                    }`}
                                            >
                                                <item.icon size={18} />
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <label className="text-[10px] font-bold text-text-3 uppercase tracking-widest">Theme Color</label>
                                    <div className="flex gap-3">
                                        {COLORS.map((c) => (
                                            <button
                                                key={c}
                                                type="button"
                                                onClick={() => setColor(c)}
                                                className="w-8 h-8 rounded-full flex items-center justify-center transition-transform hover:scale-110 active:scale-95"
                                                style={{ backgroundColor: c }}
                                            >
                                                {color === c && <Check size={14} className="text-white" strokeWidth={4} />}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={!name.trim() || loading}
                                className="w-full mt-10 py-4 rounded-2xl bg-accent text-white font-bold text-sm tracking-widest uppercase shadow-xl shadow-accent/20 hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 transition-all"
                            >
                                {loading ? <Loader2 className="animate-spin mx-auto" size={20} /> : 'Create Space'}
                            </button>
                        </form>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    )
}
