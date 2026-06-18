'use client'

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { useDispatch } from 'react-redux'
import { IoCheckmarkCircle, IoChevronDown, IoCopyOutline, IoSearch, IoSwapHorizontal } from 'react-icons/io5'
import toast from 'react-hot-toast'
import JSZip from 'jszip'

import PortalHeader from '@/app/result-checking/components/Portalheader'
import BulkSearchForm from './BulkSearchForm'
import SearchFilterSummary from './SearchFilterSummary'
import StudentResultsTable from './StudentResultsTable'
import BulkActionBar from './BulkActionBar'
import BulkPaymentModal from './BulkPaymentModal'
import BulkDownloadModal, { type BulkDownloadStage } from './BulkDownloadModal'
import VoucherLookup from './VoucherLookup'
import {
    useCreateBatchPaymentMutation,
    useGetBulkStudentsBySchoolQuery,
    useLazyGetVoucherDownloadQuery,
    useVerifyBatchPaymentQuery,
    getVerifiedStudentCount,
    studentApi,
    type VoucherResponse,
} from '@/app/result-checking/store/api/studentApi'
import { ExamTypeEnum } from '@/app/portal/store/api/authApi'
import { mapBulkStudentListItem } from './bulkApiAdapter'
import { type BulkExamConfig } from './examConfig'
import {
    saveVoucherToStorage,
    loadVoucherFromStorage,
    hasVoucherInStorage,
    clearVoucherFromStorage,
} from './voucherStorage'
import type {
    BulkSearchFilters,
    BulkSelectionSummary,
    BulkStatusFilter,
    BulkStudent,
} from './types'
import { generateUBEATCertificate } from '@/app/exam-portal/dashboard/schools/[schoolId]/ubeat/utils/certificateGenerator'
import type { UBEATStudent } from '@/app/exam-portal/dashboard/schools/types/student.types'

interface BulkPageContentProps {
    config: BulkExamConfig
}

const DEFAULT_FILTERS: BulkSearchFilters = {
    examYear: '',
    lga: '',
    school: { id: '', name: '' },
}

const ITEMS_PER_PAGE_DEFAULT = 12

/** Normalize a string for case- and whitespace-insensitive matching. */
function normalizeForSearch(value: string): string {
    return value.trim().toLowerCase()
}

/**
 * Top-level client component for `/bulk-downloads/{bece,ubeat}`.
 *
 * Owns all UI state:
 *   - search form values & "form vs. results" mode
 *   - in-table search query + status filter (All / Unpaid / Paid)
 *   - client-side paginated cohort, items-per-page
 *   - per-row selection set (with cross-page select-all matching)
 *   - payment + download modal states
 *
 * Data flow:
 *   1. User picks year + LGA + school in `BulkSearchForm`
 *   2. We POST to `/{examType}/students/by-school` via RTK Query
 *   3. The minimal `BulkStudentListItem` response is mapped to `BulkStudent`
 *      (see `bulkApiAdapter.ts`)
 *   4. The cohort is sliced by status filter → search → page
 */
