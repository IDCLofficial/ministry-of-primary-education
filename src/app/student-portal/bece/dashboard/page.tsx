'use client'

import { useEffect, useState, useRef } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { IoLogOut, IoDownload, IoPrint, IoSparkles, IoSwapHorizontal, IoTrophy } from 'react-icons/io5'
import toast from 'react-hot-toast'
import Paywall from './components/Paywall'
import Image from 'next/image'
import { generateBECECertificate } from '@/app/exam-portal/dashboard/schools/[schoolId]/bece/utils/certificateGenerator'
import { toPng } from 'html-to-image'
import jsPDF from 'jspdf'
import { useGetBECEResultQuery } from '../../store/api/studentApi'
import StudentInfoCard from './components/StudentInfoCard'
import Lottie from 'lottie-react'
import celebrationData from "./components/celebrationBirthdayEmoji.json"
import { useMedia } from 'react-use'
import PortalHeader from '../../components/Portalheader'
import { getSecureItem, removeSecureItem } from '@/app/student-portal/utils/secureStorage'

// Regex pattern for exam number validation (e.g., XX/000/000)
const EXAM_NO_REGEX = /^[a-zA-Z]{2}\/\d{1,4}\/\d{1,4}(\(\d\))?$/
// Regex pattern for exam number validation (e.g., XX/000/0000/000)
const EXAM_NO_REGEX_02 = /^[a-zA-Z]{2}\/\d{1,4}\/\d{4}\/\d{1,4}$/
// Regex pattern for exam number validation (e.g., XX/XX/000/0000)
const EXAM_NO_REGEX_03 = /^[a-zA-Z]{2}\/[a-zA-Z]{2}\/\d{1,4}\/\d{1,4}$/

