import { API_BASE_URL, endpoints } from '@/app/portal/utils/constants/Api.const'
import { decryptApiResponseFrom, isApiResponseDecryptConfigured } from '@/lib/apiResponseFunnel'
import { apiSlice } from './apiSlice'
import { LgaEnum } from '@/app/portal/dashboard/[schoolCode]/types';
import { ExamTypeEnum } from '@/app/portal/store/api/authApi';

// TypeScript interfaces for API responses

interface PaymentPaid {
    isPaid: true;
}

interface PaymentUnpaid {
    isPaid: false
    paymentReference: string
    paymentUrl: string
}

type Payment = PaymentPaid | PaymentUnpaid;

// UBEAT Student Result
export interface UBEATStudentResult {
    _id?: string
    studentName: string
    examNumber: string
    age?: number
    sex?: string
    school?: string
    schoolName?: string
    lga?: string
    serialNumber?: number
    averageScore?: number
    grade?: string
    examYear: number
    subjects?: {
        [key: string]: {
            ca: number
            exam: number
            total: number
            _id: string
        }
    }
    payment?: Payment
    // Direct payment fields (for alternative form response)
    paymentUrl?: string
    paymentReference?: string
    createdAt?: string
    updatedAt?: string
    __v?: number
}

// BECE Student Result
export interface BECEStudentResult {
    _id: string
    name: string
    examNo: string
    examYear: number
    age: number
    sex: string
    school: string
    schoolName: string
    lga: string
    subjects: Array<{
        name: string
        exam: number
        ca: number
        total: number
        grade: string
    }>
    overallGrade: string
    totalCredits: number
    payment?: Payment
    createdAt: string
    updatedAt: string
}

// ── Bulk Downloads (agent) ────────────────────────────────────────────────

/**
 * Request body for the bulk students-by-school endpoint.
 * Mirrors the backend contract: `POST /{ubeat|bece}/students/by-school`.
 *
 * All fields — including `page`, `limit`, and `paymentStatus` — are
 * sent in the POST body (the backend paginates and filters server-side
 * before responding).
 */
export interface BulkStudentsBySchoolRequest {
    year: number
    lga: string
    schoolId: string
    /** 1-indexed page number. Defaults to 1 server-side. */
    page?: number
    /** Items per page. Defaults to a server-side value (we use 25). */
    limit?: number
    /** Optional server-side status filter. `undefined` ⇒ no filter (all). */
    paymentStatus?: 'paid' | 'unpaid'
}

/**
 * Pagination metadata returned by the bulk students-by-school endpoint.
 */
export interface BulkStudentsPagination {
    total: number
    page: number
    limit: number
    totalPages: number
    hasNextPage: boolean
    hasPreviousPage: boolean
}

/**
 * Paginated response from the bulk students-by-school endpoint.
 *
 * Real backend shape:
 * ```
 * {
 *   data: BulkStudentListItem[],
 *   pagination: { total, page, limit, totalPages, hasNextPage, hasPreviousPage }
 * }
 * ```
 */
export interface BulkStudentsResponse {
    data: BulkStudentListItem[]
    pagination: BulkStudentsPagination
}

/**
 * One row of the response from the bulk students-by-school endpoint.
 * The backend intentionally returns a minimal shape — only the fields an
 * agent needs to make a payment decision and dispatch subsequent calls.
 * Richer details (examNo, class, gender, subjects) are fetched per-student
 * from the existing `getUBEATResult` / `getBECEResult` endpoints once a
 * specific student is opened.
 */
export interface BulkStudentListItem {
    _id: string
    name: string
    isPaid: boolean
}

// ── Bulk Payments (agent) ──────────────────────────────────────────────────

/**
 * Request body for the batch payment endpoint.
 * Mirrors the backend contract: `POST /result-payment/create-batch`.
 *
 * The `callbackUrl` (sent as a query param) is the URL Paystack will
 * redirect to after payment. The bulk-downloads page passes its own
 * route so the agent lands back where they started, with `?reference=...`
 * in the URL, which triggers the verify effect.
 */
export interface CreateBatchPaymentRequest {
    examType: 'UBEAT' | 'BECE'
    examYear: number
    studentIds: string[]
}

