'use client'

import React, { useEffect, useRef, useState } from 'react'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'
import {
    IoCardOutline,
    IoLockClosedOutline,
    IoMail,
    IoShieldCheckmarkOutline,
} from 'react-icons/io5'
import { isValidEmail } from '@/lib/utils'
import { formatNaira, type BulkExamConfig } from './examConfig'
import type { BulkSelectionSummary } from './types'
import {
    useSetBecePaymentEmailMutation,
    useSetUbeatPaymentEmailMutation,
} from '@/app/result-checking/store/api/studentApi'

interface BulkPaymentModalProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    config: BulkExamConfig
    summary: BulkSelectionSummary
    schoolName: string
    /**
     * Called when the agent confirms payment.
     * The parent POSTs to `/result-payment/create-batch`, sets
     * `window.location.href = response.authorizationUrl`, and returns the
     * payment reference (or `undefined` on failure).
     *
     * On success the parent will redirect to Paystack; the modal stays
     * mounted during the brief navigation window so the agent can't
     * double-click the pay button. On failure the parent returns
     * `undefined` and the modal resets its submitting state.
     */
    onConfirm: (args: { email: string }) => Promise<string | undefined>
}

/**
 * Confirmation + receipt-email modal shown before redirecting to Paystack.
 *
 * Mirrors the Paywall's `EmailDialog` pattern exactly:
 *   1. Validate the email
 *   2. Call `onConfirm({ email })` (parent: createBatchPayment + redirect)
 *   3. After the parent returns the reference, PATCH the email onto the
 *      payment using the same `setBecePaymentEmail` / `setUbeatPaymentEmail`
 *      mutations used by the single-student Paywalls
 *   4. The email PATCH races the redirect — that's a known characteristic
 *      of the existing flow, not a bug
 *
 * **Sticky loading rule**: once `isSubmitting` is true, it is ONLY reset
 * on a failure path. A successful `onConfirm` (or successful email set)
 * leaves `isSubmitting = true` so the Pay button stays disabled until the
 * page navigation tears the modal down. This prevents the agent from
 * clicking "Pay" twice and creating two Paystack transactions.
 */
