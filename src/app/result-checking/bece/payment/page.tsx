'use client'

import React, {
    useState,
    useEffect,
    useRef,
    useCallback,
    Suspense,
} from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { IoCard, IoShieldCheckmark, IoPhonePortrait, IoWallet, IoMail, IoWarning } from 'react-icons/io5'
import Image from 'next/image'
import toast from 'react-hot-toast'
import Lottie from 'lottie-react'
import animationData from '../../assets/students.json'
import { verifyPayment } from '../../utils/api'
import { useSetBecePaymentEmailMutation } from '../../store/api/studentApi'
import { capitalizeWords, updateSearchParam } from '@/lib'
import { useSecureLocalStorage, SessionStore } from '@/app/result-checking/utils/secureStorage'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from '@/components/ui/dialog'
import { isValidEmail } from '@/lib/utils'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface RecentAccount {
    examNo: string
    studentName: string
    school: string
    lastAccessed: number // Unix ms timestamp
}

type PaymentStatus = 'pending' | 'processing' | 'success' | 'failed' | 'already_used'

interface StudentFormData {
    fullName: string
    schoolName: string
    lga: string
    examYear: string
    school: {
        id: string;
        name: string
    }
}

interface PaymentDetails {
    reference: string
    trxref: string
    studentName?: string
    school?: string
    examNumber?: string
    examYear?: number
    transactionId?: string
    /** Amount in Naira (already divided by 100) */
    amount?: number
    paidAt?: string
    channel?: string
    gatewayResponse?: string
    last4?: string
    bank?: string
    cardType?: string
}

interface PaystackMetaField {
    variable_name: string
    value: string
}

interface PaystackAuthorization {
    last4?: string
    bank?: string
    card_type?: string
    [key: string]: unknown
}

interface PaystackResponse {
    id?: number | string
    amount?: number
    paid_at?: string
    paidAt?: string
    created_at?: string
    createdAt?: string
    channel?: string
    gateway_response?: string
    authorization?: PaystackAuthorization
    metadata?: {
        custom_fields?: PaystackMetaField[]
    }
}

// ---------------------------------------------------------------------------
// Storage helpers (encrypted localStorage)
// ---------------------------------------------------------------------------

const STORAGE_KEYS = {
    PAYMENT_URL: 'bece_payment_url',
    PAYMENT_REF: 'bece_payment_reference',
    FORM_DATA: 'bece_alt_form_data',
    EXAM_NO: 'student_exam_no',
    EXAM_TYPE: 'selected_exam_type',
    RETURN_URL: 'student-payment-return-url',
} as const

const storage = {
    async getFormData(): Promise<StudentFormData | null> {
        try {
            const raw = await SessionStore.get(STORAGE_KEYS.FORM_DATA)
            return raw ? (JSON.parse(raw) as StudentFormData) : null
        } catch {
            return null
        }
    },
    async getPaymentUrl(): Promise<string> {
        return (await SessionStore.get(STORAGE_KEYS.PAYMENT_URL)) ?? ''
    },
    async getPaymentRef(): Promise<string> {
        return (await SessionStore.get(STORAGE_KEYS.PAYMENT_REF)) ?? ''
    },
    async getReturnUrl(): Promise<string> {
        return (await SessionStore.get(STORAGE_KEYS.RETURN_URL)) ?? '/result-checking/bece/dashboard'
    },
    async saveExamAccess(examNumber: string): Promise<void> {
        await SessionStore.set(STORAGE_KEYS.EXAM_NO, examNumber)
        await SessionStore.set(STORAGE_KEYS.EXAM_TYPE, 'bece')
    },
    clearPaymentData(): void {
        SessionStore.remove(STORAGE_KEYS.PAYMENT_URL)
        SessionStore.remove(STORAGE_KEYS.PAYMENT_REF)
        SessionStore.remove(STORAGE_KEYS.FORM_DATA)
    },
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const MAX_RETRIES = 3
const RETRY_DELAY_MS = 1500

function delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms))
}

function capitalize(str: string): string {
    return str ? str.charAt(0).toUpperCase() + str.slice(1) : ''
}

function formatNaira(amount?: number): string {
    if (amount == null || Number.isNaN(amount)) return '—'
    return `₦${amount.toLocaleString('en-NG')}`
}

function formatDate(iso?: string): { date: string; time: string } | null {
    if (!iso) return null
    try {
        const d = new Date(iso)
        return {
            date: d.toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
            }),
            time: d.toLocaleTimeString('en-US'),
        }
    } catch {
        return null
    }
}

// ---------------------------------------------------------------------------
// Hooks
// ---------------------------------------------------------------------------

/**
 * Manages the PENDING flow: loads stored data and fetches a fresh payment URL.
 */
function usePaymentSetup(isCallback: boolean) {
    const [studentData, setStudentData] = useState<StudentFormData | null>(null)
    const [paymentUrl, setPaymentUrl] = useState('')
    const [paymentReference, setPaymentReference] = useState('')
    const [setupError, setSetupError] = useState<string | null>(null)
    const [isLoadingUrl, setIsLoadingUrl] = useState(false)

    const router = useRouter()

    useEffect(() => {
        if (isCallback) return

        let cancelled = false
        setIsLoadingUrl(true)

        Promise.all([
            storage.getFormData(),
            storage.getPaymentUrl(),
            storage.getPaymentRef(),
        ]).then(([formData, url, ref]) => {
            if (cancelled) return
            if (!formData || !url || !ref) {
                toast.error('No payment data found. Please try again.')
                router.replace('/result-checking/bece')
                return
            }
            setStudentData(formData)
            setPaymentUrl(url)
            setPaymentReference(ref)
        }).catch(() => {
            if (!cancelled) setSetupError('Unable to load payment data. Please go back and try again.')
        }).finally(() => {
            if (!cancelled) setIsLoadingUrl(false)
        })

        return () => { cancelled = true }
    }, [isCallback]) // eslint-disable-line react-hooks/exhaustive-deps

    return {
        studentData,
        paymentUrl,
        paymentReference,
        setupError,
        isLoadingUrl,
    }
}

