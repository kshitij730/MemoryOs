'use client'
// app/(dashboard)/graph/page.tsx — D3 force-directed knowledge graph
import dynamic from 'next/dynamic'

// Dynamic import to avoid SSR issues with D3
const MemoryGraph = dynamic(
    () => import('@/components/memory-graph').then((m) => m.MemoryGraph),
    {
        ssr: false,
        loading: () => (
            <div className="h-full flex items-center justify-center">
                <div className="text-center">
                    <div className="skeleton w-64 h-64 rounded-full mx-auto" />
                    <p className="text-text-3 text-sm mt-4">Loading graph...</p>
                </div>
            </div>
        ),
    }
)

export default function GraphPage() {
    return (
        <div className="h-full flex flex-col">
            <div className="p-6 border-b border-border flex items-center justify-between">
                <div>
                    <h1 className="font-serif text-2xl text-text-1">Knowledge Graph</h1>
                    <p className="text-text-2 text-xs mt-0.5">
                        Scroll to zoom · Drag to pan · Click node for details
                    </p>
                </div>
            </div>
            <div className="flex-1 overflow-hidden">
                <MemoryGraph />
            </div>
        </div>
    )
}
