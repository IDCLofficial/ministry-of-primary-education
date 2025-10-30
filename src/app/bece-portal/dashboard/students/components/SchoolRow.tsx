import React from 'react'
import { IoChevronDown, IoChevronForward, IoSchool } from 'react-icons/io5'
import { School } from '../types/student.types'

interface SchoolRowProps {
    school: School
    isExpanded: boolean
    onToggle: (schoolId: string) => void
}

// Helper function to safely extract LGA name
const getLgaName = (lga: string | { _id: string; name: string }): string => {
    if (typeof lga === 'string') {
        return lga
    }
    return lga?.name || 'Unknown LGA'
}

export default function SchoolRow({ school, isExpanded, onToggle }: SchoolRowProps) {
    return (
        <tr 
            className="bg-blue-50 hover:bg-blue-100 cursor-pointer transition-colors"
            onClick={() => onToggle(school._id)}
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
                        <div className="text-sm font-medium text-gray-900 capitalize">
                            {school.schoolName.toLowerCase()}
                        </div>
                        <div className="text-sm text-gray-500 capitalize">
                            {getLgaName(school.lga).toLowerCase()} • {school.students} students
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
