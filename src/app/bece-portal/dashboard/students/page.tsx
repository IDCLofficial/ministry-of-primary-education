'use client'
import React, { useState } from 'react'
import StudentTableHeader from './components/StudentTableHeader'
import SearchBar from './components/SearchBar'
import StudentsTable from './components/StudentsTable'
import EmptyState from './components/EmptyState'
import StudentModal from './components/StudentModal'
import { useStudentFiltering } from './hooks/useStudentFiltering'
import { useSchoolPagination } from './hooks/useSchoolPagination'
import { Student } from './types/student.types'
import { useSchoolsWithStudents } from './hooks/useSchoolsWithStudents'

export default function StudentsPage() {
    const [expandedSchools, setExpandedSchools] = useState<Set<string>>(new Set())
    const [searchQuery, setSearchQuery] = useState('')
    const [selectedStudent, setSelectedStudent] = useState<Student | null>(null)
    const [selectedSchoolName, setSelectedSchoolName] = useState<string>('')
    const [isModalOpen, setIsModalOpen] = useState(false)


    const { schools, isLoading, hasError, error } = useSchoolsWithStudents()
    const { filteredSchools, totalStudents: filteredTotalStudents } = useStudentFiltering(schools, searchQuery)
    const { paginatedSchools, setSchoolPage } = useSchoolPagination(filteredSchools, 5);

    const toggleSchool = (schoolId: string) => {
        const newExpanded = new Set(expandedSchools)
        if (newExpanded.has(schoolId)) {
            newExpanded.delete(schoolId)
        } else {
            newExpanded.add(schoolId)
        }
        setExpandedSchools(newExpanded)
    }

    const handleViewStudent = (student: Student, schoolName: string) => {
        setSelectedStudent(student)
        setSelectedSchoolName(schoolName)
        setIsModalOpen(true)
    }

    const handleCloseModal = () => {
        setIsModalOpen(false)
        setSelectedStudent(null)
        setSelectedSchoolName('')
    }

    if (isLoading) {
        return (
            <div className='p-6 bg-white/50 backdrop-blur-[2px] h-full overflow-y-auto border border-black/10 m-1 mb-0 space-y-6'>
                <div className="flex items-center justify-center h-64">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                        <p className="mt-4 text-gray-600">Loading schools and students...</p>
                    </div>
                </div>
            </div>
        )
    }

    if (hasError) {
        return (
            <div className='p-6 bg-white/50 backdrop-blur-[2px] h-full overflow-y-auto border border-black/10 m-1 mb-0 space-y-6'>
                <div className="flex items-center justify-center h-64">
                    <div className="text-center">
                        <div className="text-red-600 text-lg font-medium">Error Loading Data</div>
                        <p className="mt-2 text-gray-600">{typeof error === 'string' ? error : 'Failed to load schools and students'}</p>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <React.Fragment>
            <div className='p-6 bg-white/50 backdrop-blur-[2px] h-full overflow-y-auto border border-black/10 m-1 mb-0 space-y-6'>
                <StudentTableHeader
                    schoolCount={schools.length}
                    studentCount={filteredTotalStudents}
                />
                <SearchBar
                    searchQuery={searchQuery}
                    onSearchChange={setSearchQuery}
                />
                <StudentsTable
                    schools={paginatedSchools}
                    expandedSchools={expandedSchools}
                    onToggleSchool={toggleSchool}
                    onViewStudent={handleViewStudent}
                    onSchoolPageChange={setSchoolPage}
                />
                {filteredSchools.length === 0 && searchQuery && (
                    <EmptyState searchQuery={searchQuery} />
                )}
            </div>
            <StudentModal
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                student={selectedStudent}
                schoolName={selectedSchoolName}
            />
        </React.Fragment>
    )
}
