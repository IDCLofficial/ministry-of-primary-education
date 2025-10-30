import React from 'react'
import { IoRibbon, IoTrophy, IoCheckmarkCircle } from 'react-icons/io5'
import { StudentData } from '../../utils/demoData'

interface ResultsCardProps {
    student: StudentData
}

export default function ResultsCard({ student }: ResultsCardProps) {
    const getGradeColor = (grade: string) => {
        if (grade.startsWith('A')) return 'bg-green-100 text-green-800 border-green-200'
        if (grade.startsWith('B')) return 'bg-blue-100 text-blue-800 border-blue-200'
        if (grade.startsWith('C')) return 'bg-yellow-100 text-yellow-800 border-yellow-200'
        if (grade.startsWith('D')) return 'bg-orange-100 text-orange-800 border-orange-200'
        return 'bg-red-100 text-red-800 border-red-200'
    }

    const getOverallGradeColor = (grade: string) => {
        switch (grade) {
            case 'Distinction': return 'text-green-600 bg-green-50'
            case 'Credit': return 'text-blue-600 bg-blue-50'
            case 'Pass': return 'text-yellow-600 bg-yellow-50'
            default: return 'text-red-600 bg-red-50'
        }
    }

    return (
        <div className="space-y-6">
            {/* Overall Performance Summary */}
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-blue-900 mb-4 flex items-center">
                    <IoRibbon className="w-5 h-5 mr-2" />
                    Overall Performance
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-white rounded-lg p-4 text-center">
                        <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-100 rounded-full mb-2">
                            <IoCheckmarkCircle className="w-6 h-6 text-blue-600" />
                        </div>
                        <p className="text-3xl font-bold text-blue-600">
                            {student.subjects.length}
                        </p>
                        <p className="text-sm text-gray-600">Subjects Taken</p>
                    </div>

                    <div className="bg-white rounded-lg p-4 text-center">
                        <div className="inline-flex items-center justify-center w-12 h-12 bg-green-100 rounded-full mb-2">
                            <IoTrophy className="w-6 h-6 text-green-600" />
                        </div>
                        <p className="text-3xl font-bold text-green-600">
                            {student.totalCredits}
                        </p>
                        <p className="text-sm text-gray-600">Credits (A-C)</p>
                    </div>

                    <div className="bg-white rounded-lg p-4 text-center">
                        <div className={`inline-flex items-center justify-center w-12 h-12 rounded-full mb-2 ${getOverallGradeColor(student.overallGrade)}`}>
                            <IoRibbon className="w-6 h-6" />
                        </div>
                        <p className={`text-3xl font-bold ${student.overallGrade === 'Distinction' ? 'text-green-600' : student.overallGrade === 'Credit' ? 'text-blue-600' : student.overallGrade === 'Pass' ? 'text-yellow-600' : 'text-red-600'}`}>
                            {student.overallGrade}
                        </p>
                        <p className="text-sm text-gray-600">Overall Grade</p>
                    </div>
                </div>
            </div>

            {/* Detailed Results Table */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden animate-fadeIn-y hover:shadow-lg transition-all duration-300">
                <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-900">
                        BECE Examination Results
                    </h3>
                    <p className="text-sm text-gray-600 mt-1">
                        Detailed breakdown of your performance
                    </p>
                </div>

                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Subject
                                </th>
                                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    CA (30)
                                </th>
                                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Exam (70)
                                </th>
                                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Total (100)
                                </th>
                                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Grade
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {student.subjects.map((subject, index) => (
                                <tr key={index} className="hover:bg-blue-50 transition-all duration-200 group cursor-pointer">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm font-medium text-gray-900">
                                            {subject.name}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-center">
                                        <span className="text-sm text-gray-900 font-medium">
                                            {subject.ca}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-center">
                                        <span className="text-sm text-gray-900 font-medium">
                                            {subject.exam}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-center">
                                        <span className="text-sm font-bold text-gray-900">
                                            {subject.total}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-center">
                                        <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full border group-hover:scale-110 transition-transform duration-200 ${getGradeColor(subject.grade)}`}>
                                            {subject.grade}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Grade Legend */}
                <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
                    <h4 className="text-sm font-medium text-gray-900 mb-3">BECE Grading System</h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                        <div className="flex items-center">
                            <span className="inline-block w-3 h-3 bg-green-500 rounded-full mr-2"></span>
                            <span className="text-gray-700">A1-A3: Excellent (80-100)</span>
                        </div>
                        <div className="flex items-center">
                            <span className="inline-block w-3 h-3 bg-blue-500 rounded-full mr-2"></span>
                            <span className="text-gray-700">B2-B3: Very Good (65-79)</span>
                        </div>
                        <div className="flex items-center">
                            <span className="inline-block w-3 h-3 bg-yellow-500 rounded-full mr-2"></span>
                            <span className="text-gray-700">C4-C6: Good (45-64)</span>
                        </div>
                        <div className="flex items-center">
                            <span className="inline-block w-3 h-3 bg-red-500 rounded-full mr-2"></span>
                            <span className="text-gray-700">D7-F9: Poor (0-44)</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
