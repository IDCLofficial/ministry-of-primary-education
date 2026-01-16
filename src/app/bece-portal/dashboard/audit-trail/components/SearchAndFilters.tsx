'use client'
import { useState } from 'react'
import { IoSearchOutline, IoFilterOutline } from 'react-icons/io5'

interface FilterState {
    user: string
    action: string
    resourceType: string
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
                        placeholder="Search by user, resource, or activity..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
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
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                        <select
                            value={filters.user}
                            onChange={(e) => setFilters({ ...filters, user: e.target.value })}
                            className="px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500"
                        >
                            <option value="">All Users</option>
                            <option value="John Doe">John Doe</option>
                            <option value="Jane Smith">Jane Smith</option>
                            <option value="Mike Johnson">Mike Johnson</option>
                            <option value="David Brown">David Brown</option>
                            <option value="Sarah Wilson">Sarah Wilson</option>
                        </select>

                        <select
                            value={filters.action}
                            onChange={(e) => setFilters({ ...filters, action: e.target.value })}
                            className="px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500"
                        >
                            <option value="">All Actions</option>
                            <option value="upload">Upload</option>
                            <option value="download">Download</option>
                            <option value="view">View</option>
                            <option value="create">Create</option>
                            <option value="update">Update</option>
                            <option value="delete">Delete</option>
                            <option value="login">Login</option>
                            <option value="logout">Logout</option>
                        </select>

                        <select
                            value={filters.resourceType}
                            onChange={(e) => setFilters({ ...filters, resourceType: e.target.value })}
                            className="px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500"
                        >
                            <option value="">All Resources</option>
                            <option value="file">Files</option>
                            <option value="student">Students</option>
                            <option value="certificate">Certificates</option>
                            <option value="account">Accounts</option>
                            <option value="system">System</option>
                        </select>

                        <select
                            value={filters.status}
                            onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                            className="px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500"
                        >
                            <option value="">All Status</option>
                            <option value="success">Success</option>
                            <option value="failed">Failed</option>
                            <option value="warning">Warning</option>
                        </select>

                        <select
                            value={filters.dateRange}
                            onChange={(e) => setFilters({ ...filters, dateRange: e.target.value })}
                            className="px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500"
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
