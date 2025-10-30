'use client'
import React, { useState, useMemo } from 'react'
import StudentTableHeader from './components/StudentTableHeader'
import SearchBar from './components/SearchBar'
import SchoolsGrid from './components/SchoolsGrid'
import EmptyState from './components/EmptyState'
import { useGetSchoolsQuery } from '../../store/api/authApi'

export default function StudentsPage() {
    const [searchQuery, setSearchQuery] = useState('')

    const { data: schools = [], isLoading, error } = useGetSchoolsQuery()

    // Filter schools based on search query
    const filteredSchools = useMemo(() => {
        if (!searchQuery) return schools
        const query = searchQuery.toLowerCase()
        return schools.filter(school => 
            school.schoolName.toLowerCase().includes(query)
        )
    }, [schools, searchQuery])

    // Calculate total students from all schools
    const totalStudents = useMemo(() => {
        return schools.reduce((sum, school) => sum + (school.students || 0), 0)
    }, [schools])

    if (isLoading) {
        return (
            <div className='p-6 bg-white/50 backdrop-blur-[2px] h-full overflow-y-auto border border-black/10 m-1 mb-0 space-y-6'>
                <div className="flex items-center justify-center h-64">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                        <p className="mt-4 text-gray-600">Loading schools...</p>
                    </div>
                </div>
            </div>
        )
    }

    if (error) {
        const errorMessage = typeof error === 'object' && 'message' in error 
            ? (error as unknown as Error).message 
            : 'Failed to load schools'

        return (
            <div className='p-6 bg-white/50 backdrop-blur-[2px] h-full overflow-y-auto border border-black/10 m-1 mb-0 space-y-6'>
                <div className="flex items-center justify-center h-64">
                    <div className="text-center">
                        <div className="text-red-600 text-lg font-medium">Error Loading Data</div>
                        <p className="mt-2 text-gray-600">{errorMessage}</p>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className='p-6 bg-white/50 backdrop-blur-[2px] h-full overflow-y-auto border border-black/10 m-1 mb-0 space-y-6'>
            <StudentTableHeader
                schoolCount={schools.length}
                studentCount={totalStudents}
            />
            <SearchBar
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
            />
            {filteredSchools.length === 0 && searchQuery ? (
                <EmptyState searchQuery={searchQuery} />
            ) : (
                <SchoolsGrid schools={filteredSchools} />
            )}
        </div>
    )
}