/**
 * Manages the CALLBACK flow: verifies payment with retry logic.
 */
function usePaymentVerification(
    isCallback: boolean,
    reference: string | null,
    trxref: string | null,
) {
    const [status, setStatus] = useState<PaymentStatus>(
        isCallback ? 'processing' : 'pending',
    )
    const [details, setDetails] = useState<PaymentDetails | null>(null)
    const [verifyError, setVerifyError] = useState<string | null>(null)

    // ── Recent accounts (persisted, encrypted) ───────────────────────────────
    const [_, setRecentAccounts] = useSecureLocalStorage<RecentAccount[]>(
        'bece_recent_accounts',
        [],
    )

    const syncRecentAccount = useCallback((account: RecentAccount) => {
        console.log("Ewo!!!")
        setRecentAccounts(prev => {
            const existing = (prev ?? []).filter(a => a.examNo !== account.examNo)
            return [account, ...existing].slice(0, 5);
        })
    }, [setRecentAccounts])

    useEffect(() => {
        if (!isCallback || !reference) return

        let cancelled = false

        const verify = async () => {
            for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
                try {
                    const response = await verifyPayment(reference)

                    if (cancelled) return

                    // Check for 402 - Payment already used
                    if (response.statusCode === 402) {
                        setStatus('already_used')
                        setVerifyError(
                            response.message || 'This payment has already been used to access an exam number.'
                        )
                        storage.clearPaymentData()
                        return
                    }

                    if (response.statusCode !== 200) {
                        throw new Error("Something went wrong");
                    }

                    if (response.paymentStatus === 'successful') {
                        const customFields: PaystackMetaField[] =
                            response.paystackResponse?.metadata?.custom_fields ?? []

                        const getField = (name: string) =>
                            customFields.find((f) => f.variable_name === name)?.value ?? ''

                        const paystackData = response.paystackResponse as PaystackResponse
                        const authorization = paystackData?.authorization ?? {}
                        const rawAmount = paystackData?.amount ?? 0
                        const channel = paystackData?.channel ?? ''

                        const built: PaymentDetails = {
                            reference,
                            trxref: trxref ?? '',
                            studentName: getField('student_name') || response.studentName,
                            school: getField('school') || response.school,
                            examNumber: response.examNumber,
                            examYear: response.examYear,
                            transactionId: String(
                                response.paystackTransactionId ?? paystackData?.id ?? '',
                            ),
                            amount: rawAmount / 100,
                            paidAt: paystackData?.paid_at ?? paystackData?.paidAt ?? response.paidAt,
                            channel: capitalize(channel),
                            gatewayResponse: paystackData?.gateway_response ?? '',
                            last4: authorization.last4 ?? '',
                            bank: authorization.bank ?? '',
                            cardType: (authorization.card_type as string)?.trim() ?? '',
                        }

                        if (response.examNumber) {
                            await storage.saveExamAccess(response.examNumber)
                            syncRecentAccount({
                                examNo: response.examNumber,
                                lastAccessed: Date.now(),
                                school: built.school || "N/A",
                                studentName: built.studentName || "N/A"
                            })
                        }
                        storage.clearPaymentData()

                        setDetails(built)
                        setStatus('success')
                        return
                    }

                    // Non-successful but no error thrown — treat as failed
                    setStatus('failed')
                    setVerifyError(
                        'Payment was not completed. If you were charged, a refund will be issued within 3–5 business days.',
                    )
                    return
                } catch (err: any) {
                    if (cancelled) return

                    // Check if error response contains 402 status
                    if (err?.response?.status === 402 || err?.statusCode === 402) {
                        setStatus('already_used')
                        setVerifyError(
                            err?.response?.data?.message ||
                            err?.message ||
                            'This payment has already been used to access an exam number.'
                        )
                        storage.clearPaymentData()
                        return
                    }

                    console.error(`Verification attempt ${attempt} failed:`, err)

                    if (attempt < MAX_RETRIES) {
                        await delay(RETRY_DELAY_MS * attempt)
                    } else {
                        setStatus('failed')
                        setVerifyError(
                            'We could not verify your payment. Please contact support with your reference number.',
                        )
                    }
                }
            }
        }

        verify()
        return () => {
            cancelled = true
        }
    }, [isCallback, reference, trxref]) // eslint-disable-line react-hooks/exhaustive-deps

    return { status, setStatus, details, verifyError }
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function PageShell({ children }: { children: React.ReactNode }) {
    return (
        <>
            <style dangerouslySetInnerHTML={{ __html: PRINT_STYLES }} />
            {children}
        </>
    )
}

