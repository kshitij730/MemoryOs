import type { Metadata } from 'next'
import { Instrument_Serif, DM_Sans, JetBrains_Mono } from 'next/font/google'
import './globals.css'
import { Providers } from './providers'

const instrumentSerif = Instrument_Serif({
    weight: '400',
    subsets: ['latin'],
    variable: '--font-serif',
    display: 'swap',
})

const dmSans = DM_Sans({
    subsets: ['latin'],
    weight: ['400', '500'],
    variable: '--font-ui',
    display: 'swap',
})

const jetbrainsMono = JetBrains_Mono({
    subsets: ['latin'],
    variable: '--font-mono',
    display: 'swap',
})

export const metadata: Metadata = {
    title: 'MemoryOS — Personal Intelligence',
    description: 'A premium AI-powered second brain for your personal knowledge base.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="en" className={`${instrumentSerif.variable} ${dmSans.variable} ${jetbrainsMono.variable} scroll-smooth`}>
            <body className="bg-bg-0 text-text-1 font-ui antialiased">
                <Providers>{children}</Providers>
            </body>
        </html>
    )
}
