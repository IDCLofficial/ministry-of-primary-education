import React from 'react'
import { IoChevronDown, IoChevronForward, IoSchool } from 'react-icons/io5'
import { School } from '../types/student.types'

interface SchoolRowProps {
    school: School
    isExpanded: boolean
    onToggle: (schoolId: string) => void
}

export default function SchoolRow({ school, isExpanded, onToggle }: SchoolRowProps) {
    return (
        <tr 
            className="bg-blue-50 hover:bg-blue-100 cursor-pointer transition-colors"
            onClick={() => onToggle(school.id)}
        >
            <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center">
                    <div className="mr-3">
                        {isExpanded ? (
                            <IoChevronDown className="w-4 h-4 text-gray-500" />
                        ) : (
                            <IoChevronForward className="w-4 h-4 text-gray-500" />
                        )}
                    </div>
                    <IoSchool className="w-5 h-5 text-blue-600 mr-3" />
                    <div>
                        <div className="text-sm font-medium text-gray-900">
                            {school.name}
                        </div>
                        <div className="text-sm text-gray-500">
                            {school.location} • {school.students.length} students
                        </div>
                    </div>
                </div>
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                —
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                —
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                —
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                —
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                —
            </td>
        </tr>
    )
}
