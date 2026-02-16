'use client'
import React, { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { IoLogOut, IoDownload, IoPrint, IoSchool, IoSparkles, IoSwapHorizontal } from 'react-icons/io5'
import toast from 'react-hot-toast'
import Image from 'next/image'

// TypeScript interface for UBEAT student data
interface UBEATStudentData {
    _id: string
    name: string
    examNo: string
    age?: number
    sex?: string
    school: string
    lga?: string
    examYear?: string | number
    subjects: {
        [key: string]: {
            ca: number
            exam: number
            total: number
            grade: string
        }
    }
    createdAt?: string
    updatedAt?: string
}

export default function UBEATDashboard() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const [student, setStudent] = useState<UBEATStudentData | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

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

    useEffect(() => {
        const examNo = localStorage.getItem('student_exam_no')
        const selectedExamType = localStorage.getItem('selected_exam_type')
        const studentDataStr = localStorage.getItem('student_data')

        if (!examNo || selectedExamType !== 'ubeat') {
            router.push('/student-portal/ubeat')
            return
        }

        if (!studentDataStr) {
            setError('No student data found')
            setTimeout(() => {
                router.push('/student-portal/ubeat')
            }, 3000)
            setIsLoading(false)
            return
        }

        try {
            const studentData = JSON.parse(studentDataStr) as UBEATStudentData
            setStudent(studentData)
            setError(null)
        } catch (err) {
            console.error('Error parsing student data:', err)
            setError('Invalid student data')
            setTimeout(() => {
                router.push('/student-portal/ubeat')
            }, 3000)
        } finally {
            setIsLoading(false)
        }
    }, [router, searchParams])

    const handleLogout = () => {
        localStorage.removeItem('student_exam_no')
        localStorage.removeItem('student_data')
        localStorage.removeItem('selected_exam_type')
        toast.success('Logged out successfully')
        router.push('/student-portal/ubeat')
    }

    const handleChangeExam = () => {
        localStorage.removeItem('selected_exam_type')
        toast('Returning to exam selection...', { icon: '🔄' })
        router.push('/student-portal')
    }

    const handleDownload = () => {
        window.print()
    }

    const handlePrint = () => {
        window.print()
    }

    // Show loading
    if (isLoading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-purple-50">
                <header className="bg-white/80 backdrop-blur-xl border-b border-gray-200/50 sticky top-0 z-50">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-purple-500/30">
                                <IoSchool className="w-5 h-5 text-white" />
                            </div>
                            <div>
                                <h1 className="text-base font-bold text-gray-900">UBEAT Results</h1>
                                <p className="text-xs text-gray-500">Student Portal</p>
                            </div>
                        </div>
                    </div>
                </header>
                <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                    <div className="flex items-center justify-center min-h-[60vh]">
                        <div className="text-center">
                            <div className="relative mb-6">
                                <div className="animate-spin rounded-full h-16 w-16 border-4 border-gray-200 border-t-purple-600 mx-auto"></div>
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <IoSparkles className="w-6 h-6 text-purple-600 animate-pulse" />
                                </div>
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">Loading Results</h3>
                            <p className="text-sm text-gray-500">Preparing your examination results...</p>
                        </div>
                    </div>
                </main>
            </div>
        )
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
                        <p className="text-sm text-gray-500">Redirecting to login in 3 seconds...</p>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-purple-700 text-white font-medium rounded-xl hover:shadow-lg hover:shadow-purple-500/30 transition-all duration-200 active:scale-95"
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

    // Convert subjects object to array for display
    const subjectsArray = Object.entries(student.subjects).map(([name, data]) => ({
        name,
        ...data
    }))

    const getGradeColor = (grade: string) => {
        if (grade.startsWith('A')) return 'bg-green-50 text-green-700 border-green-200'
        if (grade.startsWith('B')) return 'bg-green-50 text-green-700 border-green-200'
        if (grade.startsWith('C')) return 'bg-yellow-50 text-yellow-700 border-yellow-200'
        if (grade.startsWith('D')) return 'bg-orange-50 text-orange-700 border-orange-200'
        return 'bg-red-50 text-red-700 border-red-200'
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
                            <h1 className="text-sm font-semibold text-gray-900">UBEAT Results Portal</h1>
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
                            className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors cursor-pointer"
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
                                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                                    <IoSparkles className="w-5 h-5 text-purple-600" />
                                </div>
                                <div>
                                    <h2 className="text-lg font-semibold text-gray-900">
                                        Welcome, <span className="capitalize">{student.name.toLowerCase()}</span>
                                    </h2>
                                    <p className="text-sm text-gray-600 mt-0.5">
                                        Your UBEAT examination results are displayed below
                                    </p>
                                </div>
                            </div>
                            <span className="px-3 py-1 text-xs font-semibold rounded-full bg-purple-100 text-purple-700 border border-purple-200">
                                UBEAT
                            </span>
                        </div>
                    </div>
                </div>

                {/* Print Header (Only visible when printing) */}
                <div className="hidden print:block mb-8 text-center border-b-2 border-gray-300 pb-6">
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">
                        Universal Basic Education Achievement Test (UBEAT)
                    </h1>
                    <p className="text-lg text-gray-700">Official Results Statement</p>
                    <p className="text-sm text-gray-600 mt-2">
                        Academic Year {student.examYear || new Date().getFullYear()}
                    </p>
                </div>

                {/* Content Grid */}
                <div className="space-y-4 mb-6">
                    {/* Student Info */}
                    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                        <div className="border-b border-gray-100 px-6 py-4">
                            <h3 className="text-sm font-semibold text-gray-900">Student Information</h3>
                        </div>
                        <div className="p-6">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-5">
                                <div>
                                    <p className="text-xs font-medium text-gray-500 mb-1.5">Full Name</p>
                                    <p className="text-sm font-medium text-gray-900 capitalize">
                                        {student.name.toLowerCase()}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-xs font-medium text-gray-500 mb-1.5">Exam Number</p>
                                    <p className="text-sm font-mono font-medium text-gray-900 uppercase">
                                        {student.examNo}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-xs font-medium text-gray-500 mb-1.5">School</p>
                                    <p className="text-sm font-medium text-gray-900 capitalize">
                                        {student.school.toLowerCase()}
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
                        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                            <div className="border-b border-gray-100 px-6 py-4">
                                <h3 className="text-sm font-semibold text-gray-900">Overall Performance</h3>
                            </div>
                            <div className="p-6">
                                <div className="grid grid-cols-3 gap-4">
                                    <div className="text-center">
                                        <p className="text-2xl font-semibold text-gray-900 mb-1">
                                            {subjectsArray.length}
                                        </p>
                                        <p className="text-xs text-gray-500">Subjects</p>
                                    </div>
                                    <div className="text-center border-l border-r border-gray-200">
                                        <p className="text-2xl font-semibold text-gray-900 mb-1">
                                            {subjectsArray.filter(s => s.grade.startsWith('A') || s.grade.startsWith('B') || s.grade.startsWith('C')).length}
                                        </p>
                                        <p className="text-xs text-gray-500">Credits</p>
                                    </div>
                                    <div className="text-center">
                                        <p className="text-2xl font-semibold text-purple-600 mb-1">
                                            {subjectsArray.reduce((sum, s) => sum + s.total, 0) / subjectsArray.length >= 70 ? 'Distinction' : 
                                             subjectsArray.reduce((sum, s) => sum + s.total, 0) / subjectsArray.length >= 55 ? 'Credit' : 
                                             subjectsArray.reduce((sum, s) => sum + s.total, 0) / subjectsArray.length >= 40 ? 'Pass' : 'Fail'}
                                        </p>
                                        <p className="text-xs text-gray-500">Grade</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Detailed Results Table */}
                        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
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
                                                        <span className="text-sm text-gray-900">{subject.name}</span>
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
                                                    <span className={`inline-flex items-center px-2.5 py-1 text-xs font-medium rounded border ${getGradeColor(subject.grade)}`}>
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
                                <p className="text-xs font-medium text-gray-500 mb-2">Grading Scale</p>
                                <div className="grid grid-cols-2 gap-2 text-xs text-gray-600">
                                    <div className="flex items-center gap-1.5">
                                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                        <span>A1-B3: Excellent</span>
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                        <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                                        <span>C4-C6: Good</span>
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                        <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                                        <span>D7: Fair</span>
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                        <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                                        <span>E8-F9: Poor</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Info Footer */}
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 mb-6 print:hidden">
                    <div className="flex items-start gap-3">
                        <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                            <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
        </div>
    )
}
