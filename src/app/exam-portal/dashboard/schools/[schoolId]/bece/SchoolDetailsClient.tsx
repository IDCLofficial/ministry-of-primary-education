'use client'

import React, { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { IoArrowBack, IoSchool, IoLocationOutline, IoPeopleOutline, IoCalendarOutline } from 'react-icons/io5'
import SchoolStudentsTable from '../../components/SchoolStudentsTable'
import StudentModal from '../../components/StudentModal'
import CertificateModal from '@/components/CertificateModal'
import SearchBar from '../../components/SearchBar'
import { Student } from '../../types/student.types'
import { updateSearchParam } from '@/app/exam-portal/utils'
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
    const yearFilter = searchParams.get("year") || "all"
    const [localSearch, setLocalSearch] = useState(searchQuery)
    const debouncedSearch = useDebounce(localSearch, 500)
    const [selectedStudent, setSelectedStudent] = useState<Student | null>(null)
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [isCertificateModalOpen, setIsCertificateModalOpen] = useState(false)
    const [certificateStudent, setCertificateStudent] = useState<Student | null>(null)

    // Extract unique years from students
    const availableYears = React.useMemo(() => {
        const years = students
            .map(s => s.examYear)
            .filter((year): year is number => year !== undefined && year !== null)
        return Array.from(new Set(years)).sort((a, b) => b - a)
    }, [students])

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
        router.push(`/exam-portal/dashboard/schools/${schoolId}`)
    }

    const handleGenerateCertificate = (student: Student) => {
        setCertificateStudent(student)
        setIsCertificateModalOpen(true)
    }

    const handleCloseCertificateModal = () => {
        setIsCertificateModalOpen(false)
        setCertificateStudent(null)
    }

    const handleYearChange = (year: string) => {
        updateSearchParam("year", year)
        // Reset to page 1 when changing year
        if (searchParams.get("page") !== "1") {
            updateSearchParam("page", "1")
        }
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

                <div className="flex flex-col sm:flex-row gap-3">
                    <div className="flex-1 flex items-center justify-between gap-3">
                        <SearchBar
                            searchQuery={localSearch}
                            onSearchChange={setLocalSearch}
                            isSearching={isSearching}
                        />

                        {availableYears.length > 0 && (
                            <div className="flex items-center gap-2 flex-1">
                                <label className="block text-xs font-medium text-gray-700 mb-1.5">
                                    Filter by Year
                                </label>
                                <div className="relative">
                                    <IoCalendarOutline className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                                    <select
                                        value={yearFilter}
                                        onChange={(e) => handleYearChange(e.target.value)}
                                        className="w-full pl-9 pr-10 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-white cursor-pointer appearance-none"
                                        style={{
                                            backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
                                            backgroundPosition: 'right 0.5rem center',
                                            backgroundRepeat: 'no-repeat',
                                            backgroundSize: '1.5em 1.5em'
                                        }}
                                    >
                                        <option value="all">All Years</option>
                                        {availableYears.map(year => (
                                            <option key={year} value={year}>
                                                {year}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

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
