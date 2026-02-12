import React from 'react'
import { IoSchoolOutline } from 'react-icons/io5'

interface SchoolsEmptyStateProps {
    searchQuery?: string
}

export default function SchoolsEmptyState({ searchQuery }: SchoolsEmptyStateProps) {
    return (
        <div className="text-center py-12 px-4">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-50 rounded-full mb-4">
                <IoSchoolOutline className="w-10 h-10 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
                No Schools Found
            </h3>
            <p className="text-gray-500 max-w-md mx-auto">
                {searchQuery 
                    ? `No schools match your search "${searchQuery}". Try adjusting your search terms.`
                    : "There are no schools available at the moment."
                }
            </p>
        </div>
    )
}
