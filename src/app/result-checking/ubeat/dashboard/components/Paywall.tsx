'use client'
import React, { useEffect, useRef, useState } from 'react'
import { IoCard, IoLockClosedOutline, IoMail, IoShieldCheckmark, IoShieldCheckmarkOutline } from 'react-icons/io5'
import toast from 'react-hot-toast'
import { createPayment } from '@/app/result-checking/utils/api'
import { ExamTypeEnum } from '@/app/portal/store/api/authApi'
import { useTopLoader } from "nextjs-toploader"
import { setSecureItem, removeSecureItem } from '@/app/result-checking/utils/secureStorage'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { useSetUbeatPaymentEmailMutation } from '@/app/result-checking/store/api/studentApi'
import { isValidEmail } from '@/lib/utils'

interface PaywallProps {
    examNo: string
    studentName: string
    school: string
}

function EmailDialog({
    open,
    onOpenChange,
    onConfirm,
}: {
    open: boolean
    onOpenChange: (open: boolean) => void
    onConfirm: (email: string) => Promise<string | undefined>
}) {
    const [email, setEmail] = useState('')
    const [error, setError] = useState<string | null>(null)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const inputRef = useRef<HTMLInputElement>(null)

    const [setUbeatPaymentEmail] = useSetUbeatPaymentEmailMutation();

    useEffect(() => {
        if (open) {
            setEmail('')
            setError(null)
            setIsSubmitting(false)
            setTimeout(() => inputRef.current?.focus(), 50)
        }
    }, [open])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        const trimmed = email.trim();

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
            const reference = await onConfirm(trimmed)

            if (!reference) {
                setError("An unexpected error has occured, please refresh the page.");
                return;
            }

            const request = await setUbeatPaymentEmail({
                email: trimmed,
                paymentReference: reference
            }).unwrap();

            // Note: Check if status >= 201 is actually an error in your API logic
            // Usually 201 is "Created". If it's an error, keep this:
            if (request.status >= 201) {
                throw new Error("Something went wrong, Email not set");
            }

        } catch {
            setError('Something went wrong. Please try again.');
            setIsSubmitting(false)
        }
    }

    const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setEmail(e.target.value)
        if (error) setError(null)
    }

    return (
        <Dialog open={open} onOpenChange={isSubmitting ? undefined : onOpenChange}>
            <DialogContent className="sm:max-w-md rounded-2xl p-0 overflow-hidden gap-0">
                <div className="h-1.5 w-full bg-gradient-to-r from-green-500 to-green-600" />

                <div className="p-6">
                    <DialogHeader className="mb-5">
                        <div className="flex items-center justify-center w-12 h-12 rounded-full bg-green-50 border border-green-100 mb-4 mx-auto">
                            <IoMail className="w-6 h-6 text-green-600" aria-hidden="true" />
                        </div>

                        <DialogTitle className="text-xl font-bold text-gray-900 text-center">
                            Confirm your contact email
                        </DialogTitle>

                        <DialogDescription className="text-sm text-gray-500 text-center mt-1 leading-relaxed">
                            We use this as your primary contact point to send your **official payment receipt** and exam number once your transaction is confirmed.
                        </DialogDescription>
                    </DialogHeader>

                    <form onSubmit={handleSubmit} noValidate>
                        <div className="mb-4">
                            <label
                                htmlFor="email-input"
                                className="block text-sm font-medium text-gray-700 mb-1.5"
                            >
                                Receipt delivery email
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

                            {error && (
                                <p id="email-error" role="alert" className="mt-1.5 text-xs text-red-600 flex items-center gap-1">
                                    <svg className="w-3.5 h-3.5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                    </svg>
                                    {error}
                                </p>
                            )}
                        </div>

                        {/* Updated Privacy/Contact Note */}
                        <div className="bg-blue-50/50 border border-blue-100 rounded-lg p-3 mb-5">
                            <p className="text-xs text-blue-700 flex items-start gap-2">
                                <IoShieldCheckmark className="w-4 h-4 text-blue-500 shrink-0" aria-hidden="true" />
                                <span>
                                    <strong>Contact Point:</strong> This email will be linked to your payment
                                    to ensure you receive your proof of purchase and support if needed.
                                </span>
                            </p>
                        </div>

                        <DialogFooter className="flex flex-col-reverse sm:flex-row gap-2 sm:gap-3">
                            <button
                                type="button"
                                disabled={isSubmitting}
                                onClick={() => onOpenChange(false)}
                                className="flex-1 px-4 py-2.5 text-sm font-medium rounded-lg border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
                            >
                                Cancel
                            </button>

                            <button
                                type="submit"
                                disabled={isSubmitting || !email.trim()}
                                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold rounded-lg bg-green-600 hover:bg-green-700 text-white transition-all shadow-sm disabled:opacity-50 active:scale-95"
                            >
                                {isSubmitting ? (
                                    <>
                                        <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                                        Processing...
                                    </>
                                ) : (
                                    <>
                                        <IoCard className="w-4 h-4" />
                                        Continue to Payment
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

export default function Paywall({ examNo, studentName, school }: PaywallProps) {
    const [isProcessing, setIsProcessing] = useState(false);
    const topLoader = useTopLoader()

    const handlePayment = async () => {
        if (isProcessing) return;
        try {
            setIsProcessing(true)
            // Store return URL for redirect after payment (encrypted)
            await setSecureItem('student-payment-return-url', '/result-checking/ubeat/dashboard')

            const response = await createPayment(examNo, ExamTypeEnum.UBEAT);

            if (response.authorizationUrl) {
                toast.success('Redirecting to payment gateway...')
                topLoader.start()
                // Redirect to Paystack payment page
                window.location.href = response.authorizationUrl
            } else {
                throw new Error('Invalid payment response')
            }
            return response.reference;
        } catch (error) {
            console.error('Payment error:', error)
            toast.error('Failed to initiate payment. Please try again.')
            setIsProcessing(false)
        } finally {
            topLoader.done()
        }
    }

    const [emailDialogOpen, setEmailDialogOpen] = useState(false)

    // Opens the email dialog (guarded: do nothing if not ready)
    const handleOpenEmailDialog = () => {
        if (isProcessing) return;

        setEmailDialogOpen(true)
    }

    // Called by EmailDialog once the user submits a valid email
    const handleSetEmail = async (email: string): Promise<string | undefined> => {
        console.info('Notification email set:', email)
        // Proceed to payment gateway
        const reference = await handlePayment();
        return reference
    }

    const handleLogOut = () => {
        toast('Come back soon!', {
            icon: '👋',
        })
        removeSecureItem('student_exam_no')
        removeSecureItem('selected_exam_type')
        window.location.href = '/result-checking/ubeat'
    }

    return (
        <>
            <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
                <div className="max-w-lg w-full">
                    {/* Main Card */}
                    <div className="bg-white rounded-3xl border border-gray-200 overflow-hidden">

                        {/* Header - Minimal */}
                        <div className="px-8 pt-8 pb-6 text-center border-b border-gray-100">
                            <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-gray-100 mb-4">
                                <IoLockClosedOutline className="w-7 h-7 text-gray-600" />
                            </div>
                            <h1 className="text-xl font-semibold text-gray-900 mb-1">
                                Results Access Required
                            </h1>
                            <p className="text-sm text-gray-500">
                                Complete this <span className="font-bold">One Time Payment</span> payment to view your UBEAT results
                            </p>
                        </div>

                        {/* Content */}
                        <div className="px-8 py-6">

                            {/* Student Info - Cleaner */}
                            <div className="mb-6 space-y-2.5">
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-500">Name</span>
                                    <span className="font-medium text-gray-900 capitalize">
                                        {studentName.toLowerCase()}
                                    </span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-500">School</span>
                                    <span className="font-medium text-gray-900 capitalize text-right max-w-[60%]">
                                        {school?.toLowerCase()}
                                    </span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-500">Exam Number</span>
                                    <span className="font-mono text-xs font-medium text-gray-900 uppercase">
                                        {examNo}
                                    </span>
                                </div>
                            </div>

                            {/* Divider */}
                            <div className="border-t border-gray-100 my-6"></div>

                            {/* Pricing - Clean */}
                            <div className="mb-6 text-center py-4">
                                <div className="flex items-baseline justify-center gap-1 mb-1">
                                    <span className="text-4xl font-semibold text-green-800">₦1,000</span>
                                </div>
                                <p className="text-xs text-gray-500">
                                    One-time payment · Lifetime access
                                </p>
                            </div>

                            {/* Divider */}
                            <div className="border-t border-gray-100 my-6"></div>
                            {/* Features - Minimal */}
                            <div className="mb-6">
                                <p className="text-xs uppercase tracking-wide font-medium text-gray-400 mb-3">
                                    What&apos;s Included
                                </p>
                                <div className="space-y-2.5">
                                    {[
                                        'Complete UBEAT results',
                                        'Official First School Leaving Certificate (FSLC) download',
                                        'Print-ready format',
                                        'Unlimited access'
                                    ].map((feature, index) => (
                                        <div key={index} className="flex items-center gap-2.5">
                                            <div className="w-1 h-1 rounded-full bg-gray-400"></div>
                                            <span className="text-sm text-gray-600">{feature}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Payment Button - Simple */}
                            <div className="grid gap-1">
                                <button
                                    onClick={handleOpenEmailDialog}
                                    disabled={isProcessing}
                                    className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-3 px-4 rounded-3xl transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed text-sm cursor-pointer"
                                >
                                    {isProcessing ? (
                                        <span className="flex items-center justify-center gap-2">
                                            <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                                            Processing...
                                        </span>
                                    ) : (
                                        'Continue to Payment'
                                    )}
                                </button>
                                <button
                                    onClick={handleLogOut}
                                    className="w-full cursor-pointer text-center text-sm text-gray-600 py-2 hover:text-red-600 transition-colors duration-150"
                                >
                                    I'll pay later
                                </button>
                            </div>

                            {/* Security Note - Subtle */}
                            <div className="mt-4 flex items-center justify-center gap-1.5 text-xs text-gray-400">
                                <IoShieldCheckmarkOutline className="w-3.5 h-3.5" />
                                <span>Secure payment via Paystack</span>
                            </div>
                        </div>
                    </div>

                    {/* Footer Note - Minimal */}
                    <div className="text-center mt-6">
                        <p className="text-xs text-gray-400">
                            Imo State Ministry of Primary Education - Nigeria
                        </p>
                    </div>
                </div>
            </div>
            <EmailDialog
                open={emailDialogOpen}
                onOpenChange={setEmailDialogOpen}
                onConfirm={handleSetEmail}
            />
        </>
    )
}
