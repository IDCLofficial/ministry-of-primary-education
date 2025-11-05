'use client'
import React, { useState } from 'react'
import { SearchAndFilters } from './components/SearchAndFilters'
import { UploadsTable } from './components/UploadsTable'
import { useGetUploadLogsQuery } from '../../store/api/authApi'

export default function ViewUploadsPage() {
    const [searchTerm, setSearchTerm] = useState('')

    // Fetch upload logs from API
    const { data, isLoading, error } = useGetUploadLogsQuery({
        search: searchTerm || undefined,
        limit: 100
    })

    const uploads = data?.data || []
    const totalUploads = data?.meta?.total || 0

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
                searchTerm={searchTerm}
                setSearchTerm={setSearchTerm}
            />

            {isLoading ? (
                <div className="flex items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
            ) : error ? (
                <div className="text-center py-12">
                    <p className="text-red-600">Failed to load uploads</p>
                </div>
            ) : (
                <UploadsTable uploads={uploads} />
            )}
        </div>
    )
}
