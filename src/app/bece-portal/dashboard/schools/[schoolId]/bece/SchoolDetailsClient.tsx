'use client'

import React, { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { IoArrowBack, IoSchool, IoLocationOutline, IoPeopleOutline } from 'react-icons/io5'
import SchoolStudentsTable from '../../components/SchoolStudentsTable'
import StudentModal from '../../components/StudentModal'
import CertificateModal from '@/components/CertificateModal'
import SearchBar from '../../components/SearchBar'
import { Student } from '../../types/student.types'
import { updateSearchParam } from '@/app/bece-portal/utils'
import { useDebounce } from '../../hooks/useDebounce'

interface School {
    _id: string
    schoolName: string
    lga: string
    schoolCode?: string
    isFirstLogin: boolean
    hasAccount: boolean
    isVerified: boolean
    __v: number
    createdAt: string
    updatedAt: string
}

interface SchoolDetailsClientProps {
    school: School
    students: Student[]
    pagination: {
        currentPage: number
        totalPages: number
        itemsPerPage: number
        totalItems: number
    }
    isSearching?: boolean
    isLoading?: boolean
    error?: string | null
    schoolId: string
}

const getLgaName = (lga: string | undefined): string => {
    if (!lga) return 'Unknown LGA'
    return lga
}

export default function SchoolDetailsClient({ school, students, pagination, isSearching = false, isLoading = false, error = null, schoolId }: SchoolDetailsClientProps) {
    const router = useRouter()
    const searchParams = useSearchParams()
    const searchQuery = searchParams.get("search") || ""
    const [localSearch, setLocalSearch] = useState(searchQuery)
    const debouncedSearch = useDebounce(localSearch, 500)
    const [selectedStudent, setSelectedStudent] = useState<Student | null>(null)
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [isCertificateModalOpen, setIsCertificateModalOpen] = useState(false)
    const [certificateStudent, setCertificateStudent] = useState<Student | null>(null)

    // Sync URL search param with local state
    useEffect(() => {
        setLocalSearch(searchQuery)
    }, [searchQuery])

    // Update URL when debounced search changes
    useEffect(() => {
        if (debouncedSearch !== searchQuery) {
            updateSearchParam("search", debouncedSearch)
            // Reset to page 1 when searching
            if (debouncedSearch && searchParams.get("page") !== "1") {
                updateSearchParam("page", "1")
            }
        }
    }, [debouncedSearch, searchQuery, searchParams])

    const handleViewStudent = (student: Student) => {
        setSelectedStudent(student)
        setIsModalOpen(true)
    }

    const handleCloseModal = () => {
        setIsModalOpen(false)
        setSelectedStudent(null)
    }

    const handleUpdateStudent = (updatedStudent: Student) => {
        setSelectedStudent(updatedStudent)
    }

    const handleBack = () => {
        router.push(`/bece-portal/dashboard/schools/${schoolId}`)
    }

    const handleGenerateCertificate = (student: Student) => {
        setCertificateStudent(student)
        setIsCertificateModalOpen(true)
    }

    const handleCloseCertificateModal = () => {
        setIsCertificateModalOpen(false)
        setCertificateStudent(null)
    }

    return (
        <React.Fragment>
            <div className='p-6 bg-white/50 backdrop-blur-[2px] h-full overflow-y-auto border border-black/10 m-1 mb-0 space-y-6'>
                <button
                    onClick={handleBack}
                    className="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-all duration-300 active:scale-95 cursor-pointer"
                >
                    <IoArrowBack className="w-4 h-4 mr-2" />
                    Back to Exams Selection
                </button>

                <div className="bg-white rounded-xl border border-gray-200 p-6">
                    <div className="flex items-start gap-4">
                        <div className="w-16 h-16 bg-green-100 rounded-xl flex items-center justify-center flex-shrink-0">
                            <IoSchool className="w-8 h-8 text-green-600" />
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
                                        {pagination.totalItems} {pagination.totalItems === 1 ? 'Student' : 'Students'}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <SearchBar
                    searchQuery={localSearch}
                    onSearchChange={setLocalSearch}
                    isSearching={isSearching}
                />

                <SchoolStudentsTable
                    students={students}
                    onViewStudent={handleViewStudent}
                    onGenerateCertificate={handleGenerateCertificate}
                    pagination={{
                        ...pagination,
                        onPageChange: (page: number) => updateSearchParam("page", String(page)),
                        disabled: isLoading
                    }}
                    isLoading={isLoading}
                    error={error}
                    onRetry={() => window.location.reload()}
                    searchQuery={debouncedSearch}
                />
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
