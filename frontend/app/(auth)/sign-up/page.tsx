'use client'
// app/(auth)/sign-up/page.tsx — Supabase Auth sign-up page
import { useState } from 'react'
import { motion } from 'framer-motion'
import { createClient } from '@/lib/supabase'
import Link from 'next/link'
import { Brain, Check, Loader2 } from 'lucide-react'

export default function SignUpPage() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [name, setName] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [success, setSuccess] = useState(false)

    const handleSignUp = async (e: React.FormEvent) => {
        e.preventDefault()
        if (password.length < 8) { setError('Password must be at least 8 characters'); return }
        setLoading(true)
        setError(null)
        const supabase = createClient()
        const { error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: { name },
                emailRedirectTo: `${window.location.origin}/auth/callback`
            },
        })
        if (error) setError(error.message)
        else setSuccess(true)
        setLoading(false)
    }

    const handleGoogleSignUp = async () => {
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
            {/* Background Aura */}
            <div className="absolute inset-0 opacity-20 pointer-events-none">
                <div className="absolute top-[-5%] right-[-5%] w-[45%] h-[45%] bg-accent/20 rounded-full blur-[130px]" />
                <div className="absolute bottom-[-10%] left-[-10%] w-[35%] h-[35%] bg-accent-light/10 rounded-full blur-[120px]" />
            </div>

            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                className="w-full max-w-[460px] z-10"
            >
                <div className="flex flex-col items-center mb-10 text-center">
                    <motion.div
                        whileHover={{ rotate: -15, scale: 1.1 }}
                        className="w-14 h-14 bg-accent rounded-[20px] flex items-center justify-center shadow-2xl shadow-accent/40 mb-6"
                    >
                        <Brain size={28} className="text-white" />
                    </motion.div>
                    <h2 className="font-serif text-3xl text-text-1 tracking-tight mb-2">Initialize Consciousness</h2>
                    <p className="text-text-3 text-[9px] uppercase font-black tracking-[0.4em]">Establish your neural domain</p>
                </div>

                <div className="card-premium bg-white/90 backdrop-blur-3xl border border-border/50 rounded-[32px] p-8 md:p-10 shadow-2xl shadow-black/20">
                    {success ? (
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className="text-center py-10"
                        >
                            <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
                                <Check size={32} className="text-green-500" />
                            </div>
                            <h3 className="text-slate-900 text-xl font-bold mb-3">Sync Initialized</h3>
                            <p className="text-slate-600 text-sm leading-relaxed mb-10">Check your neural uplink (email) to verify authentication.</p>
                            <Link href="/sign-in" className="w-full py-4 rounded-2xl bg-accent text-white font-black text-[11px] uppercase tracking-widest inline-block shadow-lg">
                                Access Brain
                            </Link>
                        </motion.div>
                    ) : (
                        <div className="space-y-6">
                            <form onSubmit={handleSignUp} className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Entity Name</label>
                                    <input
                                        type="text"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        className="w-full bg-slate-100/50 border border-slate-200 rounded-2xl px-5 py-4 text-sm text-slate-900 focus:border-accent/40 focus:bg-white outline-none transition-all placeholder:text-slate-400 font-medium"
                                        placeholder="Your Display Name"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Primary Uplink (Email)</label>
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="w-full bg-slate-100/50 border border-slate-200 rounded-2xl px-5 py-4 text-sm text-slate-900 focus:border-accent/40 focus:bg-white outline-none transition-all placeholder:text-slate-400 font-medium"
                                        placeholder="entity@memory.io"
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Security Cipher (Password)</label>
                                    <input
                                        type="password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="w-full bg-slate-100/50 border border-slate-200 rounded-2xl px-5 py-4 text-sm text-slate-900 focus:border-accent/40 focus:bg-white outline-none transition-all placeholder:text-slate-400 font-medium"
                                        placeholder="Min 8 characters"
                                        required
                                    />
                                </div>

                                {error && (
                                    <motion.p
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        className="text-red-500 text-xs font-semibold bg-red-50 border border-red-100 rounded-xl px-4 py-3"
                                    >
                                        {error}
                                    </motion.p>
                                )}

                                <button type="submit" disabled={loading} className="w-full py-5 rounded-2xl bg-accent text-white font-black text-[11px] uppercase tracking-[0.2em] shadow-xl shadow-accent/20 hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 transition-all flex items-center justify-center gap-3">
                                    {loading ? <Loader2 size={18} className="animate-spin" /> : 'Forge Identity'}
                                </button>
                            </form>

                            <div className="relative py-2">
                                <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-200"></div></div>
                                <div className="relative flex justify-center text-[10px] uppercase font-black tracking-widest text-slate-400 bg-transparent px-2"><span className="bg-[#f0f0f0] px-3 py-1 rounded-full border border-slate-200">Or Hybrid Access</span></div>
                            </div>

                            <button
                                type="button"
                                onClick={handleGoogleSignUp}
                                disabled={loading}
                                className="w-full py-4 rounded-2xl border border-slate-200 bg-white text-slate-700 font-bold text-xs hover:bg-slate-50 transition-all flex items-center justify-center gap-3 shadow-sm active:scale-[0.98]"
                            >
                                <svg className="w-4 h-4" viewBox="0 0 24 24"><path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" /><path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" /><path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" /><path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" /></svg>
                                Continue with Google Account
                            </button>
                        </div>
                    )}
                </div>

                <p className="text-center text-text-3 text-[10px] font-black uppercase tracking-[0.2em] mt-10">
                    Existing brain?{' '}
                    <Link href="/sign-in" className="text-accent underline underline-offset-4 hover:text-accent-light transition-colors">SignIn</Link>
                </p>
            </motion.div>

            {/* Neural lines/grid footer */}
            <div className="fixed bottom-8 left-0 right-0 flex justify-center gap-12 opacity-20 pointer-events-none">
                <span className="text-[8px] font-black uppercase tracking-[0.6em] text-text-3">Quantum Ingestion Active</span>
                <span className="text-[8px] font-black uppercase tracking-[0.6em] text-text-3">Identity Encryption Verified</span>
            </div>
        </div>
    )
}
