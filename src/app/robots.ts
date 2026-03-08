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
                    '/student-portal',
                    '/student-portal/bece',
                    '/student-portal/ubeat',
                    '/student-portal/faq',
                    '/registration-portal',
                ],
                disallow: [
                    // Student portal — auth-protected pages
                    '/student-portal/bece/dashboard',
                    '/student-portal/ubeat/dashboard',
                    '/student-portal/ubeat/payment',
                    '/student-portal/payment-callback',

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
