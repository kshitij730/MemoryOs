'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { createClient } from '@/lib/supabase'
import { Sidebar } from '@/components/sidebar'
import { Topbar } from '@/components/topbar'
import { SearchCommand } from '@/components/search-command'
import { Plus } from 'lucide-react'
import Link from 'next/link'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    const router = useRouter()
    const [searchOpen, setSearchOpen] = useState(false)

    // Cmd+K global search
    useEffect(() => {
        const handler = (e: KeyboardEvent) => {
            if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
                e.preventDefault()
                setSearchOpen(true)
            }
        }
        window.addEventListener('keydown', handler)
        return () => window.removeEventListener('keydown', handler)
    }, [])

    const handleSignOut = async () => {
        const supabase = createClient()
        await supabase.auth.signOut()
        router.push('/sign-in')
    }

    return (
        <div className="flex h-screen bg-bg-0 text-text-1 overflow-hidden font-ui">
            {/* Sidebar Shell */}
            <Sidebar onSignOut={handleSignOut} />

            {/* Main content grid */}
            <main className="flex-1 overflow-hidden relative h-full flex flex-col bg-bg-0">
                <Topbar />

                <div className="flex-1 overflow-y-auto scroll-smooth pb-20 md:pb-0">
                    <div className="mx-auto w-full min-h-full">
                        {children}
                    </div>
                </div>

                {/* Desktop FAB */}
                <Link
                    href="/upload"
                    id="fab-upload"
                    className="hidden md:flex fixed bottom-8 right-8 w-14 h-14 bg-accent hover:bg-accent-light rounded-2xl
                       items-center justify-center shadow-2xl shadow-accent/20
                       transition-all duration-300 active:scale-95 group z-50 transition-all shadow-lg"
                >
                    <Plus size={28} className="text-white group-hover:rotate-90 transition-transform duration-300" />
                </Link>
            </main>

            {/* Global search command palette */}
            <SearchCommand open={searchOpen} onClose={() => setSearchOpen(false)} />
        </div>
    )
}
