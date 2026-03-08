import type { MetadataRoute } from 'next'
import { getEventsList } from './events/events'
import { slugify } from '@/lib'
import { getNewsList } from './news/newsData'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://education.im.gov.ng'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {

    // ── Dynamic routes ────────────────────────────────────────────────────────
    // Fetch slugs from your CMS/API and map them below.
    const newsSlugs:  string[] = (await getNewsList(process.env.NEXT_PUBLIC_MINISTRY_ID || '')).map((n) => slugify(n.title)) ||[] // newsItems.map((n: { slug: string }) => n.slug)
    const eventSlugs: string[] = (await getEventsList()).map((e) => slugify(e.title)) || [] // eventItems.map((e: { slug: string }) => e.slug)

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
            url:              url('/student-portal'),
            lastModified:     now,
            changeFrequency:  'monthly',
            priority:         0.9,
        },
        {
            url:              url('/student-portal/bece'),
            lastModified:     now,
            changeFrequency:  'monthly',
            priority:         0.8,
        },
        {
            url:              url('/student-portal/ubeat'),
            lastModified:     now,
            changeFrequency:  'monthly',
            priority:         0.8,
        },
        {
            url:              url('/student-portal/faq'),
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
        // /student-portal/bece/dashboard
        // /student-portal/ubeat/dashboard
        // /student-portal/ubeat/payment
        // /student-portal/payment-callback
        // /exam-portal (and all sub-routes)
        // /portal (and all sub-routes)

    ]
}
