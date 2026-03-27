import type { Metadata } from 'next'
import siteKeywords from './siteKeywords'

// ─── Shared constants ─────────────────────────────────────────────────────────

const SITE_NAME   = 'Imo State Ministry of Primary & Secondary Education'
const SITE_URL    = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://education.im.gov.ng'
const TWITTER_HANDLE = '@ImoEducation'

/** Shared Open Graph image used across the site unless overridden per-page */
const DEFAULT_OG_IMAGE = {
    url:    `${SITE_URL}/images/og/default.png`,
    width:  2940,
    height: 1840,
    alt:    SITE_NAME,
}

/** Base metadata merged into every page via layout.tsx `metadata` export */
export const baseMetadata: Metadata = {
    metadataBase: new URL(SITE_URL),
    applicationName: SITE_NAME,
    authors: [{ name: SITE_NAME, url: SITE_URL }],
    creator: "Imo Digital City Limited",
    publisher: 'Imo State Government',
    keywords: siteKeywords,
    icons: {
        icon:    '/images/favicon/favicon.ico',
        apple:   '/images/favicon/apple-touch-icon.png',
        shortcut: '/images/favicon/favicon-32x32.png',
    },
    openGraph: {
        siteName: SITE_NAME,
        locale:   'en_NG',
        type:     'website',
        images:   [DEFAULT_OG_IMAGE],
    },
    twitter: {
        card:    'summary_large_image',
        site:    TWITTER_HANDLE,
        creator: TWITTER_HANDLE,
        images:  [DEFAULT_OG_IMAGE.url],
    },
}

// ─────────────────────────────────────────────────────────────────────────────
// SECTION 1 — Public Website (Info / Landing pages)
// ─────────────────────────────────────────────────────────────────────────────

export const publicMetadata = {

    home: {
        title: {
            default:  SITE_NAME,
            template: `%s | ${SITE_NAME}`,
        },
        description:
            'Official website of the Imo State Ministry of Primary & Secondary Education — driving excellence in basic and post-basic education across Imo State.',
        openGraph: {
            title:       SITE_NAME,
            description: 'Official website of the Imo State Ministry of Primary & Secondary Education.',
            url:         SITE_URL,
            images: [{
                url:    `${SITE_URL}/images/og/home.png`,
                width:  1200,
                height: 630,
                alt:    SITE_NAME,
            }],
        },
    } satisfies Metadata,

    about: {
        title:       'About Us',
        description: 'Learn about the vision, mission, and leadership of the Imo State Ministry of Primary & Secondary Education.',
        openGraph: {
            title:       'About Us',
            description: 'Vision, mission and leadership of the Imo State Ministry of Primary & Secondary Education.',
            url:         `${SITE_URL}/about`,
        },
    } satisfies Metadata,

    news: {
        title:       'News & Announcements',
        description: 'Stay up to date with the latest news, circulars, and announcements from the Imo State Ministry of Education.',
        openGraph: {
            title: 'News & Announcements',
            url:   `${SITE_URL}/news`,
        },
    } satisfies Metadata,

    contact: {
        title:       'Contact Us',
        description: 'Get in touch with the Imo State Ministry of Primary & Secondary Education — locations, phone numbers, and email addresses.',
        openGraph: {
            title: 'Contact Us',
            url:   `${SITE_URL}/contact-us`,
        },
    } satisfies Metadata,

    departments: {
        title:       'Departments',
        description: 'Explore the various departments under the Imo State Ministry of Primary & Secondary Education.',
        openGraph: {
            title: 'Departments',
            url:   `${SITE_URL}/departments`,
        },
    } satisfies Metadata,
    
    events: {
        title:       'Events',
        description: 'Discover upcoming events and activities organized by the Imo State Ministry of Education.',
        openGraph: {
            title: 'Events',
            url:   `${SITE_URL}/events`,
        },
    } satisfies Metadata,
    
    projects: {
        title:       'Projects',
        description: 'Discover upcoming projects and initiatives organized by the Imo State Ministry of Education.',
        openGraph: {
            title: 'Projects',
            url:   `${SITE_URL}/projects`,
        },
    } satisfies Metadata,

} as const


