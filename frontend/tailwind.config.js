/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        './pages/**/*.{js,ts,jsx,tsx,mdx}',
        './components/**/*.{js,ts,jsx,tsx,mdx}',
        './app/**/*.{js,ts,jsx,tsx,mdx}',
    ],
    theme: {
        extend: {
            fontFamily: {
                serif: ['var(--font-serif)', 'serif'],
                ui: ['var(--font-ui)', 'sans-serif'],
                mono: ['var(--font-mono)', 'monospace'],
            },
            colors: {
                bg: {
                    0: 'var(--bg-0)',
                    1: 'var(--bg-1)',
                    2: 'var(--bg-2)',
                    3: 'var(--bg-3)',
                },
                border: {
                    DEFAULT: 'var(--border)',
                    active: 'var(--border-active)',
                },
                text: {
                    1: 'var(--text-1)',
                    2: 'var(--text-2)',
                    3: 'var(--text-3)',
                },
                accent: {
                    DEFAULT: 'var(--accent)',
                    light: 'var(--accent-light)',
                    bg: 'var(--accent-bg)',
                },
                tag: {
                    bg: 'var(--tag-bg)',
                    text: 'var(--tag-text)',
                },
                error: 'var(--error)',
                warning: 'var(--warning)',
                success: 'var(--success)',
            },
            animation: {
                'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
            },
        },
    },
    plugins: [
        require('@tailwindcss/typography'),
    ],
}