function MinistryHeader({ subtitle }: { subtitle: string }) {
    return (
        <header className="w-full pt-8 pb-6 px-4 relative z-20">
            <div className="flex flex-col justify-center gap-3 items-center">
                <Image
                    src="/images/ministry-logo.png"
                    alt="Imo State Ministry of Primary and Secondary Education logo"
                    width={60}
                    height={60}
                    className="object-contain"
                    priority
                />
                <div className="text-center">
                    <h1 className="text-2xl md:text-3xl font-bold">
                        <abbr title="Basic Education Certificate Examination" className="no-underline">
                            BECE
                        </abbr>{' '}
                        Payment
                    </h1>
                    <p className="text-sm md:text-base text-gray-600 max-w-md mt-1">{subtitle}</p>
                </div>
            </div>
        </header>
    )
}

function InfoRow({ label, value }: { label: string; value?: string }) {
    if (!value) return null
    return (
        <div className="flex justify-between gap-2 text-sm">
            <span className="text-gray-600 font-medium shrink-0">{label}</span>
            <span className="font-semibold text-gray-900 text-right truncate max-w-[60%]" title={value}>
                {value}
            </span>
        </div>
    )
}

function DetailCard({
    label,
    children,
    highlight,
}: {
    label: string
    children: React.ReactNode
    highlight?: boolean
}) {
    return (
        <div
            className={`rounded-lg p-4 border ${highlight
                ? 'bg-green-50 border-green-200'
                : 'bg-gray-50 border-gray-200'
                }`}
        >
            <p className="text-xs text-gray-500 mb-1 uppercase tracking-wide">{label}</p>
            {children}
        </div>
    )
}

// ---------------------------------------------------------------------------
// Email Dialog
// ---------------------------------------------------------------------------

function EmailDialog({
    open,
    onOpenChange,
    onConfirm,
    paymentReference
}: {
    open: boolean
    onOpenChange: (open: boolean) => void
    onConfirm: (email: string) => Promise<void>
    paymentReference: string
}) {
    const [email, setEmail] = useState('')
    const [error, setError] = useState<string | null>(null)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const inputRef = useRef<HTMLInputElement>(null)

    const [setBecePaymentEmail, { isLoading, isSuccess, isError }] = useSetBecePaymentEmailMutation();

    // Reset state when dialog opens
    useEffect(() => {
        if (open) {
            setEmail('')
            setError(null)
            setIsSubmitting(false)
            // Small delay to allow dialog to mount before focusing
            setTimeout(() => inputRef.current?.focus(), 50)
        }
    }, [open])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        const trimmed = email.trim()

        if (!paymentReference) {
            setError("An unexpected error has occured, please refresh the page.");
            return;
        }

        if (!trimmed) {
            setError('Please enter your email address.')
            return
        }

        if (!isValidEmail(trimmed)) {
            setError('Please enter a valid email address.')
            return
        }

        setError(null)
        setIsSubmitting(true)

        try {
            const request = await setBecePaymentEmail({
                email: trimmed,
                paymentReference
            }).unwrap();

            if (request.status >= 201) {
                throw new Error("Something went wrong, Email not set");
            }

            await onConfirm(trimmed)
        } catch {
            setError('Something went wrong. Please try again.');
            setIsSubmitting(false)
            throw new Error("Something went wrong, Email not set");
        }
    }

    const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setEmail(e.target.value)
        if (error) setError(null)
    }

    return (
        <Dialog open={open} onOpenChange={isSubmitting ? undefined : onOpenChange}>
            <DialogContent className="sm:max-w-md rounded-2xl p-0 overflow-hidden gap-0">

                {/* Coloured top accent */}
                <div className="h-1.5 w-full bg-gradient-to-r from-green-500 to-green-600" />

                <div className="p-6">
                    <DialogHeader className="mb-5">

                        {/* Icon */}
                        <div className="flex items-center justify-center w-12 h-12 rounded-full bg-green-50 border border-green-100 mb-4 mx-auto">
                            <IoMail className="w-6 h-6 text-green-600" aria-hidden="true" />
                        </div>

                        <DialogTitle className="text-xl font-bold text-gray-900 text-center">
                            Where should we send your Exam Number?
                        </DialogTitle>

                        <DialogDescription className="text-sm text-gray-500 text-center mt-1 leading-relaxed">
                            Enter your email address and we'll send your exam number there once the
                            payment is confirmed so you always have it on hand.
                        </DialogDescription>
                    </DialogHeader>

                    <form onSubmit={handleSubmit} noValidate>

                        {/* Input */}
                        <div className="mb-4">
                            <label
                                htmlFor="email-input"
                                className="block text-sm font-medium text-gray-700 mb-1.5"
                            >
                                Email address
                            </label>

                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <IoMail
                                        className={`w-4 h-4 transition-colors ${error ? 'text-red-400' : 'text-gray-400'}`}
                                        aria-hidden="true"
                                    />
                                </div>
                                <input
                                    ref={inputRef}
                                    id="email-input"
                                    type="email"
                                    autoComplete="email"
                                    inputMode="email"
                                    placeholder="you@example.com"
                                    value={email}
                                    onChange={handleEmailChange}
                                    disabled={isSubmitting}
                                    aria-invalid={!!error}
                                    aria-describedby={error ? 'email-error' : undefined}
                                    className={`
                                        w-full pl-9 pr-4 py-2.5 text-sm rounded-lg border outline-none
                                        transition-all duration-150 bg-white
                                        placeholder:text-gray-400 text-gray-900
                                        disabled:bg-gray-50 disabled:cursor-not-allowed
                                        focus:ring-2 focus:ring-offset-0
                                        ${error
                                            ? 'border-red-400 focus:border-red-400 focus:ring-red-100'
                                            : 'border-gray-300 focus:border-green-500 focus:ring-green-100'
                                        }
                                    `}
                                />
                            </div>

                            {/* Error message */}
                            {error && (
                                <p
                                    id="email-error"
                                    role="alert"
                                    className="mt-1.5 text-xs text-red-600 flex items-center gap-1"
                                >
                                    <svg className="w-3.5 h-3.5 shrink-0" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                    </svg>
                                    {error}
                                </p>
                            )}
                        </div>

                        {/* Privacy note */}
                        <p className="text-xs text-gray-500 mb-5 flex items-start gap-1.5">
                            <IoShieldCheckmark className="w-3.5 h-3.5 text-green-500 shrink-0 mt-0.5" aria-hidden="true" />
                            Your email is used only to deliver your exam number and receipt. We don't share it.
                        </p>

                        <DialogFooter className="flex flex-col-reverse sm:flex-row gap-2 sm:gap-3">
                            <button
                                type="button"
                                disabled={isSubmitting}
                                onClick={() => onOpenChange(false)}
                                className="
                                    flex-1 px-4 py-2.5 text-sm font-medium rounded-lg border border-gray-300
                                    bg-white text-gray-700 hover:bg-gray-50 transition-colors duration-150
                                    disabled:opacity-50 disabled:cursor-not-allowed
                                    focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-400
                                    cursor-pointer active:scale-95
                                "
                            >
                                Cancel
                            </button>

                            <button
                                type="submit"
                                disabled={isSubmitting || !email.trim()}
                                className="
                                    flex-1 flex items-center justify-center gap-2
                                    px-4 py-2.5 text-sm font-semibold rounded-lg
                                    bg-green-600 hover:bg-green-700 text-white
                                    transition-all duration-150 shadow-sm hover:shadow
                                    disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-green-600
                                    focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500
                                    cursor-pointer active:scale-95
                                "
                            >
                                {isSubmitting ? (
                                    <>
                                        <span
                                            className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin"
                                            aria-hidden="true"
                                        />
                                        Proceeding…
                                    </>
                                ) : (
                                    <>
                                        <IoCard className="w-4 h-4" aria-hidden="true" />
                                        Proceed to Payment
                                    </>
                                )}
                            </button>
                        </DialogFooter>
                    </form>
                </div>
            </DialogContent>
        </Dialog>
    )
}

