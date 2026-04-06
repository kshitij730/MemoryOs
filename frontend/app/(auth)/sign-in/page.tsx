// app/(auth)/sign-in/page.tsx — Supabase Auth sign-in page
'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { createClient } from '@/lib/supabase'
import Link from 'next/link'
import { Brain, ArrowRight, Loader2 } from 'lucide-react'

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
        <div className="min-h-screen bg-bg-0 flex items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="w-full max-w-sm"
            >
                {/* Logo */}
                <div className="flex items-center gap-3 mb-8">
                    <div className="w-9 h-9 bg-accent rounded-lg flex items-center justify-center">
                        <Brain size={20} className="text-white" />
                    </div>
                    <span className="font-serif text-xl text-text-1">MemoryOS</span>
                </div>

                <h1 className="font-serif text-3xl text-text-1 mb-1">Welcome back</h1>
                <p className="text-text-2 text-sm mb-8">Sign in to your second brain</p>

                {magicLinkSent ? (
                    <div className="card text-center py-8">
                        <p className="text-text-1 font-medium mb-2">Check your email</p>
                        <p className="text-text-2 text-sm">We sent a magic link to <strong>{email}</strong></p>
                    </div>
                ) : (
                    <form onSubmit={handleSignIn} className="space-y-4">
                        <div>
                            <label className="block text-xs text-text-2 mb-1.5">Email</label>
                            <input
                                id="email"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="input"
                                placeholder="you@example.com"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-xs text-text-2 mb-1.5">Password</label>
                            <input
                                id="password"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="input"
                                placeholder="••••••••"
                                required
                            />
                        </div>

                        {error && (
                            <p className="text-error text-xs bg-error/10 border border-error/30 rounded-lg px-3 py-2">
                                {error}
                            </p>
                        )}

                        <button
                            id="sign-in-btn"
                            type="submit"
                            disabled={loading}
                            className="btn-primary w-full justify-center"
                        >
                            {loading ? <Loader2 size={16} className="animate-spin" /> : null}
                            Sign in
                            {!loading && <ArrowRight size={16} />}
                        </button>

                        <button
                            id="magic-link-btn"
                            type="button"
                            onClick={handleMagicLink}
                            disabled={loading}
                            className="btn-ghost w-full justify-center text-xs"
                        >
                            Send magic link instead
                        </button>
                    </form>
                )}

                <p className="text-center text-text-3 text-sm mt-6">
                    No account?{' '}
                    <Link href="/sign-up" className="text-accent-2 hover:underline">
                        Sign up free
                    </Link>
                </p>
            </motion.div>
        </div>
    )
}
