/**
 * Shared types for the Bulk Result Downloads (Agent) flow.
 *
 * The shape of `BulkStudent` is intentionally a superset of the backend
 * contract (`{ _id, name, isPaid }` — see `BulkStudentListItem` in
 * `studentApi.ts`). Richer fields are marked optional so the same type
 * works for both the live API response and a future detailed view fetched
 * via the per-student `getUBEATResult` / `getBECEResult` endpoints.
 */

export type BulkExamType = 'bece' | 'ubeat'

/** Payment state of a single student in the bulk list. */
export type BulkPaymentStatus = 'paid' | 'unpaid' | 'pending'

/** A single student row in the bulk-downloads table. */
export interface BulkStudent {
    /** Mongo ObjectId — used as the stable React key & for payment mutations. */
    _id: string
    /** Full legal name. Sourced from the API's `name` field. */
    studentName: string
    /** Tri-state payment status derived from the API's `isPaid: boolean`. */
    paymentStatus: BulkPaymentStatus
    /** Convenience mirror of `paymentStatus === 'paid'`. */
    certificateReady?: boolean

    // ── Optional context fields (not in the bulk-list contract) ──────────
    /** XX/000/000 — available only after fetching the detailed result. */
    examNo?: string
    /** Exam-specific class label (e.g. "JSS3", "Primary 6"). */
    studentClass?: string
    gender?: 'male' | 'female' | string
    examYear?: number
    /** Display label of the school (already resolved server-side). */
    schoolName?: string
    /** Mongo id of the school — useful for sub-queries. */
    schoolId?: string
    /** Imo State LGA name (matches LgaEnum). */
    lga?: string
}

/** Search filters captured from `BulkSearchForm`. */
export interface BulkSearchFilters {
    examYear: string
    lga: string
    /** Selected `{ id, name }` so we can display the label without re-querying. */
    school: { id: string; name: string }
}

/** Tri-state status filter for the results toolbar chips. */
export type BulkStatusFilter = 'all' | 'paid' | 'unpaid'

/** Paginated wrapper used internally by the table view. */
export interface BulkStudentsResponse {
    data: BulkStudent[]
    currentPage: number
    totalPages: number
    totalItems: number
}

/**
 * Local UI state for the bulk action bar.
 * Calculated from `selectedIds` against the current page of `BulkStudent[]`.
 */
export interface BulkSelectionSummary {
    selectedCount: number
    payableCount: number      // selected & unpaid
    downloadableCount: number // selected & paid (cert ready)
    totalAmount: number       // payableCount * pricePerStudent
}
