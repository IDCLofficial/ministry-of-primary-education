'use client'
import { useRef } from 'react';
import { IoClose, IoDownload } from 'react-icons/io5';
import toast from 'react-hot-toast';
import Image from 'next/image';

interface Subject {
    name: string
    exam: number
}

interface StudentData {
    name: string
    examNo: string
    school?: string
    schoolName?: string
    subjects: Subject[]
}

interface CertificateModalProps {
    isOpen: boolean
    onClose: () => void
    student: StudentData | null
    schoolName?: string
}

export default function CertificateModal({ isOpen, onClose, student, schoolName }: CertificateModalProps) {
    const certificateRef = useRef<HTMLDivElement>(null);
    if (!isOpen || !student) return null

    const validateStudentData = (): { valid: boolean; errors: string[] } => {
        const errors: string[] = []

        if (!student.name || student.name.trim() === '') {
            errors.push('Student name is missing')
        }
        if (!student.examNo || student.examNo.trim() === '') {
            errors.push('Exam number is missing')
        }
        if (!student.subjects || student.subjects.length === 0) {
            errors.push('No subjects found')
        }
        if (student.subjects && student.subjects.some(s => !s.name || s.name.trim() === '')) {
            errors.push('Some subjects are missing names')
        }
        if (student.subjects && student.subjects.some(s => typeof s.exam !== 'number')) {
            errors.push('Some subjects have invalid scores')
        }

        return { valid: errors.length === 0, errors }
    }

    const calculateAggregate = () => {
        const grades = student.subjects.map(subject => {
            const total = subject.exam
            if (total >= 80) return 1
            if (total >= 75) return 2
            if (total >= 70) return 3
            if (total >= 65) return 4
            if (total >= 60) return 5
            if (total >= 55) return 6
            if (total >= 50) return 7
            if (total >= 45) return 8
            return 9
        })
        return grades.reduce((sum, grade) => sum + grade, 0)
    }

    const getOverallGrade = (aggregate: number) => {
        if (aggregate <= 6) return 'Distinction'
        if (aggregate <= 12) return 'Credit'
        if (aggregate <= 18) return 'Pass'
        return 'Fail'
    }

    const overallGradeColor = (overallGrade: string) => {
        if (overallGrade.toLowerCase() === 'distinction') return '#32493e'
        if (overallGrade.toLowerCase() === 'credit') return '#000080'
        if (overallGrade.toLowerCase() === 'pass') return '#FF7900'
        return '#c41e3a'
    }

    const aggregate = calculateAggregate()
    const overallGrade = getOverallGrade(aggregate)
    const school = schoolName || student.schoolName || student.school || 'N/A'

    const handlePrint = () => {
        if (!certificateRef.current) {
            toast.error('Certificate preview not ready')
            return
        }
        const validation = validateStudentData()

        if (!validation.valid) {
            toast.error(`Cannot print certificate: ${validation.errors.join(', ')}`)
            return
        }
        
        window.print()
    }

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex items-center justify-center h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
                <div
                    className="fixed inset-0 transition-opacity bg-black/75"
                    onClick={onClose}
                />

                <div className="inline-block w-full max-w-5xl my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-2xl relative z-10">
                    <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 print:hidden">
                        <h3 className="text-lg font-semibold text-gray-900">
                            BECE Certificate
                        </h3>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={handlePrint}
                                className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-green-600 border border-transparent rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all cursor-pointer active:scale-95"
                            >
                                <IoDownload className="w-4 h-4 mr-2" />
                                Print
                            </button>
                            <button
                                onClick={onClose}
                                className="p-2 text-gray-400 hover:text-gray-500 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
                            >
                                <IoClose className="w-5 h-5" />
                            </button>
                        </div>
                    </div>

                    <div className="p-8 overflow-y-auto max-h-[calc(100vh-200px)]">
                        <div
                            ref={certificateRef}
                            className="relative overflow-hidden"
                            style={{
                                aspectRatio: '1.414',
                                maxWidth: '900px',
                                margin: '0 auto',
                                background: 'linear-gradient(to bottom right, #FEF3C7, #FED7AA)'
                            }}
                        >
                            {/* Green triangular corners */}
                            <div className="absolute top-0 left-0 w-0 h-0" style={{
                                borderLeft: '120px solid transparent',
                                borderTop: '120px solid #15803d'
                            }}></div>
                            <div className="absolute top-0 right-0 w-0 h-0" style={{
                                borderRight: '120px solid transparent',
                                borderTop: '120px solid #15803d',
                                zIndex: 20
                            }}></div>
                            <div className="absolute bottom-0 left-0 w-0 h-0" style={{
                                borderLeft: '120px solid transparent',
                                borderBottom: '120px solid #15803d',
                                zIndex: 20
                            }}></div>
                            <div className="absolute bottom-0 right-0 w-0 h-0" style={{
                                borderRight: '120px solid transparent',
                                borderBottom: '120px solid #15803d'
                            }}></div>

                            {/* Gold dots at corners */}
                            <div className="absolute top-3 left-3 w-3 h-3 rounded-full" style={{ backgroundColor: '#f59e0b' }}></div>
                            <div className="absolute top-3 right-3 w-3 h-3 rounded-full" style={{ backgroundColor: '#f59e0b', zIndex: 20 }}></div>
                            <div className="absolute bottom-3 left-3 w-3 h-3 rounded-full" style={{ backgroundColor: '#f59e0b', zIndex: 20 }}></div>
                            <div className="absolute bottom-3 right-3 w-3 h-3 rounded-full" style={{ backgroundColor: '#f59e0b' }}></div>

                            {/* Main Content */}
                            <div className="relative z-10 p-12 m-6" style={{
                                border: '4px solid #d97706',
                                backgroundColor: 'rgba(255, 255, 255, 0.95)'
                            }}>
                                {/* Logo */}
                                <div className="flex justify-center mb-4">
                                    <Image
                                        src="/images/ministry-logo.png"
                                        alt="Ministry Logo"
                                        width={80}
                                        height={80}
                                        className="object-contain"
                                    />
                                </div>

                                {/* Header */}
                                <div className="text-center mb-6">
                                    <h1 className="text-2xl font-bold text-gray-800 mb-2 tracking-wide uppercase">
                                        {school}
                                    </h1>
                                    <h2 className="text-3xl font-serif font-bold mb-4" style={{ color: '#15803d' }}>
                                        CERTIFICATE OF EXCELLENCE
                                    </h2>
                                    <p className="text-sm text-gray-600 italic">
                                        This certificate is awarded to
                                    </p>
                                </div>

                                {/* Student Name */}
                                <div className="text-center mb-6">
                                    <h3 className="text-2xl font-serif font-bold capitalize" style={{ color: '#166534' }}>
                                        {student.name.toLowerCase()}
                                    </h3>
                                </div>

                                {/* Achievement Text */}
                                <div className="text-center mb-6 max-w-2xl mx-auto">
                                    <p id="certificate" className="text-sm text-gray-700 leading-relaxed">
                                        in recognition of outstanding academic achievement in the
                                        <span className="font-semibold"> Basic Education Certificate Examination (BECE)</span>,
                                        demonstrating excellence and dedication to learning.
                                    </p>
                                </div>

                                {/* Student Details */}
                                <div className="grid grid-cols-3 gap-4 mb-6 text-center text-xs">
                                    <div>
                                        <p className="text-gray-500 mb-1">Exam Number</p>
                                        <p className="font-semibold text-gray-800 uppercase text-lg">{student.examNo}</p>
                                    </div>
                                    <div>
                                        <p className="text-gray-500 mb-1">Overall Grade</p>
                                        <p className="font-semibold lowercase text-lg" style={{ color: overallGradeColor(overallGrade) }}>{overallGrade}</p>
                                    </div>
                                    <div>
                                        <p className="text-gray-500 mb-1">Aggregate</p>
                                        <p className="font-semibold text-gray-800 text-lg">{aggregate}</p>
                                    </div>
                                </div>

                                {/* Date */}
                                <div className="text-center mb-8">
                                    <p className="text-sm text-gray-600">
                                        Given this {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}.
                                    </p>
                                </div>

                                {/* Signature */}
                                <div className="text-center mt-12">
                                    <div className="inline-block">
                                        <div className="pt-2 px-8" style={{ borderTop: '2px solid #1f2937' }}>
                                            <p className="text-sm font-semibold text-gray-800">Hr. Minister Professor Bernard Thompson Onyemechukwu Ikegwuoha</p>
                                            <p className="text-xs text-gray-600">Imo State Ministry of Primary and Secondary Education</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
