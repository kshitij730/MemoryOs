'use client'
// components/memory-graph.tsx — D3 v7 force-directed knowledge graph
import { useEffect, useRef, useState } from 'react'
import * as d3 from 'd3'
import { useMemories } from '@/lib/hooks/use-memories'
import type { Memory } from '@/lib/types'
import Link from 'next/link'

interface GraphNode extends d3.SimulationNodeDatum {
    id: string
    title: string
    source_type: string
    tags: string[]
    connections: number
}

interface GraphLink {
    source: string
    target: string
}

const SOURCE_COLORS: Record<string, string> = {
    document: '#60a5fa',
    url: '#a78bfa',
    note: '#34d399',
    voice: '#fb923c',
    agent: '#f472b6',
}

export function MemoryGraph() {
    const svgRef = useRef<SVGSVGElement>(null)
    const tooltipRef = useRef<HTMLDivElement>(null)
    const { data } = useMemories({ limit: 100 })
    const memories = data?.memories ?? []
    const [selectedNode, setSelectedNode] = useState<Memory | null>(null)

    useEffect(() => {
        if (!svgRef.current || memories.length === 0) return

        const svg = d3.select(svgRef.current)
        svg.selectAll('*').remove()

        const width = svgRef.current.clientWidth
        const height = svgRef.current.clientHeight

        // Build nodes + links from shared tags
        const nodes: GraphNode[] = memories.map((m) => ({
            id: m.id,
            title: m.title,
            source_type: m.source_type,
            tags: m.tags,
            connections: 0,
        }))

        const links: GraphLink[] = []
        const nodeMap = new Map(nodes.map((n) => [n.id, n]))

        // Create edges between memories sharing tags
        for (let i = 0; i < memories.length; i++) {
            for (let j = i + 1; j < memories.length; j++) {
                const shared = memories[i].tags.filter((t) => memories[j].tags.includes(t))
                if (shared.length > 0) {
                    links.push({ source: memories[i].id, target: memories[j].id })
                    const ni = nodeMap.get(memories[i].id)
                    const nj = nodeMap.get(memories[j].id)
                    if (ni) ni.connections++
                    if (nj) nj.connections++
                }
            }
        }

        // Zoom behaviour
        const zoomBehaviour = d3.zoom<SVGSVGElement, unknown>()
            .scaleExtent([0.3, 3])
            .on('zoom', (event) => g.attr('transform', event.transform))
        svg.call(zoomBehaviour)

        const g = svg.append('g')

        // Links
        const link = g.append('g')
            .selectAll('line')
            .data(links)
            .join('line')
            .attr('stroke', '#2a2a2a')
            .attr('stroke-width', 1)
            .attr('stroke-opacity', 0.8)

        // Nodes
        const node = g.append('g')
            .selectAll('circle')
            .data(nodes)
            .join('circle')
            .attr('r', (d) => Math.max(5, Math.min(16, 5 + d.connections * 2)))
            .attr('fill', (d) => SOURCE_COLORS[d.source_type] || '#7c3aed')
            .attr('fill-opacity', 0.8)
            .attr('stroke', '#0f0f0f')
            .attr('stroke-width', 2)
            .attr('cursor', 'pointer')
            .on('mouseover', (event, d) => {
                const tooltip = tooltipRef.current
                if (tooltip) {
                    tooltip.style.display = 'block'
                    tooltip.style.left = `${event.offsetX + 12}px`
                    tooltip.style.top = `${event.offsetY - 10}px`
                    tooltip.textContent = d.title
                }
                d3.select(event.currentTarget as SVGCircleElement)
                    .transition().duration(150).attr('fill-opacity', 1)
            })
            .on('mouseout', (event) => {
                if (tooltipRef.current) tooltipRef.current.style.display = 'none'
                d3.select(event.currentTarget as SVGCircleElement)
                    .transition().duration(150).attr('fill-opacity', 0.8)
            })
            .on('click', (_, d) => {
                const mem = memories.find((m) => m.id === d.id)
                setSelectedNode(mem || null)
            })

            // Drag — cast to any to sidestep D3 v7 BaseType generic conflicts (known issue)
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            ; (node as any).call(d3.drag<SVGCircleElement, GraphNode>()
                .on('start', (event, d) => {
                    if (!event.active) sim.alphaTarget(0.3).restart()
                    d.fx = d.x; d.fy = d.y
                })
                .on('drag', (event, d) => { d.fx = event.x; d.fy = event.y })
                .on('end', (event, d) => {
                    if (!event.active) sim.alphaTarget(0)
                    d.fx = null; d.fy = null
                })
            )

        // Labels for larger nodes
        g.append('g')
            .selectAll('text')
            .data(nodes.filter((n) => n.connections >= 2))
            .join('text')
            .text((d) => d.title.slice(0, 20) + (d.title.length > 20 ? '…' : ''))
            .attr('font-size', '10px')
            .attr('font-family', 'DM Sans, sans-serif')
            .attr('fill', '#999')
            .attr('pointer-events', 'none')
            .attr('dy', '0.35em')
            .attr('dx', (d) => Math.max(5, Math.min(16, 5 + d.connections * 2)) + 4)

        // Force simulation
        const sim = d3.forceSimulation<GraphNode>(nodes)
            .force('link', d3.forceLink<GraphNode, GraphLink>(links).id((d) => d.id).distance(80))
            .force('charge', d3.forceManyBody().strength(-150))
            .force('center', d3.forceCenter(width / 2, height / 2))
            .force('collision', d3.forceCollide<GraphNode>().radius((d: GraphNode) => Math.max(5, Math.min(16, 5 + d.connections * 2)) + 4))

        sim.on('tick', () => {
            link
                .attr('x1', (d) => ((d.source as unknown) as GraphNode).x ?? 0)
                .attr('y1', (d) => ((d.source as unknown) as GraphNode).y ?? 0)
                .attr('x2', (d) => ((d.target as unknown) as GraphNode).x ?? 0)
                .attr('y2', (d) => ((d.target as unknown) as GraphNode).y ?? 0)

            node.attr('cx', (d) => d.x ?? 0).attr('cy', (d) => d.y ?? 0)

            g.selectAll('text')
                .data(nodes.filter((n) => n.connections >= 2))
                .attr('x', (d) => d.x ?? 0)
                .attr('y', (d) => d.y ?? 0)
        })

        return () => { sim.stop() }
    }, [memories])

    return (
        <div className="relative w-full h-full bg-bg-0">
            {/* Legend */}
            <div className="absolute top-4 left-4 z-10 card !p-3 space-y-1.5">
                <p className="text-text-3 text-xs uppercase tracking-wider mb-2">Source type</p>
                {Object.entries(SOURCE_COLORS).map(([type, color]) => (
                    <div key={type} className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: color }} />
                        <span className="text-text-2 text-xs capitalize">{type}</span>
                    </div>
                ))}
            </div>

            <svg ref={svgRef} className="w-full h-full" />

            {/* Tooltip */}
            <div ref={tooltipRef} className="graph-tooltip" style={{ display: 'none' }} />

            {/* Empty state */}
            {memories.length === 0 && (
                <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                        <p className="font-serif text-2xl text-text-1 mb-2">No graph yet</p>
                        <p className="text-text-2 text-sm">Save memories with shared tags to see connections</p>
                    </div>
                </div>
            )}

            {/* Selected node detail panel */}
            {selectedNode && (
                <div className="absolute right-4 top-4 bottom-4 w-72 card overflow-y-auto animate-slide-in-right">
                    <div className="flex items-start justify-between mb-3">
                        <h3 className="font-serif text-text-1 text-lg leading-snug flex-1 pr-2">{selectedNode.title}</h3>
                        <button onClick={() => setSelectedNode(null)} className="text-text-3 hover:text-text-1 text-xl flex-shrink-0">×</button>
                    </div>
                    {selectedNode.summary && (
                        <p className="text-text-2 text-sm leading-relaxed mb-4">{selectedNode.summary}</p>
                    )}
                    <div className="flex flex-wrap gap-1.5 mb-4">
                        {selectedNode.tags.map((tag) => <span key={tag} className="tag-pill">{tag}</span>)}
                    </div>
                    <Link href={`/memories/${selectedNode.id}`}
                        className="btn-primary w-full justify-center text-sm" onClick={() => setSelectedNode(null)}>
                        Open memory →
                    </Link>
                </div>
            )}
        </div>
    )
}
