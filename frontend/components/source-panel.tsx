'use client'
// components/source-panel.tsx — Cited sources sidebar
import { motion } from 'framer-motion'
import type { SourceReference } from '@/lib/types'
import Link from 'next/link'
import { X, ExternalLink } from 'lucide-react'

interface SourcePanelProps {
    sources: SourceReference[]
    onClose: () => void
}

export function SourcePanel({ sources, onClose }: SourcePanelProps) {
    return (
        <motion.aside
            initial={{ x: 320, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 320, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="w-80 flex-shrink-0 border-l border-border bg-bg-2 flex flex-col h-full overflow-hidden"
        >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-border">
                <p className="text-text-1 text-sm font-medium">Sources</p>
                <button id="close-sources" onClick={onClose} className="btn-ghost p-1.5">
                    <X size={16} />
                </button>
            </div>

            {/* Source list */}
            <div className="overflow-y-auto flex-1 p-3 space-y-2">
                {sources.map((source) => (
                    <motion.div
                        key={source.chunk_id}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="card !p-3 space-y-2"
                    >
                        {/* Index + title */}
                        <div className="flex items-start gap-2">
                            <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-accent text-white text-xs font-bold flex-shrink-0 mt-0.5">
                                {source.index}
                            </span>
                            <div className="min-w-0 flex-1">
                                <p className="text-text-1 text-xs font-medium leading-snug line-clamp-2">
                                    {source.title || 'Untitled'}
                                </p>
                            </div>
                        </div>

                        {/* Snippet */}
                        <p className="text-text-3 text-xs leading-relaxed line-clamp-4 font-mono !text-[11px]">
                            {source.snippet}
                        </p>

                        {/* Actions */}
                        <div className="flex items-center gap-2">
                            <Link
                                href={`/memories/${source.memory_id}`}
                                className="text-xs text-accent-2 hover:underline"
                            >
                                Open memory →
                            </Link>
                            {source.similarity !== undefined && (
                                <span className="ml-auto text-xs text-text-3">
                                    {(source.similarity * 100).toFixed(0)}% match
                                </span>
                            )}
                        </div>
                    </motion.div>
                ))}

                {sources.length === 0 && (
                    <div className="text-center py-8">
                        <p className="text-text-3 text-xs">No sources retrieved yet</p>
                    </div>
                )}
            </div>
        </motion.aside>
    )
}
