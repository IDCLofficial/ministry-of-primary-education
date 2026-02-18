'use client'
import React, { useState } from 'react'
import { IoClose, IoSchool, IoPerson, IoCalendar, IoRibbon, IoDocumentText } from 'react-icons/io5'
import toast from 'react-hot-toast'
import { UBEATStudent } from '../../../types/student.types'
import useShortcuts, { KeyboardKey } from '@useverse/useshortcuts'
import { generateUBEATCertificate } from '../utils/certificateGenerator'

interface UBEATStudentModalProps {
    isOpen: boolean
    onClose: () => void
    student: UBEATStudent | null
    schoolName?: string
    onGenerateCertificate?: (student: UBEATStudent) => void
}

const getScoreColor = (score: number, max: number): string => {
    const percentage = (score / max) * 100
    if (percentage >= 80) return 'text-green-600'
    if (percentage >= 70) return 'text-blue-600'
    if (percentage >= 60) return 'text-yellow-600'
    if (percentage >= 50) return 'text-orange-600'
    return 'text-red-600'
}

const getGradeColor = (grade: string): string => {
    const lowerGrade = grade.toLowerCase()
    if (lowerGrade.includes('distinction') || lowerGrade === 'a') return 'bg-green-100 text-green-800 border-green-200'
    if (lowerGrade.includes('credit') || lowerGrade === 'b') return 'bg-blue-100 text-blue-800 border-blue-200'
    if (lowerGrade.includes('pass') || lowerGrade === 'c') return 'bg-yellow-100 text-yellow-800 border-yellow-200'
    if (lowerGrade.includes('merit') || lowerGrade === 'd') return 'bg-orange-100 text-orange-800 border-orange-200'
    return 'bg-red-100 text-red-800 border-red-200'
}

