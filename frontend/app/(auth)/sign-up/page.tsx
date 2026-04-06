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
        <div className="min-h-screen bg-bg-0 flex items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="w-full max-w-sm"
            >
                <div className="flex items-center gap-3 mb-8">
                    <div className="w-9 h-9 bg-accent rounded-lg flex items-center justify-center">
                        <Brain size={20} className="text-white" />
                    </div>
                    <span className="font-serif text-xl text-text-1">MemoryOS</span>
                </div>

                <h1 className="font-serif text-3xl text-text-1 mb-1">Create your brain</h1>
                <p className="text-text-2 text-sm mb-8">Start building your second brain today — free.</p>

                {success ? (
                    <motion.div
                        initial={{ scale: 0.95 }}
                        animate={{ scale: 1 }}
                        className="card text-center py-8"
                    >
                        <div className="w-12 h-12 bg-success/20 rounded-full flex items-center justify-center mx-auto mb-3">
                            <Check size={24} className="text-success" />
                        </div>
                        <p className="text-text-1 font-medium mb-2">Account created!</p>
                        <p className="text-text-2 text-sm">Check your email to verify your account.</p>
                        <Link href="/sign-in" className="btn-primary inline-flex mt-4">
                            Sign in
                        </Link>
                    </motion.div>
                ) : (
                    <form onSubmit={handleSignUp} className="space-y-4">
                        <div>
                            <label className="block text-xs text-text-2 mb-1.5">Name</label>
                            <input
                                id="name"
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="input"
                                placeholder="Your name"
                            />
                        </div>
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
                                placeholder="Min 8 characters"
                                required
                            />
                        </div>

                        {error && (
                            <p className="text-error text-xs bg-error/10 border border-error/30 rounded-lg px-3 py-2">
                                {error}
                            </p>
                        )}

                        <button id="sign-up-btn" type="submit" disabled={loading} className="btn-primary w-full justify-center">
                            {loading ? <Loader2 size={16} className="animate-spin" /> : null}
                            Create account
                        </button>
                    </form>
                )}

                <p className="text-center text-text-3 text-sm mt-6">
                    Already have an account?{' '}
                    <Link href="/sign-in" className="text-accent-2 hover:underline">Sign in</Link>
                </p>
            </motion.div>
        </div>
    )
}
