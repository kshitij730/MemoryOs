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
            options: { data: { name } },
        })
        if (error) setError(error.message)
        else setSuccess(true)
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
                    <h2 className="font-serif text-3xl text-text-1 italic tracking-tight italic mb-2">Initialize Consciousness</h2>
                    <p className="text-text-3 text-[9px] uppercase font-black tracking-[0.4em]">Establish your neural domain</p>
                </div>

                <div className="card-premium bg-bg-1/60 backdrop-blur-3xl border border-border/50 rounded-[32px] p-8 md:p-10 shadow-2xl border-white/5">
                    {success ? (
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className="text-center py-10"
                        >
                            <div className="w-16 h-16 bg-success/10 rounded-full flex items-center justify-center mx-auto mb-6">
                                <Check size={32} className="text-success" />
                            </div>
                            <h3 className="text-text-1 text-xl font-bold mb-3">Sync Initialized</h3>
                            <p className="text-text-3 text-sm leading-relaxed mb-10">Check your neural uplink (email) to verify authentication.</p>
                            <Link href="/sign-in" className="w-full py-4 rounded-2xl bg-accent text-white font-black text-[11px] uppercase tracking-widest inline-block shadow-lg">
                                Access Brain
                            </Link>
                        </motion.div>
                    ) : (
                        <form onSubmit={handleSignUp} className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-text-3 uppercase tracking-widest ml-1">Entity Name</label>
                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className="w-full bg-bg-2/50 border border-border rounded-2xl px-5 py-4 text-sm focus:border-accent/40 outline-none transition-all placeholder:text-text-3/50"
                                    placeholder="Your Display Name"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-text-3 uppercase tracking-widest ml-1">Primary Uplink (Email)</label>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full bg-bg-2/50 border border-border rounded-2xl px-5 py-4 text-sm focus:border-accent/40 outline-none transition-all placeholder:text-text-3/50"
                                    placeholder="entity@memory.io"
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-text-3 uppercase tracking-widest ml-1">Security Cipher (Password)</label>
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full bg-bg-2/50 border border-border rounded-2xl px-5 py-4 text-sm focus:border-accent/40 outline-none transition-all placeholder:text-text-3/50"
                                    placeholder="Min 8 characters"
                                    required
                                />
                            </div>

                            {error && (
                                <motion.p
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="text-error text-xs font-semibold bg-error/5 border border-error/20 rounded-xl px-4 py-3"
                                >
                                    {error}
                                </motion.p>
                            )}

                            <button type="submit" disabled={loading} className="w-full py-5 rounded-2xl bg-accent text-white font-black text-[11px] uppercase tracking-[0.2em] shadow-xl shadow-accent/20 hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 transition-all flex items-center justify-center gap-3">
                                {loading ? <Loader2 size={18} className="animate-spin" /> : 'Forge Identity'}
                            </button>
                        </form>
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