/**
 * Response from `POST /result-payment/create-batch`.
 * `authorizationUrl` is the Paystack checkout URL the agent is redirected to.
 * `reference` is what Paystack (and the backend) use to identify the
 * transaction; the agent lands back at `callbackUrl?reference=<ref>` after
 * paying, and we hit `verify-batch` to confirm and refresh the cohort.
 */
export interface CreateBatchPaymentResponse {
    authorizationUrl: string
    reference: string
    studentCount: number
    totalAmount: number
}

/**
 * One entry in `paystackResponse.metadata.custom_fields` — Paystack echoes
 * the variables the backend stored at charge-creation time. The bulk
 * payment backend stashes `payment_type` (`BATCH_RESULT_PAYMENT`),
 * `exam_type`, `student_count`, and `exam_year` so the verify response is
 * self-describing even when the top-level fields are missing.
 */
export interface PaystackCustomField {
    display_name?: string
    variable_name?: string
    value?: string
}

export interface PaystackMetadata {
    custom_fields?: PaystackCustomField[]
    referrer?: string
}

export interface PaystackCustomer {
    id?: number
    first_name?: string | null
    last_name?: string | null
    email?: string
    customer_code?: string
}

export interface PaystackAuthorization {
    authorization_code?: string
    bin?: string
    last4?: string
    exp_month?: string
    exp_year?: string
    channel?: string
    card_type?: string
    bank?: string
    country_code?: string
    brand?: string
    reusable?: boolean
    signature?: string
    account_name?: string | null
}

export interface PaystackTransactionLog {
    time_spent?: number
    attempts?: number
    authentication?: string
    errors?: number
    success?: boolean
    mobile?: boolean
    input?: unknown[]
    channel?: string
    metadata?: Record<string, unknown>
}

export interface PaystackTransaction {
    id?: number
    domain?: string
    status?: string
    reference?: string
    receipt_number?: string | null
    amount?: number
    message?: string | null
    gateway_response?: string
    response_code?: string
    paid_at?: string
    created_at?: string
    channel?: string
    currency?: string
    ip_address?: string
    metadata?: PaystackMetadata
    log?: PaystackTransactionLog
    fees?: number | null
    requested_amount?: number | null
    transaction_date?: string
    paidAt?: string
    createdAt?: string
    customer?: PaystackCustomer
    authorization?: PaystackAuthorization
}

/**
 * Response from `GET /result-payment/verify/:reference`.
 *
 * The backend's `paymentStatus` field drives the success/failed toast and
 * the cache invalidation. `statusCode === 200` is the legacy fallback for
 * older backends that wrap the payload. Any other `paymentStatus` value
 * (`pending`, `abandoned`, etc.) is treated as a failure — the agent is
 * shown a generic "couldn't verify" toast and the cohort is NOT refreshed.
 *
 * The top-level `studentCount` and `totalAmount` are optional — the live
 * backend instead carries the same numbers inside `paystackResponse`
 * (kobo-denominated `amount` and `metadata.custom_fields[student_count]`).
 * Use `getVerifiedStudentCount()` / `getVerifiedTotalAmount()` to read
 * them portably across both shapes.
 */
export interface VerifyBatchPaymentResponse {
    statusCode?: number
    paymentStatus: 'successful' | 'failed' | 'pending' | string
    reference?: string
    studentCount?: number
    totalAmount?: number
    message?: string
    paystackTransactionId?: string
    paystackResponse?: PaystackTransaction
    paymentMethod?: string
    paymentNotes?: string
    voucherReference?: string
}

const PAYSTACK_CUSTOM_FIELD_NAMES = {
    studentCount: 'student_count',
    examType: 'exam_type',
    examYear: 'exam_year',
    paymentType: 'payment_type',
} as const

function readPaystackCustomField(
    response: VerifyBatchPaymentResponse | undefined,
    variableName: string,
): string | undefined {
    const fields = response?.paystackResponse?.metadata?.custom_fields
    if (!fields) return undefined
    const match = fields.find(f => f.variable_name === variableName)
    return match?.value
}

