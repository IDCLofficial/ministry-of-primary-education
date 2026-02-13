'use client'
import { useMemo, useEffect, useState } from 'react'
import StudentTableHeader from './components/StudentTableHeader'
import SearchBar from './components/SearchBar'
import SchoolsGrid from './components/SchoolsGrid'
import { useGetSchoolsQuery } from '../../store/api/authApi'
import { updateSearchParam } from '@/app/bece-portal/utils'
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

    const schools = useMemo(() => data?.data || [], [data])

    const pagination = useMemo(() => {
        if (!data) return {
            currentPage: parseInt(page),
            totalPages: 1,
            onPageChange: (page: number) => updateSearchParam("page", String(page)),
            itemsPerPage: 10,
            totalItems: 0,
        }
        return {
            currentPage: parseInt(data.pagination.currentPage),
            totalPages: data.pagination.totalPages || 1,
            onPageChange: (page: number) => updateSearchParam("page", String(page)),
            itemsPerPage: parseInt(data.pagination.itemsPerPage) || 10,
            totalItems: data.pagination.totalItems || 0,
        }
    }, [data, page]);

    // Reset to page 1 when debounced search changes
    useEffect(() => {
        if (debouncedSearch && page !== "1") {
            updateSearchParam("page", "1")
        }
    }, [debouncedSearch, page])

    const isSearching = isLoading || isFetching && debouncedSearch !== "";

    // Get error message if error exists
    const errorMessage = error 
        ? (typeof error === 'object' && 'message' in error 
            ? (error as unknown as Error).message 
            : 'Failed to load schools')
        : null;

    return (
        <div className='p-6 bg-white/50 backdrop-blur-[2px] h-full overflow-y-auto border border-black/10 m-1 mb-0 space-y-6'>
            <StudentTableHeader
                schoolCount={schools.length || 0}
            />
            <SearchBar
                searchQuery={localSearch}
                onSearchChange={setLocalSearch}
                isSearching={isSearching}
            />
            <SchoolsGrid 
                schools={schools} 
                pagination={{...pagination, disabled: isLoading || isFetching}} 
                isLoading={isLoading}
                error={errorMessage}
                onRetry={() => window.location.reload()}
                searchQuery={debouncedSearch}
            />
        </div>
    )
}
