'use client'
import React, { useMemo, use } from 'react'
import { useSearchParams } from 'next/navigation'
import { IoArrowBack } from 'react-icons/io5'
import Link from 'next/link'
import { useGetResultsQuery, useGetSchoolsQuery } from '../../../store/api/authApi'
import SchoolDetailsClient from './SchoolDetailsClient'

export default function SchoolDetailsPage({ params }: { params: Promise<{ schoolId: string }> }) {
    const { schoolId } = use(params)
    const searchParams = useSearchParams()
    const page = searchParams.get("page") || "1"
    const search = searchParams.get("search") || ""

    const { data: schools, isLoading: schoolsLoading, error: schoolsError } = useGetSchoolsQuery({
        page: 1,
        limit: 100
    })
    
    const { data: studentsData, isLoading: studentsLoading, error: studentsError, isFetching: studentsFetching } = useGetResultsQuery({
        schoolId,
        page: parseInt(page),
        limit: 10,
        search: search || undefined
    }, {
        skip: !schoolId
    })

    const school = useMemo(() => {
        return schools?.schools?.find(s => s._id === schoolId)
    }, [schools, schoolId])

    const students = studentsData?.results || []
    const isLoading = schoolsLoading || studentsLoading
    const hasError = !!schoolsError || !!studentsError
    const error = schoolsError || studentsError
    const isSearching = studentsFetching && !studentsLoading

    const pagination = useMemo(() => {
        if (!studentsData) return {
            currentPage: parseInt(page),
            totalPages: 1,
            itemsPerPage: 10,
            totalItems: 0,
        }
        return {
            currentPage: parseInt(page),
            totalPages: studentsData.totalPages || 1,
            itemsPerPage: studentsData.limit || 10,
            totalItems: studentsData.totalResults || 0,
        }
    }, [studentsData, page])

    if (isLoading) {
        return (
            <div className='p-6 bg-white/50 backdrop-blur-[2px] h-full overflow-y-auto border border-black/10 m-1 mb-0 space-y-6'>
                <div className="flex items-center justify-center h-64">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
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
                        <Link
                            href="/bece-portal/dashboard/schools"
                            className="mt-4 inline-flex items-center px-4 py-2 text-sm font-medium text-green-600 bg-green-50 border border-green-200 rounded-md hover:bg-green-100"
                        >
                            <IoArrowBack className="w-4 h-4 mr-2" />
                            Back to Schools
                        </Link>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <SchoolDetailsClient
            school={school}
            students={students}
            pagination={pagination}
            isSearching={isSearching}
        />
    )
}
