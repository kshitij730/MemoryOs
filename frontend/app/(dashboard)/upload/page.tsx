'use client'
// app/(dashboard)/upload/page.tsx — Premium 4-tab upload hub with Memory Spaces
import { useState, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useUpload, useJobStatus } from '@/lib/hooks/use-upload'
import { JobStatus } from '@/components/job-status'
import {
    FileText, Link2, PenLine, Mic, StopCircle,
    Loader2, Upload as UploadIcon, X, CheckCircle,
    AlertCircle, Sparkles, Plus, Send, ChevronRight
} from 'lucide-react'
import { useSpaceStore } from '@/store/use-space-store'
import { useMediaQuery } from '@/lib/hooks/use-media-query'

const TABS = [
    { id: 'file', label: 'Document', icon: FileText },
    { id: 'url', label: 'Web Link', icon: Link2 },
    { id: 'note', label: 'Brain Note', icon: PenLine },
    { id: 'voice', label: 'Thought', icon: Mic },
] as const

type TabId = typeof TABS[number]['id']

export default function UploadPage() {
    const isMobile = useMediaQuery('(max-width: 767px)')
    const [tab, setTab] = useState<TabId>('file')
    const { activeSpace } = useSpaceStore()
    const { isUploading, jobId, memoryId, error, uploadFile, uploadUrl, uploadNote, reset } = useUpload()

    // Shared state
    const [tags, setTags] = useState('')

    // File state
    const [file, setFile] = useState<File | null>(null)
    const [fileTitle, setFileTitle] = useState('')
    const [isDragging, setIsDragging] = useState(false)
    const fileInputRef = useRef<HTMLInputElement>(null)

    // URL state
    const [url, setUrl] = useState('')
    const [urlTitle, setUrlTitle] = useState('')

    // Note state
    const [noteTitle, setNoteTitle] = useState('')
    const [noteContent, setNoteContent] = useState('')

    // Voice state
    const [isRecording, setIsRecording] = useState(false)
    const [audioBlob, setAudioBlob] = useState<Blob | null>(null)
    const mediaRef = useRef<MediaRecorder | null>(null)
    const chunksRef = useRef<Blob[]>([])

    // Job status tracking
    const [jobStatus, setJobStatus] = useState<{ status: string; progress: number; error: string | null } | null>(null)
    const { subscribe } = useJobStatus(jobId, (update) => {
        setJobStatus(update)
    })

    const handleFileSubmit = async () => {
        if (!file || !fileTitle || isUploading) return
        reset()
        setJobStatus(null)
        const tagList = tags.split(',').map(t => t.trim()).filter(Boolean)
        await uploadFile(file, fileTitle, tagList, activeSpace?.id)
        subscribe()
    }

    const handleUrlSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!url || isUploading) return
        reset()
        setJobStatus(null)
        const tagList = tags.split(',').map(t => t.trim()).filter(Boolean)
        await uploadUrl(url, urlTitle || url, tagList, activeSpace?.id)
        subscribe()
    }

    const handleNoteSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!noteTitle || !noteContent || isUploading) return
        reset()
        setJobStatus(null)
        const tagList = tags.split(',').map(t => t.trim()).filter(Boolean)
        await uploadNote(noteTitle, noteContent, tagList, activeSpace?.id)
        subscribe()
    }

    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
            chunksRef.current = []
            const recorder = new MediaRecorder(stream)
            recorder.ondataavailable = (e) => chunksRef.current.push(e.data)
            recorder.onstop = () => setAudioBlob(new Blob(chunksRef.current, { type: 'audio/webm' }))
            recorder.start()
            mediaRef.current = recorder
            setIsRecording(true)
        } catch (err) {
            console.error('Mic access denied', err)
        }
    }

    const stopRecording = () => {
        mediaRef.current?.stop()
        setIsRecording(false)
    }

    const handleVoiceSubmit = async () => {
        if (!audioBlob || isUploading) return
        const voiceFile = new File([audioBlob], 'recording.webm', { type: 'audio/webm' })
        reset()
        setJobStatus(null)
        await uploadFile(voiceFile, 'Voice Memo', [], activeSpace?.id)
        subscribe()
        setAudioBlob(null)
    }

    return (
        <div className="max-w-[1400px] mx-auto px-4 md:px-12 py-8 md:py-20 h-full flex flex-col pb-32">
            {/* Header */}
            <div className={`flex flex-col md:flex-row md:items-end justify-between mb-8 md:mb-12 gap-4 md:gap-6 ${isMobile ? 'pt-16' : ''}`}>
                <div>
                    <h1 className="font-serif text-3xl md:text-5xl text-text-1 italic tracking-tight mb-2 md:mb-3">Knowledge Ingestion</h1>
                    <div className="flex items-center gap-2">
                        <p className="text-text-3 text-[10px] md:text-xs font-medium uppercase tracking-[0.2em]">Filing in</p>
                        <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-accent-bg border border-accent/20">
                            <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: activeSpace?.color }} />
                            <span className="text-[9px] md:text-[10px] font-bold text-accent uppercase tracking-widest">{activeSpace?.name}</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-12">
                {/* Left: Input Area */}
                <div className="lg:col-span-12 xl:col-span-8">
                    <div className="card-premium min-h-[500px] md:min-h-[580px] flex flex-col bg-bg-1 shadow-2xl shadow-accent/5 overflow-hidden rounded-[24px] md:rounded-[32px]">
                        {/* Tabs */}
                        <div className="flex border-b border-border p-1 md:p-2 gap-1 overflow-x-auto scrollbar-none snap-x">
                            {TABS.map((t) => (
                                <button
                                    key={t.id}
                                    onClick={() => { setTab(t.id); reset() }}
                                    className={`flex-none w-1/3 sm:flex-1 flex items-center justify-center gap-2 py-3 md:py-4 rounded-xl text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em] transition-all duration-300 snap-center ${tab === t.id
                                        ? 'bg-accent text-white shadow-xl shadow-accent/20'
                                        : 'text-text-3 hover:text-text-2 hover:bg-bg-2'
                                        }`}
                                >
                                    <t.icon size={isMobile ? 12 : 14} />
                                    {t.label}
                                </button>
                            ))}
                        </div>

                        <div className="flex-1 p-6 md:p-12">
                            <AnimatePresence mode="wait">
                                {tab === 'file' && (
                                    <motion.div key="file" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="h-full flex flex-col">
                                        {!file ? (
                                            <div
                                                onDragOver={(e) => { e.preventDefault(); setIsDragging(true) }}
                                                onDragLeave={() => setIsDragging(false)}
                                                onDrop={(e) => {
                                                    e.preventDefault()
                                                    setIsDragging(false)
                                                    const dropped = e.dataTransfer.files[0]
                                                    if (dropped) { setFile(dropped); setFileTitle(dropped.name) }
                                                }}
                                                onClick={() => fileInputRef.current?.click()}
                                                className={`flex-1 min-h-[300px] border-2 border-dashed rounded-[24px] md:rounded-[32px] flex flex-col items-center justify-center gap-4 md:gap-6 cursor-pointer transition-all duration-500 px-6 text-center ${isDragging ? 'border-accent bg-accent/5 scale-[0.99]' : 'border-border hover:border-border-active hover:bg-bg-0'}`}
                                            >
                                                <input type="file" ref={fileInputRef} className="hidden" onChange={(e) => {
                                                    const selected = e.target.files?.[0]
                                                    if (selected) { setFile(selected); setFileTitle(selected.name) }
                                                }} />
                                                <div className="w-16 h-16 md:w-20 md:h-20 rounded-[20px] md:rounded-[28px] bg-bg-2 border border-border flex items-center justify-center text-accent shadow-inner">
                                                    <UploadIcon size={isMobile ? 24 : 32} />
                                                </div>
                                                <div>
                                                    <p className="text-md font-bold text-text-1 italic">Transmit knowledge</p>
                                                    <p className="text-[10px] font-bold text-text-3 mt-2 uppercase tracking-[0.2em]">PDF, DOCX, TXT, MD • Max 50MB</p>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="space-y-6 md:space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                                <div className="flex items-center gap-4 md:gap-6 p-4 md:p-6 bg-stroke-bg border border-border rounded-2xl md:rounded-3xl relative group">
                                                    <div className="w-12 h-12 md:w-14 md:h-14 bg-accent/10 rounded-xl md:rounded-2xl flex items-center justify-center text-accent shrink-0">
                                                        <FileText size={isMobile ? 24 : 28} />
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-sm md:text-md font-black text-text-1 truncate uppercase tracking-tight">{file.name}</p>
                                                        <p className="text-[9px] md:text-[10px] font-bold text-text-3 uppercase tracking-widest mt-1">{(file.size / (1024 * 1024)).toFixed(2)} MB • READY</p>
                                                    </div>
                                                    <button onClick={() => setFile(null)} className="p-2 hover:bg-error/10 hover:text-error rounded-xl transition-all">
                                                        <X size={20} />
                                                    </button>
                                                </div>
                                                <div className="space-y-4 md:space-y-6">
                                                    <div className="space-y-2">
                                                        <label className="text-[9px] md:text-[10px] font-black text-text-3 uppercase tracking-[0.2em]">Memory Label</label>
                                                        <input value={fileTitle} onChange={(e) => setFileTitle(e.target.value)} className="w-full bg-bg-2 border border-border rounded-xl md:rounded-2xl px-5 py-3 md:px-6 md:py-4 text-sm focus:border-accent/40 outline-none transition-all" />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <label className="text-[9px] md:text-[10px] font-black text-text-3 uppercase tracking-[0.2em]">Semantic Tags</label>
                                                        <input value={tags} onChange={(e) => setTags(e.target.value)} placeholder="research, thesis, draft..." className="w-full bg-bg-2 border border-border rounded-xl md:rounded-2xl px-5 py-3 md:px-6 md:py-4 text-sm focus:border-accent/40 outline-none transition-all" />
                                                    </div>
                                                </div>
                                                <button onClick={handleFileSubmit} disabled={isUploading} className="w-full py-4 md:py-5 rounded-xl md:rounded-2xl bg-accent text-white font-black text-[10px] md:text-xs tracking-[0.2em] uppercase shadow-2xl shadow-accent/20 hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 transition-all">
                                                    {isUploading ? <Loader2 className="animate-spin mx-auto" size={20} /> : 'Process document & embed'}
                                                </button>
                                            </div>
                                        )}
                                    </motion.div>
                                )}

                                {tab === 'url' && (
                                    <motion.div key="url" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-8 md:space-y-10">
                                        <div className="space-y-4 md:space-y-6">
                                            <div className="space-y-2 md:space-y-3">
                                                <label className="text-[9px] md:text-[10px] font-black text-text-3 uppercase tracking-[0.2em]">Source Link</label>
                                                <input value={url} onChange={(e) => setUrl(e.target.value)} className="w-full bg-bg-2 border border-border rounded-xl md:rounded-2xl px-5 py-4 md:px-6 md:py-5 text-sm focus:border-accent/40 outline-none transition-all font-mono" placeholder="https://..." />
                                            </div>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                                                <div className="space-y-2 md:space-y-3">
                                                    <label className="text-[9px] md:text-[10px] font-black text-text-3 uppercase tracking-[0.2em]">Custom Title</label>
                                                    <input value={urlTitle} onChange={(e) => setUrlTitle(e.target.value)} className="w-full bg-bg-1 border border-border rounded-xl md:rounded-2xl px-5 py-3 md:px-6 md:py-4 text-sm focus:border-accent/40 outline-none transition-all" placeholder="Auto-fetch if empty" />
                                                </div>
                                                <div className="space-y-2 md:space-y-3">
                                                    <label className="text-[9px] md:text-[10px] font-black text-text-3 uppercase tracking-[0.2em]">Tags</label>
                                                    <input value={tags} onChange={(e) => setTags(e.target.value)} className="w-full bg-bg-1 border border-border rounded-xl md:rounded-2xl px-5 py-3 md:px-6 md:py-4 text-sm focus:border-accent/40 outline-none transition-all" placeholder="news, tech, article" />
                                                </div>
                                            </div>
                                        </div>
                                        <button onClick={handleUrlSubmit} disabled={isUploading || !url} className="w-full py-4 md:py-5 rounded-xl md:rounded-2xl bg-accent text-white font-black text-[10px] md:text-xs tracking-[0.2em] uppercase shadow-2xl shadow-accent/20 transition-all disabled:opacity-50">
                                            {isUploading ? <Loader2 className="animate-spin mx-auto" size={20} /> : 'Process URL memory'}
                                        </button>
                                        <div className="p-6 md:p-8 border border-border border-dashed rounded-[24px] md:rounded-[32px] flex items-center gap-4 bg-bg-0/30">
                                            <Sparkles size={20} className="text-accent shrink-0" />
                                            <p className="text-[11px] md:text-xs text-text-3 italic leading-relaxed">MemoryOS will crawl the provided URL, extract visual and textual data, and synthesize a semantic vector for your brain.</p>
                                        </div>
                                    </motion.div>
                                )}

                                {tab === 'note' && (
                                    <motion.div key="note" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="h-full flex flex-col space-y-4 md:space-y-6">
                                        <input value={noteTitle} onChange={(e) => setNoteTitle(e.target.value)} className="w-full bg-transparent border-none text-2xl md:text-4xl font-serif italic text-text-1 focus:ring-0 outline-none px-0" placeholder="Untethered thought..." />
                                        <div className="flex-1 relative group min-h-[300px]">
                                            <textarea value={noteContent} onChange={(e) => setNoteContent(e.target.value)} className="w-full h-full bg-bg-2 border border-border rounded-[24px] md:rounded-[32px] p-6 md:p-8 text-sm font-mono leading-relaxed focus:border-accent/30 outline-none resize-none placeholder:text-text-3 transition-all" placeholder="Write your brain note in markdown..." />
                                            <div className="absolute bottom-4 right-6 text-[8px] md:text-[9px] font-black text-text-3 tracking-[0.3em] uppercase opacity-40">
                                                {noteContent.length} CHARS • UTF-8
                                            </div>
                                        </div>
                                        <div className="flex flex-col md:flex-row gap-4 items-center pt-2">
                                            <input value={tags} onChange={(e) => setTags(e.target.value)} className="w-full md:flex-1 bg-bg-2 border border-border rounded-xl md:rounded-2xl px-5 py-4 text-[9px] md:text-[10px] font-black uppercase tracking-widest focus:border-accent/30 outline-none transition-all" placeholder="TAGS: JOURNAL, IDEA, RESEARCH" />
                                            <button onClick={handleNoteSubmit} disabled={isUploading || !noteTitle || !noteContent} className="w-full md:w-auto px-10 py-4 rounded-xl md:rounded-2xl bg-accent text-white font-black text-[10px] uppercase tracking-[0.2em] shadow-lg shadow-accent/10 transition-all hover:scale-105 active:scale-95 disabled:opacity-50">
                                                {isUploading ? <Loader2 size={16} className="animate-spin" /> : 'Committ Note'}
                                            </button>
                                        </div>
                                    </motion.div>
                                )}

                                {tab === 'voice' && (
                                    <motion.div key="voice" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="h-full flex flex-col items-center justify-center space-y-8 md:space-y-12 py-10">
                                        <div className="relative">
                                            <AnimatePresence>
                                                {isRecording && (
                                                    <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: [1, 1.4, 1], opacity: [0.3, 0.1, 0.3] }} transition={{ duration: 1.5, repeat: Infinity }} className="absolute -inset-10 md:-inset-12 bg-red-500 rounded-full blur-2xl md:blur-3xl" />
                                                )}
                                            </AnimatePresence>
                                            <button
                                                onClick={isRecording ? stopRecording : startRecording}
                                                className={`relative w-24 h-24 md:w-28 md:h-28 rounded-full flex items-center justify-center shadow-2xl transition-all duration-500 active:scale-90 ${isRecording ? 'bg-red-500 text-white scale-110 shadow-red-500/20' : 'bg-accent text-white shadow-accent/40'}`}
                                            >
                                                {isRecording ? <StopCircle size={isMobile ? 32 : 36} /> : <Mic size={isMobile ? 32 : 36} />}
                                            </button>
                                        </div>
                                        <div className="text-center">
                                            <h3 className="text-text-1 font-serif text-2xl md:text-3xl italic mb-2 md:mb-3">Sync Voice Stream</h3>
                                            <p className="text-text-3 text-[9px] md:text-[10px] uppercase tracking-[0.3em] font-black">Neural transcription • Whisper Large-V3</p>
                                        </div>

                                        {audioBlob ? (
                                            <div className="w-full max-w-sm space-y-4 animate-in zoom-in-95 duration-300">
                                                <audio src={URL.createObjectURL(audioBlob)} controls className="w-full opacity-60" />
                                                <button onClick={handleVoiceSubmit} disabled={isUploading} className="w-full py-4 md:py-5 rounded-xl md:rounded-2xl bg-accent text-white font-black text-[10px] md:text-xs uppercase tracking-widest shadow-xl shadow-accent/20 transition-all">
                                                    {isUploading ? <Loader2 className="animate-spin mx-auto" size={18} /> : 'Process thought stream'}
                                                </button>
                                            </div>
                                        ) : (
                                            <div className="flex gap-2 h-10 md:h-14 items-center">
                                                {[1.2, 2.5, 1.8, 3.2, 1.4, 2.7, 1.9, 3.5].map((v, i) => (
                                                    <motion.div key={i} animate={{ height: isRecording ? ['20%', '100%', '20%'] : '10%' }} transition={{ duration: v * 0.4, repeat: Infinity, delay: i * 0.1 }} className={`w-1.5 md:w-2 rounded-full ${isRecording ? 'bg-red-500/40' : 'bg-accent/20'}`} />
                                                ))}
                                            </div>
                                        )}
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>
                </div>
            </div>

            {/* Global Errors / Progress */}
            <AnimatePresence>
                {error && (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }} className="fixed bottom-20 md:bottom-12 left-4 right-4 md:left-auto md:right-12 max-w-md bg-error/10 backdrop-blur-xl border border-error/30 rounded-2xl p-5 md:p-6 flex items-start gap-4 shadow-2xl z-50">
                        <AlertCircle className="text-error shrink-0" size={20} />
                        <div>
                            <p className="text-[10px] font-black text-error uppercase tracking-widest mb-1">Upload Protocol Failed</p>
                            <p className="text-xs md:text-sm text-text-1 leading-relaxed opacity-80">{error}</p>
                        </div>
                    </motion.div>
                )}

                {jobId && (
                    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="fixed bottom-20 md:bottom-12 left-4 right-4 md:left-auto md:right-12 md:w-80 bg-bg-1/80 backdrop-blur-2xl border border-border rounded-2xl md:rounded-3xl p-5 md:p-6 shadow-2xl shadow-accent/10 z-50">
                        <JobStatus jobId={jobId} memoryId={memoryId} externalStatus={jobStatus} />
                    </motion.div>
                )}
            </AnimatePresence>

            <footer className="mt-12 md:mt-auto py-8 md:py-12 flex flex-col md:flex-row items-center justify-center gap-6 md:gap-10 text-[8px] md:text-[9px] font-black text-text-3 tracking-[0.3em] uppercase opacity-40">
                <div className="flex items-center gap-2"><Sparkles size={12} className="text-accent" /> Encrypted Neural Cloud</div>
                <div className="hidden md:block w-1 h-1 rounded-full bg-border" />
                <div className="flex items-center gap-2"><CheckCircle size={12} className="text-accent" /> Semantic Vector Grid</div>
            </footer>
        </div>
    )
}
