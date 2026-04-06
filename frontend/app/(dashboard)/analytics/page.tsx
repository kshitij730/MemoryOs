'use client'
// app/(dashboard)/analytics/page.tsx — Premium Brain Insights
import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell, Legend, AreaChart, Area
} from 'recharts'
import {
    Brain, Zap, Cpu, History, TrendingUp, Tag as TagIcon,
    Layers, MessageSquare, Loader2, Sparkles
} from 'lucide-react'
import { analyticsApi } from '@/lib/api'

const COLORS = ['#7c3aed', '#a78bfa', '#ec4899', '#3b82f6', '#10b981']

export default function AnalyticsPage() {
    const [data, setData] = useState<any>(null)
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        analyticsApi.overview().then(res => {
            setData(res)
            setIsLoading(false)
        })
    }, [])

    if (isLoading) return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
            <Loader2 className="animate-spin text-accent" size={32} />
            <p className="text-[10px] font-black text-text-3 uppercase tracking-[0.2em]">Analyzing neural patterns...</p>
        </div>
    )

    const typeData = Object.entries(data.memories_by_type).map(([name, value]) => ({ name, value }))

    return (
        <div className="max-w-6xl mx-auto p-8 pb-32">
            <header className="mb-12">
                <div className="flex items-center gap-3 mb-2">
                    <Sparkles className="text-accent" size={20} />
                    <span className="text-[10px] font-black text-accent uppercase tracking-[0.3em]">Insight Engine</span>
                </div>
                <h1 className="font-serif text-5xl text-text-1 italic tracking-tight">Brain Overview</h1>
            </header>

            {/* Row 1: Metric Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
                {[
                    { label: 'Total Memories', value: data.total_memories, unit: 'units', icon: Brain },
                    { label: 'Chats Completed', value: data.total_chats, unit: 'sessions', icon: MessageSquare },
                    { label: 'Tokens Consumed', value: `${(data.total_tokens_used / 1000).toFixed(1)}k`, unit: 'total', icon: Cpu },
                    { label: 'Avg Latency', value: data.avg_chat_latency_ms, unit: 'ms', icon: Zap },
                ].map((stat, i) => (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                        key={stat.label}
                        className="bg-bg-1 border border-border p-6 rounded-3xl"
                    >
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-8 h-8 rounded-xl bg-bg-2 flex items-center justify-center text-text-3">
                                <stat.icon size={16} />
                            </div>
                            <span className="text-[10px] font-black text-text-3 uppercase tracking-widest">{stat.label}</span>
                        </div>
                        <div className="flex items-baseline gap-2">
                            <span className="text-3xl font-serif text-text-1">{stat.value}</span>
                            <span className="text-[10px] font-bold text-text-3 uppercase tracking-wider">{stat.unit}</span>
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Row 2: Main Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 mb-12">
                <div className="lg:col-span-3">
                    <div className="mb-6">
                        <h3 className="text-[10px] font-black text-text-3 uppercase tracking-[0.2em] mb-1">Ingestion Timeline</h3>
                        <p className="font-serif text-xl text-text-1 italic">Memories saved per day (30d)</p>
                    </div>
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={data.memories_by_day}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#2a2a2a" />
                                <XAxis
                                    dataKey="date"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: '#888888', fontSize: 10 }}
                                    tickFormatter={(val) => val.split('-').slice(1).join('/')}
                                />
                                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#888888', fontSize: 10 }} />
                                <Tooltip
                                    cursor={{ fill: '#ffffff05' }}
                                    contentStyle={{ backgroundColor: '#0f0f0f', border: '1px solid #2a2a2a', borderRadius: '12px', fontSize: '10px' }}
                                />
                                <Bar dataKey="count" fill="#7c3aed" radius={[4, 4, 0, 0]} barSize={24} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="lg:col-span-2">
                    <div className="mb-6">
                        <h3 className="text-[10px] font-black text-text-3 uppercase tracking-[0.2em] mb-1">Neural Diversity</h3>
                        <p className="font-serif text-xl text-text-1 italic">Source type distribution</p>
                    </div>
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={typeData}
                                    innerRadius={60}
                                    outerRadius={80}
                                    paddingAngle={8}
                                    dataKey="value"
                                >
                                    {typeData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#0f0f0f', border: '1px solid #2a2a2a', borderRadius: '12px', fontSize: '10px' }}
                                />
                                <Legend
                                    verticalAlign="bottom"
                                    height={36}
                                    iconType="circle"
                                    formatter={(value) => <span className="text-[10px] uppercase font-black tracking-widest text-text-3 ml-1">{value}</span>}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* Row 3: Topics & Tags */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-12">
                <div>
                    <h3 className="text-[10px] font-black text-text-3 uppercase tracking-[0.2em] mb-6">Cognitive Focal Points</h3>
                    <div className="space-y-4">
                        {data.top_topics.map((topic: any, i: number) => (
                            <div key={topic.topic} className="group">
                                <div className="flex justify-between items-end mb-2">
                                    <span className="text-xs font-bold text-text-2 group-hover:text-text-1 transition-colors uppercase tracking-wider">{topic.topic}</span>
                                    <span className="text-[10px] font-black text-accent">{topic.count} refs</span>
                                </div>
                                <div className="w-full h-1 bg-bg-2 rounded-full overflow-hidden">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: `${(topic.count / data.top_topics[0].count) * 100}%` }}
                                        className="h-full bg-accent opacity-60 group-hover:opacity-100 transition-opacity"
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div>
                    <h3 className="text-[10px] font-black text-text-3 uppercase tracking-[0.2em] mb-8">Metadata Cloud</h3>
                    <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-4 py-8">
                        {data.top_tags.map((tag: any, i: number) => (
                            <motion.span
                                key={tag.tag}
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: i * 0.05 }}
                                style={{
                                    fontSize: `${10 + (tag.count * 4)}px`,
                                    color: tag.count > 3 ? '#f0f0f0' : '#484848'
                                }}
                                className="font-serif italic cursor-default hover:text-accent transition-colors"
                            >
                                {tag.tag}
                            </motion.span>
                        ))}
                    </div>
                </div>
            </div>

            {/* Knowledge Timeline */}
            <div className="mt-24 pt-12 border-t border-border">
                <div className="flex items-center gap-3 mb-10">
                    <History size={20} className="text-text-3" />
                    <h3 className="text-[10px] font-black text-text-3 uppercase tracking-[0.3em]">Knowledge Evolution</h3>
                </div>
                <div className="relative flex items-center justify-between gap-12 overflow-x-auto pb-8 mask-fade-edges">
                    {/* Simplified timeline view */}
                    {[
                        { month: 'Mar \'25', count: 12, label: 'Inception' },
                        { month: 'Apr \'25', count: 45, label: 'Neural Growth' },
                        { month: 'May \'25', count: 89, label: 'Cognitive Expansion' },
                        { month: 'Jun \'25', count: 156, label: 'Peak Recall' },
                    ].map((step, i) => (
                        <div key={step.month} className="shrink-0 flex flex-col items-center gap-4 text-center">
                            <div className="w-px h-12 bg-border relative">
                                <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-accent" />
                            </div>
                            <div>
                                <p className="text-[10px] font-black text-text-3 uppercase tracking-widest mb-1">{step.month}</p>
                                <p className="font-serif text-lg text-text-1 italic">{step.label}</p>
                                <p className="text-[9px] font-bold text-accent/60 uppercase">{step.count} clusters</p>
                            </div>
                        </div>
                    ))}
                    <div className="absolute top-0 left-0 right-0 h-px bg-border -z-10 mt-12" />
                </div>
            </div>
        </div>
    )
}
