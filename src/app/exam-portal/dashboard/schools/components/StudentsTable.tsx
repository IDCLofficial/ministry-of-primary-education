import React from 'react'
import { School, Student } from '../types/student.types'
import SchoolRow from './SchoolRow'
import StudentRow from './StudentRow'
import Pagination from './Pagination'

interface PaginatedSchool extends School {
    paginatedStudents: Student[]
    currentPage: number
    totalPages: number
    totalStudents: number
}

interface StudentsTableProps {
    schools: PaginatedSchool[]
    expandedSchools: Set<string>
    onToggleSchool: (schoolId: string) => void
    onViewStudent: (student: Student, schoolName: string) => void
    onGenerateCertificate: (student: Student, schoolName: string) => void
    onSchoolPageChange: (schoolId: string, page: number) => void
}

export default function StudentsTable({ 
    schools, 
    expandedSchools, 
    onToggleSchool, 
    onViewStudent,
    onGenerateCertificate,
    onSchoolPageChange 
}: StudentsTableProps) {
    return (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
                <table className="min-w-full">
                    <thead className="bg-gray-50 border-b border-gray-200">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                School / Student
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
                        {schools.map((school) => (
                            <React.Fragment key={school._id}>
                                <SchoolRow 
                                    school={school}
                                    isExpanded={expandedSchools.has(school._id)}
                                    onToggle={onToggleSchool}
                                />
                                {expandedSchools.has(school._id) && (
                                    <>
                                        {school.paginatedStudents.map((student, index) => (
                                            <StudentRow 
                                                key={`${student.examNo}-${index}`} 
                                                student={student} 
                                                onViewStudent={(student) => onViewStudent(student, school.schoolName)}
                                                onGenerateCertificate={(student) => onGenerateCertificate(student, school.schoolName)}
                                            />
                                        ))}
                                        {school.totalPages > 1 && (
                                            <tr>
                                                <td colSpan={6} className="px-0 py-0">
                                                    <Pagination
                                                        currentPage={school.currentPage}
                                                        totalPages={school.totalPages}
                                                        onPageChange={(page) => onSchoolPageChange(school._id, page)}
                                                        itemsPerPage={5}
                                                        totalItems={school.totalStudents}
                                                    />
                                                </td>
                                            </tr>
                                        )}
                                    </>
                                )}
                            </React.Fragment>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    )
}
