import React from 'react'
import { IoSchool, IoPeople } from 'react-icons/io5'

interface StudentTableHeaderProps {
    schoolCount: number
}

export default function StudentTableHeader({ schoolCount }: StudentTableHeaderProps) {
    return (
        <div className="flex items-center justify-between">
            <div>
                <h1 className="text-2xl font-bold text-gray-900">{schoolCount} Schools</h1>
                <p className="text-gray-600 mt-1">Manage BECE student records by school</p>
            </div>
        </div>
    )
}