// ---------------------------------------------------------------------------
// View: Pending (initial payment screen)
// ---------------------------------------------------------------------------

function PendingView({
    studentData,
    paymentUrl,
    paymentReference,
    isLoading,
    setupError,
}: {
    studentData: StudentFormData | null
    paymentUrl: string
    paymentReference: string
    isLoading: boolean
    setupError: string | null
}) {
    const router = useRouter()
    const [showCancelConfirm, setShowCancelConfirm] = useState(false)
    const [emailDialogOpen, setEmailDialogOpen] = useState(false)

    // Opens the email dialog (guarded: do nothing if not ready)
    const handleOpenEmailDialog = () => {
        if (!paymentUrl || isLoading || !!setupError) return
        setEmailDialogOpen(true)
    }

    // Called by EmailDialog once the user submits a valid email
    const handleSetEmail = async (email: string): Promise<void> => {
        console.info('Notification email set:', email)
        // Proceed to payment gateway
        window.location.href = paymentUrl
    }

    const handleCancelConfirmed = () => {
        storage.clearPaymentData()
        router.push('/result-checking/bece')
    }

    return (
        <div className="min-h-screen bg-[#F3F3F3] flex flex-col relative overflow-hidden">
            {/* Background */}
            <div className="absolute inset-0 z-0">
                <Image
                    src="/images/asset.png"
                    alt=""
                    aria-hidden="true"
                    fill
                    className="object-cover saturate-200 brightness-75 scale-x-[-1]"
                    priority
                />
            </div>

            {/* Lottie */}
            <div className="fixed inset-0 flex sm:justify-end justify-center items-end pointer-events-none z-10">
                <Lottie
                    animationData={animationData}
                    loop
                    autoPlay
                    className="max-sm:hidden mb-5"
                    style={{ height: '40vmin' }}
                />
            </div>

            <MinistryHeader subtitle="Complete your payment to retrieve your Exam Number" />

            <main className="flex-1 flex items-center justify-center p-4">
                <div className="w-full max-w-md relative z-10">
                    <div className="bg-white rounded-3xl shadow-xl border border-gray-200 p-8 transition-shadow duration-300 hover:shadow-2xl">

                        {/* Error state */}
                        {setupError && (
                            <div role="alert" className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 text-sm text-red-800">
                                {setupError}
                            </div>
                        )}

                        {/* Student info */}
                        <section aria-label="Student Information" className="mb-6">
                            <h2 className="text-xl font-bold text-gray-900 mb-4">Student Information</h2>
                            <div className="space-y-3 bg-gray-50 rounded-lg p-4 border border-gray-200">
                                {isLoading ? (
                                    <div className="space-y-2 animate-pulse">
                                        {[...Array(4)].map((_, i) => (
                                            <div key={i} className="h-4 bg-gray-200 rounded w-full" />
                                        ))}
                                    </div>
                                ) : (
                                    <>
                                        <InfoRow label="Name:" value={capitalizeWords(studentData?.fullName || "")} />
                                        <InfoRow label="School:" value={capitalizeWords(studentData?.school.name || "")} />
                                        <InfoRow label="LGA:" value={capitalizeWords(studentData?.lga || "")} />
                                        <InfoRow label="Exam Year:" value={studentData?.examYear} />
                                    </>
                                )}
                            </div>
                        </section>

                        {/* Amount */}
                        <div className="border-t border-gray-200 pt-6 mb-6">
                            <div className="bg-gradient-to-r from-green-50 to-green-100 rounded-xl p-4 border border-green-200">
                                <div className="flex justify-between items-center mb-2">
                                    <span className="text-gray-700 font-medium">Amount to Pay:</span>
                                    <span className="text-3xl font-bold text-green-600">₦500</span>
                                </div>
                                {paymentReference && (
                                    <p className="text-xs text-gray-600">
                                        Reference:{' '}
                                        <span className="font-mono">{paymentReference}</span>
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* Security badge */}
                        <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-6 flex items-center gap-2">
                            <IoShieldCheckmark className="w-5 h-5 text-green-600 shrink-0" aria-hidden="true" />
                            <p className="text-xs text-green-800">Your payment is secured via Paystack</p>
                        </div>

                        {/* Payment methods */}
                        <div className="mb-6">
                            <p className="text-xs text-gray-600 mb-3 font-medium">Accepted Payment Methods:</p>
                            <div className="flex gap-2 flex-wrap">
                                {[
                                    { icon: <IoCard className="w-4 h-4" />, label: 'Debit Card' },
                                    { icon: <IoWallet className="w-4 h-4" />, label: 'Bank Transfer' },
                                    { icon: <IoPhonePortrait className="w-4 h-4" />, label: 'USSD' },
                                ].map(({ icon, label }) => (
                                    <span
                                        key={label}
                                        className="flex-1 justify-center border border-gray-200 px-3 py-1.5 bg-gray-100 text-gray-700 text-xs rounded-full font-medium flex items-center gap-1"
                                    >
                                        {icon} {label}
                                    </span>
                                ))}
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="space-y-3">
                            {showCancelConfirm ? (
                                <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 text-center">
                                    <p className="text-sm text-orange-800 mb-3 font-medium">
                                        Are you sure you want to cancel?
                                    </p>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={handleCancelConfirmed}
                                            className="flex-1 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-semibold rounded-lg transition-all active:scale-95 cursor-pointer"
                                        >
                                            Yes, Cancel
                                        </button>
                                        <button
                                            onClick={() => setShowCancelConfirm(false)}
                                            className="flex-1 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 text-sm font-medium rounded-lg transition-all active:scale-95 cursor-pointer"
                                        >
                                            Go Back
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <>
                                    {/* Trigger button — opens email dialog */}
                                    <button
                                        onClick={handleOpenEmailDialog}
                                        disabled={isLoading || !!setupError || !paymentUrl}
                                        aria-busy={isLoading}
                                        className="w-full flex items-center justify-center px-4 py-3 bg-green-600 hover:bg-green-700 disabled:bg-green-300 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-all duration-200 active:scale-95 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 group cursor-pointer"
                                    >
                                        {isLoading ? (
                                            <>
                                                <span className="w-5 h-5 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                                Preparing Payment…
                                            </>
                                        ) : (
                                            <>
                                                <IoCard className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform" aria-hidden="true" />
                                                Proceed to Payment
                                            </>
                                        )}
                                    </button>

                                    <button
                                        onClick={() => setShowCancelConfirm(true)}
                                        className="w-full px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg transition-all duration-200 active:scale-95 border border-gray-300 cursor-pointer"
                                    >
                                        Cancel Payment
                                    </button>
                                </>
                            )}
                        </div>
                    </div>

                    {/* Tip */}
                    <div className="mt-6 bg-gradient-to-b from-white to-blue-100 border border-blue-200 rounded-2xl p-4 hover:border-blue-300 transition-colors duration-300">
                        <p className="text-sm text-blue-800">
                            <strong>💡 Tip:</strong> After payment, you can access your results anytime using your exam number.
                        </p>
                    </div>

                    <p className="mt-6 text-center text-xs text-gray-600">
                        © {new Date().getFullYear()} Imo State Ministry of Primary and Secondary Education
                    </p>
                </div>
            </main>

            {/* Email Dialog */}
            <EmailDialog
                open={emailDialogOpen}
                paymentReference={paymentReference}
                onOpenChange={setEmailDialogOpen}
                onConfirm={handleSetEmail}
            />
        </div>
    )
}

// ---------------------------------------------------------------------------
// View: Processing
// ---------------------------------------------------------------------------

function ProcessingView({ reference }: { reference?: string }) {
    return (
        <div
            className="min-h-screen bg-gray-50 flex items-center justify-center p-4"
            role="status"
            aria-live="polite"
            aria-label="Verifying payment"
        >
            <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full text-center">
                <div
                    className="animate-spin rounded-full h-16 w-16 border-4 border-green-100 border-t-green-600 mx-auto mb-6"
                    aria-hidden="true"
                />
                <h2 className="text-xl font-semibold text-gray-900 mb-2">Verifying Payment</h2>
                <p className="text-gray-600 mb-6 text-sm">
                    Please wait while we confirm your transaction with Paystack. This usually takes a few seconds.
                </p>
                {reference && (
                    <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                        <p className="text-xs text-gray-500 mb-1 uppercase tracking-wide">Transaction Reference</p>
                        <p className="font-mono text-sm text-gray-900 break-all">{reference}</p>
                    </div>
                )}
            </div>
        </div>
    )
}

// ---------------------------------------------------------------------------
// View: Success
// ---------------------------------------------------------------------------

function SuccessView({
    details,
    onContinue,
}: {
    details: PaymentDetails
    onContinue: () => void
}) {
    const [copied, setCopied] = useState(false)
    const continueRef = useRef<HTMLButtonElement>(null)

    // Focus the primary action when success is rendered
    useEffect(() => {
        continueRef.current?.focus()
    }, [])

    const handleCopyExamNumber = useCallback(async () => {
        if (!details.examNumber) return
        try {
            await navigator.clipboard.writeText(details.examNumber)
            setCopied(true)
            toast.success('Exam number copied!')
            setTimeout(() => setCopied(false), 2000)
        } catch {
            toast.error('Could not copy — please copy manually.')
        }
    }, [details.examNumber])

    const paidAtFormatted = formatDate(details.paidAt)

    return (
        <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-green-50 flex items-center justify-center p-4">
            <div className="w-full max-w-2xl print-full-width">

                {/* On-screen header */}
                <div className="text-center mb-6 no-print">
                    <Image
                        src="/images/ministry-logo.png"
                        alt="Ministry Logo"
                        width={80}
                        height={80}
                        className="object-contain mx-auto mb-4"
                    />
                    <h1 className="text-3xl font-bold text-gray-900 mb-1">Payment Successful! 🎉</h1>
                    <p className="text-gray-600 text-lg">Your results are now available</p>
                </div>

                <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">

                    {/* Print-only header */}
                    <div className="hidden print:block p-6 border-b border-gray-200">
                        <div className="flex items-center gap-4 mb-3">
                            <Image src="/images/ministry-logo.png" alt="Ministry Logo" width={56} height={56} className="object-contain" />
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900">Payment Receipt</h1>
                                <p className="text-sm text-gray-600">Imo State Ministry of Primary and Secondary Education</p>
                                <p className="text-xs text-gray-500">
                                    <abbr title="Basic Education Certificate Examination" className="no-underline">BECE</abbr> Examination — {details.examYear ?? new Date().getFullYear()}
                                </p>
                            </div>
                        </div>
                        <p className="text-xs text-gray-500 text-right">
                            Printed: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })} at {new Date().toLocaleTimeString('en-US')}
                        </p>
                    </div>

                    {/* Exam number banner */}
                    {details.examNumber && (
                        <div className="bg-gradient-to-r from-green-600 to-green-700 text-white p-6 text-center relative overflow-hidden">
                            <span className="absolute top-2 right-2 bg-white/20 text-white text-xs px-3 py-1 rounded-full border border-white/30 no-print">
                                <abbr title="Basic Education Certificate Examination" className="no-underline">BECE</abbr>
                            </span>

                            <p className="text-sm uppercase tracking-widest mb-2 opacity-90">Your Exam Number</p>

                            {/* Clickable (screen only) */}
                            <button
                                onClick={handleCopyExamNumber}
                                className="no-print group relative inline-block focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-green-700 rounded cursor-pointer"
                                aria-label={`Exam number ${details.examNumber}. Click to copy.`}
                            >
                                <span className="text-3xl md:text-4xl font-bold tracking-wider font-mono group-hover:scale-105 inline-block transition-transform duration-200">
                                    {details.examNumber}
                                </span>
                                <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 bg-white text-gray-900 text-xs px-3 py-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap shadow-lg pointer-events-none">
                                    {copied ? '✓ Copied!' : 'Click to copy'}
                                </span>
                            </button>

                            {/* Print-only static */}
                            <p className="hidden print:block text-3xl font-bold tracking-wider font-mono">
                                {details.examNumber}
                            </p>

                            <p className="text-sm mt-6 opacity-90 no-print">Click the number above to copy</p>
                            <p className="hidden print:block text-sm mt-2 opacity-90">Keep this number for future reference</p>
                        </div>
                    )}

                    {/* Details grid */}
                    <div className="p-6 space-y-6">

                        {/* Student information */}
                        <section aria-label="Student Information">
                            <h2 className="font-semibold text-gray-900 text-lg mb-3 flex items-center gap-2">
                                <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                </svg>
                                Student Information
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {details.studentName && (
                                    <DetailCard label="Student Name">
                                        <p className="font-semibold text-gray-900 capitalize">{details.studentName.toLowerCase()}</p>
                                    </DetailCard>
                                )}
                                {details.school && (
                                    <DetailCard label="School">
                                        <p className="font-semibold text-gray-900 capitalize">{details.school.toLowerCase()}</p>
                                    </DetailCard>
                                )}
                                {details.examYear && (
                                    <DetailCard label="Exam Year">
                                        <p className="font-semibold text-gray-900">{details.examYear}</p>
                                    </DetailCard>
                                )}
                            </div>
                        </section>

                        {/* Transaction details */}
                        <section aria-label="Transaction Details" className="border-t border-gray-200 pt-6">
                            <h2 className="font-semibold text-gray-900 text-lg mb-3 flex items-center gap-2">
                                <IoCard className="w-5 h-5 text-green-600" aria-hidden="true" />
                                Transaction Details
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                                <DetailCard label="Amount Paid" highlight>
                                    <p className="font-bold text-3xl text-green-600">{formatNaira(details.amount)}</p>
                                </DetailCard>

                                {details.transactionId && (
                                    <DetailCard label="Transaction ID">
                                        <p className="font-mono text-sm text-gray-900 break-all">{details.transactionId}</p>
                                    </DetailCard>
                                )}

                                <DetailCard label="Payment Reference">
                                    <p className="font-mono text-xs text-gray-900 break-all">{details.reference}</p>
                                </DetailCard>

                                {paidAtFormatted && (
                                    <DetailCard label="Payment Date">
                                        <p className="font-semibold text-gray-900">{paidAtFormatted.date}</p>
                                        <p className="text-xs text-gray-500 mt-0.5">{paidAtFormatted.time}</p>
                                    </DetailCard>
                                )}

                                {details.channel && (
                                    <DetailCard label="Payment Method">
                                        <p className="font-semibold text-gray-900">{details.channel}</p>
                                    </DetailCard>
                                )}

                                {details.last4 && (
                                    <DetailCard label="Card Details">
                                        <p className="font-semibold text-gray-900">
                                            {details.cardType && <span className="uppercase mr-2">{details.cardType}</span>}
                                            **** {details.last4}
                                        </p>
                                        {details.bank && (
                                            <p className="text-xs text-gray-500 mt-0.5 capitalize">{details.bank.toLowerCase()}</p>
                                        )}
                                    </DetailCard>
                                )}

                                {details.gatewayResponse && (
                                    <DetailCard label="Status">
                                        <p className="font-semibold text-green-600">{details.gatewayResponse}</p>
                                    </DetailCard>
                                )}
                            </div>
                        </section>
                    </div>

                    {/* Actions */}
                    <div className="p-6 bg-gray-50 border-t border-gray-200 space-y-3 no-print">
                        <button
                            ref={continueRef}
                            onClick={onContinue}
                            className="w-full flex items-center justify-center gap-2 bg-green-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-green-700 transition-all duration-200 active:scale-95 shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 cursor-pointer"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                            Go to Dashboard
                        </button>
                        <button
                            onClick={() => window.print()}
                            className="w-full flex items-center justify-center gap-2 bg-white text-gray-700 py-3 px-4 rounded-lg font-medium hover:bg-gray-100 transition-all duration-200 active:scale-95 border-2 border-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-400 cursor-pointer"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                            </svg>
                            Print / Save Receipt
                        </button>
                    </div>
                </div>

                {/* Footer */}
                <div className="mt-6 text-center">
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                        <p className="text-sm text-gray-600 flex items-center justify-center gap-2">
                            <IoShieldCheckmark className="w-5 h-5 text-green-600 shrink-0" aria-hidden="true" />
                            <span><strong>Secure Transaction:</strong> Processed via Paystack</span>
                        </p>
                    </div>
                    <p className="text-xs text-gray-500 mt-4">
                        © {new Date().getFullYear()} Imo State Ministry of Primary and Secondary Education
                    </p>
                </div>
            </div>
        </div>
    )
}

