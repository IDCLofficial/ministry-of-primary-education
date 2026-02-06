'use client'
import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { IoLogOut, IoDownload, IoPrint, IoSchool } from 'react-icons/io5'
import toast from 'react-hot-toast'
import StudentInfoCard from './components/StudentInfoCard'
import ResultsCard from './components/ResultsCard'
import CertificateModal from '@/components/CertificateModal'
import { checkStudentResult, StudentData } from '../utils/api'

// Regex pattern for exam number validation (e.g., ok/977/2025/001)
const EXAM_NO_REGEX = /^[a-zA-Z]{2}\/\d{3}\/\d{4}\/\d{3}$/

export default function StudentDashboardPage() {
    const router = useRouter()
    const [student, setStudent] = useState<StudentData | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [isCertificateModalOpen, setIsCertificateModalOpen] = useState(false)

    useEffect(() => {
        const fetchStudentData = async () => {
            const examNo = localStorage.getItem('student_exam_no');

            if (!examNo) {
                router.push('/student-portal')
                return
            }

            // Validate exam number format
            if (!EXAM_NO_REGEX.test(examNo)) {
                setError('Invalid exam number format')
                setTimeout(() => {
                    localStorage.removeItem('student_exam_no')
                    router.push('/student-portal')
                }, 3000)
                setIsLoading(false)
                return
            }

            try {
                const studentData = await checkStudentResult(examNo.replace(/\s/g, '').replace(/\//g, '-'));
                setStudent(studentData)
                setError(null)
            } catch (err) {
                console.error('Error fetching student data:', err)
                let errorMessage = 'Something went wrong'
                
                if (err instanceof Error) {
                    if (err.message.includes('404') || err.message.includes('not found')) {
                        errorMessage = '404: Student not found'
                    } else if (err.message.includes('400') || err.message.includes('Invalid')) {
                        errorMessage = '400: Invalid exam number'
                    } else if (err.message.includes('500') || err.message.includes('Server')) {
                        errorMessage = '500: Server error'
                    }
                }
                
                setError(errorMessage)
                
                // Auto logout after showing error
                setTimeout(() => {
                    localStorage.removeItem('student_exam_no')
                    router.push('/student-portal')
                }, 3000)
            } finally {
                setIsLoading(false)
            }
        }

        fetchStudentData()
    }, [router])

    const handleLogout = () => {
        localStorage.removeItem('student_exam_no')
        toast.success('Logged out successfully')
        router.push('/student-portal')
    }

    const handleDownload = () => {
        setIsCertificateModalOpen(true)
    }

    const handlePrint = () => {
        setIsCertificateModalOpen(true)
    }

    if (isLoading) {
        return (
            <>
                <header className="bg-white border-b border-gray-200">
                    <div className="px-6 h-[4.45rem] flex items-center w-full">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center">
                                <IoSchool className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <h1 className="text-lg font-bold text-gray-900">
                                    BECE Student Portal
                                </h1>
                            </div>
                        </div>
                    </div>
                </header>
                <main className="flex-1 overflow-y-auto">
                    <div className='p-6 bg-white/50 backdrop-blur-[2px] border border-black/10 m-1 mb-0 h-full overflow-y-auto'>
                        <div className="flex items-center justify-center h-64">
                            <div className="text-center">
                                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
                                <p className="mt-4 text-gray-600">Loading your results...</p>
                            </div>
                        </div>
                    </div>
                </main>
            </>
        )
    }

    if (error) {
        return (
            <>
                <header className="bg-white border-b border-gray-200">
                    <div className="px-6 h-[4.45rem] flex items-center w-full">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center">
                                <IoSchool className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <h1 className="text-lg font-bold text-gray-900">
                                    BECE Student Portal
                                </h1>
                            </div>
                        </div>
                    </div>
                </header>
                <main className="flex-1 overflow-y-auto">
                    <div className='p-6 bg-white/50 backdrop-blur-[2px] border border-black/10 m-1 mb-0 h-full overflow-y-auto'>
                        <div className="flex items-center justify-center h-64">
                            <div className="text-center max-w-md">
                                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                                <div className="text-red-600 text-lg font-medium mb-2">Error Loading Results</div>
                                <p className="text-gray-600 mb-4">{error}</p>
                                <p className="text-sm text-gray-500 mb-6">
                                    You will be redirected to the login page in 3 seconds...
                                </p>
                                <button
                                    onClick={handleLogout}
                                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-green-600 hover:bg-green-700 transition-all duration-150 cursor-pointer active:scale-95"
                                >
                                    <IoLogOut className="w-4 h-4 mr-2" />
                                    Back to Login Now
                                </button>
                            </div>
                        </div>
                    </div>
                </main>
            </>
        )
    }

    if (!student) {
        return null
    }

    return (
        <>
            {/* Header */}
            <header className="bg-white border-b border-gray-200 print:hidden">
                <div className="px-6 h-[4.45rem] flex items-center w-full">
                    <div className="flex items-center justify-between w-full">
                        {/* Logo */}
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center">
                                <IoSchool className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <h1 className="text-lg font-bold text-gray-900">
                                    BECE Student Portal
                                </h1>
                                <p className="text-xs text-gray-500">
                                    View Your Results
                                </p>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-2">
                            <button
                                onClick={handlePrint}
                                className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 transition-all duration-150 cursor-pointer active:scale-95 active:opacity-90"
                            >
                                <IoPrint className="w-4 h-4 mr-2" />
                                Print
                            </button>
                            <button
                                onClick={handleDownload}
                                className="inline-flex items-center px-3 py-2 border border-green-600 text-sm font-medium rounded-lg text-green-600 bg-green-50 hover:bg-green-100 transition-all duration-150 cursor-pointer active:scale-95 active:opacity-90"
                            >
                                <IoDownload className="w-4 h-4 mr-2" />
                                Download
                            </button>
                            <button
                                onClick={handleLogout}
                                className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-red-600 hover:bg-red-700 transition-all duration-150 cursor-pointer active:scale-95 active:opacity-90"
                            >
                                <IoLogOut className="w-4 h-4 mr-2" />
                                Logout
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="flex-1 overflow-y-auto">
                <div className='p-6 bg-white/50 backdrop-blur-[2px] border border-black/10 m-1 mb-0 h-full overflow-y-auto space-y-6'>
                    {/* Welcome Banner */}
                    <div className="print:hidden">
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">
                            Welcome, <span className="capitalize">{student.name.toLowerCase()}</span>! 🎉
                        </h2>
                        <p className="text-gray-600">
                            Here are your BECE examination results. You can download or print this page for your records.
                        </p>
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
                    <div className="space-y-6">
                        {/* Student Info */}
                        <StudentInfoCard student={student} />

                        {/* Results */}
                        <ResultsCard student={student} />
                    </div>
                </div>
            </main>

            {/* Print Footer */}
            <footer className="hidden print:block mt-12 pt-6 border-t-2 border-gray-300 text-center text-sm text-gray-600">
                <p>Ministry of Primary Education - Ghana</p>
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
        </>
    )
}
