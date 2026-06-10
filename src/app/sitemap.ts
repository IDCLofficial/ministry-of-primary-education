import type { MetadataRoute } from 'next'
import { getEventsList } from './events/events'
import { slugify } from '@/lib'
import { getNewsList } from './news/newsData'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://education.im.gov.ng'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {

    // ── Dynamic routes ────────────────────────────────────────────────────────
    const newsSlugs:  string[] = (await getNewsList(process.env.NEXT_PUBLIC_MINISTRY_ID || '')).map((n) => slugify(n.title)) || []
    const eventSlugs: string[] = (await getEventsList()).map((e) => slugify(e.title)) || []

    // ── Helpers ───────────────────────────────────────────────────────────────

    const url = (path: string) => `${SITE_URL}${path}`

    const now = new Date()

    return [

        // ── Public website ────────────────────────────────────────────────────
        {
            url:              url('/'),
            lastModified:     now,
            changeFrequency:  'weekly',
            priority:         1.0,
        },
        {
            url:              url('/about'),
            lastModified:     now,
            changeFrequency:  'monthly',
            priority:         0.8,
        },
        {
            url:              url('/contact-us'),
            lastModified:     now,
            changeFrequency:  'monthly',
            priority:         0.7,
        },
        {
            url:              url('/departments'),
            lastModified:     now,
            changeFrequency:  'monthly',
            priority:         0.7,
        },
        {
            url:              url('/services'),
            lastModified:     now,
            changeFrequency:  'monthly',
            priority:         0.7,
        },
        {
            url:              url('/projects'),
            lastModified:     now,
            changeFrequency:  'monthly',
            priority:         0.6,
        },
        {
            url:              url('/news'),
            lastModified:     now,
            changeFrequency:  'daily',
            priority:         0.9,
        },
        {
            url:              url('/events'),
            lastModified:     now,
            changeFrequency:  'daily',
            priority:         0.8,
        },
        {
            url:              url('/media'),
            lastModified:     now,
            changeFrequency:  'weekly',
            priority:         0.6,
        },

        // ── Dynamic news pages ────────────────────────────────────────────────
        ...newsSlugs.map(slug => ({
            url:             url(`/news/${slug}`),
            lastModified:    now,
            changeFrequency: 'monthly' as const,
            priority:        0.7,
        })),

        // ── Dynamic event pages ───────────────────────────────────────────────
        ...eventSlugs.map(slug => ({
            url:             url(`/events/${slug}`),
            lastModified:    now,
            changeFrequency: 'monthly' as const,
            priority:        0.6,
        })),

        // ── Student portal (public-facing) ────────────────────────────────────
        {
            url:              url('/result-checking'),
            lastModified:     now,
            changeFrequency:  'monthly',
            priority:         0.9,
        },
        {
            url:              url('/result-checking/bece'),
            lastModified:     now,
            changeFrequency:  'monthly',
            priority:         0.8,
        },
        {
            url:              url('/result-checking/ubeat'),
            lastModified:     now,
            changeFrequency:  'monthly',
            priority:         0.8,
        },
        {
            url:              url('/result-checking/faq'),
            lastModified:     now,
            changeFrequency:  'monthly',
            priority:         0.6,
        },

        // ── Registration portal ───────────────────────────────────────────────
        {
            url:              url('/registration-portal'),
            lastModified:     now,
            changeFrequency:  'monthly',
            priority:         0.5,
        },

        // NOTE: The following routes are intentionally excluded from the sitemap
        // as they are auth-protected or private:
        //
        // /result-checking/bece/dashboard
        // /result-checking/ubeat/dashboard
        // /result-checking/bece/payment
        // /result-checking/ubeat/payment
        // /result-checking/payment-callback
        // /result-checking/bece/bulk-downloads
        // /result-checking/ubeat/bulk-downloads
        // /exam-portal (and all sub-routes)
        // /portal (and all sub-routes, including /portal/iirs)
    ]
}
