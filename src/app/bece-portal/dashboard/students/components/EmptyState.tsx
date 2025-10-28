import React from 'react'
import { IoSearch } from 'react-icons/io5'

interface EmptyStateProps {
    searchQuery: string
}

export default function EmptyState({ searchQuery }: EmptyStateProps) {
    return (
        <div className="text-center py-8 text-gray-500">
            <IoSearch className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p>No students or schools found matching &ldquo;{searchQuery}&rdquo;</p>
        </div>
    )
}
