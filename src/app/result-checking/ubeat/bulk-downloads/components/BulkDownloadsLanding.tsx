'use client'

import React from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
    IoArrowBack,
    IoArchiveOutline,
    IoArrowForward,
    IoCheckmarkCircle,
    IoLayersOutline,
    IoReceiptOutline,
} from 'react-icons/io5'
import { motion } from 'framer-motion'

import { BULK_EXAM_CONFIGS, formatNaira, type BulkExamConfig } from './examConfig'

interface ExamCardData {
    config: BulkExamConfig
    icon: React.ReactNode
    accent: string
    iconBg: string
}

const EXAM_CARDS: ExamCardData[] = [
    {
        config: BULK_EXAM_CONFIGS.bece,
        icon: <IoLayersOutline className="w-6 h-6" />,
        accent: 'from-emerald-50 to-green-50',
        iconBg: 'bg-emerald-100 text-emerald-700',
    },
    {
        config: BULK_EXAM_CONFIGS.ubeat,
        icon: <IoArchiveOutline className="w-6 h-6" />,
        accent: 'from-sky-50 to-blue-50',
        iconBg: 'bg-sky-100 text-sky-700',
    },
]

const BULK_FEATURES = [
    {
        icon: <IoCheckmarkCircle className="w-4 h-4 text-emerald-600" />,
        label: 'Pay once for the whole cohort',
    },
    {
        icon: <IoCheckmarkCircle className="w-4 h-4 text-emerald-600" />,
        label: 'One ZIP file, all certificates',
    },
    {
        icon: <IoCheckmarkCircle className="w-4 h-4 text-emerald-600" />,
        label: 'Receipt emailed automatically',
    },
]

const cardVariants = {
    hidden: { opacity: 0, y: 14 },
    visible: { opacity: 1, y: 0, transition: { type: 'spring' as const, stiffness: 260, damping: 26 } },
}

/**
 * Exam-picker landing for the bulk-downloads agent flow.
 *
 * NOTE: Currently dead code — not imported by any `page.tsx`. The two
 * `/result-checking/{bece,ubeat}/bulk-downloads/page.tsx` files render
 * `BulkPageContent` directly, bypassing this picker. The intended route
 * was `/result-checking/bulk-downloads` (a shared exam-picker screen) but
 * that page was never created; the bulk-downloads flow is reached via
 * the per-exam links from the main `/result-checking/{bece,ubeat}`
 * landing pages instead. Wire this up by creating
 * `src/app/result-checking/bulk-downloads/page.tsx` that renders
 * `<BulkDownloadsLanding />` if the picker is ever wanted.
 */
