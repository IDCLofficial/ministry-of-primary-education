import React from 'react'
import { Student } from '../types/student.types'
import StudentRow from './StudentRow'
import Pagination from './Pagination'

interface SchoolStudentsTableProps {
    students: Student[]
    onViewStudent: (student: Student) => void
    onGenerateCertificate: (student: Student) => void
    pagination: {
        currentPage: number
        totalPages: number
        onPageChange: (page: number) => void
        itemsPerPage: number
        totalItems: number
        disabled: boolean
    }
}

export default function SchoolStudentsTable({ students, onViewStudent, onGenerateCertificate, pagination }: SchoolStudentsTableProps) {

    return (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
                <table className="min-w-full">
                    <thead className="bg-gray-50 border-b border-gray-200">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Student Name
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Exam Number
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Gender
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Subjects
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Actions
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {students.map((student, index) => (
                            <StudentRow 
                                key={`${student.examNo}-${index}`} 
                                student={student} 
                                onViewStudent={onViewStudent}
                                onGenerateCertificate={onGenerateCertificate}
                            />
                        ))}
                    </tbody>
                </table>
            </div>
            {pagination.totalPages > 1 && (
                <Pagination
                    disabled={pagination.disabled}
                    currentPage={pagination.currentPage}
                    totalPages={pagination.totalPages}
                    onPageChange={pagination.onPageChange}
                    itemsPerPage={pagination.itemsPerPage}
                    totalItems={pagination.totalItems}
                />
            )}
        </div>
    )
}
