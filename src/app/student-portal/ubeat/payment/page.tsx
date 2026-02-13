'use client'
import React, { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { IoCheckmarkCircle, IoCloseCircle, IoCard, IoShieldCheckmark } from 'react-icons/io5'
import Image from 'next/image'
import toast from 'react-hot-toast'
import Lottie from 'lottie-react'
import animationData from '../../assets/students.json'
import Link from 'next/link'

function PaymentContent() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const [paymentStatus, setPaymentStatus] = useState<'pending' | 'processing' | 'success' | 'failed'>('pending')
    const [studentData, setStudentData] = useState<any>(null)
    const [paymentReference, setPaymentReference] = useState('')

    useEffect(() => {
        // Get the reference from URL
        const ref = searchParams.get('ref')
        if (ref) {
            setPaymentReference(ref)
        }

        // Get stored form data
        const storedData = localStorage.getItem('ubeat_alt_form_data')
        if (storedData) {
            setStudentData(JSON.parse(storedData))
        } else {
            // Redirect back if no data found
            toast.error('No student data found. Please try again.')
            router.push('/student-portal/ubeat')
        }
    }, [searchParams, router])

    const handlePayment = async () => {
        setPaymentStatus('processing')

        try {
            // Simulate payment processing
            await new Promise(resolve => setTimeout(resolve, 3000))

            // In a real implementation, you would:
            // 1. Call Paystack/Flutterwave API
            // 2. Verify payment status
            // 3. If successful, call your backend to search for student
            // 4. Store student data and redirect to dashboard

            // For now, simulate success
            const mockStudentData = {
                _id: 'temp-' + Date.now(),
                name: studentData?.fullName || 'Student',
                examNo: 'TEMP/' + Date.now(),
                school: studentData?.schoolName || 'School',
                lga: studentData?.lga || 'LGA',
                examYear: studentData?.examYear || new Date().getFullYear(),
                subjects: {
                    'Mathematics': { ca: 20, exam: 65, total: 85, grade: 'A1' },
                    'English': { ca: 18, exam: 60, total: 78, grade: 'A1' },
                    'Science': { ca: 19, exam: 62, total: 81, grade: 'A1' },
                },
                paymentVerified: true
            }

            // Store data
            localStorage.setItem('student_data', JSON.stringify(mockStudentData))
            localStorage.setItem('student_exam_no', mockStudentData.examNo)
            localStorage.setItem('selected_exam_type', 'ubeat')
            localStorage.setItem('payment_verified', 'true')
            localStorage.removeItem('ubeat_alt_form_data')

            setPaymentStatus('success')

            // Redirect after 2 seconds
            setTimeout(() => {
                toast.success('Payment successful! Redirecting to dashboard...')
                router.push('/student-portal/ubeat/dashboard')
            }, 2000)

        } catch (error) {
            console.error('Payment error:', error)
            setPaymentStatus('failed')
            toast.error('Payment failed. Please try again.')
        }
    }

    const handleCancel = () => {
        if (confirm('Are you sure you want to cancel the payment?')) {
            localStorage.removeItem('ubeat_alt_form_data')
            router.push('/student-portal/ubeat')
        }
    }

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
                            <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded-full border border-green-200">
                                Secure
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
                    <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-8 animate-fadeIn-y hover:shadow-2xl transition-all duration-300">
                        {paymentStatus === 'pending' && (
                            <>
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
                                            Your payment is secured with 256-bit encryption
                                        </p>
                                    </div>
                                </div>

                                {/* Payment Methods Info */}
                                <div className="mb-6">
                                    <p className="text-xs text-gray-600 mb-3 font-medium">Accepted Payment Methods:</p>
                                    <div className="flex gap-2 flex-wrap">
                                        <span className="px-3 py-1.5 bg-gray-100 text-gray-700 text-xs rounded-full font-medium">💳 Debit Card</span>
                                        <span className="px-3 py-1.5 bg-gray-100 text-gray-700 text-xs rounded-full font-medium">🏦 Bank Transfer</span>
                                        <span className="px-3 py-1.5 bg-gray-100 text-gray-700 text-xs rounded-full font-medium">📱 USSD</span>
                                    </div>
                                </div>

                                {/* Action Buttons */}
                                <div className="space-y-3">
                                    <button
                                        onClick={handlePayment}
                                        className="w-full flex items-center justify-center px-4 py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition-all duration-200 active:scale-95 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 group"
                                    >
                                        <IoCard className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform" />
                                        Proceed to Payment
                                    </button>
                                    <button
                                        onClick={handleCancel}
                                        className="w-full px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg transition-all duration-200 active:scale-95 border border-gray-300"
                                    >
                                        Cancel Payment
                                    </button>
                                </div>
                            </>
                        )}

                        {paymentStatus === 'processing' && (
                            <div className="text-center py-8">
                                <div className="relative mb-6">
                                    <div className="animate-spin rounded-full h-16 w-16 border-4 border-green-200 border-t-green-600 mx-auto"></div>
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 mb-2">Processing Payment...</h3>
                                <p className="text-sm text-gray-600">Please wait while we verify your payment</p>
                                <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-3">
                                    <p className="text-xs text-blue-800">
                                        Do not close this window
                                    </p>
                                </div>
                            </div>
                        )}

                        {paymentStatus === 'success' && (
                            <div className="text-center py-8">
                                <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-4 animate-bounce">
                                    <IoCheckmarkCircle className="w-12 h-12 text-green-600" />
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 mb-2">Payment Successful! 🎉</h3>
                                <p className="text-sm text-gray-600 mb-4">Your results are now available</p>
                                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                                    <p className="text-sm text-green-800 font-medium">
                                        Redirecting to your dashboard...
                                    </p>
                                </div>
                            </div>
                        )}

                        {paymentStatus === 'failed' && (
                            <div className="text-center py-8">
                                <div className="inline-flex items-center justify-center w-20 h-20 bg-red-100 rounded-full mb-4">
                                    <IoCloseCircle className="w-12 h-12 text-red-600" />
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 mb-2">Payment Failed</h3>
                                <p className="text-sm text-gray-600 mb-6">Something went wrong. Please try again.</p>
                                <button
                                    onClick={() => setPaymentStatus('pending')}
                                    className="w-full px-4 py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition-all duration-200 active:scale-95"
                                >
                                    Try Again
                                </button>
                            </div>
                        )}

                        {/* Footer Link */}
                        {paymentStatus === 'pending' && (
                            <div className="mt-6 pt-6 border-t border-gray-200">
                                <p className="text-xs text-center text-gray-500">
                                    Need help? <Link href="/student-portal" className="text-green-600 hover:text-green-700 font-medium transition-all duration-150">Contact Support</Link>
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Info Box */}
                    {paymentStatus === 'pending' && (
                        <div className="mt-6 bg-linear-to-b from-white to-blue-100 border border-blue-200 rounded-2xl p-4 hover:bg-blue-100 hover:border-blue-300 transition-all duration-300">
                            <p className="text-sm text-blue-800">
                                <strong>💡 Tip:</strong> After payment, you can access your results anytime using your exam number.
                            </p>
                        </div>
                    )}

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

export default function PaymentPage() {
    return (
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
    )
}
