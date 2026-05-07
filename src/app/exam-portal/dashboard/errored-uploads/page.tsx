'use client'
import React, { useState, useEffect, useMemo } from 'react'
import { SearchAndFilters } from './components/SearchAndFilters'
import { ErroredUploadsTable } from './components/ErroredUploadsTable'
import { SummaryStats } from './components/SummaryStats'
import { useGetSkippedResultsQuery } from '../../store/api/authApi'
import { useSearchParams } from 'next/navigation'
import { updateSearchParam } from '@/app/exam-portal/utils'
import { useDebounce } from '../schools/hooks/useDebounce'

export default function ErroredUploadsPage() {
    const searchParams = useSearchParams()
    const page = searchParams.get("page") || "1"
    const uploadBatch = searchParams.get("uploadBatch") || ""
    const lga = searchParams.get("lga") || ""
    const schoolName = searchParams.get("schoolName") || ""
    const status = searchParams.get("status") || ""
    
    const [localSchoolName, setLocalSchoolName] = useState(schoolName)
    const debouncedSchoolName = useDebounce(localSchoolName, 500)

    // Fetch skipped results from API
    const { data, isLoading, error, isFetching } = useGetSkippedResultsQuery({
        page: parseInt(page),
        limit: 20,
        uploadBatch: uploadBatch || undefined,
        lga: lga || undefined,
        schoolName: debouncedSchoolName || undefined,
        status: status || undefined,
    })

    // Sync URL search param with local state
    useEffect(() => {
        setLocalSchoolName(schoolName)
    }, [schoolName])

    // Update URL when debounced search changes
    useEffect(() => {
        if (debouncedSchoolName !== schoolName) {
            updateSearchParam("schoolName", debouncedSchoolName)
            // Reset to page 1 when searching
            if (debouncedSchoolName && page !== "1") {
                updateSearchParam("page", "1")
            }
        }
    }, [debouncedSchoolName, schoolName, page])

    const erroredResults = data?.data || []
    const isSearching = isFetching && localSchoolName !== debouncedSchoolName

    const pagination = useMemo(() => {
        const currentPageNum = parseInt(page) || 1
        const handlePageChange = (newPage: number) => {
            if (newPage !== currentPageNum && newPage >= 1) {
                updateSearchParam("page", String(newPage))
            }
        }

        if (!data?.pagination) return {
            currentPage: currentPageNum,
            totalPages: 1,
            onPageChange: handlePageChange,
            itemsPerPage: 20,
            totalItems: 0,
        }
        
        return {
            currentPage: Number(data.pagination.page),
            totalPages: Number(data.pagination.totalPages),
            onPageChange: handlePageChange,
            itemsPerPage: Number(data.pagination.limit),
            totalItems: Number(data.pagination.total),
        }
    }, [data?.pagination, page])

    const handleFilterChange = (filterName: string, value: string) => {
        updateSearchParam(filterName, value)
        // Reset to page 1 when filtering
        if (page !== "1") {
            updateSearchParam("page", "1")
        }
    }

    const handleClearFilters = () => {
        updateSearchParam("uploadBatch", "")
        updateSearchParam("lga", "")
        updateSearchParam("schoolName", "")
        updateSearchParam("status", "")
        updateSearchParam("page", "1")
        setLocalSchoolName("")
    }

    return (
        <div className="p-5 bg-white/50 backdrop-blur-[2px] border border-black/10 m-1 mb-0 space-y-4 flex-1 overflow-auto">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h2 className='text-2xl font-medium'>Errored Uploads</h2>
                    <p className='text-gray-400 text-sm'>View and manage upload errors (school not found)</p>
                </div>
            </div>

            {/* Summary Stats */}
            {data?.summary && (
                <SummaryStats 
                    totalSkipped={data.summary.totalSkipped}
                    bySchool={data.summary.bySchool}
                />
            )}

            {/* Search and Filters */}
            <SearchAndFilters
                schoolName={localSchoolName}
                setSchoolName={setLocalSchoolName}
                uploadBatch={uploadBatch}
                lga={lga}
                status={status}
                availableFilters={data?.availableFilters}
                onFilterChange={handleFilterChange}
                onClearFilters={handleClearFilters}
                isSearching={isSearching}
            />

            {/* Results Table */}
            {isLoading ? (
                <div className="flex items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
                </div>
            ) : error ? (
                <div className="text-center py-12">
                    <p className="text-red-600">Failed to load errored uploads</p>
                </div>
            ) : (
                <ErroredUploadsTable 
                    results={erroredResults} 
                    pagination={pagination} 
                    isLoading={isFetching}
                    appliedFilters={data?.filters}
                />
            )}
        </div>
    )
}
