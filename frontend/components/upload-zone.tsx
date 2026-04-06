'use client'
import { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
    Upload, Link as LinkIcon, FileText, Mic,
    X, CheckCircle, AlertCircle, Loader2, Sparkles, Plus, Send
} from 'lucide-react'

type Tab = 'file' | 'url' | 'note' | 'voice'

interface UploadZoneProps {
    onUploadFile: (file: File, title: string, tags: string[]) => Promise<void>
    onUploadURL: (url: string, title?: string, tags?: string[]) => Promise<void>
    onUploadNote: (title: string, content: string, tags?: string[]) => Promise<void>
}

export function UploadZone({ onUploadFile, onUploadURL, onUploadNote }: UploadZoneProps) {
    const [activeTab, setActiveTab] = useState<Tab>('file')
    const [isDragging, setIsDragging] = useState(false)
    const [isUploading, setIsUploading] = useState(false)
    const [file, setFile] = useState<File | null>(null)
    const [title, setTitle] = useState('')
    const [url, setUrl] = useState('')
    const [noteContent, setNoteContent] = useState('')
    const [tags, setTags] = useState('')
    const fileInputRef = useRef<HTMLInputElement>(null)

    const resetForm = () => {
        setFile(null)
        setTitle('')
        setUrl('')
        setNoteContent('')
        setTags('')
    }

    const handleFileUpload = async () => {
        if (!file || !title || isUploading) return
        setIsUploading(true)
        try {
            const tagList = tags.split(',').map(t => t.trim()).filter(Boolean)
            await onUploadFile(file, title, tagList)
            resetForm()
        } finally {
            setIsUploading(false)
        }
    }

    const handleURLUpload = async () => {
        if (!url || isUploading) return
        setIsUploading(true)
        try {
            const tagList = tags.split(',').map(t => t.trim()).filter(Boolean)
            await onUploadURL(url, title || undefined, tagList)
            resetForm()
        } finally {
            setIsUploading(false)
        }
    }

    const handleNoteUpload = async () => {
        if (!title || !noteContent || isUploading) return
        setIsUploading(true)
        try {
            const tagList = tags.split(',').map(t => t.trim()).filter(Boolean)
            await onUploadNote(title, noteContent, tagList)
            resetForm()
        } finally {
            setIsUploading(false)
        }
    }

    return (
        <div className="max-w-3xl mx-auto py-12 px-6">
            <header className="text-center mb-12">
                <h1 className="font-serif text-4xl text-text-1 mb-3 italic tracking-tight">Expand Your Intelligence</h1>
                <p className="text-text-3 text-sm font-ui max-w-md mx-auto">Upload documents, save URLs, capture notes, or record thoughts to build your personal knowledge base.</p>
            </header>

            <div className="card-premium h-[540px] flex flex-col bg-bg-1 shadow-2xl shadow-accent/5">
                {/* Tabs */}
                <div className="flex border-b border-border p-2 gap-1 overflow-x-auto scrollbar-none">
                    {(['file', 'url', 'note', 'voice'] as Tab[]).map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`flex-1 flex items-center justify-center gap-2 py-3.5 rounded-xl text-xs font-bold uppercase tracking-widest transition-all duration-300 ${activeTab === tab
                                    ? 'bg-accent text-white shadow-xl shadow-accent/20'
                                    : 'text-text-3 hover:text-text-2'
                                }`}
                        >
                            {tab === 'file' && <Upload size={14} />}
                            {tab === 'url' && <LinkIcon size={14} />}
                            {tab === 'note' && <FileText size={14} />}
                            {tab === 'voice' && <Mic size={14} />}
                            {tab}
                        </button>
                    ))}
                </div>

                <div className="flex-1 overflow-y-auto p-8 relative">
                    <AnimatePresence mode="wait">
                        {activeTab === 'file' && (
                            <motion.div
                                key="file-tab"
                                initial={{ opacity: 0, scale: 0.98 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.98 }}
                                className="h-full flex flex-col"
                            >
                                {!file ? (
                                    <div
                                        onDragOver={(e) => { e.preventDefault(); setIsDragging(true) }}
                                        onDragLeave={() => setIsDragging(false)}
                                        onDrop={(e) => {
                                            e.preventDefault()
                                            setIsDragging(false)
                                            const dropped = e.dataTransfer.files[0]
                                            if (dropped) {
                                                setFile(dropped)
                                                setTitle(dropped.name)
                                            }
                                        }}
                                        onClick={() => fileInputRef.current?.click()}
                                        className={`flex-1 border-2 border-dashed rounded-3xl flex flex-col items-center justify-center gap-4 cursor-pointer transition-all duration-500 ${isDragging
                                                ? 'border-accent bg-accent/5 scale-[0.99]'
                                                : 'border-border hover:border-border-active hover:bg-bg-2'
                                            }`}
                                    >
                                        <input type="file" ref={fileInputRef} className="hidden" onChange={(e) => {
                                            const selected = e.target.files?.[0]
                                            if (selected) {
                                                setFile(selected)
                                                setTitle(selected.name)
                                            }
                                        }} />
                                        <div className="w-16 h-16 rounded-[24px] bg-bg-2 border border-border flex items-center justify-center text-accent group-hover:scale-110 transition-transform">
                                            <Upload size={28} />
                                        </div>
                                        <div className="text-center">
                                            <p className="text-sm font-semibold text-text-1">Drop documents here</p>
                                            <p className="text-[11px] font-medium text-text-3 mt-1 uppercase tracking-widest">PDF, DOCX, TXT, MD up to 50MB</p>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="space-y-6">
                                        <div className="flex items-center gap-4 p-5 bg-bg-2 border border-border rounded-2xl relative group">
                                            <div className="w-12 h-12 bg-accent/10 rounded-xl flex items-center justify-center text-accent">
                                                <FileText size={24} />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-bold text-text-1 truncate">{file.name}</p>
                                                <p className="text-xs text-text-3">{(file.size / (1024 * 1024)).toFixed(2)} MB • Document</p>
                                            </div>
                                            <button onClick={() => setFile(null)} className="p-2 hover:bg-error/10 hover:text-error rounded-lg opacity-0 group-hover:opacity-100 transition-all">
                                                <X size={18} />
                                            </button>
                                        </div>

                                        <div className="space-y-4">
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-bold text-text-3 uppercase tracking-widest">Memory Title</label>
                                                <input value={title} onChange={(e) => setTitle(e.target.value)}
                                                    className="w-full bg-bg-2 border border-border rounded-xl px-4 py-3 text-sm focus:border-accent/40 outline-none transition-all placeholder:text-text-3"
                                                    placeholder="Give this memory a name..." />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-bold text-text-3 uppercase tracking-widest">Tags (Optional)</label>
                                                <input value={tags} onChange={(e) => setTags(e.target.value)}
                                                    className="w-full bg-bg-2 border border-border rounded-xl px-4 py-3 text-sm focus:border-accent/40 outline-none transition-all placeholder:text-text-3"
                                                    placeholder="Separate with commas..." />
                                            </div>
                                        </div>

                                        <button
                                            onClick={handleFileUpload}
                                            disabled={isUploading}
                                            className="w-full py-4 rounded-2xl bg-accent text-white font-bold text-sm tracking-widest uppercase shadow-xl shadow-accent/20 hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 disabled:grayscale transition-all"
                                        >
                                            {isUploading ? <Loader2 className="animate-spin mx-auto" size={20} /> : 'Process Memory'}
                                        </button>
                                    </div>
                                )}
                            </motion.div>
                        )}

                        {activeTab === 'url' && (
                            <motion.div key="url-tab" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-bold text-text-3 uppercase tracking-widest">Source URL</label>
                                        <div className="flex gap-2">
                                            <input value={url} onChange={(e) => setUrl(e.target.value)}
                                                className="flex-1 bg-bg-2 border border-border rounded-xl px-4 py-3.5 text-sm focus:border-accent/40 outline-none transition-all"
                                                placeholder="https://..." />
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-bold text-text-3 uppercase tracking-widest">Title (Optional)</label>
                                            <input value={title} onChange={(e) => setTitle(e.target.value)}
                                                className="w-full bg-bg-2 border border-border rounded-xl px-4 py-3.5 text-sm focus:border-accent/40 outline-none transition-all"
                                                placeholder="Auto-fetched if empty" />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-bold text-text-3 uppercase tracking-widest">Tags</label>
                                            <input value={tags} onChange={(e) => setTags(e.target.value)}
                                                className="w-full bg-bg-2 border border-border rounded-xl px-4 py-3.5 text-sm focus:border-accent/40 outline-none transition-all"
                                                placeholder="Reading, Tech, etc." />
                                        </div>
                                    </div>
                                    <button
                                        onClick={handleURLUpload}
                                        disabled={isUploading || !url}
                                        className="w-full py-4 rounded-2xl bg-accent text-white font-bold text-sm tracking-widest uppercase shadow-xl shadow-accent/20 mt-4 disabled:opacity-50 transition-all font-ui"
                                    >
                                        {isUploading ? <Loader2 className="animate-spin mx-auto" size={20} /> : 'Save URL Memory'}
                                    </button>
                                </div>
                                <div className="p-6 border border-border border-dashed rounded-3xl text-center">
                                    <p className="text-text-3 text-xs italic">MemoryOS will crawl the URL, extract clean text, and generate a summary for your brain.</p>
                                </div>
                            </motion.div>
                        )}

                        {activeTab === 'note' && (
                            <motion.div key="note-tab" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="h-full flex flex-col space-y-4">
                                <div className="space-y-2">
                                    <input value={title} onChange={(e) => setTitle(e.target.value)}
                                        className="w-full bg-transparent border-none text-2xl font-serif italic text-text-1 focus:ring-0 outline-none px-0"
                                        placeholder="Note Title..." />
                                </div>
                                <div className="flex-1 relative">
                                    <textarea value={noteContent} onChange={(e) => setNoteContent(e.target.value)}
                                        className="w-full h-full bg-bg-2 border border-border rounded-2xl p-6 text-sm font-mono leading-relaxed focus:border-accent/30 outline-none resize-none placeholder:text-text-3 transition-colors"
                                        placeholder="Write your thoughts in markdown..." />
                                    <div className="absolute bottom-4 right-6 text-[10px] font-bold text-text-3 tracking-widest uppercase">
                                        {noteContent.length} Characters
                                    </div>
                                </div>
                                <div className="flex gap-4 items-center">
                                    <input value={tags} onChange={(e) => setTags(e.target.value)}
                                        className="flex-1 bg-bg-2 border border-border rounded-xl px-4 py-3 text-xs focus:border-accent/30 outline-none transition-all"
                                        placeholder="Tags: journal, idea, research..." />
                                    <button onClick={handleNoteUpload} disabled={isUploading || !title || !noteContent}
                                        className="px-8 py-3 rounded-xl bg-accent text-white font-bold text-xs uppercase tracking-widest shadow-lg shadow-accent/10 disabled:opacity-50 active:scale-95 transition-all">
                                        {isUploading ? <Loader2 className="animate-spin" size={16} /> : 'Save Note'}
                                    </button>
                                </div>
                            </motion.div>
                        )}

                        {activeTab === 'voice' && (
                            <motion.div key="voice-tab" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="h-full flex flex-col items-center justify-center space-y-10">
                                <div className="relative">
                                    <motion.div
                                        animate={{ scale: [1, 1.15, 1], opacity: [0.5, 0.2, 0.5] }}
                                        transition={{ duration: 2, repeat: Infinity }}
                                        className="absolute -inset-8 bg-accent rounded-full blur-2xl"
                                    />
                                    <button className="relative w-24 h-24 bg-accent text-white rounded-full flex items-center justify-center shadow-2xl shadow-accent/40 active:scale-90 transition-transform">
                                        <Mic size={36} />
                                    </button>
                                </div>
                                <div className="text-center">
                                    <h3 className="text-text-1 font-serif text-2xl italic mb-2 px-6">Record a Voice Memory</h3>
                                    <p className="text-text-3 text-xs uppercase tracking-widest font-bold">Transcription starts after recording</p>
                                </div>
                                <div className="flex gap-1.5 h-12 items-center">
                                    {[1, 2.5, 1.5, 3.5, 1.2, 2.8].map((v, i) => (
                                        <motion.div key={i}
                                            animate={{ height: ['20%', '100%', '20%'] }}
                                            transition={{ duration: v * 0.5, repeat: Infinity, delay: i * 0.1 }}
                                            className="w-1.5 bg-accent/40 rounded-full" />
                                    ))}
                                </div>
                                <p className="text-text-3 text-[10px] uppercase font-bold tracking-[0.2em] opacity-40">Coming Soon: Whisper Large-V3 Integration</p>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>

            <footer className="mt-8 flex justify-center items-center gap-6 text-[10px] font-bold text-text-3 tracking-[0.2em] uppercase opacity-60">
                <div className="flex items-center gap-2"><Sparkles size={12} className="text-accent" /> Encrypted Cloud</div>
                <div className="w-1 h-1 rounded-full bg-border" />
                <div className="flex items-center gap-2"><CheckCircle size={12} className="text-success" /> OCR Extraction</div>
                <div className="w-1 h-1 rounded-full bg-border" />
                <div className="flex items-center gap-2"><Plus size={12} className="text-warning" /> Multi-Source</div>
            </footer>
        </div>
    )
}
