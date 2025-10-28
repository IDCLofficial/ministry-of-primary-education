import React from 'react'
import { IoSchool, IoPeople } from 'react-icons/io5'

interface StudentTableHeaderProps {
    schoolCount: number
    studentCount: number
}

export default function StudentTableHeader({ schoolCount, studentCount }: StudentTableHeaderProps) {
    return (
        <div className="flex items-center justify-between">
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Student Management</h1>
                <p className="text-gray-600 mt-1">Manage BECE student records by school</p>
            </div>
            <div className="flex items-center gap-4 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                    <IoSchool className="w-4 h-4" />
                    <span>{schoolCount} Schools</span>
                </div>
                <div className="flex items-center gap-2">
                    <IoPeople className="w-4 h-4" />
                    <span>{studentCount} Students</span>
                </div>
            </div>
        </div>
    )
}
