'use client'
// app/(dashboard)/settings/page.tsx — API key and user preferences
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'
import { motion } from 'framer-motion'
import { Copy, Check, Eye, EyeOff, Loader2 } from 'lucide-react'

export default function SettingsPage() {
    const [user, setUser] = useState<{ email: string; name: string } | null>(null)
    const [apiKey, setApiKey] = useState<string>('')
    const [showKey, setShowKey] = useState(false)
    const [copied, setCopied] = useState(false)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchUser = async () => {
            const supabase = createClient()
            const { data: { user: authUser } } = await supabase.auth.getUser()
            if (!authUser) return
            const { data } = await supabase
                .from('users')
                .select('email, name, api_key')
                .eq('id', authUser.id)
                .single()
            if (data) {
                setUser({ email: data.email, name: data.name || '' })
                setApiKey(data.api_key || '')
            }
            setLoading(false)
        }
        fetchUser()
    }, [])

    const copyKey = async () => {
        await navigator.clipboard.writeText(apiKey)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
    }

    const mcpConfig = JSON.stringify({
        mcpServers: {
            memoryos: {
                url: `${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000'}/mcp/sse`,
                headers: { Authorization: `Bearer ${apiKey}` },
            },
        },
    }, null, 2)

    if (loading) return <div className="p-8 text-text-2 flex gap-2"><Loader2 size={18} className="animate-spin" /> Loading...</div>

    return (
        <div className="max-w-2xl mx-auto p-8 space-y-8">
            <div>
                <h1 className="font-serif text-3xl text-text-1 mb-1">Settings</h1>
                <p className="text-text-2 text-sm">Manage your account and API access.</p>
            </div>

            {/* Account */}
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="card space-y-4">
                <h2 className="text-text-1 font-medium">Account</h2>
                <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                        <p className="text-text-3 text-xs mb-1">Email</p>
                        <p className="text-text-1">{user?.email}</p>
                    </div>
                    <div>
                        <p className="text-text-3 text-xs mb-1">Name</p>
                        <p className="text-text-1">{user?.name || '—'}</p>
                    </div>
                </div>
            </motion.div>

            {/* API Key */}
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }} className="card space-y-4">
                <div>
                    <h2 className="text-text-1 font-medium mb-1">API Key</h2>
                    <p className="text-text-2 text-xs">Use this to connect Claude Desktop, Cursor, or any MCP client.</p>
                </div>

                <div className="flex items-center gap-2">
                    <div className="input font-mono text-xs flex-1 select-all overflow-hidden text-ellipsis">
                        {showKey ? apiKey : '•'.repeat(40)}
                    </div>
                    <button id="toggle-key" onClick={() => setShowKey(!showKey)} className="btn-ghost p-2">
                        {showKey ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                    <button id="copy-key" onClick={copyKey} className="btn-ghost p-2">
                        {copied ? <Check size={16} className="text-success" /> : <Copy size={16} />}
                    </button>
                </div>
            </motion.div>

            {/* MCP Config */}
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="card space-y-3">
                <div>
                    <h2 className="text-text-1 font-medium mb-1">Claude Desktop Config</h2>
                    <p className="text-text-2 text-xs">Add to your <code className="text-accent-2">claude_desktop_config.json</code></p>
                </div>
                <pre className="bg-bg-3 border border-border rounded-lg p-3 text-xs font-mono text-text-2 overflow-x-auto">
                    {mcpConfig}
                </pre>
            </motion.div>

            {/* Stack info */}
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} className="card">
                <h2 className="text-text-1 font-medium mb-3">Stack</h2>
                <div className="grid grid-cols-2 gap-2 text-xs">
                    {[
                        ['LLM', 'Groq llama-3.3-70b-versatile'],
                        ['Embeddings', 'Supabase gte-small (384d)'],
                        ['Database', 'Supabase + pgvector'],
                        ['Search', 'Hybrid BM25 + cosine (RRF)'],
                        ['Voice', 'OpenAI Whisper (local)'],
                        ['MCP', 'SSE transport'],
                    ].map(([k, v]) => (
                        <div key={k}>
                            <p className="text-text-3">{k}</p>
                            <p className="text-text-1 mt-0.5">{v}</p>
                        </div>
                    ))}
                </div>
            </motion.div>
        </div>
    )
}