export default function BulkDownloadsLanding() {
    const router = useRouter()

    return (
        <div className="min-h-screen bg-gradient-to-br from-green-50/40 via-white to-blue-50/30 flex flex-col">
            {/* Top bar */}
            <header className="bg-white border-b border-gray-100 sticky top-0 z-20">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-3">
                    <Link
                        href="/result-checking"
                        className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 transition-colors"
                    >
                        <IoArrowBack className="w-4 h-4" />
                        <span className="hidden sm:inline">Back to Student Portal</span>
                        <span className="sm:hidden">Back</span>
                    </Link>
                    <div className="flex items-center gap-2">
                        <Image
                            src="/images/ministry-logo.png"
                            alt="MOPSE"
                            width={32}
                            height={32}
                            className="h-8 w-auto object-contain"
                        />
                        <div className="border-l border-gray-200 pl-2">
                            <span className="text-sm font-semibold text-gray-900 block leading-tight">
                                Bulk Downloads
                            </span>
                            <span className="text-[10px] text-gray-500 block leading-tight">
                                Agent Portal
                            </span>
                        </div>
                    </div>
                </div>
            </header>

            <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
                {/* Hero */}
                <section className="mb-10">
                    <div className="inline-flex items-center gap-2 bg-emerald-50 border border-emerald-100 text-emerald-700 text-xs font-semibold rounded-full px-3 py-1 mb-4">
                        <IoReceiptOutline className="w-3.5 h-3.5" />
                        <span>Agent-only · Whole-cohort processing</span>
                    </div>
                    <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-3 leading-tight">
                        Bulk Result Downloads
                    </h1>
                    <p className="text-base sm:text-lg text-gray-600 max-w-2xl leading-relaxed">
                        Search a full school cohort, pay for every unpaid result in a single transaction,
                        and download every certificate as one ZIP file. Pick the exam type to begin.
                    </p>
                </section>

                {/* Exam picker */}
                <section className="mb-10">
                    <h2 className="text-lg font-bold text-gray-900 mb-4">Choose an examination</h2>
                    <motion.div
                        className="grid grid-cols-1 md:grid-cols-2 gap-5"
                        initial="hidden"
                        animate="visible"
                        transition={{ staggerChildren: 0.08 }}
                    >
                        {EXAM_CARDS.map(({ config, icon, accent, iconBg }) => (
                            <motion.button
                                key={config.examType}
                                variants={cardVariants}
                                whileHover={{ y: -4 }}
                                whileTap={{ scale: 0.99 }}
                                onClick={() => router.push(config.bulkRoute)}
                                className={[
                                    'group text-left p-6 rounded-2xl bg-gradient-to-br',
                                    accent,
                                    'border border-white/80 shadow-sm hover:shadow-lg',
                                    'transition-all duration-200 cursor-pointer',
                                ].join(' ')}
                            >
                                <div className="flex items-start gap-4 mb-4">
                                    <div
                                        className={[
                                            'flex items-center justify-center w-12 h-12 rounded-2xl flex-shrink-0',
                                            iconBg,
                                        ].join(' ')}
                                    >
                                        {icon}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h3 className="text-xl font-bold text-gray-900 mb-0.5">
                                            {config.shortName}
                                        </h3>
                                        <p className="text-xs text-gray-600 font-medium">
                                            {config.fullName}
                                        </p>
                                    </div>
                                    <IoArrowForward className="w-5 h-5 text-gray-400 group-hover:text-gray-700 group-hover:translate-x-1 transition-all" />
                                </div>

                                <p className="text-sm text-gray-700 leading-relaxed mb-4">
                                    Bulk-download {config.certificateLabel}s for an entire school cohort.
                                    {' '}{formatNaira(config.pricePerStudent)} per certificate.
                                </p>

                                <ul className="space-y-1.5 mb-5">
                                    {BULK_FEATURES.map((feature) => (
                                        <li
                                            key={feature.label}
                                            className="flex items-center gap-2 text-xs text-gray-700"
                                        >
                                            {feature.icon}
                                            <span>{feature.label}</span>
                                        </li>
                                    ))}
                                </ul>

                                <div className="inline-flex items-center justify-center w-full py-2.5 rounded-lg text-sm font-semibold bg-white text-gray-900 border border-gray-200 group-hover:bg-gray-50 transition-colors">
                                    Start {config.shortName} bulk download
                                </div>
                            </motion.button>
                        ))}
                    </motion.div>
                </section>

                {/* Helper banner */}
                <section className="mb-10">
                    <div className="bg-amber-50 border border-amber-100 rounded-2xl p-5 flex items-start gap-3">
                        <div className="flex-shrink-0 w-9 h-9 rounded-xl bg-white border border-amber-100 flex items-center justify-center">
                            <span className="text-lg">💡</span>
                        </div>
                        <div className="flex-1 min-w-0">
                            <h3 className="text-sm font-semibold text-amber-900 mb-1">
                                How bulk downloads work
                            </h3>
                            <ol className="text-sm text-amber-900/80 space-y-1 list-decimal list-inside">
                                <li>Pick the exam, then the year, LGA and school.</li>
                                <li>Select the students whose certificates you need.</li>
                                <li>
                                    Pay {formatNaira(BULK_EXAM_CONFIGS.bece.pricePerStudent)} per unpaid student in a single transaction.
                                </li>
                                <li>Download every paid certificate as a ZIP file.</li>
                            </ol>
                        </div>
                    </div>
                </section>

                {/* Single-student fallback */}
                <section className="text-center">
                    <p className="text-xs text-gray-500">
                        Only need one student’s result?{' '}
                        <Link
                            href="/result-checking"
                            className="text-green-600 hover:text-green-700 font-medium"
                        >
                            Go to the standard student portal
                        </Link>
                    </p>
                </section>
            </main>

            <footer className="border-t border-gray-100 py-6 bg-gray-50">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <p className="text-xs text-gray-500">
                        © {new Date().getFullYear()} Imo State Ministry of Primary and Secondary Education
                    </p>
                </div>
            </footer>
        </div>
    )
}
