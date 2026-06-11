'use client'

import React, { useEffect, useMemo, useRef, useState } from 'react'
import {
    IoAlertCircleOutline,
    IoBusinessOutline,
    IoCalendarOutline,
    IoCardOutline,
    IoCheckmarkCircle,
    IoChevronDown,
    IoCopyOutline,
    IoDownloadOutline,
    IoHelpCircleOutline,
    IoLocationOutline,
    IoLogOutOutline,
    IoReceiptOutline,
    IoRefresh,
    IoSearch,
} from 'react-icons/io5'
import toast from 'react-hot-toast'
import { useLazyGetVoucherQuery, getVoucherDownloadableIds } from '@/app/result-checking/store/api/studentApi'
import { type BulkExamConfig } from './examConfig'
import { toTitleCase } from './format'
import type { VoucherResponse } from '@/app/result-checking/store/api/studentApi'

interface VoucherLookupProps {
    config: BulkExamConfig
    initialValue?: string
    autoFetch?: boolean
    onDownloadAll: (paidIds: string[], voucher: VoucherResponse) => void
    onActiveChange?: (active: boolean) => void
    onVoucherLoaded?: (voucher: VoucherResponse) => void
    savedVoucher?: VoucherResponse | null
    verifiedAt?: string | null
    onClearSaved?: () => void
}

