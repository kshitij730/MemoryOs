// app/(auth)/sign-in/page.tsx — Supabase Auth sign-in page
'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { createClient } from '@/lib/supabase'
import Link from 'next/link'
import { Brain, ArrowRight, Loader2, Send } from 'lucide-react'

export default function SignInPage() {
    const router = useRouter()
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [magicLinkSent, setMagicLinkSent] = useState(false)

    const handleSignIn = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError(null)
        const supabase = createClient()
        const { error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) {
            setError(error.message)
        } else {
            router.push('/')
            router.refresh()
        }
        setLoading(false)
    }

    const handleMagicLink = async () => {
        if (!email) { setError('Enter your email first'); return }
        setLoading(true)
        setError(null)
        const supabase = createClient()
        const { error } = await supabase.auth.signInWithOtp({ email })
        if (error) setError(error.message)
        else setMagicLinkSent(true)
        setLoading(false)
    }

    return (
        <div className="min-h-screen bg-[#050505] flex items-center justify-center p-6 relative overflow-hidden">
            {/* Background Grain/Aura */}
            <div className="absolute inset-0 opacity-20 pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-accent/20 rounded-full blur-[120px]" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-accent-light/10 rounded-full blur-[120px]" />
            </div>

            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
                className="w-full max-w-[440px] z-10"
            >
                {/* Logo & Brand */}
                <div className="flex flex-col items-center mb-12 text-center">
                    <motion.div
                        whileHover={{ rotate: 15, scale: 1.1 }}
                        className="w-14 h-14 bg-accent rounded-[20px] flex items-center justify-center shadow-2xl shadow-accent/40 mb-6"
                    >
                        <Brain size={28} className="text-white" />
                    </motion.div>
                    <h2 className="font-serif text-4xl text-text-1 italic tracking-tight italic mb-2">MemoryOS</h2>
                    <p className="text-text-3 text-[10px] uppercase font-black tracking-[0.3em]">Synaptic Intelligence Hub</p>
                </div>

                <div className="card-premium bg-bg-1/60 backdrop-blur-3xl border border-border/50 rounded-[32px] p-8 md:p-10 shadow-2xl border-white/5">
                    <div className="mb-8">
                        <h1 className="text-2xl font-serif text-text-1 mb-2 text-center md:text-left">Welcome back</h1>
                        <p className="text-text-3 text-sm text-center md:text-left">Access your collective intelligence.</p>
                    </div>

                    {magicLinkSent ? (
                        <div className="text-center py-10 animate-in fade-in zoom-in-95">
                            <div className="w-12 h-12 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-6">
                                <Send size={20} className="text-accent" />
                            </div>
                            <h3 className="text-text-1 font-bold mb-2">Check your pulse</h3>
                            <p className="text-text-3 text-sm leading-relaxed">We sent a magic link to <span className="text-accent-light">{email}</span></p>
                        </div>
                    ) : (
                        <form onSubmit={handleSignIn} className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-text-3 uppercase tracking-widest ml-1">Universal Identity (Email)</label>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full bg-bg-2/50 border border-border rounded-2xl px-5 py-4 text-sm focus:border-accent/40 outline-none transition-all placeholder:text-text-3/50"
                                    placeholder="your@neuro.com"
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-text-3 uppercase tracking-widest ml-1">Access Cipher (Password)</label>
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full bg-bg-2/50 border border-border rounded-2xl px-5 py-4 text-sm focus:border-accent/40 outline-none transition-all placeholder:text-text-3/50"
                                    placeholder="••••••••"
                                    required
                                />
                            </div>

                            {error && (
                                <motion.p
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    className="text-error text-xs font-semibold bg-error/5 border border-error/20 rounded-xl px-4 py-3"
                                >
                                    {error}
                                </motion.p>
                            )}

                            <div className="space-y-4 pt-2">
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full py-5 rounded-2xl bg-accent text-white font-black text-[11px] uppercase tracking-[0.2em] shadow-xl shadow-accent/20 hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 transition-all flex items-center justify-center gap-3"
                                >
                                    {loading ? <Loader2 size={18} className="animate-spin" /> : 'Synchronize Identity'}
                                    {!loading && <ArrowRight size={18} />}
                                </button>

                                <button
                                    type="button"
                                    onClick={handleMagicLink}
                                    disabled={loading}
                                    className="w-full py-4 rounded-xl text-[9px] font-black uppercase tracking-[0.3em] text-text-3 hover:text-text-1 transition-colors"
                                >
                                    Send Magic Link Pulse
                                </button>
                            </div>
                        </form>
                    )}
                </div>

                <p className="text-center text-text-3 text-[10px] font-black uppercase tracking-[0.2em] mt-10">
                    New entity?{' '}
                    <Link href="/sign-up" className="text-accent underline underline-offset-4 hover:text-accent-light transition-colors">
                        Create Intelligence
                    </Link>
                </p>
            </motion.div>

            {/* Footer markers */}
            <div className="fixed bottom-8 left-0 right-0 flex justify-center gap-10 opacity-20 pointer-events-none">
                <span className="text-[8px] font-black uppercase tracking-[0.5em] text-text-3">Encrypted Neural Cloud</span>
                <span className="text-[8px] font-black uppercase tracking-[0.5em] text-text-3">Semantic Grid Active</span>
            </div>
        </div>
    )
}
