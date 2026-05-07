'use client'
import { IoSearchOutline, IoCloseCircle, IoFunnel } from 'react-icons/io5'

interface SearchAndFiltersProps {
    schoolName: string
    setSchoolName: (name: string) => void
    uploadBatch: string
    lga: string
    status: string
    availableFilters?: {
        batches: string[]
        lgas: string[]
        statuses: string[]
    }
    onFilterChange: (filterName: string, value: string) => void
    onClearFilters: () => void
    isSearching?: boolean
}

export function SearchAndFilters({ 
    schoolName, 
    setSchoolName, 
    uploadBatch, 
    lga, 
    status,
    availableFilters,
    onFilterChange,
    onClearFilters,
    isSearching = false 
}: SearchAndFiltersProps) {
    
    const hasActiveFilters = uploadBatch || lga || schoolName || status

    return (
        <div className="bg-white rounded-xl border border-gray-100 p-4">
            <div className="flex items-center gap-2 mb-4">
                <IoFunnel className="w-5 h-5 text-gray-600" />
                <h3 className="text-sm font-medium text-gray-900">Filters</h3>
                {hasActiveFilters && (
                    <button
                        onClick={onClearFilters}
                        className="ml-auto text-sm text-red-600 hover:text-red-700 flex items-center gap-1"
                    >
                        <IoCloseCircle className="w-4 h-4" />
                        Clear All
                    </button>
                )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* School Name Search */}
                <div className="relative">
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                        School Name
                    </label>
                    <div className="relative">
                        <IoSearchOutline className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <input
                            type="text"
                            placeholder="Search by school..."
                            value={schoolName}
                            onChange={(e) => setSchoolName(e.target.value)}
                            className="w-full pl-9 pr-8 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        />
                        {isSearching && (
                            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                                <div className="animate-spin rounded-full h-4 w-4 border-2 border-gray-300 border-t-green-600"></div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Upload Batch Filter */}
                <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                        Upload Batch
                    </label>
                    <select
                        value={uploadBatch}
                        onChange={(e) => onFilterChange('uploadBatch', e.target.value)}
                        className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    >
                        <option value="">All Batches</option>
                        {availableFilters?.batches.map((batch) => (
                            <option key={batch} value={batch}>
                                {batch}
                            </option>
                        ))}
                    </select>
                </div>

                {/* LGA Filter */}
                <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                        LGA
                    </label>
                    <select
                        value={lga}
                        onChange={(e) => onFilterChange('lga', e.target.value)}
                        className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    >
                        <option value="">All LGAs</option>
                        {availableFilters?.lgas.map((lgaOption) => (
                            <option key={lgaOption} value={lgaOption}>
                                {lgaOption}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Status Filter */}
                <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                        Status
                    </label>
                    <select
                        value={status}
                        onChange={(e) => onFilterChange('status', e.target.value)}
                        className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    >
                        <option value="">All Statuses</option>
                        {availableFilters?.statuses.map((statusOption) => (
                            <option key={statusOption} value={statusOption}>
                                {statusOption.replace(/_/g, ' ').toUpperCase()}
                            </option>
                        ))}
                    </select>
                </div>
            </div>
        </div>
    )
}
