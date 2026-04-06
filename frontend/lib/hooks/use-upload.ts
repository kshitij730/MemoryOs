'use client'
// lib/hooks/use-upload.ts — Upload hook with progress tracking
import { useState, useCallback } from 'react'
import { uploadApi } from '@/lib/api'
import { createClient } from '@/lib/supabase'

interface UploadState {
    isUploading: boolean
    jobId: string | null
    memoryId: string | null
    error: string | null
}

export function useUpload() {
    const [state, setState] = useState<UploadState>({
        isUploading: false,
        jobId: null,
        memoryId: null,
        error: null,
    })

    const reset = useCallback(() => {
        setState({ isUploading: false, jobId: null, memoryId: null, error: null })
    }, [])

    const uploadFile = useCallback(async (file: File, title: string, tags: string[], space_id?: string) => {
        setState({ isUploading: true, jobId: null, memoryId: null, error: null })
        try {
            const result = await uploadApi.file(file, title, tags, space_id)
            setState({ isUploading: false, jobId: result.job_id, memoryId: result.memory_id, error: null })
            return result
        } catch (err) {
            const msg = err instanceof Error ? err.message : 'Upload failed'
            setState({ isUploading: false, jobId: null, memoryId: null, error: msg })
            throw err
        }
    }, [])

    const uploadUrl = useCallback(async (url: string, title?: string, tags?: string[], space_id?: string) => {
        setState({ isUploading: true, jobId: null, memoryId: null, error: null })
        try {
            const result = await uploadApi.url({ url, title, tags, space_id })
            setState({ isUploading: false, jobId: result.job_id, memoryId: result.memory_id, error: null })
            return result
        } catch (err) {
            const msg = err instanceof Error ? err.message : 'Upload failed'
            setState({ isUploading: false, jobId: null, memoryId: null, error: msg })
            throw err
        }
    }, [])

    const uploadNote = useCallback(async (title: string, content: string, tags?: string[], space_id?: string) => {
        setState({ isUploading: true, jobId: null, memoryId: null, error: null })
        try {
            const result = await uploadApi.note({ title, content, tags, space_id })
            setState({ isUploading: false, jobId: result.job_id, memoryId: result.memory_id, error: null })
            return result
        } catch (err) {
            const msg = err instanceof Error ? err.message : 'Upload failed'
            setState({ isUploading: false, jobId: null, memoryId: null, error: msg })
            throw err
        }
    }, [])

    return { ...state, uploadFile, uploadUrl, uploadNote, reset }
}

// Subscribe to a job's realtime updates via Supabase Realtime + Polling Fallback
export function useJobStatus(jobId: string | null, onUpdate: (job: { status: string; progress: number; error: string | null }) => void) {
    const [subscribed, setSubscribed] = useState(false)

    // 1. Realtime Subscription
    const subscribe = useCallback(() => {
        if (!jobId || subscribed) return
        const supabase = createClient()
        const channel = supabase
            .channel(`job-${jobId}`)
            .on(
                'postgres_changes',
                { event: 'UPDATE', schema: 'public', table: 'jobs', filter: `id=eq.${jobId}` },
                (payload) => {
                    onUpdate({
                        status: payload.new.status,
                        progress: payload.new.progress,
                        error: payload.new.error,
                    })
                }
            )
            .subscribe()

        setSubscribed(true)

        // 2. Polling Fallback (Every 2 seconds)
        // Helps if Realtime is blocked or slow on Windows/Local
        const pollInterval = setInterval(async () => {
            const { data } = await supabase.from('jobs').select('*').eq('id', jobId).single()
            if (data) {
                onUpdate({
                    status: data.status,
                    progress: data.progress,
                    error: data.error,
                })
                // Stop polling if done or failed
                if (data.status === 'done' || data.status === 'failed') {
                    clearInterval(pollInterval)
                }
            }
        }, 2000)

        return () => {
            supabase.removeChannel(channel)
            clearInterval(pollInterval)
        }
    }, [jobId, subscribed, onUpdate])

    return { subscribe }
}
