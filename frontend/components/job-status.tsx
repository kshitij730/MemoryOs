'use client'
// components/job-status.tsx — Realtime job processing progress card
import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { CheckCircle, XCircle, Loader2, ArrowRight } from 'lucide-react'

interface JobStatusProps {
    jobId: string
    memoryId: string | null
    externalStatus?: { status: string; progress: number; error: string | null } | null
}

export function JobStatus({ jobId, memoryId, externalStatus }: JobStatusProps) {
    const [status, setStatus] = useState(externalStatus?.status || 'pending')
    const [progress, setProgress] = useState(externalStatus?.progress || 0)
    const [error, setError] = useState(externalStatus?.error || null)

    useEffect(() => {
        if (externalStatus) {
            setStatus(externalStatus.status)
            setProgress(externalStatus.progress)
            setError(externalStatus.error)
        }
    }, [externalStatus])

    const isDone = status === 'done'
    const isFailed = status === 'failed'
    const isRunning = status === 'running' || status === 'pending'

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="card space-y-3"
        >
            <div className="flex items-center gap-3">
                {isDone && <CheckCircle size={18} className="text-success flex-shrink-0" />}
                {isFailed && <XCircle size={18} className="text-error flex-shrink-0" />}
                {isRunning && <Loader2 size={18} className="text-accent animate-spin flex-shrink-0" />}

                <div className="flex-1">
                    <p className="text-text-1 text-sm font-medium">
                        {isDone ? 'Memory saved & indexed' :
                            isFailed ? 'Processing failed' :
                                status === 'pending' ? 'Queued for processing...' :
                                    'Processing your memory...'}
                    </p>
                    <p className="text-text-3 text-xs mt-0.5">Job ID: {jobId.slice(0, 8)}...</p>
                </div>

                {isDone && memoryId && (
                    <Link href={`/memories/${memoryId}`}
                        className="flex items-center gap-1 text-xs text-accent-2 hover:underline">
                        View <ArrowRight size={12} />
                    </Link>
                )}
            </div>

            {/* Progress bar */}
            {!isFailed && (
                <div className="h-1 bg-bg-3 rounded-full overflow-hidden">
                    <motion.div
                        className="h-full bg-accent rounded-full"
                        initial={{ width: 0 }}
                        animate={{ width: `${progress}%` }}
                        transition={{ duration: 0.5, ease: 'easeOut' }}
                    />
                </div>
            )}

            {isFailed && error && (
                <p className="text-error text-xs bg-error/10 border border-error/30 rounded-lg px-2 py-1.5">
                    {error}
                </p>
            )}

            {isDone && (
                <p className="text-text-3 text-xs">
                    Your memory has been chunked, embedded, and indexed. You can now chat with it.
                </p>
            )}
        </motion.div>
    )
}
