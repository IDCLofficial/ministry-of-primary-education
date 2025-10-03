'use client'
import React, { useState } from 'react'
import StudentTableHeader from './components/StudentTableHeader'
import SearchBar from './components/SearchBar'
import StudentsTable from './components/StudentsTable'
import EmptyState from './components/EmptyState'
import StudentModal from './components/StudentModal'
import { sampleSchools } from './data/sampleData'
import { useStudentFiltering } from './hooks/useStudentFiltering'
import { useSchoolPagination } from './hooks/useSchoolPagination'
import { Student } from './types/student.types'

export default function StudentsPage() {
    const [expandedSchools, setExpandedSchools] = useState<Set<string>>(new Set())
    const [searchQuery, setSearchQuery] = useState('')
    const [selectedStudent, setSelectedStudent] = useState<Student | null>(null)
    const [selectedSchoolName, setSelectedSchoolName] = useState<string>('')
    const [isModalOpen, setIsModalOpen] = useState(false)

    const { filteredSchools, totalStudents } = useStudentFiltering(sampleSchools, searchQuery)
    const { paginatedSchools, setSchoolPage } = useSchoolPagination(filteredSchools, 5)

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

    return (
        <React.Fragment>
            <div className='p-6 bg-white/50 backdrop-blur-[2px] h-full overflow-y-auto border border-black/10 m-1 mb-0 space-y-6'>
                <StudentTableHeader
                    schoolCount={sampleSchools.length}
                    studentCount={totalStudents}
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
