import type { MetadataRoute } from 'next'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://imoeducation.gov.ng'

export default function robots(): MetadataRoute.Robots {
    return {
        rules: [
            // ── Allow all crawlers on public pages ────────────────────────────
            {
                userAgent:   '*',
                allow: [
                    '/',
                    '/about',
                    '/contact-us',
                    '/departments',
                    '/services',
                    '/projects',
                    '/news/',
                    '/events/',
                    '/media',
                    '/result-checking',
                    '/result-checking/bece',
                    '/result-checking/ubeat',
                    '/result-checking/faq',
                    '/registration-portal',
                ],
                disallow: [
                    // Student portal — auth-protected pages
                    '/result-checking/bece/dashboard',
                    '/result-checking/ubeat/dashboard',
                    '/result-checking/ubeat/payment',
                    '/result-checking/payment-callback',

                    // Exam portal — admin only
                    '/exam-portal/',

                    // AEE portal — all routes
                    '/portal/',

                    // Next.js internals
                    '/api/',
                    '/_next/',
                    '/favicon.ico',
                ],
            },

            // ── Block GPT/AI crawlers from scraping government content ─────────
            {
                userAgent: 'GPTBot',
                disallow:  ['/'],
            },
            {
                userAgent: 'ChatGPT-User',
                disallow:  ['/'],
            },
            {
                userAgent: 'Google-Extended',
                disallow:  ['/'],
            },
            {
                userAgent: 'CCBot',
                disallow:  ['/'],
            },
            {
                userAgent: 'anthropic-ai',
                disallow:  ['/'],
            },
            {
                userAgent: 'Claude-Web',
                disallow:  ['/'],
            },
        ],

        sitemap: `${SITE_URL}/sitemap.xml`,
        host:    SITE_URL,
    }
}