export default function BulkPaymentModal({
    open,
    onOpenChange,
    config,
    summary,
    schoolName,
    onConfirm,
}: BulkPaymentModalProps) {
    const [email, setEmail] = useState('')
    const [error, setError] = useState<string | null>(null)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const inputRef = useRef<HTMLInputElement>(null)

    const [setBecePaymentEmail] = useSetBecePaymentEmailMutation()
    const [setUbeatPaymentEmail] = useSetUbeatPaymentEmailMutation()

    useEffect(() => {
        if (open) {
            setEmail('')
            setError(null)
            setIsSubmitting(false)
            setTimeout(() => inputRef.current?.focus(), 60)
        }
    }, [open])

    const handleConfirm = async () => {
        const trimmed = email.trim()

        if (!trimmed) {
            setError('Please enter an email for the receipt.')
            return
        }
        if (!isValidEmail(trimmed)) {
            setError('That doesn\'t look like a valid email address.')
            return
        }

        setError(null)
        // ── Sticky loading: set true ONCE here. From this point on, the
        // Pay and Cancel buttons are disabled and will not re-enable
        // until a failure path explicitly resets the state. A successful
        // `onConfirm` (which triggers window.location.href) does NOT
        // reset isSubmitting — the modal will be unmounted by the page
        // navigation before the user ever sees it re-enable.
        setIsSubmitting(true)

        try {
            const reference = await onConfirm({ email: trimmed })
            if (!reference) {
                // createBatchPayment failed — the parent has already
                // reset its own loading state and toasted the error.
                // Re-enable the modal so the agent can retry.
                setError('Couldn\'t start the payment. Please try again.')
                setIsSubmitting(false)
                return
            }

            // createBatchPayment succeeded and the parent has already
            // set `window.location.href = response.authorizationUrl`.
            // PATCH the email onto the payment, racing the redirect.
            //
            // ── Sticky loading: the email PATCH happens AFTER the
            // redirect has been triggered. We do NOT want a PATCH
            // failure to reset isSubmitting (which would re-enable the
            // Pay button mid-navigation and could cause a duplicate
            // payment if the user clicked it again before the page
            // tears down). The PATCH is best-effort: log the failure
            // and let the navigation continue.
            try {
                const setEmail = config.examType === 'bece' ? setBecePaymentEmail : setUbeatPaymentEmail
                const result = await setEmail({
                    email: trimmed,
                    paymentReference: reference,
                }).unwrap()

                // Paywall's existing check: any status >= 201 is treated
                // as a hard error (mirrors the single-student EmailDialog).
                if (typeof result.status === 'number' && result.status >= 201) {
                    throw new Error('Email could not be saved on the payment')
                }
            } catch (emailErr) {
                console.warn(
                    'Receipt email could not be saved on the payment, but the Paystack redirect is already in progress.',
                    emailErr,
                )
                // Intentionally NOT resetting isSubmitting — the page is
                // about to navigate. The agent will not be able to click
                // Pay again before the modal is unmounted.
            }

            // Success: isSubmitting STAYS true. The page navigation will
            // unmount the modal shortly.
        } catch (err) {
            // This catch only fires for the createBatchPayment path (the
            // email PATCH has its own try/catch above). Reset isSubmitting
            // so the agent can retry.
            console.error('Bulk payment confirmation failed', err)
            setError('Something went wrong. Please try again.')
            setIsSubmitting(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={isSubmitting ? undefined : onOpenChange}>
            <DialogContent className="sm:max-w-md rounded-2xl p-0 overflow-hidden gap-0">
                <div className="h-1.5 w-full bg-gradient-to-r from-green-500 to-green-600" />

                <div className="p-6">
                    <DialogHeader className="mb-5">
                        <div className="flex items-center justify-center w-12 h-12 rounded-full bg-green-50 border border-green-100 mb-4 mx-auto">
                            <IoCardOutline className="w-6 h-6 text-green-600" aria-hidden="true" />
                        </div>
                        <DialogTitle className="text-center text-lg font-semibold text-gray-900">
                            Confirm bulk payment
                        </DialogTitle>
                        <DialogDescription className="text-sm text-gray-500 text-center mt-1 leading-relaxed">
                            You&apos;re about to pay for {summary.payableCount} {config.shortName}
                            {' '}result{summary.payableCount === 1 ? '' : 's'} at <span className="capitalize">{schoolName.toLowerCase()}</span>.
                        </DialogDescription>
                    </DialogHeader>

                    {/* Receipt summary */}
                    <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 mb-5 space-y-2.5">
                        <Row label="Exam" value={config.shortName} />
                        <Row label="Results to pay for" value={`${summary.payableCount}`} />
                        <Row label="Price per result" value={formatNaira(config.pricePerStudent)} />
                        <div className="h-px bg-gray-200 my-2" />
                        <Row
                            label="Total amount"
                            value={formatNaira(summary.totalAmount)}
                            emphasised
                        />
                    </div>

                    <div className="mb-5">
                        <label
                            htmlFor="bulk-payment-email"
                            className="block text-sm font-medium text-gray-700 mb-1.5"
                        >
                            Receipt email
                        </label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <IoMail
                                    className={`h-5 w-5 transition-colors ${error ? 'text-red-400' : 'text-gray-400'}`}
                                    aria-hidden="true"
                                />
                            </div>
                            <input
                                ref={inputRef}
                                id="bulk-payment-email"
                                type="email"
                                value={email}
                                onChange={(e) => {
                                    setEmail(e.target.value)
                                    if (error) setError(null)
                                }}
                                placeholder="agent@example.com"
                                autoComplete="email"
                                disabled={isSubmitting}
                                className={[
                                    'block w-full pl-10 pr-3 py-2.5 text-sm border rounded-lg',
                                    'focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors',
                                    error ? 'border-red-300 bg-red-50' : 'border-gray-300 hover:border-green-400',
                                ].join(' ')}
                            />
                        </div>
                        {error && (
                            <p className="text-xs text-red-600 mt-1.5">{error}</p>
                        )}
                        <p className="text-[11px] text-gray-500 mt-1.5 flex items-center gap-1">
                            <IoShieldCheckmarkOutline className="w-3 h-3" />
                            We&apos;ll send your bulk receipt and ZIP download link here.
                        </p>
                    </div>

                    <DialogFooter className="sm:justify-between gap-2">
                        <button
                            type="button"
                            onClick={() => onOpenChange(false)}
                            disabled={isSubmitting}
                            className="px-4 py-2.5 text-sm font-medium rounded-lg border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Cancel
                        </button>
                        <button
                            type="button"
                            onClick={handleConfirm}
                            disabled={isSubmitting}
                            className="inline-flex justify-center items-center gap-2 px-4 py-2.5 text-sm font-semibold rounded-lg bg-green-600 hover:bg-green-700 text-white transition-colors shadow-sm cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isSubmitting ? (
                                <>
                                    <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                                    Redirecting…
                                </>
                            ) : (
                                <>
                                    <IoLockClosedOutline className="w-4 h-4" />
                                    Pay {formatNaira(summary.totalAmount)}
                                </>
                            )}
                        </button>
                    </DialogFooter>
                </div>
            </DialogContent>
        </Dialog>
    )
}

function Row({
    label,
    value,
    emphasised = false,
}: {
    label: string
    value: string
    emphasised?: boolean
}) {
    return (
        <div className="flex justify-between items-center text-sm">
            <span className={emphasised ? 'text-gray-700 font-medium' : 'text-gray-500'}>
                {label}
            </span>
            <span
                className={[
                    'text-right',
                    emphasised ? 'text-base font-bold text-green-700' : 'text-gray-900 font-medium',
                ].join(' ')}
            >
                {value}
            </span>
        </div>
    )
}
