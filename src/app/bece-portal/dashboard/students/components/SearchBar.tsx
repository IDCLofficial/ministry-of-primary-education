import React from 'react'
import { IoSearch } from 'react-icons/io5'

interface SearchBarProps {
    searchQuery: string
    onSearchChange: (query: string) => void
    placeholder?: string
}

export default function SearchBar({ 
    searchQuery, 
    onSearchChange, 
    placeholder = "Search students or schools..." 
}: SearchBarProps) {
    return (
        <div className="relative max-w-md">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <IoSearch className="h-4 w-4 text-gray-400" />
            </div>
            <input
                type="text"
                placeholder={placeholder}
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                className="block w-full pl-10 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
        </div>
    )
}