/**
 * Pull the student count out of a verify response. Tries top-level
 * `studentCount` first, then falls back to the Paystack metadata field
 * (which is where the live backend stores it). Returns `undefined` if
 * neither is present.
 */
export function getVerifiedStudentCount(
    response: VerifyBatchPaymentResponse | undefined,
): number | undefined {
    if (response?.studentCount !== undefined) return response.studentCount
    const raw = readPaystackCustomField(response, PAYSTACK_CUSTOM_FIELD_NAMES.studentCount)
    if (raw === undefined) return undefined
    const parsed = Number.parseInt(raw, 10)
    return Number.isFinite(parsed) ? parsed : undefined
}

/**
 * Total paid for the batch, in NAIRA (NOT kobo). Reads from
 * `paystackResponse.amount` (kobo → naira), with a top-level
 * `totalAmount` (already in naira) fallback.
 */
export function getVerifiedTotalAmountNaira(
    response: VerifyBatchPaymentResponse | undefined,
): number | undefined {
    if (response?.totalAmount !== undefined) return response.totalAmount
    const kobo = response?.paystackResponse?.amount
    if (kobo === undefined) return undefined
    return kobo / 100
}

// ── Voucher Receipt ─────────────────────────────────────────────────
// Returned by `GET /voucher/:voucherReference`. The agent pastes the
// `voucherReference` they got from the verify-batch response (or a
// receipt email) to look up the list of students the voucher covers.
// Only students with `isPaid: true` are eligible for download — even
// though the voucher is the receipt, the per-student payment flag is
// the actual download gate.
export interface VoucherStudent {
    _id: string
    examNumber?: string
    studentName: string
    isPaid: boolean
}

export interface VoucherSchool {
    _id: string
    schoolName: string
    lga: string
    schoolCode?: string
    hasAccount?: boolean
    isVerified?: boolean
}

export interface VoucherResponse {
    _id: string
    voucherReference: string
    paymentReference: string
    examType: 'BECE' | 'UBEAT' | string
    examYear: number
    school: VoucherSchool
    schoolName: string
    lga: string
    studentCount: number
    /** Total paid in NAIRA (NOT kobo). */
    amountPaid: number
    studentIds: VoucherStudent[]
    /** Backend Mongoose model name — usually "Bece" or "Ubeat". */
    studentModel: string
    createdAt: string
    updatedAt: string
}

export interface VoucherDownloadStudent {
    studentName: string
    examYear: number
    examNo: string
    grade: string
}

export interface VoucherDownloadResponse {
    schoolName: string
    students: VoucherDownloadStudent[]
}

/**
 * Reduce a voucher's `studentIds` to the IDs the agent is actually
 * allowed to download. Filters out anything the backend hasn't yet
 * marked paid (the per-student payment flag is the download gate;
 * the voucher is just the receipt).
 */
export function getVoucherDownloadableIds(
    voucher: VoucherResponse | undefined | null,
): string[] {
    if (!voucher?.studentIds) return []
    return voucher.studentIds
        .filter(s => s.isPaid && !!s._id)
        .map(s => s._id)
}

// Match returned by find-my-result / find-exam-number endpoints
interface MatchedNames {
    studentName: string
    id: string
}

interface MatchedNamesResponseSuccess {
    statusCode: 200,
    data: MatchedNames[]
}

interface MatchedNamesResponseError {
    statusCode: 404 | 400 | 500 | 'FETCH_ERROR',
    message: string
}

export type FindResultMatch = MatchedNamesResponseSuccess | MatchedNamesResponseError;

// Find UBEAT result by student details (alternative form)
export interface FindResultRequest {
    schoolId: string
    examYear: number
    studentName: string
    lga: string
}

// Match returned by find-multiple-matches endpoint
export interface MultiMatchResult {
    _id: string
    name?: string
    studentName?: string
    examNo: string
    examYear: number
    school?: {
        _id: string
        schoolName: string
        lga?: string
        schoolCode?: string
    }
    subjects?: Array<{ name: string; exam: number }>
    isPaid?: boolean
}

export interface CustomerSupport {
    fullName: string,
    lga: LgaEnum,
    schoolName: string,
    year: number,
    exam: ExamTypeEnum,
    reasonForContact: string,
    examNo?: string,
    phone: number,
    other?: string;
    email: string
}

