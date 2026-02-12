import React from 'react'
import { StudentData } from '../../utils/api'

interface ResultsCardProps {
    student: StudentData
}

export default function ResultsCard({ student }: ResultsCardProps) {
    const getGradeColor = (grade: string) => {
        if (grade.startsWith('A')) return 'bg-green-50 text-green-700 border-green-200'
        if (grade.startsWith('B')) return 'bg-green-50 text-green-700 border-green-200'
        if (grade.startsWith('C')) return 'bg-yellow-50 text-yellow-700 border-yellow-200'
        if (grade.startsWith('D')) return 'bg-orange-50 text-orange-700 border-orange-200'
        return 'bg-red-50 text-red-700 border-red-200'
    }

    return (
        <div className="space-y-4">
            {/* Overall Performance Summary */}
            <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
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
            <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
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
    )
}
