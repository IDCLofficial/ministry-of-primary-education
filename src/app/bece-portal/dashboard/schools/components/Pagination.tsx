import React from 'react'
import { IoChevronBack, IoChevronForward } from 'react-icons/io5'

interface PaginationProps {
    disabled?: boolean
    currentPage: number
    totalPages: number
    onPageChange: (page: number) => void
    itemsPerPage: number
    totalItems: number
}

export default function Pagination({ 
    currentPage, 
    totalPages, 
    itemsPerPage, 
    totalItems,
    disabled,
    onPageChange, 
}: PaginationProps) {
    if (totalPages <= 1) return null

    const startItem = (currentPage - 1) * itemsPerPage + 1
    const endItem = Math.min(currentPage * itemsPerPage, totalItems)

    const getVisiblePages = () => {
        const pages = []
        const maxVisible = 5
        
        if (totalPages <= maxVisible) {
            for (let i = 1; i <= totalPages; i++) {
                pages.push(i)
            }
        } else {
            if (currentPage <= 3) {
                for (let i = 1; i <= 4; i++) {
                    pages.push(i)
                }
                pages.push('...')
                pages.push(totalPages)
            } else if (currentPage >= totalPages - 2) {
                pages.push(1)
                pages.push('...')
                for (let i = totalPages - 3; i <= totalPages; i++) {
                    pages.push(i)
                }
            } else {
                pages.push(1)
                pages.push('...')
                for (let i = currentPage - 1; i <= currentPage + 1; i++) {
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
                    <span className="font-medium">{totalItems}</span> students
                </span>
            </div>

            <div className="flex items-center space-x-2">
                {/* Previous button */}
                <button
                    onClick={() => onPageChange(currentPage - 1)}
                    disabled={currentPage === 1 || disabled}
                    className={`inline-flex items-center px-3 py-2 text-sm font-medium rounded-md transition-all active:scale-75 active:rotate-1 cursor-pointer ${
                        currentPage === 1 || disabled
                            ? 'text-gray-400 cursor-not-allowed'
                            : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                >
                    <IoChevronBack className="w-4 h-4 mr-1" />
                    Previous
                </button>

                {/* Page numbers */}
                <div className="flex items-center space-x-1">
                    {getVisiblePages().map((page, index) => (
                        <React.Fragment key={index}>
                            {page === '...' ? (
                                <span className="px-3 py-2 text-sm text-gray-500">...</span>
                            ) : (
                                <button
                                    disabled={disabled}
                                    onClick={() => onPageChange(page as number)}
                                    className={`px-3 py-2 text-sm font-medium rounded-md transition-all active:scale-75 active:rotate-1 cursor-pointer ${
                                        currentPage === page
                                            ? 'bg-green-600 text-white'
                                            : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                                    }`}
                                >
                                    {page}
                                </button>
                            )}
                        </React.Fragment>
                    ))}
                </div>

                {/* Next button */}
                <button
                    onClick={() => onPageChange(currentPage + 1)}
                    disabled={currentPage === totalPages || disabled}
                    className={`inline-flex items-center px-3 py-2 text-sm font-medium rounded-md transition-all active:scale-75 active:rotate-1 cursor-pointer ${
                        currentPage === totalPages || disabled
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