export default function UBEATStudentModal({ isOpen, onClose, student, schoolName, onGenerateCertificate }: UBEATStudentModalProps) {
    const [isGenerating, setIsGenerating] = useState(false)
    
    // Keyboard shortcuts
    useShortcuts({
        shortcuts: [
            {
                key: KeyboardKey.Escape,
                enabled: isOpen
            }
        ],
        onTrigger: () => {
            onClose()
        }
    })

    const handleGenerateCertificate = async (certificateType: 'pass' | 'credit' | 'distinction' = 'pass') => {
        if (!student) return

        setIsGenerating(true)
        try {
            await generateUBEATCertificate({
                student,
                schoolName: schoolName || student.schoolName
            }, certificateType)
            toast.success('Certificate downloaded successfully!')
            
            // Call the optional callback if provided
            if (onGenerateCertificate) {
                onGenerateCertificate(student)
            }
        } catch (error) {
            console.error('Error generating certificate:', error)
            toast.error('Failed to generate certificate. Please try again.')
        } finally {
            setIsGenerating(false)
        }
    }

    if (!isOpen || !student) return null

    const subjects = [
        { key: 'mathematics', name: 'Mathematics', data: student.subjects.mathematics },
        { key: 'english', name: 'English Language', data: student.subjects.english },
        { key: 'generalKnowledge', name: 'General Knowledge', data: student.subjects.generalKnowledge },
        { key: 'igbo', name: 'Igbo Language', data: student.subjects.igbo }
    ]

    // Calculate average from all subject totals
    const totalSum = subjects.reduce((sum, subject) => sum + subject.data.total, 0)
    const averageScore = totalSum / 4

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0 relative">
                {/* Background overlay */}
                <div
                    className="fixed inset-0 transition-opacity bg-black/50"
                    onClick={onClose}
                />

                {/* Modal panel */}
                <div className="inline-block w-full relative z-20 max-w-5xl p-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-2xl">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h3 className="text-2xl font-bold text-gray-900">
                                UBEAT Student Report
                            </h3>
                            <p className="text-sm text-gray-600 mt-1">
                                <span className="capitalize">{student.studentName.toLowerCase()}</span> - <span className="uppercase">{student.examNumber}</span>
                            </p>
                        </div>
                        <div className="flex items-center space-x-2">
                            {student.isPaid && <button
                                onClick={() => handleGenerateCertificate(student.grade.toLowerCase() as 'pass' | 'credit' | 'distinction')}
                                disabled={isGenerating}
                                className="inline-flex cursor-pointer active:scale-90 active:rotate-1 transition-all duration-150 items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isGenerating ? (
                                    <>
                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                        Generating...
                                    </>
                                ) : (
                                    <>
                                        <IoDocumentText className="w-4 h-4 mr-2" />
                                        Download Certificate
                                    </>
                                )}
                            </button>}
                            {!student.isPaid && <div className="text-sm text-gray-700 bg-gray-100 italic border-2 border-gray-300 rounded-3xl px-3 py-0.5">Yet to pay</div>}
                            <button
                                onClick={onClose}
                                className="p-2 text-gray-400 cursor-pointer active:scale-90 active:rotate-1 transition-all duration-150 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 rounded-md"
                            >
                                <IoClose className="w-6 h-6" />
                            </button>
                        </div>
                    </div>

                    {/* Content */}
                    <div>
                        {/* Student Information */}
                        <div className="bg-gray-50 border border-black/5 rounded-lg p-6 mb-6">
                            <h4 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                                <IoPerson className="w-5 h-5 mr-2" />
                                Student Information
                            </h4>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                                <div>
                                    <label className="text-sm font-medium text-gray-500 flex items-center">
                                        <IoSchool className="w-4 h-4 mr-1" />
                                        School Name
                                    </label>
                                    <p className="text-sm text-gray-900 mt-1 capitalize">{schoolName?.toLowerCase() || student.schoolName.toLowerCase()}</p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-500">Full Name</label>
                                    <p className="text-sm text-gray-900 mt-1 capitalize">{student.studentName.toLowerCase()}</p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-500">Exam Number</label>
                                    <p className="text-sm text-gray-900 mt-1 font-mono">{student.examNumber}</p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-500 flex items-center">
                                        <IoCalendar className="w-4 h-4 mr-1" />
                                        LGA
                                    </label>
                                    <p className="text-sm text-gray-900 mt-1 capitalize">{student.lga.toLowerCase()}</p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-500">Age</label>
                                    <p className="text-sm text-gray-900 mt-1">{student.age} years</p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-500 flex items-center">
                                        <IoRibbon className="w-4 h-4 mr-1" />
                                        Gender
                                    </label>
                                    <p className="text-sm text-gray-900 mt-1 capitalize">{student.sex}</p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-500">Serial Number</label>
                                    <p className="text-sm text-gray-900 mt-1">#{student.serialNumber}</p>
                                </div>
                                {student.examYear && (
                                    <div>
                                        <label className="text-sm font-medium text-gray-500 flex items-center">
                                            <IoCalendar className="w-4 h-4 mr-1" />
                                            Exam Year
                                        </label>
                                        <p className="text-sm text-gray-900 mt-1 font-semibold">{student.examYear}</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Overall Performance */}
                        <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-6">
                            <h4 className="text-lg font-medium text-green-900 mb-4 flex items-center">
                                <IoRibbon className="w-5 h-5 mr-2" />
                                Overall Performance
                            </h4>
                            <div className="grid grid-cols-3 gap-6 text-center">
                                <div>
                                    <p className="text-3xl font-bold text-green-600">
                                        {subjects.length}
                                    </p>
                                    <p className="text-sm text-gray-600">Subjects Taken</p>
                                </div>
                                <div>
                                    <p className={`text-3xl font-bold ${getScoreColor(averageScore, 100)}`}>
                                        {averageScore.toFixed(2)}
                                    </p>
                                    <p className="text-sm text-gray-600">Average Score</p>
                                </div>
                                <div>
                                    <div className={`inline-flex items-center px-4 py-2 rounded-lg font-bold text-2xl border ${getGradeColor(student.grade)}`}>
                                        {student.grade.toUpperCase()}
                                    </div>
                                    <p className="text-sm text-gray-600 mt-2">Overall Grade</p>
                                </div>
                            </div>
                        </div>

                        {/* Subjects Table */}
                        <div className="mb-6">
                            <h4 className="text-lg font-medium text-gray-900 mb-4">UBEAT Examination Results</h4>

                            <div className="overflow-x-auto">
                                <table className="min-w-full bg-white border border-gray-200 rounded-lg">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Subject
                                            </th>
                                            <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                CA (30%)
                                            </th>
                                            <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Exam (70%)
                                            </th>
                                            <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Total (100)
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200">
                                        {subjects.map((subject) => (
                                            <tr key={subject.key} className="hover:bg-gray-50">
                                                <td className="px-4 py-4 whitespace-nowrap">
                                                    <span className="text-sm font-medium text-gray-900">
                                                        {subject.name}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-4 whitespace-nowrap text-center">
                                                    <span className={`text-sm font-semibold ${getScoreColor(subject.data.ca, 30)}`}>
                                                        {subject.data.ca}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-4 whitespace-nowrap text-center">
                                                    <span className={`text-sm font-semibold ${getScoreColor(subject.data.exam, 70)}`}>
                                                        {subject.data.exam}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-4 whitespace-nowrap text-center">
                                                    <span className={`text-base font-bold ${getScoreColor(subject.data.total, 100)}`}>
                                                        {subject.data.total}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                    <tfoot className="bg-gray-50 border-t border-gray-200">
                                        <tr>
                                            <td colSpan={3} className="px-4 py-4 text-right text-sm font-bold text-gray-700 uppercase">
                                                Total Score
                                            </td>
                                            <td className="px-4 py-4 text-center">
                                                <span className="text-lg font-bold text-green-600">
                                                    {totalSum}
                                                </span>
                                                <span className="text-xs text-gray-500 ml-1">/400</span>
                                            </td>
                                        </tr>
                                    </tfoot>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