// ─────────────────────────────────────────────────────────────────────────────
// SECTION 2 — Student Portal (Result Checking)
// ─────────────────────────────────────────────────────────────────────────────

const STUDENT_PORTAL_BASE = `${SITE_URL}/result-checking`

export const studentPortalMetadata = {

    landing: {
        title:       'Student Portal',
        description: 'Access your BECE or UBEAT examination results through the Imo State student portal.',
        openGraph: {
            title:       'Student Portal | Imo State Education',
            description: 'Check your BECE or UBEAT results quickly and securely.',
            url:         STUDENT_PORTAL_BASE,
            images: [{
                url:    `${SITE_URL}/images/og/result-checking.png`,
                width:  2940,
                height: 1840,
                alt:    'Imo State Student Portal',
            }],
        },
        robots: { index: true, follow: true },
    } satisfies Metadata,
    
    // ── BECE ─────────────────────────────────────────────────────────────────
    
    beceLogin: {
        title:       'BECE Login',
        description: 'Enter your BECE exam number to view your Basic Education Certificate Examination results.',
        openGraph: {
            title:       'BECE Results Login | Imo State Student Portal',
            description: 'View your Basic Education Certificate Examination results.',
            url:         `${STUDENT_PORTAL_BASE}/bece`,
            images: [{
                url:    `${SITE_URL}/images/og/bece.png`,
                width:  2940,
                height: 1840,
                alt:    'Imo State Student Portal',
            }],
        },
        robots: { index: false, follow: false }, // login pages should not be indexed
    } satisfies Metadata,
    
    beceDashboard: {
        title:       'My BECE Results',
        description: 'Your Basic Education Certificate Examination results — Imo State Student Portal.',
        openGraph: {
            title: 'My BECE Results',
            url:   `${STUDENT_PORTAL_BASE}/bece/dashboard`,
            images: [{
                url:    `${SITE_URL}/images/og/bece.png`,
                width:  2940,
                height: 1840,
                alt:    'Imo State Student Portal',
            }],
        },
        robots: { index: false, follow: false },
    } satisfies Metadata,
    
    // ── UBEAT ────────────────────────────────────────────────────────────────
    
    ubeatLogin: {
        title:       'UBEAT Login',
        description: 'Enter your UBEAT exam number to view your Universal Basic Education Assessment Test results.',
        openGraph: {
            title:       'UBEAT Results Login | Imo State Student Portal',
            description: 'View your Universal Basic Education Assessment Test results.',
            url:         `${STUDENT_PORTAL_BASE}/ubeat`,
            images: [{
                url:    `${SITE_URL}/images/og/ubeat.png`,
                width:  2940,
                height: 1840,
                alt:    'Imo State Student Portal',
            }],
        },
        robots: { index: false, follow: false },
    } satisfies Metadata,

    ubeatDashboard: {
        title:       'My UBEAT Results',
        description: 'Your Universal Basic Education Assessment Test results — Imo State Student Portal.',
        openGraph: {
            title: 'My UBEAT Results',
            url:   `${STUDENT_PORTAL_BASE}/ubeat/dashboard`,
            images: [{
                url:    `${SITE_URL}/images/og/ubeat.png`,
                width:  2940,
                height: 1840,
                alt:    'Imo State Student Portal',
            }],
        },
        robots: { index: false, follow: false },
    } satisfies Metadata,

    // ── Shared ───────────────────────────────────────────────────────────────

    faq: {
        title:       'Student Portal — FAQ',
        description: 'Frequently asked questions about checking your BECE and UBEAT results on the Imo State Student Portal.',
        openGraph: {
            title: 'Student Portal FAQ',
            url:   `${STUDENT_PORTAL_BASE}/faq`,
        },
    } satisfies Metadata,

} as const


// ─────────────────────────────────────────────────────────────────────────────
// SECTION 3 — Exam Portal (Admin — Result Management)
// ─────────────────────────────────────────────────────────────────────────────

const EXAM_PORTAL_BASE = `${SITE_URL}/exam-portal`

