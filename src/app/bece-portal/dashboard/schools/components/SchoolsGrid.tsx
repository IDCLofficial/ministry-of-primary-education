import React from 'react'
import { School } from '../types/student.types'
import SchoolCard from './SchoolCard'
import SchoolCardSkeleton from './SchoolCardSkeleton'
import SchoolsEmptyState from './SchoolsEmptyState'
import ErrorState from './ErrorState'
import Pagination from './Pagination'

interface SchoolsGridProps {
    schools: School[];
    pagination: {
        currentPage: number;
        totalPages: number;
        onPageChange: (page: number) => void;
        itemsPerPage: number;
        totalItems: number;
        disabled: boolean;
    };
    isLoading?: boolean;
    error?: string | null;
    onRetry?: () => void;
    searchQuery?: string;
}

export default function SchoolsGrid({ 
    schools, 
    pagination, 
    isLoading = false, 
    error = null, 
    onRetry,
    searchQuery 
}: SchoolsGridProps) {
    
    // Loading state
    if (isLoading) {
        return (
            <div className="grid sm:grid-cols-[repeat(auto-fill,minmax(20rem,1fr))] grid-cols-1 gap-3">
                {Array.from({ length: 6 }).map((_, index) => (
                    <SchoolCardSkeleton key={index} />
                ))}
            </div>
        )
    }

    // Error state
    if (error) {
        return <ErrorState message={error} onRetry={onRetry} />
    }

    // Empty state
    if (schools.length === 0) {
        return <SchoolsEmptyState searchQuery={searchQuery} />
    }

    // Data loaded successfully
    return (
        <>
            <div className="grid sm:grid-cols-[repeat(auto-fill,minmax(20rem,1fr))] grid-cols-1 gap-3">
                {schools.map((school) => (
                    <SchoolCard key={school._id} school={school} />
                ))}
            </div>
            <Pagination
                disabled={pagination.disabled}
                currentPage={pagination.currentPage}
                totalPages={pagination.totalPages}
                onPageChange={pagination.onPageChange}
                itemsPerPage={pagination.itemsPerPage}
                totalItems={pagination.totalItems}
            />
        </>
    )
}
