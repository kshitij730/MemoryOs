'use client'
// components/sidebar.tsx — Premium sidebar with Memory Spaces
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
    Home, MessageSquare, Archive, Upload, Network,
    Settings, LogOut, Brain, Plus, Sparkles, LayoutGrid,
    BookOpen, Briefcase, GraduationCap, Heart, Globe,
    Code, FlaskConical, Pencil, Landmark, Palette, Music,
    BarChart3, Menu, X
} from 'lucide-react'
import { useSpaceStore } from '@/store/use-space-store'
import { SpaceModal } from './space-modal'
import { useMediaQuery } from '@/lib/hooks/use-media-query'

const NAV_ITEMS = [
    { href: '/', icon: Home, label: 'Home' },
    { href: '/chat', icon: MessageSquare, label: 'Chat' },
    { href: '/memories', icon: Archive, label: 'Memories' },
    { href: '/study', icon: GraduationCap, label: 'Study' },
    { href: '/analytics', icon: BarChart3, label: 'Analytics' },
    { href: '/upload', icon: Upload, label: 'Upload' },
]

const SPACE_ICONS: Record<string, React.ElementType> = {
    brain: Brain, book: BookOpen, work: Briefcase, study: GraduationCap,
    personal: Heart, world: Globe, code: Code, science: FlaskConical,
    draft: Pencil, history: Landmark, art: Palette, music: Music,
}

