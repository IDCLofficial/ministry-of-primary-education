'use client'
import React, { useState, useEffect, useMemo } from 'react'
import { SearchAndFilters } from './components/SearchAndFilters'
import { UploadsTable } from './components/UploadsTable'
import { useGetUploadLogsQuery } from '../../store/api/authApi'
import { useSearchParams } from 'next/navigation'
import { updateSearchParam } from '@/app/bece-portal/utils'
import { useDebounce } from '../schools/hooks/useDebounce'

export default function ViewUploadsPage() {
    const searchParams = useSearchParams()
    const page = searchParams.get("page") || "1"
    const search = searchParams.get("search") || ""
    const [localSearch, setLocalSearch] = useState(search)
    const debouncedSearch = useDebounce(localSearch, 500)

    // Fetch upload logs from API
    const { data, isLoading, error, isFetching } = useGetUploadLogsQuery({
        search: debouncedSearch || undefined,
        page: parseInt(page),
        limit: 10
    })

    // Sync URL search param with local state
    useEffect(() => {
        setLocalSearch(search)
    }, [search])

    // Update URL when debounced search changes
    useEffect(() => {
        if (debouncedSearch !== search) {
            updateSearchParam("search", debouncedSearch)
            // Reset to page 1 when searching
            if (debouncedSearch && page !== "1") {
                updateSearchParam("page", "1")
            }
        }
    }, [debouncedSearch, search, page])

    const uploads = data?.data || []
    const totalUploads = data?.meta?.total || 0
    const isSearching = isFetching && localSearch !== debouncedSearch

    const pagination = useMemo(() => {
        if (!data?.meta) return {
            currentPage: parseInt(page),
            totalPages: 1,
            onPageChange: (page: number) => updateSearchParam("page", String(page)),
            itemsPerPage: 10,
            totalItems: 0,
        }
        return {
            currentPage: data.meta.page || parseInt(page),
            totalPages: data.meta.totalPages || 1,
            onPageChange: (page: number) => updateSearchParam("page", String(page)),
            itemsPerPage: data.meta.limit || 10,
            totalItems: data.meta.total || 0,
        }
    }, [data, page])

    return (
        <div className="p-5 bg-white/50 backdrop-blur-[2px] border border-black/10 m-1 mb-0 space-y-4 flex-1 overflow-auto">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h2 className='text-2xl font-medium'>View Uploads</h2>
                    <p className='text-gray-400 text-sm'>Manage and review uploaded examination files</p>
                </div>
                <div className="text-sm text-gray-500">
                    Total: {totalUploads} files
                </div>
            </div>

            <SearchAndFilters
                searchTerm={localSearch}
                setSearchTerm={setLocalSearch}
                isSearching={isSearching}
            />

            {isLoading ? (
                <div className="flex items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
                </div>
            ) : error ? (
                <div className="text-center py-12">
                    <p className="text-red-600">Failed to load uploads</p>
                </div>
            ) : (
                <UploadsTable uploads={uploads} pagination={pagination} />
            )}
        </div>
    )
}
