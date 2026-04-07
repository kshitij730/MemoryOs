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

    const handleGoogleSignIn = async () => {
        setLoading(true)
        const supabase = createClient()
        const { error } = await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
                redirectTo: `${window.location.origin}/auth/callback`
            }
        })
        if (error) setError(error.message)
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
                    <h2 className="font-serif text-4xl text-text-1 tracking-tight mb-2">MemoryOS</h2>
                    <p className="text-text-3 text-[10px] uppercase font-black tracking-[0.3em]">Synaptic Intelligence Hub</p>
                </div>

                <div className="card-premium bg-white/90 backdrop-blur-3xl border border-border/50 rounded-[32px] p-8 md:p-10 shadow-2xl shadow-black/20">
                    <div className="mb-8">
                        <h1 className="text-2xl font-serif text-slate-900 mb-2 text-center md:text-left">Welcome back</h1>
                        <p className="text-slate-500 text-sm text-center md:text-left">Access your collective intelligence.</p>
                    </div>

                    {magicLinkSent ? (
                        <div className="text-center py-10 animate-in fade-in zoom-in-95">
                            <div className="w-12 h-12 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-6">
                                <Send size={20} className="text-accent" />
                            </div>
                            <h3 className="text-slate-900 font-bold mb-2">Check your pulse</h3>
                            <p className="text-slate-600 text-sm leading-relaxed">We sent a magic link to <span className="text-accent font-bold">{email}</span></p>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            <form onSubmit={handleSignIn} className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Universal Identity (Email)</label>
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="w-full bg-slate-100/50 border border-slate-200 rounded-2xl px-5 py-4 text-sm text-slate-900 focus:border-accent/40 focus:bg-white outline-none transition-all placeholder:text-slate-400 font-medium"
                                        placeholder="your@neuro.com"
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Access Cipher (Password)</label>
                                    <input
                                        type="password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="w-full bg-slate-100/50 border border-slate-200 rounded-2xl px-5 py-4 text-sm text-slate-900 focus:border-accent/40 focus:bg-white outline-none transition-all placeholder:text-slate-400 font-medium"
                                        placeholder="••••••••"
                                        required
                                    />
                                </div>

                                {error && (
                                    <motion.p
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        className="text-red-500 text-xs font-semibold bg-red-50 border border-red-100 rounded-xl px-4 py-3"
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
                                </div>
                            </form>

                            <div className="relative py-2">
                                <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-200"></div></div>
                                <div className="relative flex justify-center text-[10px] uppercase font-black tracking-widest text-slate-400 bg-transparent px-2"><span className="bg-[#f0f0f0] px-3 py-1 rounded-full border border-slate-200">Or Hybrid Access</span></div>
                            </div>

                            <button
                                type="button"
                                onClick={handleGoogleSignIn}
                                disabled={loading}
                                className="w-full py-4 rounded-2xl border border-slate-200 bg-white text-slate-700 font-bold text-xs hover:bg-slate-50 transition-all flex items-center justify-center gap-3 shadow-sm active:scale-[0.98]"
                            >
                                <svg className="w-4 h-4" viewBox="0 0 24 24"><path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" /><path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" /><path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" /><path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" /></svg>
                                Continue with Neural Account
                            </button>

                            <button
                                type="button"
                                onClick={handleMagicLink}
                                disabled={loading}
                                className="w-full text-[9px] font-black uppercase tracking-[0.3em] text-slate-400 hover:text-accent transition-colors py-2"
                            >
                                Pulse Mail (Magic Link)
                            </button>
                        </div>
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