export default function BulkPageContent({ config }: BulkPageContentProps) {
    const router = useRouter()
    const searchParams = useSearchParams()
    const dispatch = useDispatch()

    // ── Search state ─────────────────────────────────────────────────────
    const [filters, setFilters] = useState<BulkSearchFilters>(DEFAULT_FILTERS)
    const [appliedFilters, setAppliedFilters] = useState<BulkSearchFilters | null>(null)

    // ── Toolbar (in-table) state ─────────────────────────────────────────
    const [searchQuery, setSearchQuery] = useState('')
    const [statusFilter, setStatusFilter] = useState<BulkStatusFilter>('all')

    // ── Pagination ───────────────────────────────────────────────────────
    const [currentPage, setCurrentPage] = useState(1)
    const [itemsPerPage, setItemsPerPage] = useState(ITEMS_PER_PAGE_DEFAULT)

    // ── Selection ────────────────────────────────────────────────────────
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())

    // ── Modal / download state ───────────────────────────────────────────
    const [isPaying, setIsPaying] = useState(false)
    const [paymentOpen, setPaymentOpen] = useState(false)
    const [downloadStage, setDownloadStage] = useState<BulkDownloadStage>('idle')
    const [downloadProgress, setDownloadProgress] = useState(0)
    const [downloadOpen, setDownloadOpen] = useState(false)
    /**
     * Number of certificates the modal is currently simulating a download
     * for. Driven by whichever entry point opened the modal (selection-
     * based or voucher-based). Read by the modal's `certificateCount` prop
     * and its `onRetry` button.
     */
    const [downloadCertificateCount, setDownloadCertificateCount] = useState(0)
    const [downloadVoucherRef, setDownloadVoucherRef] = useState('')
    /**
     * Voucher reference from the URL — kept for direct `?voucher=…` links
     * (e.g. bookmarks). After a successful verify, we store the full
     * voucher in localStorage instead and skip the URL param.
     */
    const urlVoucher = searchParams.get('voucher') ?? ''

    // ── Saved voucher from localStorage ─────────────────────────────────
    const [savedVoucher, setSavedVoucher] = useState<VoucherResponse | null>(null)
    const [verifiedAt, setVerifiedAt] = useState<string | null>(null)

    // Voucher reference shown in the post-verify copy modal.
    const [voucherRefModal, setVoucherRefModal] = useState<string | null>(null)

    // On mount, try to load a previously-saved voucher from localStorage.
    // This runs once per mount — only when there's no `?reference=` callback
    // and no `?voucher=` in the URL (those take priority).
    useEffect(() => {
        const ref = searchParams.get('reference') ?? searchParams.get('trxref')
        const vch = searchParams.get('voucher')
        if (ref || vch) return // active callback or direct link — don't load saved

        if (!hasVoucherInStorage(config.examType)) return

        loadVoucherFromStorage(config.examType).then(v => {
            if (v) setSavedVoucher(v)
        })
    }, []) // eslint-disable-line react-hooks/exhaustive-deps

    /**
     * Whether the (secondary) cohort search section is expanded. Default
     * collapsed — the voucher view at the top is the primary entry point
     * and the LGA × School search is only needed when the agent hasn't
     * paid yet. Auto-expands the first time the user submits a search so
     * they can see their cohort without an extra click.
     */
    const [cohortExpanded, setCohortExpanded] = useState(false)
    const [voucherActive, setVoucherActive] = useState(false)

    const handleClearSavedVoucher = useCallback(() => {
        clearVoucherFromStorage(config.examType)
        setSavedVoucher(null)
        setVerifiedAt(null)
        setVoucherActive(false)
    }, [config.examType])

    const handleDismissVoucherModal = useCallback(async () => {
        if (voucherRefModal) {
            try {
                await navigator.clipboard.writeText(voucherRefModal)
                toast.success('Voucher reference copied!')
            } catch {
                // clipboard not available — user can still copy manually
            }
        }
        setVoucherRefModal(null)
        router.replace(config.bulkRoute)
    }, [voucherRefModal, router, config.bulkRoute])

    /** Persist a freshly-fetched voucher to localStorage as a "session". */
    const handleVoucherLoaded = useCallback(
        async (voucher: VoucherResponse) => {
            await saveVoucherToStorage(config.examType, voucher)
            setSavedVoucher(voucher)
        },
        [config.examType],
    )

    useEffect(() => {
        if (appliedFilters) setCohortExpanded(true)
    }, [appliedFilters])

    // ── Live cohort query ────────────────────────────────────────────────
    // Server-side pagination + status filter. The response is a single page
    // (currentPage) of the (status-filtered) cohort. Free-text search is
    // still applied client-side on the current page (see `matchingCohort`).
    const yearNum = appliedFilters ? Number(appliedFilters.examYear) : NaN
    const queryArgs = appliedFilters && Number.isFinite(yearNum) && appliedFilters.school.id
        ? {
            examType: config.examType === 'bece'
                ? ExamTypeEnum.BECE
                : ExamTypeEnum.UBEAT,
            year: yearNum,
            lga: appliedFilters.lga,
            schoolId: appliedFilters.school.id,
            page: currentPage,
            limit: itemsPerPage,
            paymentStatus: statusFilter === 'all' ? undefined : statusFilter,
        }
        : undefined

    const {
        data: apiResponse,
        isLoading: isLoadingCohort,
        isFetching: isFetchingCohort,
        error: cohortError,
    } = useGetBulkStudentsBySchoolQuery(queryArgs!, {
        skip: !queryArgs,
    })

    // Map the current page's items to the wider BulkStudent shape.
    const currentPageStudents: BulkStudent[] = useMemo(() => {
        if (!apiResponse || !appliedFilters) return []
        return apiResponse.data.map(item =>
            mapBulkStudentListItem(item, {
                schoolId: appliedFilters.school.id,
                schoolName: appliedFilters.school.name,
                lga: appliedFilters.lga,
                examYear: appliedFilters.examYear,
            }),
        )
    }, [apiResponse, appliedFilters])

    // Client-side search filter — narrows the *current page* to the rows
    // whose name matches. The toolbar's "matchingCount" reflects this
    // per-page number, so "Select all N" selects every matching row on
    // the visible page. The user flips pages to accumulate selections.
    const matchingCohort: BulkStudent[] = useMemo(() => {
        const needle = normalizeForSearch(searchQuery)
        if (!needle) return currentPageStudents
        return currentPageStudents.filter(s =>
            normalizeForSearch(s.studentName).includes(needle),
        )
    }, [currentPageStudents, searchQuery])

    const students: BulkStudent[] = matchingCohort

    // Server-reported totals for the currently status-filtered cohort.
    const serverTotalItems = apiResponse?.pagination?.total ?? 0
    const serverTotalPages = apiResponse?.pagination?.totalPages ?? 1

    // Surface API errors as toasts.
    useEffect(() => {
        if (cohortError) {
            const message =
                'status' in cohortError && cohortError.status === 404
                    ? 'No students found for that school, LGA, and year.'
                    : 'Could not load the cohort. Please try again.'
            toast.error(message)
        }
    }, [cohortError])

    // Clamp the current page *only* when it's out of bounds (e.g. the user
    // changed items-per-page or applied a filter that shrunk the cohort).
    // We deliberately do NOT reset the page just because the server's last
    // response was for a different page — that would race with the user's
    // own navigation clicks and effectively freeze the pagination on page 1.
    useEffect(() => {
        if (
            apiResponse &&
            serverTotalPages > 0 &&
            currentPage > serverTotalPages
        ) {
            setCurrentPage(serverTotalPages)
        }
    }, [apiResponse, serverTotalPages, currentPage])

    // ── Derived selection summary ────────────────────────────────────────
    const summary: BulkSelectionSummary = useMemo(() => {
        const selectedOnPage = students.filter(s => selectedIds.has(s._id))
        const selectedOffPage = selectedIds.size - selectedOnPage.length

        const payableCount =
            selectedOnPage.filter(s => s.paymentStatus !== 'paid').length + selectedOffPage
        const downloadableCount = selectedOnPage.filter(
            s => s.paymentStatus === 'paid' && s.certificateReady,
        ).length

        return {
            selectedCount: selectedIds.size,
            payableCount,
            downloadableCount,
            totalAmount: payableCount * config.pricePerStudent,
        }
    }, [students, selectedIds, config.pricePerStudent])

    // ── Shift-click selection refs ───────────────────────────────────────
    // Ref to the current visible student list so the toggle callback can
    // read indices without re-creating itself on every render.
    const studentsRef = useRef(students)
    studentsRef.current = students
    // Tracks the last individually-clicked row index for shift-click ranges.
    const lastClickedRef = useRef<number | null>(null)
    const resetAnchor = useCallback(() => { lastClickedRef.current = null }, [])

    // ── Filter / pagination handlers ─────────────────────────────────────
    const handleSearchSubmit = useCallback(() => {
        setAppliedFilters(filters)
        setCurrentPage(1)
        setSelectedIds(new Set())
        setSearchQuery('')
        setStatusFilter('all')
        resetAnchor()
    }, [filters, resetAnchor])

    const handleChangeFilters = useCallback(() => {
        setAppliedFilters(null)
        setSelectedIds(new Set())
        setCurrentPage(1)
        setSearchQuery('')
        setStatusFilter('all')
        setVoucherActive(false)
        resetAnchor()
        if (typeof window !== 'undefined') {
            window.scrollTo({ top: 0, behavior: 'smooth' })
        }
    }, [resetAnchor])

    const handlePageChange = useCallback((page: number) => {
        setCurrentPage(page)
        resetAnchor()
        if (typeof window !== 'undefined') {
            window.scrollTo({ top: 120, behavior: 'smooth' })
        }
    }, [resetAnchor])

    const handleItemsPerPageChange = useCallback((n: number) => {
        setItemsPerPage(n)
        setCurrentPage(1)
        resetAnchor()
    }, [resetAnchor])

    const handleSearchInputChange = useCallback((value: string) => {
        setSearchQuery(value)
        setCurrentPage(1)
        resetAnchor()
    }, [resetAnchor])

    const handleStatusFilterChange = useCallback((value: BulkStatusFilter) => {
        setStatusFilter(value)
        setCurrentPage(1)
        resetAnchor()
    }, [resetAnchor])

    /**
     * Quick "show all students" — used by the EmptyState's primary CTA
     * so the user can recover from a dead-end filter without leaving
     * the results screen or losing their other filter context.
     */
    const handleShowAllStatuses = useCallback(() => {
        setStatusFilter('all')
        setCurrentPage(1)
        resetAnchor()
    }, [resetAnchor])

    // ── Selection handlers ───────────────────────────────────────────────
    const toggleOne = useCallback((id: string, event?: React.MouseEvent) => {
        const list = studentsRef.current
        const currentIdx = list.findIndex(s => s._id === id)
        if (currentIdx === -1) return

        if (event?.shiftKey && lastClickedRef.current !== null) {
            const from = Math.min(lastClickedRef.current, currentIdx)
            const to = Math.max(lastClickedRef.current, currentIdx)
            setSelectedIds(prev => {
                const next = new Set(prev)
                for (let i = from; i <= to; i++) {
                    const student = list[i]
                    if (student.paymentStatus !== 'paid') next.add(student._id)
                }
                return next
            })
        } else {
            lastClickedRef.current = currentIdx
            setSelectedIds(prev => {
                const next = new Set(prev)
                if (next.has(id)) next.delete(id)
                else next.add(id)
                return next
            })
        }
    }, [])

    const clearSelection = useCallback(() => {
        setSelectedIds(new Set())
    }, [])

    // ── Voucher download ────────────────────────────────────────────────
    const [triggerDownload, { isLoading: isDownloading }] = useLazyGetVoucherDownloadQuery()

    // ── Bulk payment ────────────────────────────────────────────────────
    const [createBatchPayment] = useCreateBatchPaymentMutation()

    const handleStartPayment = useCallback(() => {
        if (summary.payableCount === 0) {
            toast('Nothing to pay — your selection is already paid.', { icon: 'ℹ️' })
            return
        }
        if (summary.payableCount < 10) {
            toast.error(`Select at least 10 unpaid students to proceed (you have ${summary.payableCount}).`)
            return
        }
        if (!appliedFilters) {
            toast.error('Pick a year, LGA, and school before paying.')
            return
        }
        setPaymentOpen(true)
    }, [summary.payableCount, appliedFilters])

    const handleConfirmPayment = useCallback(async (_args: { email: string }): Promise<string | undefined> => {
        // The `email` arg is received for signature parity with the
        // Paywall's EmailDialog, but the BulkPaymentModal is responsible
        // for PATCHing it onto the payment after this function returns
        // (it calls `setBecePaymentEmail` / `setUbeatPaymentEmail` once
        // the reference is in hand, racing the redirect). We don't use
        // it here.
        if (!appliedFilters) return undefined

        // Send the agent's full `selectedIds` as the `studentIds` payload.
        // The backend dedupes against already-paid students, so it's safe to
        // include paid rows that are still in the cross-page selection set
        // (e.g. an agent who ticked a row, refreshed, then re-ticked it).
        const studentIds = Array.from(selectedIds)
        if (studentIds.length === 0) {
            toast.error('No students selected.')
            return undefined
        }

        // ── Sticky loading: set true ONCE here. From this point on, the
        // BulkActionBar shows "Starting payment…" and is disabled. Do NOT
        // reset isPaying on the success path — the page is about to
        // navigate and we don't want the action bar to re-enable mid-
        // navigation. Only the catch block may reset it.
        setIsPaying(true)
        try {
            const callbackUrl =
                typeof window !== 'undefined'
                    ? `${window.location.origin}${config.bulkRoute}`
                    : config.bulkRoute

            const yearNum = Number(appliedFilters.examYear)
            const response = await createBatchPayment({
                examType: config.examType === 'bece' ? ExamTypeEnum.BECE : ExamTypeEnum.UBEAT,
                examYear: yearNum,
                studentIds,
                callbackUrl,
            }).unwrap()

            if (!response.authorizationUrl) {
                toast.error('Payment gateway did not return a checkout URL. Please try again.')
                setIsPaying(false)
                return undefined
            }

            // Stash the original selection under the reference so the verify
            // effect (run after Paystack redirects back) can clear the
            // agent's selection set in the same shape it was in before pay.
            if (typeof window !== 'undefined') {
                window.sessionStorage.setItem(
                    `bulk-payment-selection:${response.reference}`,
                    JSON.stringify(studentIds),
                )
            }

            // ── Sticky loading: redirect is triggered. From this point
            // forward, do NOT touch isPaying under any code path. The page
            // is navigating and the action bar should stay disabled.
            toast.success('Redirecting to Paystack…')
            window.location.href = response.authorizationUrl
            return response.reference
        } catch (err) {
            console.error('Batch payment initiation failed', err)
            const apiMessage: string | undefined =
                err && typeof err === 'object' && 'data' in err
                    ? (err as { data?: { message?: string } }).data?.message
                    : undefined
            toast.error(apiMessage || 'Could not start the payment. Please try again.')
            // Failure path: reset isPaying so the agent can retry.
            setIsPaying(false)
            return undefined
        }
    }, [appliedFilters, selectedIds, createBatchPayment, config.bulkRoute, config.examType])

    // ── Bulk ZIP download ───────────────────────────────────────────────
    // Generates UBEAT certificates client-side via `generateUBEATCertificate`,
    // zips them with JSZip, and triggers a browser download.

    const processCertificateDownload = useCallback(
        async (voucherRef: string) => {
            try {
                const response = await triggerDownload(voucherRef).unwrap()
                const eligible = response.students

                if (eligible.length === 0) {
                    toast.error('No downloadable students found on this voucher.')
                    setDownloadStage('idle')
                    setDownloadOpen(false)
                    return
                }

                setDownloadStage('downloading')
                const zip = new JSZip()
                const total = eligible.length
                let completed = 0
                let failed = 0

                const BATCH_SIZE = 3
                for (let i = 0; i < total; i += BATCH_SIZE) {
                    const batch = eligible.slice(i, i + BATCH_SIZE)
                    const results = await Promise.allSettled(
                        batch.map(async (s) => {
                            const studentData: UBEATStudent = {
                                _id: s.examNo,
                                examNumber: s.examNo,
                                studentName: s.studentName,
                                serialNumber: 0,
                                isPaid: true,
                                age: 0,
                                sex: 'male',
                                lga: '',
                                school: '',
                                schoolName: response.schoolName,
                                examYear: s.examYear,
                                subjects: {
                                    mathematics: { ca: 0, exam: 0, total: 0, _id: '' },
                                    english: { ca: 0, exam: 0, total: 0, _id: '' },
                                    generalKnowledge: { ca: 0, exam: 0, total: 0, _id: '' },
                                    igbo: { ca: 0, exam: 0, total: 0, _id: '' },
                                },
                                averageScore: 0,
                                grade: s.grade,
                                createdAt: '',
                                updatedAt: '',
                                __v: 0,
                            }
                            const blob = await generateUBEATCertificate(
                                { student: studentData, schoolName: response.schoolName },
                                (s.grade?.toLowerCase() as 'pass' | 'credit' | 'distinction') || 'pass',
                                undefined,
                                undefined,
                                true,
                            )
                            const filename = `UBEAT_Certificate_${s.examNo.replace(/\//g, '_')}.png`
                            return { blob: blob as Blob, filename }
                        }),
                    )

                    for (const result of results) {
                        if (result.status === 'fulfilled') {
                            const r = result.value as { blob: Blob; filename: string }
                            if (r.blob) zip.file(r.filename, r.blob)
                            completed++
                        } else {
                            failed++
                            completed++
                        }
                    }

                    setDownloadProgress(Math.round((completed / total) * 85))
                }

                if (completed - failed === 0) {
                    toast.error('Failed to generate any certificates.')
                    setDownloadStage('idle')
                    setDownloadOpen(false)
                    return
                }

                setDownloadProgress(90)
                const zipBlob = await zip.generateAsync({ type: 'blob' })
                setDownloadProgress(95)

                const url = URL.createObjectURL(zipBlob)
                const link = document.createElement('a')
                link.href = url
                link.download = `${config.zipFilenamePrefix}_${voucherRef}.zip`
                document.body.appendChild(link)
                link.click()
                document.body.removeChild(link)
                URL.revokeObjectURL(url)

                const successCount = completed - failed
                if (failed > 0) {
                    toast(`${successCount} of ${total} certificates downloaded. ${failed} failed.`, { icon: '⚠️' })
                } else {
                    toast.success(`${successCount} certificate${successCount === 1 ? '' : 's'} downloaded!`)
                }

                setDownloadProgress(100)
                setDownloadStage('done')
            } catch (err) {
                console.error('Bulk certificate generation failed:', err)
                toast.error('Could not generate certificates. Please try again.')
                setDownloadStage('idle')
                setDownloadOpen(false)
            }
        },
        [triggerDownload, config.zipFilenamePrefix],
    )

    const handleVoucherDownloadAll = useCallback(
        (_paidIds: string[], voucher: VoucherResponse) => {
            if (_paidIds.length === 0) {
                toast('No paid students on this voucher.', { icon: 'ℹ️' })
                return
            }
            setDownloadCertificateCount(_paidIds.length)
            setDownloadVoucherRef(voucher.voucherReference)
            setDownloadStage('preparing')
            setDownloadProgress(0)
            setDownloadOpen(true)
            processCertificateDownload(voucher.voucherReference)
        },
        [processCertificateDownload],
    )

    const handleRetryDownload = useCallback(() => {
        if (!downloadVoucherRef) return
        setDownloadStage('preparing')
        setDownloadProgress(0)
        setDownloadOpen(true)
        processCertificateDownload(downloadVoucherRef)
    }, [downloadVoucherRef, processCertificateDownload])

    // ── Verify batch payment on Paystack callback ──────────────────────
    // When Paystack redirects back to `config.bulkRoute?reference=BATCH-…`
    // (or `?trxref=BATCH-…`), we call the verify endpoint. On a successful
    // verify, we invalidate the `Students` tag so the cohort refetches
    // and shows the newly-paid rows; on a failed/pending verify, we toast
    // and let the agent retry.
    const reference = searchParams.get('reference') ?? searchParams.get('trxref')
    const {
        data: verifyData,
        isLoading: isVerifying,
        isSuccess: isVerifySuccess,
        isError: isVerifyError,
    } = useVerifyBatchPaymentQuery(reference ?? '', { skip: !reference })

    // Guard so we only react to *one* resolution of the verify query.
    // Without this, the effect would re-fire on every render that
    // re-creates `verifyData` (e.g. when the router.replace flushes state).
    const handledRef = useRef<string | null>(null)
    useEffect(() => {
        if (!reference) {
            handledRef.current = null
            return
        }
        if (handledRef.current === reference) return

        if (isVerifySuccess && verifyData) {
            const ok =
                verifyData.statusCode === 200 ||
                verifyData.statusCode === undefined ||
                verifyData.paymentStatus === 'successful'
            if (ok) {
                handledRef.current = reference
                const studentCount = getVerifiedStudentCount(verifyData)
                toast.success(
                    `Bulk payment confirmed${
                        studentCount ? ` for ${studentCount} student${studentCount === 1 ? '' : 's'}` : ''
                    }.`,
                )
                // Invalidate every cached `Students` query so the cohort
                // re-fetches and the newly-paid rows flip to "paid".
                dispatch(studentApi.util.invalidateTags([{ type: 'Students' }]))
                // Land the agent on the voucher view. We push the
                // `?voucher=…` to the URL so the VoucherLookup auto-fetches
                // and the agent goes straight to the download surface.
                // If the response didn't carry a voucher ref (older
                // backend), fall back to scrubbing the URL.
                if (verifyData.voucherReference) {
                    // Fetch the full voucher response so we can save it to
                    // localStorage and display it immediately.
                    const promise = dispatch(
                        studentApi.endpoints.getVoucher.initiate(verifyData.voucherReference) as any,
                    ) as any
                    promise
                        .unwrap()
                        .then(async (voucherResult: VoucherResponse) => {
                            await saveVoucherToStorage(config.examType, voucherResult)
                            setSavedVoucher(voucherResult)
                            setVerifiedAt(new Date().toISOString())
                            setVoucherRefModal(voucherResult.voucherReference)
                        })
                        .catch(() => {
                            console.warn('Failed to fetch voucher after verify — falling back to URL param.')
                            const ref = verifyData.voucherReference ?? ''
                            router.replace(
                                `${config.bulkRoute}?voucher=${encodeURIComponent(ref)}`,
                            )
                        })
                } else {
                    router.replace(config.bulkRoute)
                }
            } else if (verifyData.paymentStatus === 'pending') {
                // Paystack's webhook hasn't settled yet. The agent may
                // have closed the Paystack tab before the backend finished
                // marking students paid. We mark this reference as handled
                // (so the effect doesn't re-fire on every render) but
                // leave the `?reference=...` in the URL — the agent can
                // refresh the page to re-check, and the verify overlay
                // will re-appear until the backend confirms.
                handledRef.current = reference
                toast(
                    'Your payment is still being processed. Please refresh this page in a few seconds.',
                    { icon: '⏳' },
                )
            } else {
                handledRef.current = reference
                toast.error('Bulk payment was not successful. No charges have been made.')
                router.replace(config.bulkRoute)
            }
        }

        if (isVerifyError) {
            handledRef.current = reference
            toast.error('Could not verify the payment. If you were charged, please contact support.')
            router.replace(config.bulkRoute)
        }
    }, [
        reference,
        isVerifySuccess,
        isVerifyError,
        verifyData,
        dispatch,
        router,
        config.bulkRoute,
    ])

    // Legacy callback: some backends redirect with `?payment=success/failed`
    // (without a `reference`). Keep the toast behaviour for that flow but
    // don't fire the verify call — there's no reference to verify against.
    useEffect(() => {
        const status = searchParams.get('payment')
        if (status && !reference) {
            if (status === 'success') {
                toast.success('Bulk payment confirmed. Refreshing the cohort…')
                dispatch(studentApi.util.invalidateTags([{ type: 'Students' }]))
            } else if (status === 'failed') {
                toast.error('Bulk payment failed. No charges have been made.')
            }
            router.replace(config.bulkRoute)
        }
    }, [searchParams, reference, dispatch, router, config.bulkRoute])

    // ── Render ──────────────────────────────────────────────────────────
    const showResults = !!appliedFilters
    const isTableLoading = isLoadingCohort || isFetchingCohort

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <PortalHeader
                title={`Bulk ${config.shortName} Downloads`}
                subtitle={config.subtitle}
                actions={[
                    {
                        key: 'switch-exam',
                        label: 'Switch Exam',
                        icon: <IoSwapHorizontal className="w-4 h-4" />,
                        onClick: () =>
                            router.push(
                                config.examType === 'bece'
                                    ? '/result-checking/ubeat/bulk-downloads'
                                    : '/result-checking/bece/bulk-downloads',
                            ),
                        variant: 'secondary',
                        hideOnMobileTray: true,
                    },
                ]}
            />

            <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 pb-32">

                {/* Step 1: Voucher lookup — the primary entry point. Agent
                    can paste a voucher ref and go straight to download,
                    bypassing the LGA × School search entirely. Auto-
                    fetches when `?voucher=…` is in the URL (i.e. after a
                    successful payment verify pushes it there). The
                    component has its own hero header. Hidden while the
                    cohort search is open (mutual exclusion). */}
                {!cohortExpanded && (
                    <section className="mb-6">
                        <VoucherLookup
                            config={config}
                            initialValue={urlVoucher}
                            autoFetch
                            onDownloadAll={handleVoucherDownloadAll}
                            onActiveChange={setVoucherActive}
                            onVoucherLoaded={handleVoucherLoaded}
                            savedVoucher={savedVoucher}
                            verifiedAt={verifiedAt}
                            onClearSaved={handleClearSavedVoucher}
                        />
                    </section>
                )}

                {/* Step 2: Cohort search — collapsible expander. The agent
                    only needs this when they haven't paid yet. Default
                    collapsed; auto-expands the first time a search is
                    submitted. Hidden entirely when a voucher is active
                    (mutual exclusion). */}
                {!voucherActive && (
                    <section className="mb-6">
                    <button
                        type="button"
                        onClick={() => setCohortExpanded(v => !v)}
                        aria-expanded={cohortExpanded}
                        aria-controls="cohort-search-panel"
                        className={[
                            'group w-full flex items-center justify-between gap-3 px-5 sm:px-6 py-4 rounded-2xl border bg-white transition-colors cursor-pointer text-left',
                            cohortExpanded
                                ? 'border-gray-300'
                                : 'border-gray-200 hover:border-gray-300',
                        ].join(' ')}
                    >
                        <div className="flex items-center gap-3 min-w-0">
                            <div className="w-9 h-9 rounded-lg bg-gray-100 text-gray-600 flex items-center justify-center flex-shrink-0">
                                <IoSearch className="w-4 h-4" />
                            </div>
                            <div className="min-w-0">
                                <p className="text-sm font-medium text-gray-900">
                                    Don&apos;t have a voucher yet?
                                </p>
                                <p className="text-xs text-gray-500 mt-0.5">
                                    Pay for your school&apos;s certificates first
                                </p>
                            </div>
                        </div>
                        <IoChevronDown
                            className={[
                                'w-4 h-4 text-gray-400 flex-shrink-0 transition-transform duration-200 group-hover:text-gray-600',
                                cohortExpanded ? 'rotate-180' : '',
                            ].join(' ')}
                        />
                    </button>

                    {cohortExpanded && (
                        <div id="cohort-search-panel" className="mt-4 space-y-4">
                            {/* Search form — only when no search submitted yet */}
                            {!showResults && (
                                <BulkSearchForm
                                    config={config}
                                    value={filters}
                                    onChange={setFilters}
                                    onSubmit={handleSearchSubmit}
                                    isLoading={isTableLoading}
                                />
                            )}

                            {/* Results */}
                            {showResults && appliedFilters && (
                                <>
                                    <SearchFilterSummary
                                        filters={appliedFilters}
                                        totalItems={serverTotalItems}
                                        onEdit={handleChangeFilters}
                                    />

                                    <StudentResultsTable
                                        config={config}
                                        students={students}
                                        selectedIds={selectedIds}
                                        onToggleOne={toggleOne}
                                        isLoading={isTableLoading}
                                        currentPage={currentPage}
                                        totalPages={serverTotalPages}
                                        totalItems={serverTotalItems}
                                        statusFilteredCount={serverTotalItems}
                                        matchingCount={students.length}
                                        itemsPerPage={itemsPerPage}
                                        onPageChange={handlePageChange}
                                        onItemsPerPageChange={handleItemsPerPageChange}
                                        disabled={
                                            isPaying ||
                                            downloadStage === 'preparing' ||
                                            downloadStage === 'downloading'
                                        }
                                        onChangeFilters={handleChangeFilters}
                                        searchQuery={searchQuery}
                                        onSearchChange={handleSearchInputChange}
                                        statusFilter={statusFilter}
                                        onStatusFilterChange={handleStatusFilterChange}
                                        emptyStateContext={{
                                            isSearching: searchQuery.trim() !== '',
                                            searchQuery,
                                            statusFilter,
                                            onClearSearch: () => handleSearchInputChange(''),
                                            onShowAllStatuses: handleShowAllStatuses,
                                            onSwitchStatus: handleStatusFilterChange,
                                        }}
                                    />
                                </>
                            )}
                        </div>
                    )}
                </section>
                )}

                {/* Footer link */}
                <footer className="mt-8 text-center space-y-2">
                    <p className="text-xs text-gray-500">
                        Need a single student instead?{' '}
                        <Link
                            href={config.singleStudentRoute}
                            className="text-gray-900 hover:text-gray-700 font-medium"
                        >
                            Go to the standard {config.shortName} portal
                        </Link>
                    </p>
                    <p className="text-xs text-gray-400">
                        Stuck or lost your voucher? Reach out on the support chat and we&apos;ll
                        help.
                    </p>
                </footer>
            </main>

            {/* Sticky bulk action bar */}
            <BulkActionBar
                config={config}
                summary={summary}
                onPay={handleStartPayment}
                onClearSelection={clearSelection}
                isProcessing={isPaying || downloadStage === 'preparing'}
                processingLabel={isPaying ? 'Starting payment…' : 'Preparing ZIP…'}
            />

            {/* Bulk payment modal */}
            <BulkPaymentModal
                open={paymentOpen}
                onOpenChange={setPaymentOpen}
                config={config}
                summary={summary}
                schoolName={appliedFilters?.school.name ?? ''}
                onConfirm={handleConfirmPayment}
            />

            {/* Bulk download modal */}
            <BulkDownloadModal
                open={downloadOpen}
                onOpenChange={(open) => {
                    setDownloadOpen(open)
                    if (!open) setDownloadStage('idle')
                }}
                config={config}
                stage={downloadStage}
                progress={downloadProgress}
                certificateCount={downloadCertificateCount}
                onRetry={handleRetryDownload}
            />

            {/* Verifying-payment overlay — shown when Paystack redirects
                back with `?reference=…` and the verify call is in flight.
                Hides automatically when the verify resolves (success or
                error → `router.replace` scrubs the URL; pending → effect
                toasts and the overlay remains visible until the agent
                refreshes the page). */}
            {reference && isVerifying && (
                <div
                    role="status"
                    aria-live="polite"
                    className="fixed inset-0 z-50 bg-white/85 backdrop-blur-sm flex items-center justify-center p-4"
                >
                    <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 max-w-md w-full overflow-hidden">
                        <div className="h-1.5 w-full bg-gray-900" />
                        <div className="p-8 text-center">
                            <div className="w-16 h-16 rounded-full bg-gray-50 border-2 border-gray-100 mx-auto mb-5 flex items-center justify-center">
                                <span className="w-8 h-8 border-[3px] border-gray-200 border-t-gray-900 rounded-full animate-spin" />
                            </div>
                            <h2 className="text-lg font-semibold text-gray-900 mb-2">
                                Verifying your payment
                            </h2>
                            <p className="text-sm text-gray-600 leading-relaxed">
                                We&apos;re confirming your bulk payment with Paystack. This usually takes a few seconds — please don&apos;t close or refresh this tab.
                            </p>
                            <p className="text-[11px] text-gray-400 mt-4 font-mono break-all">
                                {reference}
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* Voucher reference copy modal — shown right after a
                successful payment verification. */}
            {voucherRefModal && (
                <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 max-w-md w-full overflow-hidden">
                        <div className="h-1.5 w-full bg-gray-900" />
                        <div className="p-8 text-center">
                            <div className="w-16 h-16 rounded-full bg-gray-50 border-2 border-gray-100 mx-auto mb-5 flex items-center justify-center">
                                <IoCheckmarkCircle className="w-8 h-8 text-gray-900" />
                            </div>
                            <h2 className="text-lg font-semibold text-gray-900 mb-2">
                                Payment confirmed!
                            </h2>
                            <p className="text-sm text-gray-600 leading-relaxed mb-6">
                                Broski, this is your voucher reference. Click it to copy.
                            </p>
                            <button
                                type="button"
                                onClick={handleDismissVoucherModal}
                                className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-gray-900 text-white text-sm font-semibold hover:bg-gray-800 transition-colors cursor-pointer"
                            >
                                <IoCopyOutline className="w-4 h-4" />
                                {voucherRefModal}
                            </button>
                            <p className="text-[11px] text-gray-400 mt-3">
                                You&apos;ll need this to download your certificates.
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