// Extend the apiSlice with student portal endpoints
export const studentApi = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        // Get UBEAT student result by exam number or _id
        getUBEATResult: builder.query<UBEATStudentResult, { _id?: string; examNo?: string; year?: string }>({
            query: ({ _id, examNo, year }) => ({
                url: _id
                    ? `${API_BASE_URL}/ubeat/result/${_id}`
                    : `${API_BASE_URL}/ubeat/result/${encodeURIComponent((examNo || '').replace(/\s/g, '').replace(/\//g, '-'))}?year=${encodeURIComponent(year || '')}`,
                method: 'GET',
            }),
            transformResponse: async (response: unknown) => {
                const raw = response as { data?: unknown }
                if (typeof raw?.data !== 'string') return response as UBEATStudentResult
                if (!(await isApiResponseDecryptConfigured())) return response as UBEATStudentResult
                try {
                    return await decryptApiResponseFrom<UBEATStudentResult>(raw as { data: string }, 'data')
                } catch (e) {
                    console.warn('apiResponseFunnel: decrypt failed, using raw response. Check API_RESPONSE_DECRYPT_SECRET and backend key/salt match.', e)
                    return response as UBEATStudentResult
                }
            },
            providesTags: (result, error, { _id, examNo }) => [
                { type: 'Students', id: `UBEAT-${_id || examNo}` }
            ],
        }),

        // Find UBEAT result by student details
        findUBEATResult: builder.mutation<FindResultMatch, FindResultRequest>({
            query: (data) => ({
                url: `${API_BASE_URL}/ubeat/find-my-result`,
                method: 'POST',
                body: data,
            }),
            transformResponse: async (response: unknown) => {
                const raw = response as { statusCode?: number; data?: unknown; message?: string }
                if (typeof raw?.data === 'string') {
                    if (!(await isApiResponseDecryptConfigured())) return response as FindResultMatch
                    try {
                        return await decryptApiResponseFrom<FindResultMatch>(raw as { data: string }, 'data')
                    } catch (e) {
                        console.warn('apiResponseFunnel: decrypt failed, using raw response. Check API_RESPONSE_DECRYPT_SECRET and backend key/salt match.', e)
                        return response as FindResultMatch
                    }
                }
                if (Array.isArray(raw?.data)) {
                    return { statusCode: raw?.statusCode ?? 200, data: raw.data } as FindResultMatch
                }
                return response as FindResultMatch
            },
        }),

        // Find BECE result by student details
        findBECEResult: builder.mutation<FindResultMatch, FindResultRequest>({
            query: (data) => ({
                url: `${API_BASE_URL}/bece-student/find-exam-number`,
                method: 'POST',
                body: data,
            }),
            transformResponse: async (response: unknown) => {
                const raw = response as { statusCode?: number; data?: unknown; message?: string }
                if (typeof raw?.data === 'string') {
                    if (!(await isApiResponseDecryptConfigured())) return response as FindResultMatch
                    try {
                        return await decryptApiResponseFrom<FindResultMatch>(raw as { data: string }, 'data')
                    } catch (e) {
                        console.warn('apiResponseFunnel: decrypt failed, using raw response. Check API_RESPONSE_DECRYPT_SECRET and backend key/salt match.', e)
                        return response as FindResultMatch
                    }
                }
                if (Array.isArray(raw?.data)) {
                    return { statusCode: raw?.statusCode ?? 200, data: raw.data } as FindResultMatch
                }
                return response as FindResultMatch
            },
        }),

        // Create BECE payment after student selection
        createBECEPayment: builder.mutation<{ paymentUrl: string; paymentReference: string }, { id: string }>({
            query: (data) => ({
                url: `${API_BASE_URL}/bece-student/create-payment`,
                method: 'POST',
                body: data,
            }),
        }),

        // Create UBEAT payment after student selection
        createUBEATPayment: builder.mutation<{ paymentUrl: string; paymentReference: string }, { id: string }>({
            query: (data) => ({
                url: `${API_BASE_URL}/ubeat/create-payment`,
                method: 'POST',
                body: data,
            }),
        }),

        customerSupport: builder.mutation<{ reference: string }, CustomerSupport>({
            query: (data) => ({
                url: `${API_BASE_URL}/customer-support/complain`,
                method: 'POST',
                body: data,
            }),
        }),

        setBecePaymentEmail: builder.mutation<{ status: number, message: string }, { paymentReference: string, email: string }>({
            query: (data) => ({
                url: `${API_BASE_URL}/bece-student/update-payment-email`,
                method: 'PATCH',
                body: data,
            }),
        }),

        setUbeatPaymentEmail: builder.mutation<{ status: number, message: string }, { paymentReference: string, email: string }>({
            query: (data) => ({
                url: `${API_BASE_URL}/ubeat/update-payment-email`,
                method: 'PATCH',
                body: data,
            }),
        }),

        // Get available exam years
        getAvailableYears: builder.query<{ years: number[] }, { examType: 'ubeat' | 'bece' }>({
            query: ({ examType }) => ({
                url: `${API_BASE_URL}/students/available-years?examType=${examType.toUpperCase()}`,
                method: 'GET',
            }),
        }),

        // Bulk Downloads (agent) — list every student in a school cohort
        // for the year/LGA/school selected in the search form.
        // Backend contract: POST /{ubeat|bece}/students/by-school
        //   body      : { year, lga, schoolId, page, limit }
        //   query     : ?paymentStatus=paid|unpaid
        //   response  : { data: BulkStudentListItem[], pagination: { total, page, limit, totalPages, ... } }
        getBulkStudentsBySchool: builder.query<BulkStudentsResponse, BulkStudentsBySchoolRequest & { examType: ExamTypeEnum }>({
            query: ({ examType, year, lga, schoolId, page, limit, paymentStatus }) => {
                const url = new URL(`${API_BASE_URL}${endpoints.GET_BULK_STUDENTS_BY_SCHOOL(examType)}`)
                if (paymentStatus) url.searchParams.set('paymentStatus', paymentStatus)
                return {
                    url: url.toString(),
                    method: 'POST',
                    body: {
                        year,
                        lga,
                        schoolId,
                        page,
                        limit,
                    },
                }
            },
            transformResponse: async (response: unknown) => {
                // Normalize the backend payload to `BulkStudentsResponse`.
                // Accepted shapes:
                //   1. Canonical: { data: [...], pagination: { total, page, limit, totalPages, ... } }
                //   2. Flat-paginated: { data, total, page, limit, totalPages }  (older deployments)
                //   3. Legacy array: [ ... ]                                       (single page, all rows)
                //   4. Funnel-encrypted: { data: '<cipher>' }                   (decrypt then re-normalize)
                const raw = response as { data?: unknown }

                const emptyPagination: BulkStudentsPagination = {
                    total: 0, page: 1, limit: 0, totalPages: 0,
                    hasNextPage: false, hasPreviousPage: false,
                }

                const normalize = (payload: unknown): BulkStudentsResponse => {
                    if (Array.isArray(payload)) {
                        return {
                            data: payload as BulkStudentListItem[],
                            pagination: {
                                total: payload.length,
                                page: 1,
                                limit: payload.length,
                                totalPages: 1,
                                hasNextPage: false,
                                hasPreviousPage: false,
                            },
                        }
                    }
                    if (payload && typeof payload === 'object') {
                        const obj = payload as {
                            data?: unknown
                            pagination?: Partial<BulkStudentsPagination>
                            // flat-paginated fallbacks:
                            total?: number
                            page?: number
                            limit?: number
                            totalPages?: number
                            currentPage?: number
                            totalItems?: number
                        }
                        if (Array.isArray(obj.data)) {
                            const data = obj.data
                            // Prefer nested `pagination`, fall back to flat fields.
                            if (obj.pagination && typeof obj.pagination === 'object') {
                                const p = obj.pagination
                                const total = p.total ?? data.length
                                const page = p.page ?? 1
                                const limit = p.limit ?? data.length
                                const totalPages = p.totalPages ?? Math.max(1, Math.ceil(total / limit))
                                return {
                                    data,
                                    pagination: {
                                        total,
                                        page,
                                        limit,
                                        totalPages,
                                        hasNextPage: p.hasNextPage ?? page < totalPages,
                                        hasPreviousPage: p.hasPreviousPage ?? page > 1,
                                    },
                                }
                            }
                            // Flat-paginated fallback.
                            const total = obj.totalItems ?? obj.total ?? data.length
                            const page = obj.currentPage ?? obj.page ?? 1
                            const limit = obj.limit ?? data.length
                            const totalPages = obj.totalPages ?? Math.max(1, Math.ceil(total / limit))
                            return {
                                data,
                                pagination: {
                                    total, page, limit, totalPages,
                                    hasNextPage: page < totalPages,
                                    hasPreviousPage: page > 1,
                                },
                            }
                        }
                    }
                    return { data: [], pagination: emptyPagination }
                }

                if (typeof raw?.data === 'string') {
                    if (!(await isApiResponseDecryptConfigured())) {
                        return normalize(response)
                    }
                    try {
                        const decrypted = await decryptApiResponseFrom<unknown>(raw as { data: string }, 'data')
                        return normalize(decrypted)
                    } catch (e) {
                        console.warn('apiResponseFunnel: decrypt failed for bulk students, using raw response.', e)
                        return normalize(response)
                    }
                }
                // The canonical response is `{ data: [...], pagination: {...} }`.
                // We must pass the *full* response to `normalize` so the
                // sibling `pagination` object isn't discarded. Only unwrap
                // `raw.data` when there's no `pagination` sibling (i.e. the
                // legacy/unwrapped shape where `data` is the array itself).
                const payload = (raw && typeof raw === 'object' && 'pagination' in raw)
                    ? raw
                    : (raw?.data ?? response)
                return normalize(payload)
            },
            providesTags: (result, error, { examType, schoolId, year, page, limit, paymentStatus }) => [
                { type: 'Students', id: `BULK-${examType}-${schoolId}-${year}-p${page ?? 1}-l${limit ?? 25}-${paymentStatus ?? 'all'}` },
            ],
        }),

        // Get BECE student result by exam number or _id
        getBECEResult: builder.query<BECEStudentResult, { _id?: string; examNo?: string; year?: string }>({
            query: ({ _id, examNo, year }) => ({
                url: _id
                    ? `${API_BASE_URL}/bece-student/check-result/${_id}`
                    : `${API_BASE_URL}/bece-student/check-result/${encodeURIComponent((examNo || '').replace(/\s/g, '').replace(/\//g, '-'))}?year=${encodeURIComponent(year || '')}`,
                method: 'GET',
            }),
            transformResponse: async (response: unknown) => {
                const raw = response as { data?: unknown }
                if (typeof raw?.data !== 'string') return response as BECEStudentResult
                if (!(await isApiResponseDecryptConfigured())) return response as BECEStudentResult
                try {
                    return await decryptApiResponseFrom<BECEStudentResult>(raw as { data: string }, 'data')
                } catch (e) {
                    console.warn('apiResponseFunnel: decrypt failed, using raw response. Check API_RESPONSE_DECRYPT_SECRET and backend key/salt match.', e)
                    return response as BECEStudentResult
                }
            },
            providesTags: (result, error, { _id, examNo }) => [
                { type: 'Students', id: `BECE-${_id || examNo}` }
            ],
        }),

        // Find multiple matches for UBEAT exam number
        findMultipleMatches: builder.mutation<MultiMatchResult[], { examNumber: string; year: number }>({
            query: (data) => ({
                url: `${API_BASE_URL}/ubeat/result/find-multiple-matches`,
                method: 'POST',
                body: data,
            }),
            transformResponse: async (response: unknown) => {
                const raw = response as { data?: unknown }
                if (typeof raw?.data === 'string') {
                    if (!(await isApiResponseDecryptConfigured())) return response as MultiMatchResult[]
                    try {
                        const result = await decryptApiResponseFrom<MultiMatchResult[]>(raw as { data: string }, 'data')
                        return result
                    } catch (e) {
                        console.warn('apiResponseFunnel: decrypt failed, using raw response. Check API_RESPONSE_DECRYPT_SECRET and backend key/salt match.', e)
                        return response as MultiMatchResult[]
                    }
                }
                return response as MultiMatchResult[]
            },
        }),

        // Find multiple matches for BECE exam number
        findBECEMultipleMatches: builder.mutation<MultiMatchResult[], { examNumber: string; year: number }>({
            query: (data) => ({
                url: `${API_BASE_URL}/bece-student/result/find-multiple-matches`,
                method: 'POST',
                body: data,
            }),
            transformResponse: async (response: unknown) => {
                const raw = response as { data?: unknown }
                if (typeof raw?.data === 'string') {
                    if (!(await isApiResponseDecryptConfigured())) return response as MultiMatchResult[]
                    try {
                        return await decryptApiResponseFrom<MultiMatchResult[]>(raw as { data: string }, 'data')
                    } catch (e) {
                        console.warn('apiResponseFunnel: decrypt failed, using raw response. Check API_RESPONSE_DECRYPT_SECRET and backend key/salt match.', e)
                        return response as MultiMatchResult[]
                    }
                }
                return response as MultiMatchResult[]
            },
        }),

        // ── Bulk Payments (agent) ───────────────────────────────────────
        // Initiate a single Paystack transaction that covers every student
        // the agent has selected. The backend persists the `studentIds` in
        // the transaction metadata; on `verify`, it marks each saved
        // student as paid. The single-student flow is unaffected.
        createBatchPayment: builder.mutation<CreateBatchPaymentResponse, CreateBatchPaymentRequest & { callbackUrl: string }>({
            query: ({ callbackUrl, ...body }) => ({
                url: `${API_BASE_URL}${endpoints.CREATE_BATCH_PAYMENT}?callbackUrl=${encodeURIComponent(callbackUrl)}`,
                method: 'POST',
                body,
            }),
        }),

        // Verify a batch payment by its Paystack reference. The bulk-
        // downloads page fires this automatically when it detects
        // `?reference=...` in the URL (i.e. Paystack redirected back from
        // checkout). A successful response invalidates the bulk-students
        // cache so the table re-fetches and shows the newly-paid rows.
        verifyBatchPayment: builder.query<VerifyBatchPaymentResponse, string>({
            query: (reference) => `${API_BASE_URL}${endpoints.VERIFY_BATCH_PAYMENT(reference)}`,
        }),

        // Voucher lookup — fetch the full voucher record by its reference
        // (e.g. `VCH-1780658070803-33401`). Used by the bulk-downloads page
        // to gate downloads on a valid receipt: the voucher's `studentIds`
        // is the list of students the agent paid for, and the agent can
        // only download certs for those flagged `isPaid: true`.
        getVoucher: builder.query<VoucherResponse, string>({
            query: (voucherReference) => `${API_BASE_URL}${endpoints.GET_VOUCHER(voucherReference)}`,
            providesTags: (_r, _e, ref) => [{ type: 'Voucher', id: ref }],
        }),
        getVoucherDownload: builder.query<VoucherDownloadResponse, string>({
            query: (voucherReference) =>
                `${API_BASE_URL}${endpoints.GET_VOUCHER_DOWNLOAD(voucherReference)}`,
        }),
    }),
    overrideExisting: true,
})

// Export hooks for usage in functional components
export const {
    useGetUBEATResultQuery,
    useGetBECEResultQuery,
    useGetAvailableYearsQuery,
    useGetBulkStudentsBySchoolQuery,
    useLazyGetUBEATResultQuery,
    useLazyGetBECEResultQuery,
    useLazyGetBulkStudentsBySchoolQuery,
    useFindUBEATResultMutation,
    useFindBECEResultMutation,
    useCreateBECEPaymentMutation,
    useCreateUBEATPaymentMutation,
    useCustomerSupportMutation,
    useSetBecePaymentEmailMutation,
    useSetUbeatPaymentEmailMutation,
    useFindMultipleMatchesMutation,
    useFindBECEMultipleMatchesMutation,
    useCreateBatchPaymentMutation,
    useVerifyBatchPaymentQuery,
    useLazyVerifyBatchPaymentQuery,
    useGetVoucherQuery,
    useLazyGetVoucherQuery,
    useLazyGetVoucherDownloadQuery,
} = studentApi
