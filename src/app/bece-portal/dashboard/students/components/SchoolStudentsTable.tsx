import React, { useState } from 'react'
import { Student } from '../types/student.types'
import StudentRow from './StudentRow'
import Pagination from './Pagination'

interface SchoolStudentsTableProps {
    students: Student[]
    onViewStudent: (student: Student) => void
    onGenerateCertificate: (student: Student) => void
}

export default function SchoolStudentsTable({ students, onViewStudent, onGenerateCertificate }: SchoolStudentsTableProps) {
    const [currentPage, setCurrentPage] = useState(1)
    const itemsPerPage = 10

    const totalPages = Math.ceil(students.length / itemsPerPage)
    const startIndex = (currentPage - 1) * itemsPerPage
    const endIndex = startIndex + itemsPerPage
    const paginatedStudents = students.slice(startIndex, endIndex)

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
                        {paginatedStudents.map((student, index) => (
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
            {totalPages > 1 && (
                <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={setCurrentPage}
                    itemsPerPage={itemsPerPage}
                    totalItems={students.length}
                />
            )}
        </div>
    )
}
