import React from 'react'
import { IoEye } from 'react-icons/io5'
import { Student } from '../types/student.types'

interface StudentRowProps {
    student: Student
    onViewStudent: (student: Student) => void
}

export default function StudentRow({ student, onViewStudent }: StudentRowProps) {
    return (
        <tr className="hover:bg-gray-50 transition-colors">
            <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center pl-10">
                    <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center mr-3">
                        <span className="text-xs font-medium text-gray-600">
                            {student.firstName.charAt(0)}{student.lastName.charAt(0)}
                        </span>
                    </div>
                    <div>
                        <div className="text-sm font-medium text-gray-900">
                            {student.firstName} {student.lastName}
                        </div>
                    </div>
                </div>
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-mono">
                {student.examNo}
            </td>
            <td className="px-6 py-4 whitespace-nowrap">
                <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                    student.gender === 'Male' 
                        ? 'bg-blue-100 text-blue-800' 
                        : 'bg-pink-100 text-pink-800'
                }`}>
                    {student.gender}
                </span>
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {new Date(student.dateOfBirth).toLocaleDateString('en-GB')}
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {student.class}
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                <button
                    onClick={() => onViewStudent(student)}
                    className="inline-flex items-center px-3 py-1 text-xs font-medium text-blue-600 bg-blue-50 border border-blue-200 rounded-md hover:bg-blue-100 hover:text-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 transition-colors"
                >
                    <IoEye className="w-3 h-3 mr-1" />
                    View
                </button>
            </td>
        </tr>
    )
}
