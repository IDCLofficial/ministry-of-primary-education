'use client'
import React, { useState, useEffect, Suspense, useMemo } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { IoCard, IoShieldCheckmark, IoPhonePortrait, IoWallet } from 'react-icons/io5'
import Image from 'next/image'
import toast from 'react-hot-toast'
import Lottie from 'lottie-react'
import animationData from '../../assets/students.json'
import { verifyPayment } from '../../utils/api'

interface PaystackResponse {
    id?: number | string
    amount?: number
    paid_at?: string
    paidAt?: string
    created_at?: string
    createdAt?: string
    channel?: string
    gateway_response?: string
    authorization?: {
        last4?: string
        bank?: string
        card_type?: string
        [key: string]: unknown
    }
}

function PaymentContent() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const [paymentStatus, setPaymentStatus] = useState<'pending' | 'processing' | 'success' | 'failed'>('pending')
    const [studentData, setStudentData] = useState<{ fullName: string, schoolName: string, lga: string, examYear: string } | null>(null)
    const [paymentUrl, setPaymentUrl] = useState<string>('')
    const [paymentReference, setPaymentReference] = useState<string>('')
    const [copied, setCopied] = useState(false)
    const [paymentDetails, setPaymentDetails] = useState<{
        reference: string
        trxref: string
        studentName?: string
        school?: string
        examNumber?: string
        examYear?: number
        transactionId?: string
        amount?: number
        paidAt?: string
        createdAt?: string
        paymentMethod?: string
        channel?: string
        gatewayResponse?: string
        last4?: string
        bank?: string
        cardType?: string
    } | null>(null)

    // Get reference from URL parameters (for callback)
    const trxref = searchParams.get('trxref')
    const reference = searchParams.get('reference')

    const paymentReturnUrl = useMemo(() => 
        localStorage.getItem('student-payment-return-url') || '/student-portal/ubeat/dashboard', 
        []
    )

    // Check if this is a callback (has reference) or initial payment page
    const isCallback = !!reference

    // Load payment data on mount
    useEffect(() => {
        if (!isCallback) {
            // This is the initial payment page, load stored data
            const storedPaymentUrl = localStorage.getItem('ubeat_payment_url')
            const storedPaymentRef = localStorage.getItem('ubeat_payment_reference')
            const storedData = localStorage.getItem('ubeat_alt_form_data')

            if (storedPaymentUrl && storedPaymentRef && storedData) {
                setPaymentUrl(storedPaymentUrl)
                setPaymentReference(storedPaymentRef)
                setStudentData(JSON.parse(storedData))
                setPaymentStatus('pending')
            } else {
                // No payment data found, redirect back
                toast.error('No payment data found. Please try again.')
                router.push('/student-portal/ubeat')
            }
        }
    }, [isCallback, router])

    // Verify payment on mount if this is a callback
    useEffect(() => {
        const verifyUBEATPayment = async () => {
            if (!reference) {
                return
            }

            setPaymentStatus('processing')

            try {
                const response = await verifyPayment(reference)
                
                if (response.paymentStatus === 'successful') {
                    // Extract student info from paystack metadata
                    const customFields = response.paystackResponse?.metadata?.custom_fields || []
                    const studentNameField = customFields.find(f => f.variable_name === 'student_name')
                    const schoolField = customFields.find(f => f.variable_name === 'school')
                    
                    const studentName = studentNameField?.value || response.studentName || ''
                    const school = schoolField?.value || response.school || ''
                    
                    // Extract payment details from paystackResponse
                    const paystackData = response.paystackResponse as PaystackResponse
                    const amount = paystackData?.amount || 0
                    const paidAt = paystackData?.paid_at || paystackData?.paidAt || response.paidAt
                    const createdAt = paystackData?.created_at || paystackData?.createdAt
                    const channel = paystackData?.channel || ''
                    const gatewayResponse = paystackData?.gateway_response || ''
                    const authorization = paystackData?.authorization || {}
                    
                    setPaymentStatus('success')
                    setPaymentDetails({
                        reference,
                        trxref: trxref || '',
                        studentName,
                        school,
                        examNumber: response.examNumber,
                        examYear: response.examYear,
                        transactionId: String(response.paystackTransactionId || paystackData?.id || ''),
                        amount: amount / 100, // Convert from kobo to naira
                        paidAt,
                        createdAt,
                        paymentMethod: response.paymentMethod,
                        channel: channel.charAt(0).toUpperCase() + channel.slice(1), // Capitalize
                        gatewayResponse: gatewayResponse,
                        last4: authorization?.last4 || '',
                        bank: authorization?.bank || '',
                        cardType: authorization?.card_type?.trim() || ''
                    })
                    
                    // Store exam number for dashboard access
                    if (response.examNumber) {
                        localStorage.setItem('student_exam_no', response.examNumber)
                        localStorage.setItem('selected_exam_type', 'ubeat')
                    }
                    
                    // Clean up payment data
                    localStorage.removeItem('ubeat_payment_url')
                    localStorage.removeItem('ubeat_payment_reference')
                    localStorage.removeItem('ubeat_alt_form_data')
                } else {
                    setPaymentStatus('failed')
                }
            } catch (error) {
                console.error('Payment verification error:', error)
                setPaymentStatus('failed')
            }
        }

        if (isCallback) {
            verifyUBEATPayment()
        }
    }, [reference, trxref, isCallback])

    // Set initial payment details from URL
    useEffect(() => {
        if (trxref && reference) {
            setPaymentDetails(prev => ({
                reference,
                trxref,
                studentName: prev?.studentName,
                school: prev?.school
            }))
        }
    }, [trxref, reference])

    // No auto-redirect - user decides when to go to dashboard

    const handlePayment = () => {
        // Redirect to payment gateway (URL already constructed with reference on login page)
        window.location.href = paymentUrl
    }

    const handleCancel = () => {
        if (confirm('Are you sure you want to cancel the payment?')) {
            localStorage.removeItem('ubeat_payment_url')
            localStorage.removeItem('ubeat_payment_reference')
            localStorage.removeItem('ubeat_alt_form_data')
            router.push('/student-portal/ubeat')
        }
    }

    const handleCopyExamNumber = async () => {
        if (paymentDetails?.examNumber) {
            try {
                await navigator.clipboard.writeText(paymentDetails.examNumber)
                setCopied(true)
                toast.success('Exam number copied to clipboard!')
                setTimeout(() => setCopied(false), 2000)
            } catch (error) {
                console.error('Failed to copy:', error)
                toast.error('Failed to copy exam number')
            }
        }
    }

    const handleContinue = () => {
        router.replace(`${paymentReturnUrl}?payment=success`)
    }

    const handleRetry = () => {
        router.replace('/student-portal/ubeat')
    }

    if (paymentStatus === 'pending') {
        return (
            <div className="min-h-screen bg-[#F3F3F3] flex flex-col relative overflow-hidden">
                {/* Background Image */}
                <div className='absolute h-full w-full inset-0 z-[0]'>
                    <Image
                        src="/images/asset.png"
                        alt="background"
                        fill
                        className='object-cover hue-rotate-[0deg] saturate-200 brightness-[0.75] scale-x-[-1]'
                        title='Imo State Ministry of Primary and Secondary Education logo'
                    />
                </div>

                {/* Lottie Animation - Bottom Right */}
                <div className="fixed inset-0 h-screen w-screen flex animate-fadeIn-y sm:justify-end justify-center items-end pointer-events-none">
                    <Lottie
                        animationData={animationData}
                        loop={true}
                        autoPlay={true}
                        className='max-sm:hidden mb-5'
                        style={{
                            height: '40vmin',
                        }}
                    />
                </div>

                {/* Ministry Header */}
                <header className="w-full pt-8 pb-6 px-4 relative z-20">
                    <div className="flex flex-col justify-center gap-3 items-center">
                        <Image
                            src="/images/ministry-logo.png"
                            alt="logo"
                            width={60}
                            height={60}
                            className='object-contain'
                            title='Imo State Ministry of Primary and Secondary Education logo'
                        />
                        <div className="text-center">
                            <div className="flex items-center justify-center gap-2 mb-1">
                                <span className='text-2xl md:text-3xl font-bold'>
                                    <abbr title="Universal Basic Education Achievement Test" className="no-underline">UBEAT</abbr> Payment
                                </span>
                            </div>
                            <p className='text-sm md:text-base text-gray-600 max-w-md'>
                                Complete your payment to access your results
                            </p>
                        </div>
                    </div>
                </header>

                <div className="flex-1 flex items-center justify-center p-4">
                    <div className="w-full max-w-md relative z-10">
                        {/* Payment Card */}
                        <div className="bg-white rounded-3xl shadow-xl border border-gray-200 p-8 animate-fadeIn-y hover:shadow-2xl transition-all duration-300">
                            {/* Student Details */}
                            <div className="mb-6">
                                <h2 className="text-xl font-bold text-gray-900 mb-4">Student Information</h2>
                                <div className="space-y-3 text-sm bg-gray-50 rounded-lg p-4 border border-gray-200">
                                    <div className="flex justify-between">
                                        <span className="text-gray-600 font-medium">Name:</span>
                                        <span className="font-semibold text-gray-900">{studentData?.fullName}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600 font-medium">School:</span>
                                        <span className="font-semibold text-gray-900 text-right max-w-[60%] truncate" title={studentData?.schoolName}>{studentData?.schoolName}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600 font-medium">LGA:</span>
                                        <span className="font-semibold text-gray-900">{studentData?.lga}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600 font-medium">Exam Year:</span>
                                        <span className="font-semibold text-gray-900">{studentData?.examYear}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="border-t border-gray-200 pt-6 mb-6">
                                <div className="bg-gradient-to-r from-green-50 to-green-100 rounded-xl p-4 border border-green-200">
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="text-gray-700 font-medium">Amount to Pay:</span>
                                        <span className="text-3xl font-bold text-green-600">₦500</span>
                                    </div>
                                    <p className="text-xs text-gray-600">
                                        Reference: <span className="font-mono">{paymentReference}</span>
                                    </p>
                                </div>
                            </div>

                            {/* Security Badge */}
                            <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-6">
                                <div className="flex items-center gap-2">
                                    <IoShieldCheckmark className="w-5 h-5 text-green-600 flex-shrink-0" />
                                    <p className="text-xs text-green-800">
                                        Your payment is secured
                                    </p>
                                </div>
                            </div>

                            {/* Payment Methods Info */}
                            <div className="mb-6">
                                <p className="text-xs text-gray-600 mb-3 font-medium">Accepted Payment Methods:</p>
                                <div className="flex gap-2 flex-wrap">
                                    <span className="flex-1 justify-center border border-gray-200 px-3 py-1.5 bg-gray-100 text-gray-700 text-xs rounded-full font-medium flex items-center gap-1"><IoCard className="w-4 h-4" /> Debit Card</span>
                                    <span className="flex-1 justify-center border border-gray-200 px-3 py-1.5 bg-gray-100 text-gray-700 text-xs rounded-full font-medium flex items-center gap-1"><IoWallet className="w-4 h-4" /> Bank Transfer</span>
                                    <span className="flex-1 justify-center border border-gray-200 px-3 py-1.5 bg-gray-100 text-gray-700 text-xs rounded-full font-medium flex items-center gap-1"><IoPhonePortrait className="w-4 h-4" /> USSD</span>
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="space-y-3">
                                <button
                                    onClick={handlePayment}
                                    className="w-full flex items-center justify-center px-4 py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition-all duration-200 active:scale-95 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 group cursor-pointer"
                                >
                                    <IoCard className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform" />
                                    Proceed to Payment
                                </button>
                                <button
                                    onClick={handleCancel}
                                    className="w-full px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg transition-all duration-200 active:scale-95 border border-gray-300 cursor-pointer"
                                >
                                    Cancel Payment
                                </button>
                            </div>
                        </div>

                        {/* Info Box */}
                        <div className="mt-6 bg-linear-to-b from-white to-blue-100 border border-blue-200 rounded-2xl p-4 hover:bg-blue-100 hover:border-blue-300 transition-all duration-300">
                            <p className="text-sm text-blue-800">
                                <strong>💡 Tip:</strong> After payment, you can access your results anytime using your exam number.
                            </p>
                        </div>

                        {/* Copyright Footer */}
                        <div className="mt-6 text-center">
                            <p className="text-xs text-gray-600">
                                © {new Date().getFullYear()} Imo State Ministry of Primary and Secondary Education
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    if (paymentStatus === 'processing') {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
                <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-green-600 mx-auto mb-6"></div>
                    <h2 className="text-xl font-semibold text-gray-900 mb-2">Processing Payment</h2>
                    <p className="text-gray-600 mb-4">Please wait while we verify your payment...</p>
                    <div className="bg-gray-50 rounded-lg p-4">
                        <p className="text-sm text-gray-600 mb-1">Transaction Reference</p>
                        <p className="font-mono text-sm text-gray-900">{paymentDetails?.reference}</p>
                    </div>
                </div>
            </div>
        )
    }

    if (paymentStatus === 'success') {
        return (
            <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-green-50 flex items-center justify-center p-4">
                <div className="w-full max-w-2xl print-full-width">
                    {/* Ministry Logo & Success Message */}
                    <div className="text-center mb-6 no-print">
                        <div className="inline-flex items-center justify-center mb-4">
                            <Image
                                src="/images/ministry-logo.png"
                                alt="Ministry Logo"
                                width={100}
                                height={100}
                                className="object-contain"
                            />
                        </div>
                        <h2 className="text-3xl font-bold text-gray-900 mb-2">Payment Successful! 🎉</h2>
                        <p className="text-gray-600 text-lg">Your results are now available</p>
                    </div>

                    {/* Main Card */}
                    <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
                        {/* Print Only Header */}
                        <div className="hidden print:block p-6 border-b border-gray-200">
                            <div className="flex items-center gap-4 mb-4">
                                <Image
                                    src="/images/ministry-logo.png"
                                    alt="Ministry Logo"
                                    width={60}
                                    height={60}
                                    className="object-contain"
                                />
                                <div className="flex-1">
                                    <h1 className="text-2xl font-bold text-gray-900">Payment Receipt</h1>
                                    <p className="text-sm text-gray-600 mt-1">Imo State Ministry of Primary and Secondary Education</p>
                                    <p className="text-xs text-gray-500 mt-1">
                                        <abbr title="Universal Basic Education Achievement Test" className="no-underline">UBEAT</abbr> Examination - {paymentDetails?.examYear || new Date().getFullYear()}
                                    </p>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="text-xs text-gray-500">
                                    Printed: {new Date().toLocaleDateString('en-US', { 
                                        year: 'numeric', 
                                        month: 'long', 
                                        day: 'numeric' 
                                    })} at {new Date().toLocaleTimeString('en-US')}
                                </p>
                            </div>
                        </div>

                        {/* Exam Number Banner */}
                        {paymentDetails?.examNumber && (
                            <div className="bg-gradient-to-r from-green-600 to-green-700 text-white p-6 text-center print:bg-green-600 relative overflow-hidden">
                                <div className="absolute top-2 right-2 no-print">
                                    <div className="bg-white/20 backdrop-blur-sm text-white text-xs px-3 py-1 rounded-full border border-white/30">
                                        <abbr title="Universal Basic Education Achievement Test" className="no-underline">UBEAT</abbr>
                                    </div>
                                </div>
                                <p className="text-sm uppercase tracking-wide mb-2 opacity-90">Your Exam Number</p>
                                <div 
                                    className="inline-block cursor-pointer group relative no-print"
                                    onClick={handleCopyExamNumber}
                                >
                                    <p className="text-3xl md:text-4xl font-bold tracking-wider font-mono hover:scale-105 transition-transform duration-200">
                                        {paymentDetails.examNumber}
                                    </p>
                                    <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 bg-white text-gray-900 text-xs px-3 py-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap shadow-lg">
                                        {copied ? '✓ Copied!' : 'Click to copy'}
                                    </div>
                                </div>
                                <p className="text-3xl md:text-4xl font-bold tracking-wider font-mono hidden print:block">
                                    {paymentDetails.examNumber}
                                </p>
                                <p className="text-sm mt-6 opacity-90 no-print">Click the exam number to copy</p>
                                <p className="text-sm mt-2 opacity-90 hidden print:block">Save this number for future reference</p>
                            </div>
                        )}

                        {/* Payment Details Grid */}
                        <div className="p-6 space-y-6">
                            {/* Student Information Section */}
                            <div>
                                <h3 className="font-semibold text-gray-900 text-lg mb-3 flex items-center gap-2">
                                    <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                    </svg>
                                    Student Information
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {paymentDetails?.studentName && (
                                        <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                                            <p className="text-xs text-gray-500 mb-1 uppercase tracking-wide">Student Name</p>
                                            <p className="font-semibold text-gray-900 capitalize">
                                                {paymentDetails.studentName.toLowerCase()}
                                            </p>
                                        </div>
                                    )}
                                    
                                    {paymentDetails?.school && (
                                        <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                                            <p className="text-xs text-gray-500 mb-1 uppercase tracking-wide">School</p>
                                            <p className="font-semibold text-gray-900 capitalize">
                                                {paymentDetails.school.toLowerCase()}
                                            </p>
                                        </div>
                                    )}
                                    
                                    {paymentDetails?.examYear && (
                                        <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                                            <p className="text-xs text-gray-500 mb-1 uppercase tracking-wide">Exam Year</p>
                                            <p className="font-semibold text-gray-900">
                                                {paymentDetails.examYear}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Transaction Details Section */}
                            <div className="border-t border-gray-200 pt-6">
                                <h3 className="font-semibold text-gray-900 text-lg mb-3 flex items-center gap-2">
                                    <IoCard className="w-5 h-5 text-green-600" />
                                    Transaction Details
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="bg-green-50 rounded-lg p-4 border border-green-200 md:col-span-2">
                                        <p className="text-xs text-gray-500 mb-1 uppercase tracking-wide">Amount Paid</p>
                                        <p className="font-bold text-3xl text-green-600">
                                            ₦{paymentDetails?.amount?.toLocaleString() || '500'}
                                        </p>
                                    </div>
                                    
                                    {paymentDetails?.transactionId && (
                                        <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                                            <p className="text-xs text-gray-500 mb-1 uppercase tracking-wide">Transaction ID</p>
                                            <p className="font-mono text-sm text-gray-900">
                                                {paymentDetails.transactionId}
                                            </p>
                                        </div>
                                    )}
                                    
                                    <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                                        <p className="text-xs text-gray-500 mb-1 uppercase tracking-wide">Payment Reference</p>
                                        <p className="font-mono text-xs text-gray-900 break-all">
                                            {paymentDetails?.reference}
                                        </p>
                                    </div>
                                    
                                    {paymentDetails?.paidAt && (
                                        <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                                            <p className="text-xs text-gray-500 mb-1 uppercase tracking-wide">Payment Date</p>
                                            <p className="font-semibold text-gray-900">
                                                {new Date(paymentDetails.paidAt).toLocaleDateString('en-US', { 
                                                    year: 'numeric', 
                                                    month: 'long', 
                                                    day: 'numeric' 
                                                })}
                                            </p>
                                            <p className="text-xs text-gray-500 mt-1">
                                                {new Date(paymentDetails.paidAt).toLocaleTimeString('en-US')}
                                            </p>
                                        </div>
                                    )}
                                    
                                    {paymentDetails?.channel && (
                                        <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                                            <p className="text-xs text-gray-500 mb-1 uppercase tracking-wide">Payment Method</p>
                                            <p className="font-semibold text-gray-900 capitalize">
                                                {paymentDetails.channel}
                                            </p>
                                        </div>
                                    )}
                                    
                                    {paymentDetails?.last4 && (
                                        <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                                            <p className="text-xs text-gray-500 mb-1 uppercase tracking-wide">Card Details</p>
                                            <p className="font-semibold text-gray-900">
                                                {paymentDetails.cardType && <span className="uppercase mr-2">{paymentDetails.cardType}</span>}
                                                **** {paymentDetails.last4}
                                            </p>
                                            {paymentDetails.bank && (
                                                <p className="text-xs text-gray-500 mt-1 capitalize">
                                                    {paymentDetails.bank.toLowerCase()}
                                                </p>
                                            )}
                                        </div>
                                    )}
                                    
                                    {paymentDetails?.gatewayResponse && (
                                        <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                                            <p className="text-xs text-gray-500 mb-1 uppercase tracking-wide">Status</p>
                                            <p className="font-semibold text-green-600">
                                                {paymentDetails.gatewayResponse}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>

                        </div>

                        {/* Action Buttons */}
                        <div className="p-6 bg-gray-50 border-t border-gray-200 space-y-3 no-print">
                            <button
                                onClick={handleContinue}
                                className="w-full flex items-center justify-center gap-2 bg-green-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-green-700 transition-all duration-200 active:scale-95 shadow-md hover:shadow-lg cursor-pointer"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                                Go to Dashboard
                            </button>
                            
                            <button
                                onClick={() => window.print()}
                                className="w-full flex items-center justify-center gap-2 bg-white text-gray-700 py-3 px-4 rounded-lg font-medium hover:bg-gray-100 transition-all duration-200 active:scale-95 border-2 border-gray-300 cursor-pointer"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                                Download Receipt
                            </button>
                        </div>
                    </div>

                    {/* Footer Info */}
                    <div className="mt-6 text-center">
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 print:border-t print:border-gray-300 print:rounded-none print:mt-0">
                            <p className="text-sm text-gray-600 flex items-center justify-center gap-2">
                                <IoShieldCheckmark className="w-5 h-5 text-green-600" />
                                <span><strong>Secure Transaction:</strong> Your payment was processed securely via Paystack</span>
                            </p>
                            <div className="mt-3 pt-3 border-t border-gray-200 print:block hidden">
                                <p className="text-xs text-gray-500">
                                    This is an official payment receipt. For verification, please visit the Ministry website or contact support with your transaction reference.
                                </p>
                                <p className="text-xs text-gray-500 mt-2">
                                    Transaction verified at: {paymentDetails?.paidAt && new Date(paymentDetails.paidAt).toLocaleString()}
                                </p>
                            </div>
                        </div>
                        <p className="text-xs text-gray-500 mt-4">
                            © {new Date().getFullYear()} Imo State Ministry of Primary and Secondary Education
                        </p>
                    </div>
                </div>
            </div>
        )
    }

    // Failed state
    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full text-center">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </div>

                <h2 className="text-2xl font-bold text-gray-900 mb-2">Payment Failed</h2>
                <p className="text-gray-600 mb-4">
                    We couldn&apos;t process your payment. This could be due to insufficient funds, network issues, or other payment gateway problems.
                </p>

                <div className="bg-red-50 rounded-lg p-4 mb-6">
                    <p className="text-sm text-red-800">
                        If you were charged, don&apos;t worry. The amount will be refunded within 3-5 business days.
                    </p>
                </div>

                <div className="space-y-3">
                    <button
                        onClick={handleRetry}
                        className="w-full bg-green-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-green-700 transition-colors duration-200"
                    >
                        Try Again
                    </button>
                    <button
                        onClick={() => router.push('/student-portal')}
                        className="w-full bg-gray-200 text-gray-800 py-3 px-4 rounded-lg font-medium hover:bg-gray-300 transition-colors duration-200"
                    >
                        Back to Login
                    </button>
                </div>
            </div>
        </div>
    )
}

export default function PaymentPage() {
    return (
        <>
            <style dangerouslySetInnerHTML={{
                __html: `
                    @media print {
                        @page {
                            margin: 0.5in;
                        }
                        body {
                            background: white !important;
                            -webkit-print-color-adjust: exact;
                            print-color-adjust: exact;
                        }
                        .no-print {
                            display: none !important;
                        }
                        .print-full-width {
                            max-width: 100% !important;
                            box-shadow: none !important;
                        }
                        .print\\:block {
                            display: block !important;
                        }
                    }
                `
            }} />
            <Suspense fallback={
                <div className="min-h-screen bg-[#F3F3F3] flex items-center justify-center relative overflow-hidden">
                    <div className='absolute h-full w-full inset-0 z-[0]'>
                        <Image
                            src="/images/asset.png"
                            alt="background"
                            fill
                            className='object-cover hue-rotate-[0deg] saturate-200 brightness-[0.75] scale-x-[-1]'
                        />
                    </div>
                    <div className="animate-spin rounded-full h-16 w-16 border-4 border-green-200 border-t-green-600 relative z-10"></div>
                </div>
            }>
                <PaymentContent />
            </Suspense>
        </>
    )
}
