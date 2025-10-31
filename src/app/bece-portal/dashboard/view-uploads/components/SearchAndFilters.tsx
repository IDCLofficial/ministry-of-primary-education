'use client'
import { IoSearchOutline } from 'react-icons/io5'


interface SearchAndFiltersProps {
    searchTerm: string
    setSearchTerm: (term: string) => void
}

export function SearchAndFilters({ searchTerm, setSearchTerm }: SearchAndFiltersProps) {
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
            </div>
        </div>
    )
}
