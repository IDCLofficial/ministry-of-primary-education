import React from 'react'
import { IoEye, IoDocumentText } from 'react-icons/io5'
import { Student } from '../types/student.types'

interface StudentRowProps {
    student: Student
    onViewStudent: (student: Student) => void
    onGenerateCertificate: (student: Student) => void
}

export default function StudentRow({ student, onViewStudent, onGenerateCertificate }: StudentRowProps) {
    return (
        <tr className="hover:bg-gray-50 transition-colors">
            <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center pl-10">
                    <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center mr-3 border border-black/10">
                        <span className="text-xs font-semibold text-gray-600">
                            {student.name.split(' ').map(n => n.charAt(0)).join('').slice(0, 2)}
                        </span>
                    </div>
                    <div>
                        <div className="text-sm font-medium text-gray-900 capitalize">
                            {student.name.toLowerCase()}
                        </div>
                    </div>
                </div>
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-mono uppercase">
                {student.examNo}
            </td>
            <td className="px-6 py-4 whitespace-nowrap">
                <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full border border-black/10 ${
                    student.sex === 'M' 
                        ? 'bg-blue-100 text-blue-800' 
                        : 'bg-pink-100 text-pink-800'
                }`}>
                    {student.sex}
                </span>
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {student.subjects.length} subjects
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => onViewStudent(student)}
                        className="inline-flex items-center px-3 py-1 text-xs font-medium text-blue-600 bg-blue-50 border border-blue-200 rounded-md hover:bg-blue-100 hover:text-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 transition-all cursor-pointer active:scale-95"
                    >
                        <IoEye className="w-3 h-3 mr-1" />
                        View
                    </button>
                    <button
                        onClick={() => onGenerateCertificate(student)}
                        className="inline-flex items-center px-3 py-1 text-xs font-medium text-green-600 bg-green-50 border border-green-200 rounded-md hover:bg-green-100 hover:text-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-1 transition-all cursor-pointer active:scale-95"
                    >
                        <IoDocumentText className="w-3 h-3 mr-1" />
                        Certificate
                    </button>
                </div>
            </td>
        </tr>
    )
}
