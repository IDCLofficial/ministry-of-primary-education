'use client'
import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { IoLogOut, IoDownload, IoPrint, IoSchool } from 'react-icons/io5'
import toast from 'react-hot-toast'
import StudentInfoCard from './components/StudentInfoCard'
import ResultsCard from './components/ResultsCard'
import { generateDemoStudent, StudentData } from '../utils/demoData'

export default function StudentDashboardPage() {
    const router = useRouter()
    const [student, setStudent] = useState<StudentData | null>(null)
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        // Check if student is logged in
        const examNo = localStorage.getItem('student_exam_no')

        if (!examNo) {
            router.push('/student-portal')
            return
        }

        // Load demo student data
        setTimeout(() => {
            const studentData = generateDemoStudent(examNo)
            setStudent(studentData)
            setIsLoading(false)
        }, 500)
    }, [router])

    const handleLogout = () => {
        localStorage.removeItem('student_exam_no')
        toast.success('Logged out successfully')
        router.push('/student-portal')
    }

    const handleDownload = () => {
        toast.success('Download feature coming soon!')
    }

    const handlePrint = () => {
        window.print()
    }

    if (isLoading) {
        return (
            <>
                <header className="bg-white border-b border-gray-200">
                    <div className="px-6 h-[4.45rem] flex items-center w-full">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
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
                                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                                <p className="mt-4 text-gray-600">Loading your results...</p>
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
                            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
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
                                className="inline-flex items-center px-3 py-2 border border-blue-600 text-sm font-medium rounded-lg text-blue-600 bg-blue-50 hover:bg-blue-100 transition-all duration-150 cursor-pointer active:scale-95 active:opacity-90"
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

                    {/* Footer Info */}
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 print:hidden">
                        <h3 className="text-sm font-semibold text-blue-900 mb-2">
                            Important Information
                        </h3>
                        <ul className="text-sm text-blue-800 space-y-1">
                            <li>• This is an official BECE results statement</li>
                            <li>• Keep this document safe for future reference</li>
                            <li>• For any discrepancies, contact your school or the examination board</li>
                            <li>• Results are final and cannot be altered</li>
                        </ul>
                    </div>

                    {/* Demo Notice */}
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 print:hidden">
                        <p className="text-sm text-yellow-800">
                            <strong>Demo Mode:</strong> This is a demonstration portal with sample data. In production, this would display real student results from the database.
                        </p>
                    </div>
                </div>
            </main>

            {/* Print Footer */}
            <footer className="hidden print:block mt-12 pt-6 border-t-2 border-gray-300 text-center text-sm text-gray-600">
                <p>Ministry of Primary Education - Ghana</p>
                <p className="mt-1">This is an official document. Any alterations will render it invalid.</p>
                <p className="mt-2 text-xs">Printed on: {new Date().toLocaleDateString()}</p>
            </footer>
        </>
    )
}
