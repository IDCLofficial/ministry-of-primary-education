import React from 'react'
import { IoRibbon, IoTrophy, IoCheckmarkCircle } from 'react-icons/io5'
import { StudentData } from '../../utils/api'

interface ResultsCardProps {
    student: StudentData
}

export default function ResultsCard({ student }: ResultsCardProps) {
    const getGradeColor = (grade: string) => {
        if (grade.startsWith('A')) return 'bg-green-100 text-green-800 border-green-200'
        if (grade.startsWith('B')) return 'bg-green-100 text-green-800 border-green-200'
        if (grade.startsWith('C')) return 'bg-yellow-100 text-yellow-800 border-yellow-200'
        if (grade.startsWith('D')) return 'bg-orange-100 text-orange-800 border-orange-200'
        return 'bg-red-100 text-red-800 border-red-200'
    }

    const getOverallGradeColor = (grade: string) => {
        switch (grade) {
            case 'Distinction': return 'text-green-600 bg-green-50'
            case 'Credit': return 'text-green-600 bg-green-50'
            case 'Pass': return 'text-yellow-600 bg-yellow-50'
            default: return 'text-red-600 bg-red-50'
        }
    }

    return (
        <div className="space-y-6">
            {/* Overall Performance Summary */}
            <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl p-6 sm:p-8 shadow-xl shadow-green-500/20">
                <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                    <IoRibbon className="w-5 h-5" />
                    Overall Performance
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="bg-white/95 backdrop-blur-sm rounded-xl p-5 text-center hover:scale-105 transition-transform duration-200">
                        <div className="inline-flex items-center justify-center w-12 h-12 bg-green-100 rounded-xl mb-3">
                            <IoCheckmarkCircle className="w-6 h-6 text-green-600" />
                        </div>
                        <p className="text-3xl font-bold text-gray-900 mb-1">
                            {student.subjects.length}
                        </p>
                        <p className="text-xs font-medium text-gray-600 uppercase tracking-wider">Subjects Taken</p>
                    </div>

                    <div className="bg-white/95 backdrop-blur-sm rounded-xl p-5 text-center hover:scale-105 transition-transform duration-200">
                        <div className="inline-flex items-center justify-center w-12 h-12 bg-amber-100 rounded-xl mb-3">
                            <IoTrophy className="w-6 h-6 text-amber-600" />
                        </div>
                        <p className="text-3xl font-bold text-gray-900 mb-1">
                            {student.totalCredits}
                        </p>
                        <p className="text-xs font-medium text-gray-600 uppercase tracking-wider">Credits (A-C)</p>
                    </div>

                    <div className="bg-white/95 backdrop-blur-sm rounded-xl p-5 text-center hover:scale-105 transition-transform duration-200">
                        <div className={`inline-flex items-center justify-center w-12 h-12 rounded-xl mb-3 ${getOverallGradeColor(student.overallGrade)}`}>
                            <IoRibbon className="w-6 h-6" />
                        </div>
                        <p className={`text-3xl font-bold mb-1 ${student.overallGrade === 'Distinction' ? 'text-green-600' : student.overallGrade === 'Credit' ? 'text-green-600' : student.overallGrade === 'Pass' ? 'text-yellow-600' : 'text-red-600'}`}>
                            {student.overallGrade}
                        </p>
                        <p className="text-xs font-medium text-gray-600 uppercase tracking-wider">Overall Grade</p>
                    </div>
                </div>
            </div>

            {/* Detailed Results Table */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden hover:shadow-lg transition-shadow duration-300">
                <div className="px-6 py-5 bg-gradient-to-r from-gray-50 to-white border-b border-gray-200">
                    <h3 className="text-lg font-bold text-gray-900">
                        Subject Results
                    </h3>
                    <p className="text-sm text-gray-500 mt-1">
                        Detailed breakdown of your examination performance
                    </p>
                </div>

                <div className="overflow-x-auto">
                    <table className="min-w-full">
                        <thead>
                            <tr className="border-b border-gray-200">
                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                                    Subject
                                </th>
                                <th className="px-6 py-4 text-center text-xs font-bold text-gray-600 uppercase tracking-wider">
                                    Score
                                </th>
                                <th className="px-6 py-4 text-center text-xs font-bold text-gray-600 uppercase tracking-wider">
                                    Grade
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {student.subjects.map((subject, index) => (
                                <tr key={index} className="hover:bg-gradient-to-r hover:from-green-50/50 hover:to-transparent transition-all duration-200 group">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg flex items-center justify-center group-hover:from-green-100 group-hover:to-green-200 transition-all duration-200">
                                                <span className="text-xs font-bold text-gray-600 group-hover:text-green-700">
                                                    {index + 1}
                                                </span>
                                            </div>
                                            <span className="text-sm font-medium text-gray-900">
                                                {subject.name}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <span className="inline-flex items-center justify-center w-16 h-10 bg-gray-50 rounded-xl text-base font-bold text-gray-900 group-hover:bg-green-50 group-hover:text-green-700 transition-all duration-200">
                                            {subject.exam}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <span className={`inline-flex items-center justify-center px-4 py-2 text-sm font-bold rounded-xl border-2 group-hover:scale-110 transition-transform duration-200 ${getGradeColor(subject.grade)}`}>
                                            {subject.grade}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Grade Legend */}
                <div className="px-6 py-5 bg-gradient-to-r from-gray-50 to-white border-t border-gray-200">
                    <h4 className="text-sm font-bold text-gray-900 mb-4">Grading System</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                        <div className="flex items-center gap-2 bg-white rounded-xl px-3 py-2 border border-gray-200">
                            <div className="w-3 h-3 bg-green-500 rounded-full flex-shrink-0"></div>
                            <span className="text-xs font-medium text-gray-700">A1-B3: Excellent (65-100)</span>
                        </div>
                        <div className="flex items-center gap-2 bg-white rounded-xl px-3 py-2 border border-gray-200">
                            <div className="w-3 h-3 bg-yellow-500 rounded-full flex-shrink-0"></div>
                            <span className="text-xs font-medium text-gray-700">C4-C6: Good (45-64)</span>
                        </div>
                        <div className="flex items-center gap-2 bg-white rounded-xl px-3 py-2 border border-gray-200">
                            <div className="w-3 h-3 bg-orange-500 rounded-full flex-shrink-0"></div>
                            <span className="text-xs font-medium text-gray-700">D7: Fair (40-44)</span>
                        </div>
                        <div className="flex items-center gap-2 bg-white rounded-xl px-3 py-2 border border-gray-200">
                            <div className="w-3 h-3 bg-red-500 rounded-full flex-shrink-0"></div>
                            <span className="text-xs font-medium text-gray-700">E8-F9: Poor (0-39)</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
