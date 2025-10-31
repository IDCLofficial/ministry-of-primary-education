'use client'
import { useState } from 'react'
import { IoSearchOutline, IoFilterOutline } from 'react-icons/io5'

interface FilterState {
    subject: string
    examType: string
    status: string
    dateRange: string
}

interface SearchAndFiltersProps {
    searchTerm: string
    setSearchTerm: (term: string) => void
    filters: FilterState
    setFilters: (filters: FilterState) => void
}

export function SearchAndFilters({ searchTerm, setSearchTerm, filters, setFilters }: SearchAndFiltersProps) {
    const [showFilters, setShowFilters] = useState(false)

    return (
        <div className="bg-white rounded-xl border border-gray-100 p-4">
            <div className="flex flex-col sm:flex-row gap-4">
                {/* Search Bar */}
                <div className="flex-1 relative">
                    <IoSearchOutline className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                        type="text"
                        placeholder="Search by filename, subject, or uploader..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                </div>

                {/* Filter Toggle */}
                <button
                    onClick={() => setShowFilters(!showFilters)}
                    className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                    <IoFilterOutline className="w-5 h-5" />
                    Filters
                </button>
            </div>

            {/* Filter Options */}
            {showFilters && (
                <div className="mt-4 pt-4 border-t border-gray-100">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        <select
                            value={filters.subject}
                            onChange={(e) => setFilters({ ...filters, subject: e.target.value })}
                            className="px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="">All Subjects</option>
                            <option value="Mathematics">Mathematics</option>
                            <option value="English Language">English Language</option>
                            <option value="Science">Science</option>
                            <option value="Social Studies">Social Studies</option>
                            <option value="French">French</option>
                        </select>

                        <select
                            value={filters.examType}
                            onChange={(e) => setFilters({ ...filters, examType: e.target.value })}
                            className="px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="">All Exam Types</option>
                            <option value="BECE">BECE</option>
                            <option value="CA">Continuous Assessment</option>
                            <option value="Mock">Mock Exam</option>
                        </select>

                        <select
                            value={filters.status}
                            onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                            className="px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="">All Status</option>
                            <option value="processed">Processed</option>
                            <option value="pending">Pending</option>
                            <option value="error">Error</option>
                        </select>

                        <select
                            value={filters.dateRange}
                            onChange={(e) => setFilters({ ...filters, dateRange: e.target.value })}
                            className="px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="">All Dates</option>
                            <option value="today">Today</option>
                            <option value="week">This Week</option>
                            <option value="month">This Month</option>
                        </select>
                    </div>
                </div>
            )}
        </div>
    )
}
