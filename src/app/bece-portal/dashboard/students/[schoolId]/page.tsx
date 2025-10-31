'use client'
import React, { useState, useMemo } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { IoArrowBack, IoSchool, IoLocationOutline, IoPeopleOutline } from 'react-icons/io5'
import { useGetResultsQuery, useGetSchoolsQuery } from '../../../store/api/authApi'
import SchoolStudentsTable from '../components/SchoolStudentsTable'
import StudentModal from '../components/StudentModal'
import CertificateModal from '../components/CertificateModal'
import SearchBar from '../components/SearchBar'
import EmptyState from '../components/EmptyState'
import { Student } from '../types/student.types'

// Helper function to safely extract LGA name
const getLgaName = (lga: string | { _id: string; name: string } | undefined): string => {
    if (!lga) return 'Unknown LGA'
    if (typeof lga === 'string') {
        return lga
    }
    return lga?.name || 'Unknown LGA'
}

export default function SchoolDetailsPage() {
    const params = useParams()
    const router = useRouter()
    const schoolId = params.schoolId as string

    const [searchQuery, setSearchQuery] = useState('')
    const [selectedStudent, setSelectedStudent] = useState<Student | null>(null)
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [isCertificateModalOpen, setIsCertificateModalOpen] = useState(false)
    const [certificateStudent, setCertificateStudent] = useState<Student | null>(null)

    // Fetch schools to get school details
    const { data: schools = [], isLoading: schoolsLoading, error: schoolsError } = useGetSchoolsQuery()
    
    // Fetch students for this specific school
    const { data: studentsData, isLoading: studentsLoading, error: studentsError } = useGetResultsQuery(schoolId, {
        skip: !schoolId
    })

    // Find the current school from the schools list
    const school = useMemo(() => {
        return schools.find(s => s._id === schoolId)
    }, [schools, schoolId])

    const students = studentsData || []
    const isLoading = schoolsLoading || studentsLoading
    const hasError = !!schoolsError || !!studentsError
    const error = schoolsError || studentsError

    // Filter students based on search query
    const filteredStudents = students.filter(student => {
        if (!searchQuery) return true
        const query = searchQuery.toLowerCase()
        return (
            student.name.toLowerCase().includes(query) ||
            student.examNo.toLowerCase().includes(query)
        )
    })

    const handleViewStudent = (student: Student) => {
        setSelectedStudent(student)
        setIsModalOpen(true)
    }

    const handleCloseModal = () => {
        setIsModalOpen(false)
        setSelectedStudent(null)
    }

    const handleUpdateStudent = (updatedStudent: Student) => {
        // Update the selected student with the new data
        setSelectedStudent(updatedStudent)
    }

    const handleBack = () => {
        router.push('/bece-portal/dashboard/students')
    }

    const handleGenerateCertificate = (student: Student) => {
        setCertificateStudent(student)
        setIsCertificateModalOpen(true)
    }

    const handleCloseCertificateModal = () => {
        setIsCertificateModalOpen(false)
        setCertificateStudent(null)
    }

    if (isLoading) {
        return (
            <div className='p-6 bg-white/50 backdrop-blur-[2px] h-full overflow-y-auto border border-black/10 m-1 mb-0 space-y-6'>
                <div className="flex items-center justify-center h-64">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                        <p className="mt-4 text-gray-600">Loading school details...</p>
                    </div>
                </div>
            </div>
        )
    }

    if (hasError || !school) {
        const errorMessage = error 
            ? (typeof error === 'object' && 'message' in error ? (error as unknown as Error).message : 'Failed to load school details')
            : 'School not found'

        return (
            <div className='p-6 bg-white/50 backdrop-blur-[2px] h-full overflow-y-auto border border-black/10 m-1 mb-0 space-y-6'>
                <div className="flex items-center justify-center h-64">
                    <div className="text-center">
                        <div className="text-red-600 text-lg font-medium">Error Loading School</div>
                        <p className="mt-2 text-gray-600">{errorMessage}</p>
                        <button
                            onClick={handleBack}
                            className="mt-4 inline-flex items-center px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 border border-blue-200 rounded-md hover:bg-blue-100"
                        >
                            <IoArrowBack className="w-4 h-4 mr-2" />
                            Back to Schools
                        </button>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <React.Fragment>
            <div className='p-6 bg-white/50 backdrop-blur-[2px] h-full overflow-y-auto border border-black/10 m-1 mb-0 space-y-6'>
                {/* Back Button */}
                <button
                    onClick={handleBack}
                    className="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-all duration-300 active:scale-95 cursor-pointer"
                >
                    <IoArrowBack className="w-4 h-4 mr-2" />
                    Back to Schools
                </button>

                {/* School Header */}
                <div className="bg-white rounded-xl border border-gray-200 p-6">
                    <div className="flex items-start gap-4">
                        <div className="w-16 h-16 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
                            <IoSchool className="w-8 h-8 text-blue-600" />
                        </div>
                        <div className="flex-1">
                            <h1 className="text-2xl font-bold text-gray-900 capitalize mb-2">
                                {school.schoolName.toLowerCase()}
                            </h1>
                            <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                                <div className="flex items-center gap-2">
                                    <IoLocationOutline className="w-4 h-4 text-gray-400" />
                                    <span className="capitalize">{getLgaName(school.lga).toLowerCase()}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <IoPeopleOutline className="w-4 h-4 text-gray-400" />
                                    <span>
                                        {school.students} {school.students === 1 ? 'Student' : 'Students'}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Search Bar */}
                <SearchBar
                    searchQuery={searchQuery}
                    onSearchChange={setSearchQuery}
                />

                {/* Students Table */}
                {filteredStudents.length === 0 && searchQuery ? (
                    <EmptyState searchQuery={searchQuery} />
                ) : filteredStudents.length === 0 ? (
                    <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
                        <IoPeopleOutline className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No Students Found</h3>
                        <p className="text-gray-600">This school has no registered students yet.</p>
                    </div>
                ) : (
                    <SchoolStudentsTable
                        students={filteredStudents}
                        onViewStudent={handleViewStudent}
                        onGenerateCertificate={handleGenerateCertificate}
                    />
                )}
            </div>

            <StudentModal
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                student={selectedStudent}
                schoolName={school.schoolName}
                onUpdate={handleUpdateStudent}
                onGenerateCertificate={handleGenerateCertificate}
            />

            {certificateStudent && (
                <CertificateModal
                    isOpen={isCertificateModalOpen}
                    onClose={handleCloseCertificateModal}
                    student={certificateStudent}
                    schoolName={school.schoolName}
                />
            )}
        </React.Fragment>
    )
}
