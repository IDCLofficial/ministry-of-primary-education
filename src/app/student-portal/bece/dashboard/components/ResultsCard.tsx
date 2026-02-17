import React from 'react'
import { StudentData } from '@/app/student-portal/utils/api'
import { IoTrophy } from 'react-icons/io5'

interface ResultsCardProps {
    student: StudentData
}

export default function ResultsCard({ student }: ResultsCardProps) {
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
        <div className="space-y-4">
            {/* Overall Performance Summary */}
            <div className="bg-white border border-gray-200 rounded-3xl overflow-hidden">
                <div className="border-b border-gray-100 px-6 py-4">
                    <h3 className="text-sm font-semibold text-gray-900">
                        Overall Performance
                    </h3>
                </div>
                <div className="p-6">
                    <div className="grid grid-cols-3 gap-4">
                        <div className="text-center">
                            <p className="text-2xl font-semibold text-gray-900 mb-1">
                                {student.subjects.length}
                            </p>
                            <p className="text-xs text-gray-500">Subjects</p>
                        </div>

                        <div className="text-center border-l border-r border-gray-200">
                            <p className="text-2xl font-semibold text-gray-900 mb-1">
                                {student.totalCredits}
                            </p>
                            <p className="text-xs text-gray-500">Credits</p>
                        </div>

                        <div className="text-center">
                            <p className="text-2xl font-semibold text-green-600 mb-1">
                                {student.overallGrade}
                            </p>
                            <p className="text-xs text-gray-500">Grade</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Detailed Results Table */}
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
                            {student.subjects.map((subject, index) => (
                                <tr key={index} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-3">
                                        <div className="flex items-center gap-3">
                                            <span className="w-6 h-6 flex items-center justify-center text-xs font-medium text-gray-400">
                                                {index + 1}
                                            </span>
                                            <span className="text-sm text-gray-900">
                                                {subject.name}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-3 text-center">
                                        <span className="text-sm font-medium text-gray-900">
                                            {subject.exam}
                                        </span>
                                    </td>
                                    <td className="px-6 py-3 text-center">
                                        <span className={`inline-flex items-center gap-1 ${hasA1(subject.grade) ? 'px-2.5 py-1 rounded-lg shadow-sm' : ''} text-xs font-bold ${getGradeColor(subject.grade)}`}>
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
    )
}
