import { FileText, Link as LinkIcon, Mic, Bot, MoreHorizontal, Clock, Hash, Trash2, Share2 } from 'lucide-react'
import type { Memory, SourceType } from '@/lib/types'
import { formatDistanceToNow } from 'date-fns'
import { motion, useMotionValue, useTransform } from 'framer-motion'
import Link from 'next/link'
import { useMediaQuery } from '@/lib/hooks/use-media-query'

interface MemoryCardProps {
    memory: Memory
    onClick?: () => void
    compact?: boolean
    onDelete?: (id: string) => void
    onShare?: (id: string) => void
}

const getSourceIcon = (type: SourceType) => {
    switch (type) {
        case 'document': return <FileText size={14} className="text-blue-400" />
        case 'url': return <LinkIcon size={14} className="text-green-400" />
        case 'voice': return <Mic size={14} className="text-red-400" />
        case 'note': return <FileText size={14} className="text-yellow-400" />
        case 'agent': return <Bot size={14} className="text-accent-light" />
        default: return <FileText size={14} />
    }
}

export function MemoryCard({ memory, compact: isForcedCompact, onDelete, onShare }: MemoryCardProps) {
    const isMobile = useMediaQuery('(max-width: 767px)')
    const compact = isForcedCompact || isMobile
    const timeAgo = formatDistanceToNow(new Date(memory.created_at), { addSuffix: true })

    // Swipe logic
    const x = useMotionValue(0)
    const deleteOpacity = useTransform(x, [-100, -50], [1, 0])
    const shareOpacity = useTransform(x, [50, 100], [0, 1])

    if (compact) {
        return (
            <div className="relative overflow-hidden rounded-2xl group">
                {/* Swipe Background Actions */}
                <div className="absolute inset-0 flex items-center justify-between px-6 bg-bg-2">
                    <motion.div style={{ opacity: shareOpacity }} className="text-accent">
                        <Share2 size={20} />
                    </motion.div>
                    <motion.div style={{ opacity: deleteOpacity }} className="text-error">
                        <Trash2 size={20} />
                    </motion.div>
                </div>

                <motion.div
                    drag={isMobile ? "x" : false}
                    dragConstraints={{ left: -100, right: 100 }}
                    style={{ x }}
                    onDragEnd={(_, info) => {
                        if (info.offset.x < -80) onDelete?.(memory.id)
                        if (info.offset.x > 80) onShare?.(memory.id)
                        x.set(0)
                    }}
                    className="relative bg-bg-1 border border-border p-4 flex gap-4 h-[120px] transition-colors active:bg-bg-2"
                >
                    <div className="w-10 h-10 rounded-xl bg-bg-3 flex items-center justify-center shrink-0">
                        {getSourceIcon(memory.source_type)}
                    </div>
                    <div className="min-w-0 flex-1 flex flex-col">
                        <div className="flex items-center justify-between mb-1">
                            <span className="text-[9px] uppercase font-black text-text-3 tracking-widest">{memory.source_type}</span>
                            <span className="text-[9px] font-bold text-text-3">{timeAgo}</span>
                        </div>
                        <Link href={`/memories/${memory.id}`} className="block flex-1">
                            <h4 className="text-sm font-bold text-text-1 line-clamp-2 leading-tight mb-1">{memory.title}</h4>
                            <p className="text-[11px] text-text-3 line-clamp-1">{memory.summary || memory.content}</p>
                        </Link>
                    </div>
                </motion.div>
            </div>
        )
    }

    return (
        <Link href={`/memories/${memory.id}`} className="block h-[160px]">
            <motion.div
                whileHover={{ y: -4, borderColor: 'var(--border-active)' }}
                className="h-full bg-bg-1 border border-border rounded-xl p-4 flex flex-col justify-between overflow-hidden transition-all duration-300 hover:bg-bg-2"
            >
                {/* Top: Metadata */}
                <div>
                    <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                            <div className="flex items-center justify-center w-6 h-6 rounded-lg bg-bg-3">
                                {getSourceIcon(memory.source_type)}
                            </div>
                            <span className="text-[10px] uppercase tracking-wider font-bold text-text-3">
                                {memory.source_type}
                            </span>
                        </div>
                        <div className="flex items-center gap-1.5 text-[10px] text-text-3 font-medium">
                            <Clock size={10} strokeWidth={3} />
                            {timeAgo}
                        </div>
                    </div>

                    {/* Title */}
                    <h3 className="font-serif text-base text-text-1 leading-tight mb-1 line-clamp-2">
                        {memory.title}
                    </h3>

                    {/* Summary snippet */}
                    <p className="text-text-2 text-xs leading-relaxed line-clamp-2 max-w-[95%]">
                        {memory.summary || memory.content || "Processing your memory..."}
                    </p>
                </div>

                {/* Bottom: Tags */}
                <div className="flex items-center justify-between mt-auto pt-2">
                    <div className="flex gap-1.5 overflow-hidden">
                        {memory.tags?.slice(0, 3).map(tag => (
                            <span key={tag} className="tag-pill flex items-center gap-0.5 max-w-[80px] truncate">
                                <span className="opacity-50 text-[8px] mr-0.5">#</span>
                                {tag}
                            </span>
                        ))}
                        {memory.tags?.length > 3 && (
                            <span className="text-[10px] text-text-3 py-0.5">+{memory.tags.length - 3}</span>
                        )}
                    </div>
                    <button className="text-text-3 hover:text-text-2 transition-colors p-1 -mr-1">
                        <MoreHorizontal size={14} />
                    </button>
                </div>
            </motion.div>
        </Link>
    )
}
