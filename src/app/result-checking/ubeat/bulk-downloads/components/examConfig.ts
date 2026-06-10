/**
 * Per-exam configuration for the Bulk Downloads pages.
 *
 * Both `/bulk-downloads/bece` and `/bulk-downloads/ubeat` share the exact same
 * UI (`BulkPageContent`); only the labels, pricing, certificate name and
 * (future) mutation hooks differ. This file is the single source of truth for
 * those differences so adding a third exam later is a one-line change.
 */

import type { BulkExamType } from './types'

export interface BulkExamConfig {
    examType: BulkExamType
    /** Short label used in headings & buttons — e.g. "BECE". */
    shortName: string
    /** Long, accessible label used in <abbr title="..."> tooltips. */
    fullName: string
    /** Page-level subtitle shown beside the logo. */
    subtitle: string
    /** Naira amount per certificate. Displayed and used for total calculation. */
    pricePerStudent: number
    /** What the certificate is called on this exam (used in modals + ZIP name). */
    certificateLabel: string
    /** Prefix for the downloaded ZIP file. */
    zipFilenamePrefix: string
    /** Route to the public single-student page (used as fallback link). */
    singleStudentRoute: string
    /** Route this bulk-downloads variant lives at. */
    bulkRoute: string
}

export const BULK_EXAM_CONFIGS: Record<BulkExamType, BulkExamConfig> = {
    bece: {
        examType: 'bece',
        shortName: 'BECE',
        fullName: 'Basic Education Certificate Examination',
        subtitle: 'Bulk Certificate Downloads · Agent View',
        pricePerStudent: 1000,
        certificateLabel: 'BECE Certificate',
        zipFilenamePrefix: 'BECE_Certificates',
        singleStudentRoute: '/result-checking/bece',
        bulkRoute: '/result-checking/bece/bulk-downloads',
    },
    ubeat: {
        examType: 'ubeat',
        shortName: 'UBEAT',
        fullName: 'Universal Basic Education Assessment Test',
        subtitle: 'Bulk FSLC Downloads · Agent View',
        pricePerStudent: 1000,
        certificateLabel: 'FSLC (UBEAT)',
        zipFilenamePrefix: 'UBEAT_FSLC_Certificates',
        singleStudentRoute: '/result-checking/ubeat',
        bulkRoute: '/result-checking/ubeat/bulk-downloads',
    },
}

/** Convenience: format a Naira amount the same way everywhere. */
export const formatNaira = (amount: number): string =>
    new Intl.NumberFormat('en-NG', {
        style: 'currency',
        currency: 'NGN',
        minimumFractionDigits: 0,
    }).format(amount)
