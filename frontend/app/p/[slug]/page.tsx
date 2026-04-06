// app/p/[slug]/page.tsx — Standalone Public Memory Page
import { Metadata } from 'next'
import { publicApi } from '@/lib/api'
import { format } from 'date-fns'
import { Brain, ExternalLink, Tag as TagIcon, Globe, Sparkles } from 'lucide-react'
import Link from 'next/link'
import { notFound } from 'next/navigation'

interface Props {
    params: { slug: string }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    try {
        const memory = await publicApi.get(params.slug)
        return {
            title: `${memory.title} | MemoryOS`,
            description: memory.summary || "A shared insight from MemoryOS",
            openGraph: {
                title: memory.title,
                description: memory.summary || "A shared insight from MemoryOS",
                type: 'article',
                publishedTime: memory.created_at,
                tags: memory.tags,
            }
        }
    } catch {
        return { title: 'Memory Not Found | MemoryOS' }
    }
}

export default async function PublicMemoryPage({ params }: Props) {
    let memory
    try {
        memory = await publicApi.get(params.slug)
    } catch (e) {
        return notFound()
    }

    return (
        <div className="min-h-screen bg-bg-0 text-text-1 selection:bg-accent/30">
            {/* Header */}
            <header className="sticky top-0 z-50 bg-bg-0/80 backdrop-blur-xl border-b border-border">
                <div className="max-w-4xl mx-auto px-6 h-20 flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-3 group">
                        <div className="w-10 h-10 bg-accent rounded-2xl flex items-center justify-center text-white shadow-lg shadow-accent/20 transition-transform group-hover:scale-105">
                            <Brain size={22} strokeWidth={2.5} />
                        </div>
                        <span className="font-serif text-2xl tracking-tight text-text-1 italic">MemoryOS</span>
                    </Link>
                    <div className="flex items-center gap-4">
                        <Link href="/signup" className="text-[10px] font-black uppercase tracking-widest text-text-3 hover:text-text-1 transition-colors">
                            Sign Up
                        </Link>
                        <Link href="/signup" className="btn-primary py-2 px-4 text-[10px]">
                            Get Started
                        </Link>
                    </div>
                </div>
            </header>

            <main className="max-w-3xl mx-auto px-6 py-20 pb-32">
                {/* Meta Header */}
                <div className="flex items-center gap-4 mb-8">
                    <div className="px-3 py-1 bg-accent/10 border border-accent/20 rounded-full text-[10px] font-black text-accent uppercase tracking-widest flex items-center gap-2">
                        <Globe size={12} /> Public Insight
                    </div>
                    <span className="text-[10px] font-bold text-text-3 uppercase tracking-widest">
                        {format(new Date(memory.created_at), 'MMMM d, yyyy')}
                    </span>
                    <span className="w-1 h-1 rounded-full bg-text-3 opacity-30" />
                    <span className="text-[10px] font-bold text-text-3 uppercase tracking-widest">
                        {memory.source_type}
                    </span>
                </div>

                {/* Title */}
                <h1 className="font-serif text-5xl md:text-6xl text-text-1 italic leading-[1.1] mb-10 tracking-tight">
                    {memory.title}
                </h1>

                {/* Summary Card */}
                {memory.summary && (
                    <div className="relative mb-16 p-8 bg-bg-1 border border-accent/20 rounded-[32px] overflow-hidden group">
                        <div className="absolute -top-10 -right-10 w-40 h-40 bg-accent/5 rounded-full blur-3xl" />
                        <div className="flex items-center gap-2 mb-4">
                            <Sparkles size={16} className="text-accent" />
                            <span className="text-[10px] font-black text-accent uppercase tracking-[0.2em]">Synthesis</span>
                        </div>
                        <p className="text-text-2 text-lg leading-relaxed font-ui italic">
                            "{memory.summary}"
                        </p>
                    </div>
                )}

                {/* Rendered Content */}
                <div className="prose prose-invert prose-lg max-w-none">
                    <pre className="font-mono text-sm leading-relaxed text-text-2 bg-bg-1/50 border border-border p-8 rounded-[32px] whitespace-pre-wrap overflow-x-auto selection:bg-accent/20">
                        {memory.content}
                    </pre>
                </div>

                {/* Tags */}
                {memory.tags && memory.tags.length > 0 && (
                    <div className="mt-16 pt-8 border-t border-border">
                        <div className="flex items-center gap-3 flex-wrap">
                            <TagIcon size={14} className="text-text-3" />
                            {memory.tags.map(tag => (
                                <span key={tag} className="px-3 py-1.5 bg-bg-2 border border-border rounded-xl text-[10px] font-bold text-text-2 uppercase tracking-wider">
                                    #{tag}
                                </span>
                            ))}
                        </div>
                    </div>
                )}
            </main>

            {/* Footer / CTA */}
            <footer className="bg-bg-1 border-t border-border py-20">
                <div className="max-w-4xl mx-auto px-6 text-center">
                    <div className="w-16 h-16 bg-bg-2 border border-border rounded-2xl flex items-center justify-center mx-auto mb-8 text-text-3">
                        <Brain size={32} />
                    </div>
                    <h3 className="font-serif text-3xl text-text-1 mb-4 italic">Build your own second brain</h3>
                    <p className="text-text-3 max-w-md mx-auto mb-10 text-sm leading-relaxed">
                        MemoryOS helps you capture, connect, and retrieve everything you learn.
                        Start building your personal knowledge graph for free.
                    </p>
                    <Link href="/signup" className="btn-primary py-4 px-10 rounded-2xl inline-flex items-center gap-3">
                        Save this to my MemoryOS
                        <ExternalLink size={16} />
                    </Link>
                </div>
            </footer>
        </div>
    )
}