export const examPortalMetadata = {
    login: {
        title:       'Exam Portal — Admin Login',
        description: 'Secure administrator login for the Imo State Exam Management Portal.',
        openGraph: {
            title: 'Admin Login | Exam Portal',
            url:   `${EXAM_PORTAL_BASE}/login`,
        },
        robots: { index: false, follow: false },
    } satisfies Metadata,

    dashboard: {
        title:       'Exam Portal — Dashboard',
        description: 'Manage and publish BECE and UBEAT examination results for Imo State.',
        openGraph: {
            title: 'Dashboard | Exam Portal',
            url:   `${EXAM_PORTAL_BASE}/dashboard`,
        },
        robots: { index: false, follow: false },
    } satisfies Metadata,

} as const


// ─────────────────────────────────────────────────────────────────────────────
// SECTION 4 — AEE Onboarding Portal (School & Student Registration)
// ─────────────────────────────────────────────────────────────────────────────

const AEE_PORTAL_BASE = `${SITE_URL}/portal`

export const aeePortalMetadata = {

    login: {
        title:       'AEE Portal — Login',
        description: 'Authorised Education Enumerators (AEEs) — log in to manage student onboarding for Imo State examinations.',
        openGraph: {
            title:       'AEE Portal Login',
            description: 'Log in to the Imo State AEE onboarding portal.',
            url:         `${AEE_PORTAL_BASE}/login`,
            images: [{
                url:    `${SITE_URL}/images/og/portal.png`,
                width:  2940,
                height: 1840,
                alt:    'AEE Onboarding Portal',
            }],
        },
        robots: { index: false, follow: false },
    } satisfies Metadata,

    faq: {
        title:       'AEE Portal — FAQ',
        description: 'Answers to common questions about using the AEE onboarding portal for student registration.',
        openGraph: {
            title: 'AEE Portal FAQ',
            url:   `${AEE_PORTAL_BASE}/faq`,
            images: [{
                url:    `${SITE_URL}/images/og/portal.png`,
                width:  2940,
                height: 1840,
                alt:    'AEE Onboarding Portal',
            }],
        },
    } satisfies Metadata,

    registration: {
        title:       'AEE Registration',
        description: 'Register as an Authorised Education Enumerator to begin onboarding students for Imo State examinations.',
        openGraph: {
            title: 'AEE Registration',
            url:   `${AEE_PORTAL_BASE}/register`,
            images: [{
                url:    `${SITE_URL}/images/og/portal.png`,
                width:  2940,
                height: 1840,
                alt:    'AEE Onboarding Portal',
            }],
        },
        robots: { index: false, follow: false },
    } satisfies Metadata,

    // ── Dashboard ─────────────────────────────────────────────────────────────

    dashboardHome: {
        title:       'AEE Dashboard',
        description: 'Your AEE dashboard — manage schools, exams, and student registrations.',
        openGraph: {
            title: 'Dashboard | AEE Portal',
            url:   `${AEE_PORTAL_BASE}/dashboard`,
        },
        robots: { index: false, follow: false },
    } satisfies Metadata,

    schoolExamSelection: {
        title:       'Select School & Exam',
        description: 'Select a school and examination type to begin student onboarding.',
        openGraph: {
            title: 'School & Exam Selection | AEE Portal',
            url:   `${AEE_PORTAL_BASE}/dashboard/select`,
        },
        robots: { index: false, follow: false },
    } satisfies Metadata,

    examApplication: {
        title:       'Exam Application',
        description: 'Submit an application for approval to onboard students for the selected examination.',
        openGraph: {
            title: 'Exam Application | AEE Portal',
            url:   `${AEE_PORTAL_BASE}/dashboard/application`,
        },
        robots: { index: false, follow: false },
    } satisfies Metadata,

    examPage: {
        title:       'Student Registration',
        description: 'Register students for the approved examination — Imo State AEE Portal.',
        openGraph: {
            title: 'Student Registration | AEE Portal',
            url:   `${AEE_PORTAL_BASE}/dashboard/exam`,
        },
        robots: { index: false, follow: false },
    } satisfies Metadata,

} as const