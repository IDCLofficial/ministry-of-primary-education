import React from 'react'
import { IoChevronBack, IoChevronForward } from 'react-icons/io5'

interface PaginationProps {
    disabled?: boolean
    currentPage: number
    totalPages: number
    onPageChange: (page: number) => void
    itemsPerPage: number
    totalItems: number
    itemLabel?: string
}

export default function Pagination({ 
    currentPage, 
    totalPages, 
    itemsPerPage, 
    totalItems,
    disabled,
    onPageChange,
    itemLabel = 'Schools',
}: PaginationProps) {
    // Ensure currentPage is a valid number
    const validCurrentPage = Math.max(1, Math.min(Number(currentPage) || 1, totalPages))
    
    if (totalPages <= 1) return null

    const startItem = (validCurrentPage - 1) * itemsPerPage + 1
    const endItem = Math.min(validCurrentPage * itemsPerPage, totalItems)

    const getVisiblePages = (): (number | string)[] => {
        const pages: (number | string)[] = []
        const maxVisible = 5
        
        if (totalPages <= maxVisible) {
            for (let i = 1; i <= totalPages; i++) {
                pages.push(i)
            }
        } else {
            if (validCurrentPage <= 3) {
                for (let i = 1; i <= 4; i++) {
                    pages.push(i)
                }
                pages.push('...')
                pages.push(totalPages)
            } else if (validCurrentPage >= totalPages - 2) {
                pages.push(1)
                pages.push('...')
                for (let i = totalPages - 3; i <= totalPages; i++) {
                    pages.push(i)
                }
            } else {
                pages.push(1)
                pages.push('...')
                for (let i = validCurrentPage - 1; i <= validCurrentPage + 1; i++) {
                    pages.push(i)
                }
                pages.push('...')
                pages.push(totalPages)
            }
        }
        
        return pages
    }

    return (
        <div className="flex items-center justify-between px-4 py-3 bg-white border-t border-gray-200">
            <div className="flex items-center text-sm text-gray-700">
                <span>
                    Showing <span className="font-medium">{startItem}</span> to{' '}
                    <span className="font-medium">{endItem}</span> of{' '}
                    <span className="font-medium">{totalItems}</span> {itemLabel}
                </span>
            </div>

            <div className="flex items-center space-x-2">
                {/* Previous button */}
                <button
                    onClick={() => {
                        onPageChange(validCurrentPage - 1)
                        window.scrollTo({ top: 0, behavior: 'smooth' })
                    }}
                    disabled={validCurrentPage === 1 || disabled}
                    className={`inline-flex items-center px-3 py-2 text-sm font-medium rounded-md transition-all active:scale-75 active:rotate-1 cursor-pointer ${
                        validCurrentPage === 1 || disabled
                            ? 'text-gray-400 cursor-not-allowed'
                            : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                >
                    <IoChevronBack className="w-4 h-4 mr-1" />
                    Previous
                </button>

                {/* Page numbers */}
                <div className="flex items-center space-x-1">
                    {getVisiblePages().map((pageNum, index) => (
                        <React.Fragment key={index}>
                            {pageNum === '...' ? (
                                <span className="px-3 py-2 text-sm text-gray-500">...</span>
                            ) : (
                                <button
                                    disabled={disabled}
                                    onClick={() => onPageChange(pageNum as number)}
                                    className={`px-3 py-2 text-sm font-medium rounded-md transition-all active:scale-75 active:rotate-1 cursor-pointer ${
                                        validCurrentPage === pageNum
                                            ? 'bg-green-600 text-white'
                                            : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                                    }`}
                                >
                                    {pageNum}
                                </button>
                            )}
                        </React.Fragment>
                    ))}
                </div>

                {/* Next button */}
                <button
                    onClick={() => {
                        onPageChange(validCurrentPage + 1)
                        window.scrollTo({ top: 0, behavior: 'smooth' })
                    }}
                    disabled={validCurrentPage === totalPages || disabled}
                    className={`inline-flex items-center px-3 py-2 text-sm font-medium rounded-md transition-all active:scale-75 active:rotate-1 cursor-pointer ${
                        validCurrentPage === totalPages || disabled
                            ? 'text-gray-400 cursor-not-allowed'
                            : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                >
                    Next
                    <IoChevronForward className="w-4 h-4 ml-1" />
                </button>
            </div>
        </div>
    )
}
