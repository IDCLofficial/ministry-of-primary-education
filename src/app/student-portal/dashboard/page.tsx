'use client'
import React, { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { IoLogOut, IoDownload, IoPrint, IoSchool, IoSparkles } from 'react-icons/io5'
import toast from 'react-hot-toast'
import StudentInfoCard from './components/StudentInfoCard'
import ResultsCard from './components/ResultsCard'
import CertificateModal from '@/components/CertificateModal'
import Paywall from './components/Paywall'
import { checkStudentResult, StudentData, checkPaymentStatus, PaymentStatus } from '../utils/api'

// Regex pattern for exam number validation (e.g., ok/977/2025/001)
const EXAM_NO_REGEX = /^[a-zA-Z]{2}\/\d{3}\/\d{4}\/\d{3}$/
const EXAM_NO_REGEX_02 = /^[a-zA-Z]{2}\/\d{3}\/\d{3,4}(\(\d\))?$/

export default function StudentDashboardPage() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const [student, setStudent] = useState<StudentData | null>(null);
    const [paymentStatus, setPaymentStatus] = useState<PaymentStatus | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [isCheckingPayment, setIsCheckingPayment] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [isCertificateModalOpen, setIsCertificateModalOpen] = useState(false)

    // Check for payment success from URL params
    useEffect(() => {
        const paymentSuccess = searchParams.get('payment')
        if (paymentSuccess === 'success') {
            toast.success('Payment successful! Welcome to your results.')
            // Remove the query param
            window.history.replaceState({}, '', '/student-portal/dashboard')
        } else if (paymentSuccess === 'failed') {
            toast.error('Payment failed. Please try again.')
            window.history.replaceState({}, '', '/student-portal/dashboard')
        }
    }, [searchParams])

    useEffect(() => {
        const checkPaymentAndFetchData = async () => {
            const examNo = localStorage.getItem('student_exam_no');

            if (!examNo) {
                router.push('/student-portal')
                return
            }

            // Validate exam number format
            if (!EXAM_NO_REGEX.test(examNo) && !EXAM_NO_REGEX_02.test(examNo)) {
                setError('Invalid exam number format')
                setTimeout(() => {
                    localStorage.removeItem('student_exam_no')
                    localStorage.removeItem('student_data')
                    router.push('/student-portal')
                }, 3000)
                setIsLoading(false)
                setIsCheckingPayment(false)
                return
            }

            try {
                // First, check payment status
                const paymentData = await checkPaymentStatus(examNo)
                setPaymentStatus(paymentData)
                setIsCheckingPayment(false)

                // If payment is confirmed, fetch student results
                if (paymentData.paid) {
                    const examNoClean = examNo.replace(/\s/g, '').replace(/\//g, '-');
                    const studentData = await checkStudentResult(examNoClean);
                    setStudent(studentData)
                    setError(null)
                }
            } catch (err) {
                console.error('Error checking payment or fetching data:', err)
                let errorMessage = 'Something went wrong'
                
                if (err instanceof Error) {
                    if (err.message.includes('404') || err.message.includes('not found')) {
                        errorMessage = 'Student not found. Please check your exam number.'
                    } else if (err.message.includes('400') || err.message.includes('Invalid')) {
                        errorMessage = 'Invalid exam number'
                    } else if (err.message.includes('500') || err.message.includes('Server')) {
                        errorMessage = 'Server error. Please try again later.'
                    }
                }
                
                setError(errorMessage)
                setIsCheckingPayment(false)
                
                // Auto logout after showing error
                setTimeout(() => {
                    localStorage.removeItem('student_exam_no')
                    localStorage.removeItem('student_data')
                    router.push('/student-portal')
                }, 5000)
            } finally {
                setIsLoading(false)
            }
        }

        checkPaymentAndFetchData()
    }, [router, searchParams])

    const handleLogout = () => {
        localStorage.removeItem('student_exam_no')
        localStorage.removeItem('student_data')
        localStorage.removeItem('student-payment-return-url')
        toast.success('Logged out successfully')
        router.push('/student-portal')
    }

    const handleDownload = () => {
        setIsCertificateModalOpen(true)
    }

    const handlePrint = () => {
        setIsCertificateModalOpen(true)
    }

    // Show loading while checking payment or fetching data
    if (isLoading || isCheckingPayment) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-green-50">
                <header className="bg-white/80 backdrop-blur-xl border-b border-gray-200/50 sticky top-0 z-50">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center shadow-lg shadow-green-500/30">
                                <IoSchool className="w-5 h-5 text-white" />
                            </div>
                            <div>
                                <h1 className="text-base font-bold text-gray-900">BECE Results</h1>
                                <p className="text-xs text-gray-500">Student Portal</p>
                            </div>
                        </div>
                    </div>
                </header>
                <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                    <div className="flex items-center justify-center min-h-[60vh]">
                        <div className="text-center">
                            <div className="relative mb-6">
                                <div className="animate-spin rounded-full h-16 w-16 border-4 border-gray-200 border-t-green-600 mx-auto"></div>
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <IoSparkles className="w-6 h-6 text-green-600 animate-pulse" />
                                </div>
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                {isCheckingPayment ? 'Verifying Access' : 'Loading Results'}
                            </h3>
                            <p className="text-sm text-gray-500">
                                {isCheckingPayment ? 'Checking your payment status...' : 'Preparing your examination results...'}
                            </p>
                        </div>
                    </div>
                </main>
            </div>
        )
    }

    // Show paywall if payment is not confirmed
    if (paymentStatus && !paymentStatus.paid) {
        return <Paywall 
            examNo={localStorage.getItem('student_exam_no') || ''} 
            studentName={paymentStatus.studentName}
            school={paymentStatus.school}
        />
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-red-50 flex items-center justify-center p-4">
                <div className="text-center max-w-md">
                    <div className="w-20 h-20 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-red-500/10">
                        <svg className="w-10 h-10 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-3">Unable to Load Results</h2>
                    <p className="text-gray-600 mb-4">{error}</p>
                    <div className="bg-gray-50 rounded-xl p-4 mb-6 border border-gray-200">
                        <p className="text-sm text-gray-500">
                            Redirecting to login in 5 seconds...
                        </p>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white font-medium rounded-xl hover:shadow-lg hover:shadow-green-500/30 transition-all duration-200 active:scale-95"
                    >
                        <IoLogOut className="w-4 h-4" />
                        Return to Login
                    </button>
                </div>
            </div>
        )
    }

    if (!student) {
        return null
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-green-50 print:bg-white">
            {/* Header */}
            <header className="bg-white/80 backdrop-blur-xl border-b border-gray-200/50 sticky top-0 z-50 print:hidden">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                    {/* Logo */}
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center shadow-lg shadow-green-500/30 transition-transform hover:scale-105">
                            <IoSchool className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <h1 className="text-base font-bold text-gray-900">BECE Results</h1>
                            <p className="text-xs text-gray-500">Student Portal</p>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2">
                        <button
                            onClick={handlePrint}
                            className="hidden sm:inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 border border-gray-300 rounded-xl transition-all duration-200 hover:shadow-md active:scale-95"
                        >
                            <IoPrint className="w-4 h-4" />
                            <span className="hidden md:inline">Print</span>
                        </button>
                        <button
                            onClick={handleDownload}
                            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-green-700 bg-green-50 hover:bg-green-100 border border-green-200 rounded-xl transition-all duration-200 hover:shadow-md active:scale-95"
                        >
                            <IoDownload className="w-4 h-4" />
                            <span className="hidden md:inline">Download</span>
                        </button>
                        <button
                            onClick={handleLogout}
                            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-red-500 to-red-600 rounded-xl transition-all duration-200 hover:shadow-lg hover:shadow-red-500/30 active:scale-95"
                        >
                            <IoLogOut className="w-4 h-4" />
                            <span className="hidden md:inline">Logout</span>
                        </button>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 print:py-0">
                {/* Welcome Banner */}
                <div className="mb-8 print:hidden">
                    <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-2xl p-8 text-white shadow-xl shadow-green-500/20">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                                <IoSparkles className="w-6 h-6" />
                            </div>
                            <div>
                                <h2 className="text-2xl md:text-3xl font-bold">
                                    Welcome back, <span className="capitalize">{student.name.toLowerCase()}</span>!
                                </h2>
                                <p className="text-green-100 text-sm mt-1">
                                    Your BECE examination results are ready
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Print Header (Only visible when printing) */}
                <div className="hidden print:block mb-8 text-center border-b-2 border-gray-300 pb-6">
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">
                        Basic Education Certificate Examination (BECE)
                    </h1>
                    <p className="text-lg text-gray-700">
                        Official Results Statement
                    </p>
                    <p className="text-sm text-gray-600 mt-2">
                        Academic Year 2024
                    </p>
                </div>

                {/* Content Grid */}
                <div className="space-y-6 mb-8">
                    {/* Student Info */}
                    <StudentInfoCard student={student} />

                    {/* Results */}
                    <ResultsCard student={student} />
                </div>

                {/* Info Footer */}
                <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6 mb-8 print:hidden">
                    <div className="flex items-start gap-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
                            <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <div className="flex-1">
                            <h3 className="text-sm font-semibold text-blue-900 mb-1">Keep your results safe</h3>
                            <p className="text-sm text-blue-700">
                                Download or print this page for your records. You can access your results anytime by logging in with your exam number.
                            </p>
                        </div>
                    </div>
                </div>
            </main>

            {/* Print Footer */}
            <footer className="hidden print:block mt-12 pt-6 border-t-2 border-gray-300 text-center text-sm text-gray-600">
                <p>Imo State Ministry of Primary Education - Nigeria</p>
                <p className="mt-1">This is an official document. Any alterations will render it invalid.</p>
                <p className="mt-2 text-xs">Printed on: {new Date().toLocaleDateString()}</p>
            </footer>

            {/* Certificate Modal */}
            {student && (
                <CertificateModal
                    isOpen={isCertificateModalOpen}
                    onClose={() => setIsCertificateModalOpen(false)}
                    student={student}
                    schoolName={student.schoolName}
                />
            )}
        </div>
    )
}
