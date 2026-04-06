// app/sitemap.ts — Dynamic sitemap for public memories
import { MetadataRoute } from 'next'
import { createClient } from '@/lib/supabase'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://memoryos.ai'

    // We fetch directly from DB to avoid extra API overhead on sitemap generation
    // Note: In a real environment, you'd want this cached or use a specialized service
    const supabase = createClient()
    const { data: memories } = await supabase
        .from('memories')
        .select('public_slug, updated_at')
        .eq('is_public', true)

    const publicPages = (memories || []).map((m: any) => ({
        url: `${baseUrl}/p/${m.public_slug}`,
        lastModified: new Date(m.updated_at),
        changeFrequency: 'weekly' as const,
        priority: 0.7,
    }))

    return [
        {
            url: baseUrl,
            lastModified: new Date(),
            changeFrequency: 'daily',
            priority: 1,
        },
        ...publicPages,
    ]
}
