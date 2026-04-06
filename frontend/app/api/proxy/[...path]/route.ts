// app/api/proxy/[...path]/route.ts — Next.js Route Handler proxying to FastAPI backend
// This allows the frontend on Vercel to call the backend on Railway via same-origin requests.

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase-server'

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000'

async function proxy(req: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
    const { path } = await params
    const supabase = await createClient()
    const { data: { session } } = await supabase.auth.getSession()

    const backendPath = path.join('/')
    const search = req.nextUrl.search
    const targetUrl = `${BACKEND_URL}/${backendPath}${search}`

    const headers: Record<string, string> = {
        'Content-Type': req.headers.get('Content-Type') || 'application/json',
    }
    if (session?.access_token) {
        headers['Authorization'] = `Bearer ${session.access_token}`
    }

    const body = req.method !== 'GET' && req.method !== 'HEAD'
        ? await req.arrayBuffer()
        : undefined

    const res = await fetch(targetUrl, {
        method: req.method,
        headers,
        body,
    })

    // Pass through the response including streaming responses
    return new NextResponse(res.body, {
        status: res.status,
        headers: {
            'Content-Type': res.headers.get('Content-Type') || 'application/json',
            'Cache-Control': 'no-cache',
        },
    })
}

export const GET = proxy
export const POST = proxy
export const PUT = proxy
export const PATCH = proxy
export const DELETE = proxy