export default function VoucherLookup({
    config,
    initialValue,
    autoFetch = false,
    onDownloadAll,
    onActiveChange,
    savedVoucher,
    verifiedAt,
    onClearSaved,
    onVoucherLoaded,
}: VoucherLookupProps) {
    const [reference, setReference] = useState(initialValue ?? '')
    const [showHelp, setShowHelp] = useState(false)
    const [trigger, { data: voucher, isLoading, isError, error, reset }] =
        useLazyGetVoucherQuery()

    const autoFetchedRef = useRef<string | null>(null)

    const displayVoucher = savedVoucher ?? voucher
    const isFromStorage = !!savedVoucher

    useEffect(() => {
        if (initialValue && initialValue !== reference) {
            setReference(initialValue)
            reset()
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [initialValue])

    useEffect(() => {
        if (savedVoucher) return
        if (
            autoFetch &&
            initialValue &&
            initialValue.trim() &&
            autoFetchedRef.current !== initialValue
        ) {
            autoFetchedRef.current = initialValue
            trigger(initialValue.trim())
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [autoFetch, initialValue, savedVoucher])

    const downloadableIds = useMemo(() => getVoucherDownloadableIds(displayVoucher), [displayVoucher])
    const downloadableCount = downloadableIds.length
    const paidCount = useMemo(
        () => (displayVoucher?.studentIds ?? []).filter(s => s.isPaid).length,
        [displayVoucher],
    )

    const handleSubmit = (e?: React.FormEvent) => {
        e?.preventDefault()
        const trimmed = reference.trim()
        if (!trimmed) {
            toast.error('Please paste your voucher reference first.')
            return
        }
        autoFetchedRef.current = trimmed
        trigger(trimmed)
    }

    useEffect(() => {
        if (savedVoucher) {
            onActiveChange?.(true)
            return
        }
        onActiveChange?.(!!(voucher && !isLoading))
    }, [voucher, isLoading, onActiveChange, savedVoucher])

    useEffect(() => {
        if (voucher && !savedVoucher && onVoucherLoaded) {
            onVoucherLoaded(voucher)
        }
    }, [voucher, savedVoucher, onVoucherLoaded])

    const handleReset = () => {
        setReference('')
        autoFetchedRef.current = null
        reset()
        onActiveChange?.(false)
    }

    const errorMessage =
        isError && error && typeof error === 'object' && 'data' in error
            ? (error as { data?: { message?: string } }).data?.message
            : isError
                ? (error as { message?: string })?.message ??
                  "We couldn't find that voucher. Please check the reference and try again."
                : null

    const copy = async (text: string, label: string) => {
        try {
            await navigator.clipboard.writeText(text)
            toast.success(`${label} copied.`)
        } catch {
            toast.error('Could not copy to clipboard.')
        }
    }

    const VoucherMetric = ({ count, label, statusText, statusColor, amount }: {
        count: number; label: string; statusText: string; statusColor: string; amount?: number
    }) => (
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-5">
            <div>
                <div className="flex items-baseline gap-3">
                    <span className="text-5xl sm:text-7xl font-bold text-gray-900 tracking-tight tabular-nums leading-none">
                        {count}
                    </span>
                    <span className="text-base sm:text-lg text-gray-500 font-medium">
                        {label}
                    </span>
                </div>
                <div className="flex items-center gap-2 mt-3">
                    <div className={`w-2 h-2 rounded-full ${statusColor}`} />
                    <span className="text-sm text-gray-500">{statusText}</span>
                </div>
            </div>
            {amount !== undefined && (
                <div className="flex items-center gap-3 px-4 py-2.5 rounded-xl bg-gray-50 border border-gray-200">
                    <div className="text-right">
                        <p className="text-[11px] font-medium text-gray-500 uppercase tracking-wider">Total paid</p>
                        <p className="text-xl font-bold text-gray-900 tabular-nums mt-0.5">
                            ₦{amount.toLocaleString('en-NG')}
                        </p>
                    </div>
                </div>
            )}
        </div>
    )

    const VoucherDetails = ({ voucher }: { voucher: VoucherResponse }) => (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4 text-sm">
            <div className="flex items-center gap-3 min-w-0">
                <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
                    <IoBusinessOutline className="w-4 h-4 text-gray-500" />
                </div>
                <div className="min-w-0">
                    <p className="text-xs text-gray-500">School</p>
                    <p className="font-medium text-gray-900 truncate">{toTitleCase(voucher.schoolName)}</p>
                </div>
            </div>
            <div className="flex items-center gap-3 min-w-0">
                <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
                    <IoLocationOutline className="w-4 h-4 text-gray-500" />
                </div>
                <div className="min-w-0">
                    <p className="text-xs text-gray-500">LGA</p>
                    <p className="font-medium text-gray-900 truncate">{voucher.lga}</p>
                </div>
            </div>
            <div className="flex items-center gap-3 min-w-0">
                <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
                    <IoReceiptOutline className="w-4 h-4 text-gray-500" />
                </div>
                <div className="min-w-0">
                    <p className="text-xs text-gray-500">Exam</p>
                    <p className="font-medium text-gray-900">{voucher.examType} &middot; {voucher.examYear}</p>
                </div>
            </div>
            <div className="flex items-center gap-3 min-w-0">
                <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
                    <IoCalendarOutline className="w-4 h-4 text-gray-500" />
                </div>
                <div className="min-w-0">
                    <p className="text-xs text-gray-500">Issued</p>
                    <p className="font-medium text-gray-900">
                        {new Date(voucher.createdAt).toLocaleDateString('en-NG', {
                            year: 'numeric', month: 'short', day: 'numeric',
                        })}
                    </p>
                </div>
            </div>
            <div className="sm:col-span-2 flex items-center gap-3 min-w-0">
                <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
                    <IoCardOutline className="w-4 h-4 text-gray-500" />
                </div>
                <div className="min-w-0">
                    <p className="text-xs text-gray-500">Voucher reference</p>
                    <div className="flex items-center gap-2">
                        <button
                            type="button"
                            onClick={() => copy(voucher.voucherReference, 'Voucher reference')}
                            className="group inline-flex items-center gap-1.5"
                            title="Click to copy"
                        >
                            <span className="font-mono text-sm font-medium text-gray-900 truncate">
                                {voucher.voucherReference}
                            </span>
                            <IoCopyOutline className="w-3.5 h-3.5 text-gray-400 group-hover:text-gray-900 transition-colors flex-shrink-0" />
                        </button>
                        {voucher.paymentReference && (
                            <>
                                <span className="text-gray-300 mx-1">&middot;</span>
                                <button
                                    type="button"
                                    onClick={() => copy(voucher.paymentReference, 'Payment reference')}
                                    className="group inline-flex items-center gap-1.5"
                                    title="Click to copy"
                                >
                                    <span className="font-mono text-xs text-gray-500 truncate">
                                        {voucher.paymentReference}
                                    </span>
                                    <IoCopyOutline className="w-3 h-3 text-gray-300 group-hover:text-gray-900 transition-colors flex-shrink-0" />
                                </button>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )

    const StudentList = ({ voucher }: { voucher: VoucherResponse }) => (
        <div>
            <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-gray-900">Students included</h3>
                <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full font-medium">
                    {downloadableCount} {downloadableCount === 1 ? 'student' : 'students'}
                </span>
            </div>
            <div className="border border-gray-100 rounded-xl overflow-hidden divide-y divide-gray-100">
                {voucher.studentIds
                    .filter(s => s.isPaid)
                    .map((s, i) => (
                        <div key={s._id} className="flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-gray-50/80 transition-colors">
                            <span className="text-xs text-gray-400 tabular-nums font-medium w-6 text-right flex-shrink-0">
                                {String(i + 1).padStart(2, '0')}
                            </span>
                            <div className="flex-1 min-w-0">
                                <p className="text-gray-900 truncate font-medium">
                                    {s.studentName || (
                                        <span className="italic text-gray-400 font-normal">Name unavailable</span>
                                    )}
                                </p>
                            </div>
                            <span className="text-[11px] text-gray-400 font-mono">{s._id.slice(-8)}</span>
                        </div>
                    ))}
            </div>
        </div>
    )

    const DownloadSection = ({ count, voucher }: { count: number; voucher: VoucherResponse }) => (
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
                <p className="text-sm font-semibold text-gray-900">
                    Download all {count} {count === 1 ? 'certificate' : 'certificates'}
                </p>
                <p className="text-xs text-gray-500 mt-0.5">Saves as a single .zip file</p>
            </div>
            <button
                type="button"
                onClick={() => onDownloadAll(downloadableIds, voucher)}
                className="inline-flex items-center justify-center gap-2 h-11 px-6 rounded-xl text-sm font-semibold bg-gray-900 text-white hover:bg-gray-800 active:scale-[0.97] transition-all cursor-pointer"
            >
                <IoDownloadOutline className="w-4 h-4" />
                <span>Download ZIP</span>
            </button>
        </div>
    )

    // ── Render: saved voucher mode ──
    if (isFromStorage && displayVoucher) {
        const voucher = displayVoucher
        return (
            <section aria-label="Voucher receipt" className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                {/* Header */}
                <div className="px-6 sm:px-10 pt-8 sm:pt-10 pb-2 flex items-start justify-between gap-4">
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">
                            Your certificates are ready
                        </h1>
                        <p className="mt-1.5 text-sm sm:text-base text-gray-500">
                            Download your paid {config.certificateLabel.toLowerCase()} certificates below.
                        </p>
                    </div>
                    <button
                        type="button"
                        onClick={onClearSaved}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition-colors cursor-pointer flex-shrink-0"
                        title="Clear saved voucher"
                    >
                        <IoLogOutOutline className="w-4 h-4" />
                        <span className="hidden sm:inline">Clear</span>
                    </button>
                </div>

                {/* Success banner */}
                {verifiedAt && (
                    <div className="mx-6 sm:mx-10 mt-6 rounded-xl bg-green-50 border border-green-200 overflow-hidden">
                        <div className="h-1 w-full bg-green-500" />
                        <div className="p-5 flex items-start gap-4">
                            <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                                <IoCheckmarkCircle className="w-5 h-5 text-green-700" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <h3 className="text-sm font-semibold text-green-900">Payment confirmed!</h3>
                                <p className="text-sm text-green-700 mt-0.5 leading-relaxed">
                                    Your payment of{' '}
                                    <span className="font-medium">₦{voucher.amountPaid.toLocaleString('en-NG')}</span>
                                    {' '}for {voucher.studentCount} {voucher.studentCount === 1 ? 'student' : 'students'}{' '}
                                    was successful. Your certificates are ready to download.
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Metric */}
                <div className="px-6 sm:px-10 pt-8 pb-6">
                    <VoucherMetric
                        count={downloadableCount}
                        label={downloadableCount === 1 ? 'certificate' : 'certificates'}
                        statusText="Ready to download"
                        statusColor="bg-green-500"
                        amount={voucher.amountPaid}
                    />
                </div>

                {/* Voucher details */}
                <div className="px-6 sm:px-10 py-6 border-t border-gray-100">
                    <VoucherDetails voucher={voucher} />
                </div>

                {/* Students list */}
                {downloadableCount > 0 && (
                    <div className="px-6 sm:px-10 pb-6">
                        <StudentList voucher={voucher} />
                    </div>
                )}

                {/* Download CTA */}
                {downloadableCount > 0 && (
                    <div className="px-6 sm:px-10 py-6 border-t border-gray-100">
                        <DownloadSection count={downloadableCount} voucher={voucher} />
                    </div>
                )}
            </section>
        )
    }

    // ── Render: normal flow (input form + optional fetch results) ──
    return (
        <section aria-label="Voucher receipt" className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            {/* Header */}
            <div className="px-6 sm:px-10 pt-8 sm:pt-10 pb-2">
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">
                    Download your certificates
                </h1>
                <p className="mt-1.5 text-sm sm:text-base text-gray-500">
                    Paste your voucher reference below to get every paid{' '}
                    {config.certificateLabel.toLowerCase()} in one ZIP file.
                </p>
            </div>

            {/* Input row */}
            <form onSubmit={handleSubmit} aria-label="Voucher lookup" className="px-6 sm:px-10 pt-6 pb-2">
                <div className="flex flex-col sm:flex-row gap-2">
                    <div className="relative flex-1 min-w-0">
                        <IoSearch
                            aria-hidden
                            className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none"
                        />
                        <input
                            type="text"
                            inputMode="text"
                            autoComplete="off"
                            spellCheck={false}
                            value={reference}
                            onChange={e => setReference(e.target.value)}
                            placeholder="VCH-XXXXXXXXXX-XXXX"
                            disabled={isLoading}
                            aria-label="Voucher reference"
                            className={[
                                'w-full h-11 pl-10 pr-4 text-sm rounded-xl border bg-white transition-colors font-mono',
                                'placeholder:text-gray-300 placeholder:font-sans',
                                'focus:outline-none focus:ring-2 focus:ring-offset-0',
                                'disabled:bg-gray-50 disabled:cursor-not-allowed',
                                isError
                                    ? 'border-red-300 text-red-900 focus:border-red-500 focus:ring-red-500/20'
                                    : 'border-gray-300 text-gray-900 focus:border-gray-900 focus:ring-gray-900/10',
                            ].join(' ')}
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={isLoading || !reference.trim()}
                        className={[
                            'inline-flex items-center justify-center gap-2 h-11 px-5 rounded-xl text-sm font-semibold transition-all',
                            'bg-gray-900 text-white hover:bg-gray-800 cursor-pointer',
                            'disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed',
                            !isLoading && reference.trim() ? 'active:scale-[0.97]' : '',
                        ].join(' ')}
                    >
                        {isLoading ? (
                            <>
                                <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                                <span>Finding your certificates&hellip;</span>
                            </>
                        ) : (
                            <span>Get my certificates</span>
                        )}
                    </button>
                </div>

                <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-1.5 text-xs text-gray-500">
                    <span>
                        Format:{' '}
                        <span className="font-mono text-gray-700 font-medium">VCH-XXXXXXXXXX-XXXX</span>
                    </span>
                    <button
                        type="button"
                        onClick={() => setShowHelp(s => !s)}
                        aria-expanded={showHelp}
                        className="inline-flex items-center gap-1 text-gray-600 hover:text-gray-900 cursor-pointer font-medium"
                    >
                        <IoHelpCircleOutline className="w-3.5 h-3.5" />
                        <span>Where do I find this?</span>
                        <IoChevronDown
                            className={[
                                'w-3 h-3 transition-transform duration-200',
                                showHelp ? 'rotate-180' : '',
                            ].join(' ')}
                        />
                    </button>
                    {(voucher || isError) && !isLoading && (
                        <button
                            type="button"
                            onClick={handleReset}
                            className="inline-flex items-center gap-1 text-gray-500 hover:text-gray-900 cursor-pointer font-medium"
                        >
                            <IoRefresh className="w-3 h-3" />
                            <span>Use a different voucher</span>
                        </button>
                    )}
                </div>

                {showHelp && (
                    <div className="mt-3 px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 text-xs text-gray-600 leading-relaxed space-y-1.5">
                        <p>
                            After you pay, we send a receipt email with your voucher reference.
                            It also appears on the payment success page.
                        </p>
                        <p>
                            The reference always starts with{' '}
                            <span className="font-mono font-medium text-gray-900">VCH-</span>{' '}
                            followed by numbers.
                        </p>
                        <p>
                            Can&apos;t find it? Check your email inbox (and spam folder), or
                            contact support.
                        </p>
                    </div>
                )}
            </form>

            {/* Error banner */}
            {isError && (
                <div className="mx-6 sm:mx-10 mt-6 flex items-start gap-3 px-4 py-3 rounded-xl bg-red-50 border border-red-100">
                    <IoAlertCircleOutline className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-red-900">
                            We couldn&apos;t find that voucher.
                        </p>
                        <p className="text-xs text-red-700 mt-0.5 leading-relaxed">{errorMessage}</p>
                    </div>
                </div>
            )}

            {/* Fetched voucher success */}
            {voucher && !isLoading && (
                <div className="px-6 sm:px-10 pt-8 pb-10 mt-6 border-t border-gray-100 space-y-8">
                    <VoucherMetric
                        count={downloadableCount}
                        label={downloadableCount === 1 ? 'certificate' : 'certificates'}
                        statusText={
                            paidCount < voucher.studentCount
                                ? `${voucher.studentCount - paidCount} still being prepared`
                                : 'Ready to download'
                        }
                        statusColor={paidCount < voucher.studentCount ? 'bg-amber-500' : 'bg-green-500'}
                        amount={voucher.amountPaid}
                    />

                    <div className="border-t border-gray-100 pt-6">
                        <VoucherDetails voucher={voucher} />
                    </div>

                    {downloadableCount > 0 && (
                        <StudentList voucher={voucher} />
                    )}

                    {paidCount === 0 && voucher.studentCount > 0 && (
                        <div className="px-4 py-4 rounded-xl bg-amber-50 border border-amber-100 text-sm text-amber-900 flex items-start gap-3">
                            <IoAlertCircleOutline className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                            <div className="flex-1 min-w-0">
                                <p className="font-semibold">Your certificates are being prepared.</p>
                                <p className="text-xs mt-1 text-amber-800 leading-relaxed">
                                    This voucher covers {voucher.studentCount}{' '}
                                    {voucher.studentCount === 1 ? 'student' : 'students'}, but
                                    the certificates aren&apos;t quite ready yet &mdash; the system
                                    usually finishes within a few seconds.
                                </p>
                                <button
                                    type="button"
                                    onClick={() => trigger(voucher.voucherReference)}
                                    className="mt-2.5 inline-flex items-center gap-1.5 text-xs font-medium text-amber-900 hover:text-amber-950 cursor-pointer"
                                >
                                    <IoRefresh className="w-3.5 h-3.5" />
                                    <span>Check again</span>
                                </button>
                            </div>
                        </div>
                    )}

                    {downloadableCount > 0 && (
                        <div className="border-t border-gray-100 pt-6">
                            <DownloadSection count={downloadableCount} voucher={voucher} />
                        </div>
                    )}
                </div>
            )}
        </section>
    )
}
