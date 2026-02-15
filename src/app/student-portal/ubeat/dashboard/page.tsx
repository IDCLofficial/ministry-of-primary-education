'use client'
import React, { useEffect, useState, useRef } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { IoLogOut, IoDownload, IoPrint, IoSchool, IoSparkles, IoSwapHorizontal, IoTrophy } from 'react-icons/io5'
import toast from 'react-hot-toast'
import Image from 'next/image'
import { toPng } from 'html-to-image'
import jsPDF from 'jspdf'
import Paywall from './components/Paywall'
import { UBEATStudent } from '@/app/bece-portal/dashboard/schools/types/student.types'
import { generateUBEATCertificate } from '@/app/bece-portal/dashboard/schools/[schoolId]/ubeat/utils/certificateGenerator'
import { useGetUBEATResultQuery } from '../../store/api/studentApi'

export default function UBEATDashboard() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const certificateRef = useRef<HTMLDivElement>(null)
    const [isDownloading, setIsDownloading] = useState(false)
    const [examNo, setExamNo] = useState<string | null>(null)

    // Check for payment success from URL params
    useEffect(() => {
        const paymentSuccess = searchParams.get('payment')
        if (paymentSuccess === 'success') {
            toast.success('Payment successful! Welcome to your results.')
            window.history.replaceState({}, '', '/student-portal/ubeat/dashboard')
        } else if (paymentSuccess === 'failed') {
            toast.error('Payment failed. Please try again.')
            window.history.replaceState({}, '', '/student-portal/ubeat/dashboard')
        }
    }, [searchParams])

    // Get exam number from localStorage
    useEffect(() => {
        const storedExamNo = localStorage.getItem('student_exam_no')
        const selectedExamType = localStorage.getItem('selected_exam_type')

        if (!storedExamNo || selectedExamType !== 'ubeat') {
            router.push('/student-portal/ubeat')
            return
        }

        // Format exam number: replace "/" with "-"
        const formattedExamNo = storedExamNo.replace(/\//g, '-')
        setExamNo(formattedExamNo)
    }, [router])

    // Fetch student data using RTK Query
    const { 
        data: student, 
        isLoading, 
        isError, 
        error 
    } = useGetUBEATResultQuery(examNo || '', {
        skip: !examNo,
    })

    const handleLogout = () => {
        localStorage.removeItem('student_exam_no')
        localStorage.removeItem('selected_exam_type')
        toast.success('Logged out successfully')
        router.push('/student-portal/ubeat')
    }

    const handleChangeExam = () => {
        localStorage.removeItem('selected_exam_type')
        toast('Returning to exam selection...', { icon: '🔄' })
        router.push('/student-portal')
    }

    const handleDownload = async () => {
        if (!student) {
            toast.error('No student data available')
            return
        }

        setIsDownloading(true)
        try {
            // Prepare student data for certificate generation
            const studentData: UBEATStudent = {
                _id: student._id,
                examNumber: student.examNumber,
                studentName: student.studentName,
                serialNumber: student.serialNumber,
                age: student.age,
                sex: student.sex as 'male' | 'female',
                lga: student.lga,
                school: student.school,
                schoolName: student.schoolName,
                subjects: student.subjects as UBEATStudent['subjects'],
                averageScore: student.averageScore,
                grade: student.grade,
                examYear: student.examYear,
                createdAt: student.createdAt,
                updatedAt: student.updatedAt,
                __v: student.__v
            }

            await generateUBEATCertificate({
                student: studentData,
                schoolName: student.schoolName
            }, student.grade.toLowerCase() as 'pass' | 'credit' | 'distinction')

            toast.success('Certificate downloaded successfully!')
        } catch (error) {
            console.error('Error generating certificate:', error)
            toast.error('Failed to generate certificate. Please try again.')
        } finally {
            setIsDownloading(false)
        }
    }

    const handlePrint = async () => {
        if (!certificateRef.current || !student) {
            toast.error('Results not ready')
            return
        }

        try {
            setIsDownloading(true)
            toast.loading('Generating PDF...', { id: 'download-pdf' })

            const element = certificateRef.current

            // Temporarily make the element visible and positioned for rendering
            element.style.left = '0'
            element.style.opacity = '1'

            // Wait for images to load and content to be fully rendered
            await new Promise(resolve => setTimeout(resolve, 300))

            // Ensure all images in the certificate are loaded
            const images = element.getElementsByTagName('img')
            await Promise.all(
                Array.from(images).map(img => {
                    if (img.complete) return Promise.resolve()
                    return new Promise((resolve, reject) => {
                        img.onload = () => resolve(null)
                        img.onerror = reject
                        // Timeout after 5 seconds
                        setTimeout(() => resolve(null), 5000)
                    })
                })
            )

            const dataUrl = await toPng(element, {
                cacheBust: true,
                pixelRatio: 3,
                backgroundColor: '#ffffff',
                skipFonts: false,
            })

            // Hide element again
            element.style.left = '-9999px'
            element.style.opacity = '0'

            const pdf = new jsPDF({
                orientation: 'portrait',
                unit: 'mm',
                format: 'a4'
            })

            const imgWidth = 210
            const imgHeight = (element.offsetHeight * imgWidth) / element.offsetWidth

            pdf.addImage(dataUrl, 'PNG', 0, 0, imgWidth, imgHeight)
            pdf.save(`UBEAT-Results-${student.examNumber}.pdf`)

            toast.success('PDF downloaded successfully!', { id: 'download-pdf' })
        } catch (error) {
            console.error('Error generating PDF:', error)
            toast.error('Failed to generate PDF', { id: 'download-pdf' })
        } finally {
            setIsDownloading(false)
        }
    }

    // Show loading
    if (isLoading || !examNo) {
        return (
            <div className="min-h-screen bg-linear-to-br from-green-50/30 via-white to-pink-50/30">
                <header className="bg-white border-b border-gray-100 sticky top-0 z-50">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-green-600 rounded-xl flex items-center justify-center">
                                <IoSchool className="w-5 h-5 text-white" />
                            </div>
                            <div>
                                <h1 className="text-base font-bold text-gray-900">UBEAT Results</h1>
                                <p className="text-xs text-gray-600">Your achievement awaits</p>
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
                            <h3 className="text-xl font-bold text-gray-900 mb-2">Almost there!</h3>
                            <p className="text-base text-gray-600">Loading your results...</p>
                        </div>
                    </div>
                </main>
            </div>
        )
    }

    if (isError) {
        const errorMessage = error && 'status' in error 
            ? error.status === 404 
                ? 'We couldn\'t find your results. Please check your exam number.'
                : error.status === 500
                ? 'Our system is having a moment. Please try again.'
                : 'Something went wrong. Please try again.'
            : 'Unable to load your results. Please try again.'

        return (
            <div className="min-h-screen bg-gradient-to-br from-orange-50/30 via-white to-yellow-50/30 flex items-center justify-center p-4">
                <div className="text-center max-w-md">
                    <div className="w-20 h-20 bg-orange-100 rounded-3xl flex items-center justify-center mx-auto mb-6">
                        <svg className="w-10 h-10 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-3">Oops! Something went wrong</h2>
                    <p className="text-base text-gray-600 mb-2">{errorMessage}</p>
                    <p className="text-sm text-gray-500 mb-6">Don't worry, this happens sometimes. Let's try again!</p>
                    <div className="bg-blue-50 rounded-xl p-4 mb-6 border border-blue-100">
                        <p className="text-sm text-gray-700">
                            💡 <strong>Quick tip:</strong> Double-check your exam number format or ask your teacher for help
                        </p>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="inline-flex items-center gap-2 px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-xl transition-all duration-200 active:scale-95"
                    >
                        <IoLogOut className="w-4 h-4" />
                        Try Again
                    </button>
                </div>
            </div>
        )
    }

    if (!student) {
        return null
    }

    // Check payment status from the student result data
    const isPaid = !student.payment || student.payment.isPaid

    // Show paywall if payment is not confirmed
    if (!isPaid && student.payment && !student.payment.isPaid) {
        return (
            <Paywall
                examNo={student.examNumber}
                studentName={student.studentName}
                school={student.schoolName}
            />
        )
    }

    // Grade calculation function
    const calculateGrade = (total: number): string => {
        if (total >= 80) return 'A1'
        if (total >= 70) return 'B2'
        if (total >= 65) return 'B3'
        if (total >= 60) return 'C4'
        if (total >= 55) return 'C5'
        if (total >= 50) return 'C6'
        if (total >= 45) return 'D7'
        if (total >= 40) return 'E8'
        return 'F9'
    }

    // Convert subjects object to array for display
    const subjectsArray = Object.entries(student.subjects).map(([name, data]) => ({
        name,
        ...data,
        grade: calculateGrade(data.total)
    }))

    // Use average score from API response
    const averageScore = student.averageScore || 0

    const getGradeColor = (grade: string) => {
        // A1: Gold fill with trophy icon
        if (grade === 'A1') return 'bg-gradient-to-r from-yellow-400 to-amber-500 text-white border-0'
        // B2-B3: Green text only
        if (grade === 'B2') return 'text-green-600 border-0'
        if (grade === 'B3') return 'text-green-500 border-0'
        // C4-C6: Blue text only
        if (grade === 'C4') return 'text-blue-600 border-0'
        if (grade === 'C5') return 'text-blue-500 border-0'
        if (grade === 'C6') return 'text-blue-400 border-0'
        // D7: Orange text only
        if (grade === 'D7') return 'text-orange-500 border-0'
        // E8: Yellow text only
        if (grade === 'E8') return 'text-yellow-600 border-0'
        // F9: Red text only
        if (grade === 'F9') return 'text-red-600 border-0'
        // Default fallback
        return 'text-gray-600 border-0'
    }

    const hasA1 = (grade: string) => grade === 'A1'

    return (
        <div className="min-h-screen bg-gradient-to-br from-green-50/30 via-white to-pink-50/30 print:bg-white">
            {/* Header */}
            <header className="bg-white border-b border-gray-100 sticky top-0 z-50 print:hidden">
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
                        <div className="border-l border-gray-200 pl-3">
                            <h1 className="text-sm font-semibold text-gray-900">Your UBEAT Results</h1>
                            <p className="text-xs text-gray-600">Well done on your hard work!</p>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2">
                        <button
                            onClick={handlePrint}
                            className="hidden sm:inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 border border-gray-200 rounded-xl transition-all cursor-pointer"
                        >
                            <IoPrint className="w-4 h-4" />
                            <span className="hidden md:inline">Print</span>
                        </button>
                        <button
                            onClick={handleDownload}
                            disabled={isDownloading}
                            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-green-600 hover:bg-green-700 rounded-xl transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isDownloading ? (
                                <>
                                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                                    <span className="hidden md:inline">Downloading...</span>
                                </>
                            ) : (
                                <>
                                    <IoDownload className="w-4 h-4" />
                                    <span className="hidden md:inline">Download</span>
                                </>
                            )}
                        </button>
                        <button
                            onClick={handleChangeExam}
                            className="hidden sm:inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-xl transition-all cursor-pointer"
                            title="View other exam results"
                        >
                            <IoSwapHorizontal className="w-4 h-4" />
                            <span className="hidden lg:inline">Switch Exam</span>
                        </button>
                        <button
                            onClick={handleLogout}
                            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-xl transition-all cursor-pointer"
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
                    <div className="bg-gradient-to-r from-green-50 to-pink-50 border border-green-100 rounded-3xl p-8">
                        <div className="flex items-start justify-between gap-4">
                            <div className="flex items-start gap-4">
                                <div className="w-14 h-14 bg-white rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm">
                                    <IoSparkles className="w-7 h-7 text-green-600" />
                                </div>
                                <div>
                                    <h2 className="text-2xl font-bold text-gray-900 mb-2">
                                        Congratulations, <span className="capitalize">{student.studentName.toLowerCase()}</span>! 🎉
                                    </h2>
                                    <p className="text-base text-gray-700 mb-1">
                                        You've worked hard and here are your UBEAT results
                                    </p>
                                    <p className="text-sm text-gray-600">
                                        Take a moment to review your performance. We're proud of your effort!
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Print Header (Only visible when printing) */}
                <div className="hidden print:block mb-8 text-center border-b-2 border-gray-200 pb-6">
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">
                        Universal Basic Education Achievement Test (UBEAT)
                    </h1>
                    <p className="text-lg text-gray-700">Official Results - Well Done!</p>
                    <p className="text-sm text-gray-600 mt-2">
                        Academic Year {student.examYear || new Date().getFullYear()}
                    </p>
                </div>

                {/* Content Grid */}
                <div className="space-y-4 mb-6">
                    {/* Student Info */}
                    <div className="bg-white rounded-3xl border border-gray-200 overflow-hidden">
                        <div className="border-b border-gray-100 px-6 py-4">
                            <h3 className="text-sm font-semibold text-gray-900">Student Information</h3>
                        </div>
                        <div className="p-6">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-5">
                                <div>
                                    <p className="text-xs font-medium text-gray-500 mb-1.5">Full Name</p>
                                    <p className="text-sm font-medium text-gray-900 capitalize">
                                        {student.studentName.toLowerCase()}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-xs font-medium text-gray-500 mb-1.5">Exam Number</p>
                                    <p className="text-sm font-mono font-medium text-gray-900 uppercase">
                                        {student.examNumber}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-xs font-medium text-gray-500 mb-1.5">School</p>
                                    <p className="text-sm font-medium text-gray-900 capitalize">
                                        {student.schoolName.toLowerCase()}
                                    </p>
                                </div>
                                {student.lga && (
                                    <div>
                                        <p className="text-xs font-medium text-gray-500 mb-1.5">LGA</p>
                                        <p className="text-sm font-medium text-gray-900 capitalize">
                                            {student.lga.toLowerCase()}
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Results */}
                    <div className="space-y-4">
                        {/* Overall Performance Summary */}
                        <div className="bg-white border border-gray-200 rounded-3xl overflow-hidden">
                            <div className="border-b border-gray-100 px-6 py-4">
                                <h3 className="text-sm font-semibold text-gray-900">Overall Performance</h3>
                            </div>
                            <div className="p-6">
                                <div className="grid grid-cols-3 gap-4">
                                    <div className="text-center">
                                        <p className="text-2xl font-semibold text-green-600 mb-1 capitalize">
                                            {student.grade.toLowerCase()}
                                        </p>
                                        <p className="text-xs text-gray-500">Grade</p>
                                    </div>
                                    <div className="text-center border-l border-r border-gray-200">
                                        <p className="text-2xl font-semibold text-purple-600 mb-1">
                                            {averageScore}
                                        </p>
                                        <p className="text-xs text-gray-500">Score</p>
                                    </div>
                                    <div className="text-center">
                                        <p className="text-2xl font-semibold text-gray-900 mb-1">
                                            {subjectsArray.length}
                                        </p>
                                        <p className="text-xs text-gray-500">Subjects</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Detailed Results Table */}
                        <div className="bg-white border border-gray-200 rounded-3xl overflow-hidden">
                            <div className="border-b border-gray-100 px-6 py-4">
                                <h3 className="text-sm font-semibold text-gray-900">Subject Results</h3>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="min-w-full">
                                    <thead>
                                        <tr className="border-b border-gray-100 bg-gray-50">
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500">Subject</th>
                                            <th className="px-6 py-3 text-center text-xs font-medium text-gray-500">CA</th>
                                            <th className="px-6 py-3 text-center text-xs font-medium text-gray-500">Exam</th>
                                            <th className="px-6 py-3 text-center text-xs font-medium text-gray-500">Total</th>
                                            <th className="px-6 py-3 text-center text-xs font-medium text-gray-500">Grade</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {subjectsArray.map((subject, index) => (
                                            <tr key={index} className="hover:bg-gray-50 transition-colors">
                                                <td className="px-6 py-3">
                                                    <div className="flex items-center gap-3">
                                                        <span className="w-6 h-6 flex items-center justify-center text-xs font-medium text-gray-400">
                                                            {index + 1}
                                                        </span>
                                                        <span className="text-sm text-gray-900 capitalize">{subject.name === "generalKnowledge" ? "General Knowledge" : subject.name}</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-3 text-center">
                                                    <span className="text-sm font-medium text-gray-900">{subject.ca}</span>
                                                </td>
                                                <td className="px-6 py-3 text-center">
                                                    <span className="text-sm font-medium text-gray-900">{subject.exam}</span>
                                                </td>
                                                <td className="px-6 py-3 text-center">
                                                    <span className="text-sm font-semibold text-gray-900">{subject.total}</span>
                                                </td>
                                                <td className="px-6 py-3 text-center">
                                                    <span className={`inline-flex items-center gap-1 ${hasA1(subject.grade) ? 'px-2.5 py-1 rounded-3xl shadow-sm' : ''} text-xs font-bold ${getGradeColor(subject.grade)}`}>
                                                        {hasA1(subject.grade) && <IoTrophy className="w-3.5 h-3.5" />}
                                                        {subject.grade}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {/* Grade Legend */}
                            <div className="px-6 py-4 bg-gray-50 border-t border-gray-100">
                                <p className="text-xs font-medium text-gray-500 mb-3">Grading Scale</p>
                                <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
                                    <div className="flex items-center gap-2">
                                        <IoTrophy className="w-4 h-4 text-amber-500" />
                                        <span className="font-medium text-gray-700">A1: Distinction</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                                        <span className="font-medium text-gray-700">B2-B3: Excellent</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                                        <span className="font-medium text-gray-700">C4-C6: Credit</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="w-3 h-3 bg-orange-400 rounded-full"></div>
                                        <span className="font-medium text-gray-700">D7: Pass</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
                                        <span className="font-medium text-gray-700">E8: Pass</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                                        <span className="font-medium text-gray-700">F9: Fail</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Info Footer */}
                <div className="bg-gradient-to-r from-pink-50 to-green-50 border border-green-100 rounded-3xl p-6 mb-6 print:hidden">
                    <div className="flex items-start gap-4">
                        <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm">
                            <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <div className="flex-1">
                            <h3 className="text-base font-semibold text-gray-900 mb-1">Keep a copy for yourself!</h3>
                            <p className="text-sm text-gray-700">
                                Use the buttons above to download or print your results. You can come back anytime to view them again using your exam number.
                            </p>
                        </div>
                    </div>
                </div>
            </main>

            {/* Print Footer */}
            <footer className="hidden print:block mt-12 pt-6 border-t-2 border-gray-200 text-center text-sm text-gray-600">
                <p className="font-semibold text-gray-900">Imo State Ministry of Primary and Secondary Education</p>
                <p className="mt-1">Official Results Document</p>
                <p className="mt-2 text-xs">Printed on: {new Date().toLocaleDateString()} • Keep this for your records</p>
            </footer>

            {/* Hidden Certificate for PDF Generation */}
            <div ref={certificateRef} style={{ position: 'fixed', left: '-9999px', top: '0', opacity: 0 }} className="w-[210mm] bg-white p-12 pointer-events-none">
                {/* Header */}
                <div className="text-center mb-8 border-b-2 border-gray-200 pb-6">
                    <div className="flex items-center justify-center mb-4">
                        <Image
                            src="/images/ministry-logo.png"
                            width={80}
                            height={80}
                            alt="Ministry Logo"
                            className="h-20 w-auto object-contain"
                        />
                    </div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">
                        Universal Basic Education Achievement Test (UBEAT)
                    </h1>
                    <p className="text-xl text-gray-700">Official Results Document</p>
                    <p className="text-base text-gray-600 mt-2">
                        Academic Year {student.examYear || new Date().getFullYear()}
                    </p>
                </div>

                {/* Student Information */}
                <div className="bg-gray-50 rounded-lg p-6 mb-6">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">Student Information</h2>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <p className="text-sm text-gray-600 mb-1">Full Name</p>
                            <p className="text-base font-semibold text-gray-900 capitalize">{student.studentName.toLowerCase()}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-600 mb-1">Exam Number</p>
                            <p className="text-base font-mono font-semibold text-gray-900 uppercase">{student.examNumber}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-600 mb-1">School</p>
                            <p className="text-base font-semibold text-gray-900 capitalize">{student.schoolName.toLowerCase()}</p>
                        </div>
                        {student.lga && (
                            <div>
                                <p className="text-sm text-gray-600 mb-1">LGA</p>
                                <p className="text-base font-semibold text-gray-900 capitalize">{student.lga.toLowerCase()}</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Overall Performance */}
                <div className="bg-green-50 rounded-lg p-6 mb-6">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">Overall Performance</h2>
                    <div className="grid grid-cols-3 gap-4 text-center">
                        <div>
                            <p className="text-3xl font-bold text-green-600 capitalize">
                                {student.grade.toLowerCase()}
                            </p>
                            <p className="text-sm text-gray-600">Grade</p>
                        </div>
                        <div>
                            <p className="text-3xl font-bold">{averageScore}</p>
                            <p className="text-sm text-gray-600">Score</p>
                        </div>
                        <div>
                            <p className="text-3xl font-bold text-gray-900">{subjectsArray.length}</p>
                            <p className="text-sm text-gray-600">Subjects</p>
                        </div>
                    </div>
                </div>

                {/* Subject Results */}
                <div className="mb-6">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">Subject Results</h2>
                    <table className="w-full border-collapse">
                        <thead>
                            <tr className="bg-gray-100">
                                <th className="border border-gray-300 px-4 py-2 text-left text-sm font-semibold">Subject</th>
                                <th className="border border-gray-300 px-4 py-2 text-center text-sm font-semibold">CA</th>
                                <th className="border border-gray-300 px-4 py-2 text-center text-sm font-semibold">Exam</th>
                                <th className="border border-gray-300 px-4 py-2 text-center text-sm font-semibold">Total</th>
                                <th className="border border-gray-300 px-4 py-2 text-center text-sm font-semibold">Grade</th>
                            </tr>
                        </thead>
                        <tbody>
                            {subjectsArray.map((subject, index) => (
                                <tr key={index}>
                                    <td className="border capitalize border-gray-300 px-4 py-2 text-sm">{subject.name === "generalKnowledge" ? "General Knowledge" : subject.name}</td>
                                    <td className="border capitalize border-gray-300 px-4 py-2 text-center text-sm">{subject.ca}</td>
                                    <td className="border capitalize border-gray-300 px-4 py-2 text-center text-sm">{subject.exam}</td>
                                    <td className="border capitalize border-gray-300 px-4 py-2 text-center text-sm font-semibold">{subject.total}</td>
                                    <td className="border capitalize border-gray-300 px-4 py-2 text-center text-sm font-bold">
                                        {subject.grade}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Footer */}
                <div className="mt-8 pt-6 border-t-2 border-gray-200 text-center text-sm text-gray-600">
                    <p className="font-semibold text-gray-900">Imo State Ministry of Primary and Secondary Education</p>
                    <p className="mt-1">Official Results Document</p>
                    <p className="mt-2 text-xs">Downloaded on: {new Date().toLocaleDateString()} • Keep this for your records</p>
                </div>
            </div>
        </div>
    )
}