// ---------------------------------------------------------------------------
// View: Failed
// ---------------------------------------------------------------------------

function FailedView({
    reference,
    errorMessage,
    onRetry,
}: {
    reference?: string | null
    errorMessage?: string | null
    onRetry: () => void
}) {
    const router = useRouter()
    const retryRef = useRef<HTMLButtonElement>(null)

    useEffect(() => {
        retryRef.current?.focus()
    }, [])

    return (
        <div
            className="min-h-screen bg-gray-50 flex items-center justify-center p-4"
            role="alert"
            aria-live="assertive"
        >
            <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full text-center">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6" aria-hidden="true">
                    <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </div>

                <h1 className="text-2xl font-bold text-gray-900 mb-2">Payment Failed</h1>
                <p className="text-gray-600 mb-4 text-sm">
                    {errorMessage ||
                        'We couldn\'t process your payment. This could be due to insufficient funds, network issues, or a gateway problem.'}
                </p>

                {reference && (
                    <div className="bg-gray-50 rounded-lg p-3 mb-4 text-left border border-gray-200">
                        <p className="text-xs text-gray-500 mb-1 uppercase tracking-wide">Your Reference</p>
                        <p className="font-mono text-sm text-gray-900 break-all">{reference}</p>
                        <p className="text-xs text-gray-500 mt-1">Keep this if you need to contact support.</p>
                    </div>
                )}

                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6 text-left">
                    <p className="text-sm text-amber-800">
                        <strong>Charged but failed?</strong> Any deducted amount will be refunded within 3–5 business days.
                    </p>
                </div>

                <div className="space-y-3">
                    <button
                        ref={retryRef}
                        onClick={onRetry}
                        className="w-full bg-green-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-green-700 transition-colors duration-200 active:scale-95 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 cursor-pointer"
                    >
                        Try Again
                    </button>
                    <button
                        onClick={() => router.push('/result-checking')}
                        className="w-full bg-gray-100 text-gray-700 py-3 px-4 rounded-lg font-medium hover:bg-gray-200 transition-colors duration-200 border border-gray-300 cursor-pointer"
                    >
                        Back to Login
                    </button>
                </div>
            </div>
        </div>
    )
}