export function Sidebar({ onSignOut }: { onSignOut: () => void }) {
    const pathname = usePathname()
    const isMobile = useMediaQuery('(max-width: 767px)')
    const isTablet = useMediaQuery('(min-width: 768px) and (max-width: 1023px)')
    const { spaces, activeSpace, setActiveSpace, fetchSpaces } = useSpaceStore()
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [isMenuOpen, setIsMenuOpen] = useState(false)

    useEffect(() => {
        fetchSpaces()
    }, [fetchSpaces])

    // ────────────────────────────────────────────────────────────────
    // Mobile: Bottom Nav Bar
    // ────────────────────────────────────────────────────────────────
    if (isMobile) {
        const bottomNavItems = NAV_ITEMS.filter(item =>
            ['Home', 'Chat', 'Memories', 'Upload'].includes(item.label)
        )
        return (
            <>
                {/* Fixed Top Bar (Logo + Hamburger) */}
                <div className="fixed top-0 left-0 right-0 h-16 bg-bg-1 border-b border-border flex items-center justify-between px-4 z-[50] backdrop-blur-xl bg-bg-1/80">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-accent rounded-lg flex items-center justify-center text-white">
                            <Brain size={16} strokeWidth={2.5} />
                        </div>
                        <span className="font-serif text-lg tracking-tight text-text-1 italic">MemoryOS</span>
                    </div>
                    <button
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                        className="w-10 h-10 flex items-center justify-center text-text-3 hover:text-text-1"
                    >
                        {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
                    </button>
                </div>

                {/* Full-Screen Menu Drawer (for Spaces/Meta) */}
                <AnimatePresence>
                    {isMenuOpen && (
                        <motion.div
                            initial={{ opacity: 0, x: '-100%' }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: '-100%' }}
                            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                            className="fixed inset-0 z-[60] bg-bg-1 p-8 pt-24 overflow-y-auto"
                        >
                            <div className="mb-12">
                                <span className="text-[10px] font-black text-text-3 uppercase tracking-[0.2em] mb-4 block">Workspace</span>
                                <div className="space-y-2">
                                    {spaces.map(space => (
                                        <button
                                            key={space.id}
                                            onClick={() => { setActiveSpace(space); setIsMenuOpen(false) }}
                                            className={`w-full flex items-center gap-4 p-4 rounded-3xl ${activeSpace?.id === space.id ? 'bg-bg-2 border border-border' : ''}`}
                                        >
                                            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: space.color }} />
                                            <span className="text-sm font-bold text-text-1">{space.name}</span>
                                        </button>
                                    ))}
                                    <button onClick={() => setIsModalOpen(true)} className="w-full flex items-center gap-4 p-4 text-text-3 border border-dashed border-border rounded-3xl">
                                        <Plus size={18} />
                                        <span className="text-sm">New Space</span>
                                    </button>
                                </div>
                            </div>

                            <nav className="space-y-4 mb-12">
                                {NAV_ITEMS.map(({ href, icon: Icon, label }) => (
                                    <Link key={href} href={href} onClick={() => setIsMenuOpen(false)} className="flex items-center gap-4 text-lg font-serif italic text-text-1">
                                        <Icon size={20} className="text-accent" />
                                        {label}
                                    </Link>
                                ))}
                            </nav>

                            <button onClick={onSignOut} className="w-full p-4 rounded-3xl bg-error/10 text-error font-black text-[10px] uppercase tracking-widest">
                                Sign Out
                            </button>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Persistent Bottom Nav (Primary actions) */}
                <div className="fixed bottom-0 left-0 right-0 h-16 bg-bg-1 border-t border-border flex items-center justify-around z-[50] backdrop-blur-xl bg-bg-1/80 px-2 pb-safe">
                    {bottomNavItems.map(({ href, icon: Icon, label }) => {
                        const active = pathname === href
                        return (
                            <Link key={href} href={href} className="flex flex-col items-center gap-1 min-w-[56px] py-1">
                                <div className={`p-1.5 rounded-xl transition-all ${active ? 'bg-accent/10 text-accent' : 'text-text-3'}`}>
                                    <Icon size={20} strokeWidth={active ? 2.5 : 2} />
                                </div>
                                <span className={`text-[8px] font-black uppercase tracking-widest ${active ? 'text-accent' : 'text-text-3'}`}>{label}</span>
                            </Link>
                        )
                    })}
                </div>
                <SpaceModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
            </>
        )
    }

    // ────────────────────────────────────────────────────────────────
    // Tablet Icon-only Mode & Desktop Sidebar
    // ────────────────────────────────────────────────────────────────
    const width = isTablet ? 72 : 240

    return (
        <>
            <motion.aside
                className="hidden md:flex flex-col h-screen bg-bg-1 border-r border-border flex-shrink-0 z-40 sticky top-0 overflow-hidden"
                initial={false}
                animate={{ width }}
            >
                {/* Logo */}
                <div className={`p-6 mb-2 flex items-center ${isTablet ? 'justify-center' : 'gap-3'}`}>
                    <div className="w-9 h-9 bg-accent rounded-xl flex items-center justify-center text-white shrink-0">
                        <Brain size={20} strokeWidth={2.5} />
                    </div>
                    {!isTablet && <span className="font-serif text-xl text-text-1 italic truncate">MemoryOS</span>}
                </div>

                {/* Primary Nav */}
                <nav className={`px-3 space-y-1 mb-10 mt-4 flex flex-col ${isTablet ? 'items-center' : ''}`}>
                    {NAV_ITEMS.map(({ href, icon: Icon, label }) => {
                        const active = href === '/' ? pathname === '/' : pathname.startsWith(href)
                        return (
                            <Link
                                key={href}
                                href={href}
                                className={`group flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all ${isTablet ? 'w-10 h-10 justify-center p-0' : 'w-full'} ${active
                                    ? 'bg-accent/5 text-accent'
                                    : 'text-text-3 hover:text-text-2 hover:bg-bg-3'
                                    }`}
                                title={isTablet ? label : undefined}
                            >
                                <Icon size={18} className={`${active ? 'text-accent' : 'group-hover:text-text-1'}`} />
                                {!isTablet && <span className="text-xs font-bold uppercase tracking-widest leading-none">{label}</span>}
                            </Link>
                        )
                    })}
                </nav>

                {/* Spaces */}
                <div className={`flex-1 overflow-y-auto px-3 space-y-1 flex flex-col ${isTablet ? 'items-center' : ''}`}>
                    {!isTablet && (
                        <div className="px-3 mb-4 flex items-center justify-between">
                            <span className="text-[10px] font-black text-text-3 uppercase tracking-[0.2em]">Workspace</span>
                            <button onClick={() => setIsModalOpen(true)} className="p-1 hover:bg-bg-3 rounded-lg text-text-3 hover:text-accent font-black">+</button>
                        </div>
                    )}

                    <div className="space-y-1 w-full">
                        {spaces.map((space) => {
                            const isActive = activeSpace?.id === space.id
                            return (
                                <button
                                    key={space.id}
                                    onClick={() => setActiveSpace(space)}
                                    className={`w-full group flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all border-l-2 ${isActive ? 'bg-bg-2 border-accent text-text-1' : 'border-transparent text-text-3 hover:bg-bg-2'} ${isTablet ? 'justify-center border-l-0 px-0' : ''}`}
                                    title={space.name}
                                >
                                    <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: space.color }} />
                                    {!isTablet && <span className="text-xs font-bold leading-none truncate">{space.name}</span>}
                                </button>
                            )
                        })}
                    </div>
                </div>

                <div className={`p-4 border-t border-border mt-auto flex flex-col ${isTablet ? 'items-center' : ''}`}>
                    <button onClick={onSignOut} className={`text-text-3 hover:text-error py-3 ${isTablet ? '' : 'flex items-center gap-3 text-[10px] font-black uppercase tracking-widest'}`}>
                        <LogOut size={16} />
                        {!isTablet && <span>Sign Out</span>}
                    </button>
                </div>
            </motion.aside>
            <SpaceModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
        </>
    )
}
