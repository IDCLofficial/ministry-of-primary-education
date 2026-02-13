'use client'
// BECE Dashboard - This dashboard is specifically for BECE (Basic Education Certificate Examination) results
// Each exam type (UBEAT, BECE, etc.) has its own dedicated dashboard

import React, { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { IoLogOut, IoDownload, IoPrint, IoSchool, IoSparkles, IoSwapHorizontal } from 'react-icons/io5'
import toast from 'react-hot-toast'
import StudentInfoCard from './components/StudentInfoCard'
import ResultsCard from './components/ResultsCard'
import CertificateModal from '@/components/CertificateModal'
import Paywall from './components/Paywall'
import { checkStudentResult, StudentData, checkPaymentStatus, PaymentStatus } from '../utils/api'
import Image from 'next/image'

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
    const [examType, setExamType] = useState<string>('bece')

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
            const selectedExamType = localStorage.getItem('selected_exam_type');

            if (!examNo) {
                router.push('/student-portal')
                return
            }

            // Redirect to landing page if no exam type is selected
            if (!selectedExamType) {
                router.push('/student-portal')
                return
            }

            // Set exam type state
            setExamType(selectedExamType)

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
                    console.log({ studentData })
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
        localStorage.removeItem('selected_exam_type')
        toast.success('Logged out successfully')
        router.push('/student-portal')
    }

    const handleChangeExam = () => {
        // Clear selection and return to exam selection
        localStorage.removeItem('selected_exam_type')
        toast('Returning to exam selection...', { icon: '🔄' })
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
                                <h1 className="text-base font-bold text-gray-900">
                                    {examType.toUpperCase()} Results
                                </h1>
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
        <div className="min-h-screen bg-gray-50 print:bg-white">
            {/* Header */}
            <header className="bg-white border-b border-gray-200 sticky top-0 z-50 print:hidden">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                    {/* Logo */}
                    <div className="flex items-center gap-3">
                        <Image 
                            src="/images/ministry-logo.png" 
                            width={40}
                            height={40}
                            alt="Ministry Logo" 
                            className="h-10 w-auto object-contain"
                        />
                        <div className="border-l border-gray-300 pl-3">
                            <h1 className="text-sm font-semibold text-gray-900">
                                {examType.toUpperCase()} Results Portal
                            </h1>
                            <p className="text-xs text-gray-500">Ministry of Primary Education</p>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2">
                        <button
                            onClick={handlePrint}
                            className="hidden sm:inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 border border-gray-300 rounded-lg transition-colors cursor-pointer"
                        >
                            <IoPrint className="w-4 h-4" />
                            <span className="hidden md:inline">Print</span>
                        </button>
                        <button
                            onClick={handleDownload}
                            className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-white bg-green-600 hover:bg-green-700 rounded-lg transition-colors cursor-pointer"
                        >
                            <IoDownload className="w-4 h-4" />
                            <span className="hidden md:inline">Download</span>
                        </button>
                        <button
                            onClick={handleChangeExam}
                            className="hidden sm:inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg transition-colors cursor-pointer"
                            title="Change examination type"
                        >
                            <IoSwapHorizontal className="w-4 h-4" />
                            <span className="hidden lg:inline">Change Exam</span>
                        </button>
                        <button
                            onClick={handleLogout}
                            className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
                        >
                            <IoLogOut className="w-4 h-4" />
                            <span className="hidden md:inline">Logout</span>
                        </button>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 print:py-0">
                {/* Welcome Banner */}
                <div className="mb-6 print:hidden">
                    <div className="bg-white border border-gray-200 rounded-lg p-6">
                        <div className="flex items-start justify-between gap-3">
                            <div className="flex items-center gap-3">
                                <div className={`w-10 h-10 ${examType === 'bece' ? 'bg-green-100' : 'bg-purple-100'} rounded-lg flex items-center justify-center`}>
                                    <IoSparkles className={`w-5 h-5 ${examType === 'bece' ? 'text-green-600' : 'text-purple-600'}`} />
                                </div>
                                <div>
                                    <h2 className="text-lg font-semibold text-gray-900">
                                        Welcome, <span className="capitalize">{student.name.toLowerCase()}</span>
                                    </h2>
                                    <p className="text-sm text-gray-600 mt-0.5">
                                        Your {examType.toUpperCase()} examination results are displayed below
                                    </p>
                                </div>
                            </div>
                            <span className={`px-3 py-1 text-xs font-semibold rounded-full ${
                                examType === 'bece' 
                                    ? 'bg-green-100 text-green-700 border border-green-200' 
                                    : 'bg-purple-100 text-purple-700 border border-purple-200'
                            }`}>
                                {examType.toUpperCase()}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Print Header (Only visible when printing) */}
                <div className="hidden print:block mb-8 text-center border-b-2 border-gray-300 pb-6">
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">
                        {examType === 'bece' 
                            ? 'Basic Education Certificate Examination (BECE)'
                            : examType === 'ubeat'
                            ? 'Universal Basic Education Achievement Test (UBEAT)'
                            : examType.toUpperCase()}
                    </h1>
                    <p className="text-lg text-gray-700">
                        Official Results Statement
                    </p>
                    <p className="text-sm text-gray-600 mt-2">
                        Academic Year {new Date().getFullYear()}
                    </p>
                </div>

                {/* Content Grid */}
                <div className="space-y-4 mb-6">
                    {/* Student Info */}
                    <StudentInfoCard student={student} />

                    {/* Results */}
                    <ResultsCard student={student} />
                </div>

                {/* Info Footer */}
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6 print:hidden">
                    <div className="flex items-start gap-3">
                        <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                            <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <div className="flex-1">
                            <p className="text-sm text-gray-700">
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