// ---------------------------------------------------------------------------
// View: Already Used (402)
// ---------------------------------------------------------------------------

function AlreadyUsedView({
    reference,
    errorMessage,
}: {
    reference?: string | null
    errorMessage?: string | null
}) {
    const router = useRouter()
    const actionRef = useRef<HTMLButtonElement>(null)

    useEffect(() => {
        actionRef.current?.focus()
    }, [])

    return (
        <div
            className="min-h-screen bg-gray-50 flex items-center justify-center p-4"
            role="alert"
            aria-live="polite"
        >
            <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full text-center">
                {/* Warning Icon */}
                <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-6" aria-hidden="true">
                    <IoWarning className="w-8 h-8 text-amber-600" />
                </div>

                <h1 className="text-2xl font-bold text-gray-900 mb-2">Payment Already Used</h1>
                <p className="text-gray-600 mb-6 text-sm leading-relaxed">
                    {errorMessage ||
                        'This payment has already been used to access an exam number. Each payment can only be used once.'}
                </p>

                {reference && (
                    <div className="bg-gray-50 rounded-lg p-4 mb-6 text-left border border-gray-200">
                        <p className="text-xs text-gray-500 mb-1 uppercase tracking-wide">Payment Reference</p>
                        <p className="font-mono text-sm text-gray-900 break-all">{reference}</p>
                    </div>
                )}

                {/* Info Box */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 text-left">
                    <h3 className="font-semibold text-blue-900 text-sm mb-2 flex items-center gap-2">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                        </svg>
                        What this means:
                    </h3>
                    <ul className="text-sm text-blue-800 space-y-1.5 list-disc list-inside">
                        <li>Your payment was successful and processed</li>
                        <li>An exam number has already been issued for this payment</li>
                        <li>You cannot use this payment reference again</li>
                    </ul>
                </div>

                {/* Help Box */}
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6 text-left">
                    <h3 className="font-semibold text-gray-900 text-sm">Need help? <div onClick={() => updateSearchParam("contacting-support", "true")} className='text-green-600 inline-block'>Contact Support</div></h3>
                </div>

                {/* Actions */}
                <div className="space-y-3">
                    <button
                        ref={actionRef}
                        onClick={() => router.push('/result-checking/bece/dashboard')}
                        className="w-full bg-green-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-green-700 transition-colors duration-200 active:scale-95 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 cursor-pointer"
                    >
                        Go to Dashboard
                    </button>
                    <button
                        onClick={() => router.push('/result-checking/bece')}
                        className="w-full bg-gray-100 text-gray-700 py-3 px-4 rounded-lg font-medium hover:bg-gray-200 transition-colors duration-200 border border-gray-300 cursor-pointer"
                    >
                        Back to Login
                    </button>
                </div>

                {/* Support contact */}
                <div className="mt-6 pt-6 border-t border-gray-200">
                    <p className="text-xs text-gray-500">
                        For assistance, please contact support with your reference number
                    </p>
                </div>
            </div>
        </div>
    )
}

// ---------------------------------------------------------------------------
// View: Loading fallback (Suspense)
// ---------------------------------------------------------------------------

function LoadingFallback() {
    return (
        <div className="min-h-screen bg-[#F3F3F3] flex items-center justify-center relative overflow-hidden">
            <div className="absolute inset-0 z-0">
                <Image src="/images/asset.png" alt="" aria-hidden="true" fill className="object-cover saturate-200 brightness-75 scale-x-[-1]" />
            </div>
            <div
                className="animate-spin rounded-full h-16 w-16 border-4 border-green-200 border-t-green-600 relative z-10"
                role="status"
                aria-label="Loading"
            />
        </div>
    )
}

// ---------------------------------------------------------------------------
// Core component
// ---------------------------------------------------------------------------

function PaymentContent() {
    const router = useRouter()
    const searchParams = useSearchParams()

    const reference = searchParams.get('reference')
    const trxref = searchParams.get('trxref')
    const isCallback = !!reference

    const [returnUrl, setReturnUrl] = useState('/result-checking/bece/dashboard')
    useEffect(() => {
        storage.getReturnUrl().then(setReturnUrl)
    }, [])

    // Pending flow
    const { studentData, paymentUrl, paymentReference, setupError, isLoadingUrl } =
        usePaymentSetup(isCallback)

    // Callback / verification flow
    const { status, details, verifyError } = usePaymentVerification(
        isCallback,
        reference,
        trxref
    )

    const handleContinue = useCallback(() => {
        router.replace(`${returnUrl}?payment=success`)
    }, [router, returnUrl])

    const handleRetry = useCallback(() => {
        if (window === undefined) return;
        window.location.reload()
    }, [])

    // Callback states
    if (isCallback) {
        if (status === 'processing') {
            return <ProcessingView reference={reference ?? undefined} />
        }
        if (status === 'success' && details) {
            return <SuccessView details={details} onContinue={handleContinue} />
        }
        if (status === 'already_used') {
            return <AlreadyUsedView reference={reference} errorMessage={verifyError} />
        }
        if (status === 'failed') {
            return <FailedView reference={reference} errorMessage={verifyError} onRetry={handleRetry} />
        }
        // Fallback while transitioning
        return <ProcessingView reference={reference ?? undefined} />
    }

    // Pending state (initial page)
    return (
        <PendingView
            studentData={studentData}
            paymentUrl={paymentUrl}
            paymentReference={paymentReference}
            isLoading={isLoadingUrl}
            setupError={setupError}
        />
    )
}

// ---------------------------------------------------------------------------
// Print styles
// ---------------------------------------------------------------------------

const PRINT_STYLES = `
  @media print {
    @page { margin: 0.5in; }
    body {
      background: white !important;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }
    .no-print { display: none !important; }
    .print-full-width { max-width: 100% !important; box-shadow: none !important; }
  }
`

// ---------------------------------------------------------------------------
// Export
// ---------------------------------------------------------------------------

export default function PaymentPage() {
    return (
        <PageShell>
            <Suspense fallback={<LoadingFallback />}>
                <PaymentContent />
            </Suspense>
        </PageShell>
    )
}