export default function StudentDashboardPage() {
    const isMobile = useMedia('(max-width: 1000px)')
    const router = useRouter()
    const searchParams = useSearchParams()
    const certificateRef = useRef<HTMLDivElement>(null)
    const [isDownloadingCertificate, setIsDownloadingCertificate] = useState(false)
    const [isPrinting, setIsPrinting] = useState(false)
    const [examNo, setExamNo] = useState<string | null>(null)

    const getGradeColor = (grade: string) => {
        if (grade === 'A1') return 'bg-gradient-to-r from-yellow-400 to-amber-500 text-white'
        if (grade === 'B2') return 'text-green-600'
        if (grade === 'B3') return 'text-green-500'
        if (grade === 'C4') return 'text-blue-600'
        if (grade === 'C5') return 'text-blue-500'
        if (grade === 'C6') return 'text-blue-400'
        if (grade === 'D7') return 'text-orange-500'
        if (grade === 'E8') return 'text-yellow-600'
        if (grade === 'F9') return 'text-red-600'
        return 'text-gray-600'
    }

    const hasA1 = (grade: string) => grade === 'A1'

    const calculateAverage = () => {
        if (!student) return '0'
        const scores = student.subjects.map(s => s.exam)
        const total = scores.reduce((sum, score) => sum + score, 0)
        return (total / scores.length).toFixed(1)
    }

    // Calculate grade from score
    const calculateGradeFromScore = (score: number): string => {
        if (score >= 80) return 'A1'
        if (score >= 70) return 'B2'
        if (score >= 65) return 'B3'
        if (score >= 60) return 'C4'
        if (score >= 55) return 'C5'
        if (score >= 50) return 'C6'
        if (score >= 45) return 'D7'
        if (score >= 40) return 'E8'
        return 'F9'
    }

    // Calculate credits (C4, C5, C6 grades)
    const calculateCredits = () => {
        if (!student) return 0
        return student.subjects.filter(s => {
            const grade = s.grade || calculateGradeFromScore(s.exam)
            return ['C4', 'C5', 'C6'].includes(grade)
        }).length
    }

    // Calculate overall grade based on grade points average
    const calculateOverallGrade = () => {
        if (!student) return 'N/A'
        const gradePoints: { [key: string]: number } = {
            'A1': 1, 'B2': 2, 'B3': 3, 'C4': 4, 'C5': 5, 'C6': 6,
            'D7': 7, 'E8': 8, 'F9': 9
        }

        const totalPoints = student.subjects.reduce((sum, subject) => {
            const grade = subject.grade || calculateGradeFromScore(subject.exam)
            return sum + (gradePoints[grade] || 9)
        }, 0)

        const average = totalPoints / student.subjects.length
        if (average <= 1.5) return 'Distinction'
        if (average <= 2.5) return 'Credit'
        if (average <= 4.5) return 'Pass'
        return 'Fail'
    }

    // Check for payment success from URL params
    useEffect(() => {
        const paymentSuccess = searchParams.get('payment')
        if (paymentSuccess === 'success') {
            toast.success('Payment successful! Welcome to your results.')
            window.history.replaceState({}, '', '/student-portal/bece/dashboard')
        } else if (paymentSuccess === 'failed') {
            toast.error('Payment failed. Please try again.')
            window.history.replaceState({}, '', '/student-portal/bece/dashboard')
        }
    }, [searchParams])

    // Get exam number from encrypted localStorage
    useEffect(() => {
        let cancelled = false
        Promise.all([
            getSecureItem('student_exam_no'),
            getSecureItem('selected_exam_type'),
        ]).then(([storedExamNo, selectedExamType]) => {
            if (cancelled) return
            if (!storedExamNo || selectedExamType !== 'bece' || (!EXAM_NO_REGEX.test(storedExamNo) && !EXAM_NO_REGEX_02.test(storedExamNo) && !EXAM_NO_REGEX_03.test(storedExamNo))) {
                toast.error('Invalid exam number. Please log in again.')
                setTimeout(() => router.push('/student-portal/bece'), 0)
                return
            }
            const formattedExamNo = storedExamNo.replace(/\//g, '-')
            setExamNo(formattedExamNo)
        })
        return () => { cancelled = true }
    }, [router])

    // Fetch student data using RTK Query
    const {
        data: student,
        isLoading,
        isError,
        error
    } = useGetBECEResultQuery(examNo || '', {
        skip: !examNo,
    })

    const handleLogout = () => {
        removeSecureItem('student_exam_no')
        removeSecureItem('selected_exam_type')
        toast.success('Logged out successfully')
        setTimeout(() => router.push('/student-portal/bece'), 0)
    }

    const handleChangeExam = () => {
        removeSecureItem('selected_exam_type')
        toast('Returning to exam selection...', { icon: '🔄' })
        setTimeout(() => router.push('/student-portal'), 0)
    }

    const handleDownload = async () => {
        if (!student) {
            toast.error('Results not ready')
            return
        }
        try {
            setIsDownloadingCertificate(true)
            toast.loading('Preparing certificate...', { id: 'cert-download' })
            const certYear = (student as { examYear?: number }).examYear ?? new Date().getFullYear()
            const serial =
                (student as { serialNumber?: string }).serialNumber != null &&
                String((student as { serialNumber?: string }).serialNumber).trim() !== ''
                    ? String((student as { serialNumber?: string }).serialNumber).trim()
                    : student.examNo
                        ? `${certYear}-${student.examNo.replace(/\//g, '-')}`
                        : undefined
            await generateBECECertificate(
                {
                    name: student.name,
                    schoolName: student.schoolName || student.school,
                    lga: student.lga,
                    year: certYear,
                    subjectCount: student.subjects.length,
                    courses: student.subjects.map((s) => ({
                        subject: s.name ?? '—',
                        grade: (s.grade != null && String(s.grade).trim() !== '') ? String(s.grade).trim() : calculateGradeFromScore(s.exam ?? 0),
                    })),
                    examNumber: student.examNo,
                    serialNumber: serial ?? student.examNo,
                    issueDate: new Date().toISOString().slice(0, 10),
                },
                { filename: `BECE_Certificate_${(student.examNo || '').replace(/\//g, '_')}.png` }
            )
            toast.success('Certificate downloaded', { id: 'cert-download' })
        } catch (err) {
            console.error('Certificate download failed:', err)
            toast.error('Failed to download certificate', { id: 'cert-download' })
        } finally {
            setIsDownloadingCertificate(false)
        }
    }

    const handlePrint = async () => {
        if (!certificateRef.current || !student) {
            toast.error('Results not ready')
            return
        }
        try {
            setIsPrinting(true)
            toast.loading('Generating PDF...', { id: 'download-pdf' })
            const element = certificateRef.current
            // Temporarily make the element visible for rendering
            element.style.left = '0'
            element.style.opacity = '1'
            // Wait for content to be fully rendered
            await new Promise(resolve => setTimeout(resolve, 300))
            // Ensure all images are loaded
            const images = element.getElementsByTagName('img')
            await Promise.all(
                Array.from(images).map(img => {
                    if (img.complete) return Promise.resolve()
                    return new Promise((resolve, reject) => {
                        img.onload = () => resolve(null)
                        img.onerror = reject
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
            pdf.save(`BECE-Results-${student.examNo}.pdf`)
            toast.success('PDF downloaded successfully!', { id: 'download-pdf' })
        } catch (error) {
            console.error('Error generating PDF:', error)
            toast.error('Failed to generate PDF', { id: 'download-pdf' })
        } finally {
            setIsPrinting(false)
        }
    }

    // Show loading while fetching data
    if (isLoading || !examNo) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-green-50/30 via-white to-blue-50/30">
                <header className="bg-white border-b border-gray-100 sticky top-0 z-50">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <Image
                                src={"/images/ministry-logo.png"}
                                width={40}
                                height={40}
                                alt="BECE Results"
                                className="h-10 w-auto object-contain flex-shrink-0"
                            />
                            <div className='pl-4 border-l border-l-gray-100 animate-pulse'>
                                <h1 className="text-sm font-semibold text-gray-900">Loading your data</h1>
                                <p className="text-xs text-gray-600">Please wait while we fetch your results</p>
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
                            <h3 className="text-lg font-bold text-gray-900 mb-2">Almost there!</h3>
                            <p className="text-base text-gray-600 animate-pulse">Loading your results...</p>
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
                    <div className="w-20 h-20 bg-orange-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                        <svg className="w-10 h-10 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-3">Oops! Something went wrong</h2>
                    <p className="text-base text-gray-600 mb-2">{errorMessage}</p>
                    <p className="text-sm text-gray-500 mb-6">Don&apos;t worry, this happens sometimes. Let&apos;s try again!</p>
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
                examNo={student.examNo}
                studentName={student.name}
                school={student.school}
            />
        )
    }

    // ── Render ────────────────────────────────────────────────────────────────
    return (
        <div className="min-h-screen bg-gradient-to-br from-green-50/30 via-white to-blue-50/30 print:bg-white">
            {/* Header */}
            <PortalHeader
                title="Your BECE Results"
                subtitle="Well done on your hard work!"
                actions={[
                    {
                        key: 'print',
                        label: 'Print your Results',
                        shortLabel: 'Get Results',
                        icon: <IoPrint className="w-4 h-4" />,
                        onClick: handlePrint,
                        variant: 'ghost',
                        loading: isPrinting,
                        loadingLabel: 'Printing...',
                        hideOnMobileTray: true,
                    },
                    {
                        key: 'download',
                        loading: isDownloadingCertificate,
                        label: 'Download your Certificate',
                        shortLabel: 'Certificate',
                        loadingLabel: 'Downloading...',
                        icon: <IoDownload className="w-4 h-4" />,
                        onClick: handleDownload,
                        variant: 'primary',
                    },
                    {
                        key: 'switch',
                        label: 'Switch Exam',
                        icon: <IoSwapHorizontal className="w-4 h-4" />,
                        onClick: handleChangeExam,
                        variant: 'secondary',
                        hideOnMobileTray: true,
                    },
                    {
                        key: 'logout',
                        label: 'Logout',
                        icon: <IoLogOut className="w-4 h-4" />,
                        onClick: handleLogout,
                        variant: 'ghost',
                        hideOnMobileTray: true,
                    },
                ]}
            />

            {/* Main Content */}
            <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 print:py-0">
                {/* Welcome Banner */}
                <div className="mb-6 print:hidden">
                    <div className="sm:bg-gradient-to-r bg-linear-to-b from-green-50 to-pink-50 border border-green-100 rounded-3xl p-8">
                        <div className="flex sm:items-start relative items-baseline justify-between gap-4">
                            <div className="flex items-start gap-4">
                                <div className="w-14 h-14 bg-white rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm max-sm:hidden">
                                    <IoSparkles className="w-7 h-7 text-green-600" />
                                </div>
                                <div>
                                    <h2 className="sm:text-2xl text-lg font-bold text-gray-900 mb-2">
                                        Congratulations, <span className="capitalize">{student.name.toLowerCase()}</span>!
                                    </h2>
                                    <p className="sm:text-base text-sm text-gray-700 mb-1">
                                        You&apos;ve worked hard and here are your BECE results
                                    </p>
                                    <p className="sm:text-sm text-xs text-gray-600 max-sm:mb-4">
                                        Take a moment to review your performance. We&apos;re proud of your effort!
                                    </p>
                                </div>
                            </div>

                            <Lottie
                                animationData={celebrationData}
                                loop={true}
                                autoPlay={true}
                                style={{
                                    height: isMobile ? '20vmin' : '16vmin',
                                }}
                                className='absolute sm:right-4 -right-6 sm:top-1/2 sm:-translate-y-1/2 -mt-3 -bottom-8'
                            />
                        </div>
                    </div>
                </div>

                {/* Print Header (Only visible when printing) */}
                <div className="hidden print:block mb-8 text-center border-b-2 border-gray-200 pb-6">
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">
                        Basic Education Certificate Examination (BECE)
                    </h1>
                    <p className="text-lg text-gray-700">
                        Official Results - Well Done!
                    </p>
                    <p className="text-sm text-gray-600 mt-2">
                        Academic Year {new Date().getFullYear()}
                    </p>
                </div>

                {/* Content Grid */}
                <div className="space-y-6 mb-6">
                    {/* Student Info */}
                    <StudentInfoCard student={student} />

                    {/* Overall Performance Summary */}
                    <div className="bg-white border border-gray-200 rounded-3xl overflow-hidden print:hidden">
                        <div className="border-b border-gray-100 px-6 py-4">
                            <h3 className="text-sm font-semibold text-gray-900">
                                Overall Performance
                            </h3>
                        </div>
                        <div className="p-6">
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <div className="text-center">
                                    <p className="text-2xl font-semibold text-gray-900 mb-1">
                                        {student.subjects.length}
                                    </p>
                                    <p className="text-xs text-gray-500">Subjects</p>
                                </div>

                                <div className="text-center">
                                    <p className="text-2xl font-semibold text-gray-900 mb-1">
                                        {calculateCredits()}
                                    </p>
                                    <p className="text-xs text-gray-500">Credits</p>
                                </div>

                                <div className="text-center">
                                    <p className="text-2xl font-bold text-green-600 mb-1">
                                        {calculateAverage()}%
                                    </p>
                                    <p className="text-xs text-gray-500">Average Score</p>
                                </div>

                                <div className="text-center">
                                    <p className="text-xl font-semibold text-green-600 mb-1">
                                        {calculateOverallGrade()}
                                    </p>
                                    <p className="text-xs text-gray-500">Overall Grade</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Subject Results Table */}
                    <div className="bg-white border border-gray-200 rounded-3xl overflow-hidden">
                        <div className="border-b border-gray-100 px-6 py-4">
                            <h3 className="text-sm font-semibold text-gray-900">
                                Subject Results
                            </h3>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="min-w-full">
                                <thead>
                                    <tr className="border-b border-gray-100 bg-gray-50">
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500">
                                            Subject
                                        </th>
                                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-500">
                                            Score
                                        </th>
                                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-500">
                                            Grade
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {student.subjects.map((subject, index) => {
                                        const calculatedGrade = calculateGradeFromScore(subject.exam)
                                        return (
                                            <tr key={index} className="hover:bg-gray-50 transition-colors">
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <span className="w-6 h-6 flex items-center justify-center text-xs font-medium text-gray-400">
                                                            {index + 1}
                                                        </span>
                                                        <span className="text-sm font-medium text-gray-900">
                                                            {subject.name}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-center">
                                                    <span className="text-sm font-semibold text-gray-900">
                                                        {subject.exam}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-center">
                                                    <span className={`inline-flex items-center gap-1 ${hasA1(calculatedGrade) ? 'px-3 py-1.5 rounded-lg shadow-sm' : ''} text-sm font-bold ${getGradeColor(calculatedGrade)}`}>
                                                        {hasA1(calculatedGrade) && <IoTrophy className="w-4 h-4" />}
                                                        {calculatedGrade}
                                                    </span>
                                                </td>
                                            </tr>
                                        )
                                    })}
                                </tbody>
                            </table>
                        </div>

                        {/* Grade Legend */}
                        <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 print:hidden">
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

                {/* Info Footer */}
                <div className="bg-gradient-to-b from-white to-green-50 border border-blue-100 rounded-2xl p-6 mb-6 print:hidden">
                    <div className="flex items-start gap-4">
                        <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm">
                            <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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

            {/* Hidden Certificate for PDF Generation (used by handlePrint) */}
            <div
                ref={certificateRef}
                style={{ position: 'fixed', left: '-9999px', top: '0', opacity: 0 }}
                className="w-[210mm] bg-white px-12 py-8 pointer-events-none"
            >
                {/* Header */}
                <div className="text-center pb-8">
                    <div className="flex items-center justify-center mb-4">
                        <Image
                            src="/images/ministry-logo.png"
                            width={60}
                            height={60}
                            alt="Ministry Logo"
                            className="h-16 w-auto object-contain"
                        />
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900 mb-1">
                        Basic Education Certificate Examination (BECE)
                    </h1>
                    <p className="text-lg text-gray-700">Official Results Document</p>
                    <p className="text-sm text-gray-600">
                        Academic Year {new Date().getFullYear()}
                    </p>
                </div>

                {/* Student Information */}
                <div className="bg-gray-50 rounded-2xl p-6 mb-6 border border-slate-200">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <p className="text-sm text-gray-600 mb-1">Full Name</p>
                            <p className="text-base font-semibold text-gray-900 capitalize">{student.name.toLowerCase()}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-600 mb-1">Exam Number</p>
                            <p className="text-base font-mono font-semibold text-gray-900 uppercase">{student.examNo}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-600 mb-1">School</p>
                            <p className="text-base font-semibold text-gray-900 capitalize">{student?.school.toLowerCase()}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-600 mb-1">LGA</p>
                            <p className="text-base font-semibold text-gray-900 capitalize">{student.lga.toLowerCase()}</p>
                        </div>
                    </div>
                </div>


                {/* Overall Performance */}
                <div className="bg-green-50 rounded-2xl p-6 mb-6 border border-green-200">
                    <div className="grid grid-cols-4 gap-4 text-center">
                        <div>
                            <p className="text-2xl font-bold text-gray-900">{student.subjects.length}</p>
                            <p className="text-sm text-gray-600">Subjects</p>
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-gray-900">{calculateCredits()}</p>
                            <p className="text-sm text-gray-600">Credits</p>
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-green-600">{calculateAverage()}%</p>
                            <p className="text-sm text-gray-600">Average Score</p>
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-green-600">{calculateOverallGrade()}</p>
                            <p className="text-sm text-gray-600">Overall Grade</p>
                        </div>
                    </div>
                </div>

                {/* Subject Results Table */}
                <div className="mb-6">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">Subject Results</h2>
                    <table className="w-full border-collapse">
                        <thead>
                            <tr className="bg-gray-100">
                                <th className="border border-gray-300 px-4 py-2 text-left text-sm font-semibold">Subject</th>
                                <th className="border border-gray-300 px-4 py-2 text-center text-sm font-semibold">Score</th>
                                <th className="border border-gray-300 px-4 py-2 text-center text-sm font-semibold">Grade</th>
                            </tr>
                        </thead>
                        <tbody>
                            {student.subjects.map((subject, index) => {
                                const calculatedGrade = calculateGradeFromScore(subject.exam)
                                return (
                                    <tr key={index}>
                                        <td className="border border-gray-300 px-4 py-2 text-sm">{subject.name}</td>
                                        <td className="border border-gray-300 px-4 py-2 text-center text-sm font-semibold">{subject.exam}</td>
                                        <td className="border border-gray-300 px-4 py-2 text-center">
                                            <span className={`inline-flex items-center gap-1 ${hasA1(calculatedGrade) ? 'px-2 py-0.5 rounded' : ''} text-sm font-bold ${getGradeColor(calculatedGrade)}`}>
                                                {hasA1(calculatedGrade) && <IoTrophy className="w-3.5 h-3.5" />}
                                                {calculatedGrade}
                                            </span>
                                        </td>
                                    </tr>
                                )
                            })}
                        </tbody>
                    </table>
                </div>

                {/* Footer */}
                <div className="pt-2 text-center text-sm text-gray-600">
                    <p className="font-semibold text-gray-900">Imo State Ministry of Primary and Secondary Education</p>
                    <p className="text-xs text-slate-400">Printed on: {new Date().toISOString().split('T')[0]} • Keep this for your records</p>
                </div>
            </div>

        </div>
    )
}