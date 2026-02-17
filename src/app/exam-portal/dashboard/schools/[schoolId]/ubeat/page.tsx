'use client'
import React, { useMemo, use } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { IoArrowBack } from 'react-icons/io5'
import Link from 'next/link'
import { useGetUBEATResultsQuery, useGetSchoolByIdQuery } from '../../../../store/api/authApi'
import SchoolDetailsClient from './SchoolDetailsClient'
import SchoolHeaderSkeleton from '../../components/SchoolHeaderSkeleton'
import SearchBar from '../../components/SearchBar'
import SchoolStudentsTable from '../../components/SchoolStudentsTable'
import { ubeatStudentToDisplayStudent } from '../../types/student.types'

export default function UBEATSchoolDetailsPage({ params }: { params: Promise<{ schoolId: string }> }) {
    const { schoolId } = use(params)
    const router = useRouter()
    const searchParams = useSearchParams()
    const page = searchParams.get("page") || "1"
    const search = searchParams.get("search") || ""

    
    const { data: school, isLoading: schoolLoading, error: schoolError } = useGetSchoolByIdQuery(schoolId, {
        skip: !schoolId
    })
    
    // Convert schoolId back to schoolCode format (replace dashes with slashes)
    const schoolCode = schoolId.replace(/-/g, '/')
    
    const { data: studentsData, isLoading: studentsLoading, error: studentsError, isFetching: studentsFetching } = useGetUBEATResultsQuery({
        schoolCode: schoolCode,
        page: parseInt(page),
        limit: 10,
        search: search || undefined
    }, {
        skip: !schoolId
    })

    // Convert UBEAT students to DisplayStudent format
    const students = useMemo(() => {
        return (studentsData?.data || []).map(ubeatStudentToDisplayStudent)
    }, [studentsData])
    
    const isLoading = schoolLoading || studentsLoading
    const hasError = !!schoolError || !!studentsError
    const error = schoolError || studentsError
    const isSearching = studentsFetching && !studentsLoading
    
    // Get student error message if exists
    const studentErrorMessage = studentsError 
        ? (typeof studentsError === 'object' && 'message' in studentsError 
            ? (studentsError as unknown as Error).message 
            : 'Failed to load students')
        : null

    const pagination = useMemo(() => {
        if (!studentsData) return {
            currentPage: parseInt(page),
            totalPages: 1,
            itemsPerPage: 10,
            totalItems: 0,
        }
        return {
            currentPage: studentsData.pagination.page || parseInt(page),
            totalPages: studentsData.pagination.totalPages || 1,
            itemsPerPage: studentsData.pagination.limit || 10,
            totalItems: studentsData.pagination.total || 0,
        }
    }, [studentsData, page])

    // Show skeleton loaders during initial loading
    if (isLoading) {
        return (
            <div className='p-6 bg-white/50 backdrop-blur-[2px] h-full overflow-y-auto border border-black/10 m-1 mb-0 space-y-6'>
                <button
                    onClick={() => router.push(`/exam-portal/dashboard/schools/${schoolId}`)}
                    className="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-all duration-300 active:scale-95 cursor-pointer"
                >
                    <IoArrowBack className="w-4 h-4 mr-2" />
                    Back to Exams Selection
                </button>

                <SchoolHeaderSkeleton />

                <SearchBar
                    searchQuery=""
                    onSearchChange={() => {}}
                    isSearching={false}
                />

                <SchoolStudentsTable
                    students={[]}
                    onViewStudent={() => {}}
                    onGenerateCertificate={() => {}}
                    pagination={{
                        currentPage: 1,
                        totalPages: 1,
                        itemsPerPage: 10,
                        totalItems: 0,
                        onPageChange: () => {},
                        disabled: true
                    }}
                    isLoading={true}
                />
            </div>
        )
    }

    // Show error state for school loading errors
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
                        <Link
                            href={`/exam-portal/dashboard/schools/${schoolId}`}
                            className="mt-4 inline-flex items-center px-4 py-2 text-sm font-medium text-green-600 bg-green-50 border border-green-200 rounded-md hover:bg-green-100"
                        >
                            <IoArrowBack className="w-4 h-4 mr-2" />
                            Back to Exams Selection
                        </Link>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <SchoolDetailsClient
            school={school}
            schoolId={schoolId}
            students={students}
            pagination={pagination}
            isSearching={isSearching}
            isLoading={studentsLoading}
            error={studentErrorMessage}
        />
    )
}
