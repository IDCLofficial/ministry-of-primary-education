'use client'
import { useMemo, useEffect, useState } from 'react'
import StudentTableHeader from './components/StudentTableHeader'
import SearchBar from './components/SearchBar'
import SchoolsGrid from './components/SchoolsGrid'
import EmptyState from './components/EmptyState'
import { useGetSchoolsQuery } from '../../store/api/authApi'
import { updateSearchParam } from '../upload-ca/utils'
import { useSearchParams } from 'next/navigation'
import { useDebounce } from './hooks/useDebounce'

export default function StudentsPage() {
    const searchParams = useSearchParams();
    const page = searchParams.get("page") || "1";
    const search = searchParams.get("search") || "";
    const [localSearch, setLocalSearch] = useState(search);
    const debouncedSearch = useDebounce(localSearch, 500);
    
    const { data, isLoading, error, isFetching } = useGetSchoolsQuery({
        page: parseInt(page),
        search: debouncedSearch || undefined,
    });

    // Sync URL search param with local state
    useEffect(() => {
        setLocalSearch(search)
    }, [search])

    // Update URL when debounced search changes
    useEffect(() => {
        if (debouncedSearch !== search) {
            updateSearchParam("search", debouncedSearch)
        }
    }, [debouncedSearch, search])

    const schools = useMemo(() => data?.schools || [], [data])

    const pagination = useMemo(() => {
        if (!data) return {
            currentPage: parseInt(page),
            totalPages: 1,
            onPageChange: (page: number) => updateSearchParam("page", String(page)),
            itemsPerPage: 10,
            totalItems: 0,
        }
        return {
            currentPage: parseInt(page),
            totalPages: data.totalPages || 1,
            onPageChange: (page: number) => updateSearchParam("page", String(page)),
            itemsPerPage: data.limit || 10,
            totalItems: data.totalSchools || 0,
        }
    }, [data, page])

    // Calculate total students from all schools
    const totalStudents = useMemo(() => {
        if (!schools || schools.length === 0) return 0
        return schools.reduce((sum, school) => sum + (school.students || 0), 0)
    }, [schools])

    // Reset to page 1 when debounced search changes
    useEffect(() => {
        if (debouncedSearch && page !== "1") {
            updateSearchParam("page", "1")
        }
    }, [debouncedSearch, page])

    const isSearching = isLoading || isFetching && debouncedSearch !== "";

    if (isLoading) {
        return (
            <div className='p-6 bg-white/50 backdrop-blur-[2px] h-full overflow-y-auto border border-black/10 m-1 mb-0 space-y-6'>
                <div className="flex items-center justify-center h-64">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
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
                schoolCount={schools.length || 0}
                studentCount={totalStudents}
            />
            <SearchBar
                searchQuery={localSearch}
                onSearchChange={setLocalSearch}
                isSearching={isSearching}
            />
            {schools.length === 0 && debouncedSearch ? (
                <EmptyState searchQuery={debouncedSearch} />
            ) : (
                <SchoolsGrid schools={schools} pagination={{...pagination, disabled: isLoading}} />
            )}
        </div>
    )
}
