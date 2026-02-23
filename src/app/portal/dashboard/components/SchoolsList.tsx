'use client'

import { useState } from 'react'
import Link from 'next/link'
import { IoSchoolOutline, IoSearchOutline, IoGridOutline, IoListOutline, IoArrowForward } from 'react-icons/io5'

interface School {
  _id: string
  schoolName: string
  hasAccount: boolean
  schoolCode: string
}

interface SchoolsListProps {
  schools: School[]
  isLoading?: boolean
}

export default function SchoolsList({ schools, isLoading }: SchoolsListProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')

  const filteredSchools = schools.filter(school =>
    school.schoolName.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-24 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200">
      <div className="p-4 border-b border-gray-200">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-gray-900">Schools in Your LGA</h2>
            <p className="text-sm text-gray-500 mt-1">
              {filteredSchools.length} {filteredSchools.length === 1 ? 'school' : 'schools'} found
            </p>
          </div>
          
          <div className="flex items-center gap-2">
            <div className="relative flex-1 sm:flex-initial">
              <IoSearchOutline className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search schools..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full sm:w-64 pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm"
              />
            </div>
            
            <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded ${viewMode === 'grid' ? 'bg-white shadow-sm' : 'hover:bg-gray-200'} cursor-pointer`}
                aria-label="Grid view"
              >
                <IoGridOutline className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded ${viewMode === 'list' ? 'bg-white shadow-sm' : 'hover:bg-gray-200'} cursor-pointer`}
                aria-label="List view"
              >
                <IoListOutline className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="p-4">
        {filteredSchools.length === 0 ? (
          <div className="text-center py-12">
            <IoSchoolOutline className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 text-sm">
              {searchTerm ? 'No schools found matching your search' : 'No schools available'}
            </p>
          </div>
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredSchools.map((school) => (
              <Link
                key={school._id}
                href={`/portal/dashboard/${school.schoolCode.replace(/\//g, '-')}`}
                className="border border-gray-200 rounded-lg p-4 hover:border-green-500 hover:shadow-md transition-all group cursor-pointer"
              >
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center group-hover:bg-green-100 transition-colors">
                    <IoSchoolOutline className="w-5 h-5 text-green-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900 text-sm mb-1 line-clamp-2 group-hover:text-green-600 transition-colors capitalize">
                      {school.schoolName.toLowerCase()}
                    </h3>
                    <div className="flex items-center gap-2">
                      <span className={`text-xs px-2 py-0.5 rounded-full ${'bg-gray-100 text-gray-600'}`}>
                        {school.schoolCode}
                      </span>
                    </div>
                  </div>
                  <IoArrowForward className="w-4 h-4 text-gray-400 group-hover:text-green-600 group-hover:translate-x-1 transition-all flex-shrink-0" />
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="space-y-2">
            {filteredSchools.map((school) => (
              <Link
                key={school._id}
                href={`/portal/dashboard/${school.schoolCode.replace(/\//g, '-')}`}
                className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:border-green-500 hover:bg-gray-50 transition-all group cursor-pointer"
              >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className="flex-shrink-0 w-8 h-8 bg-green-50 rounded-lg flex items-center justify-center group-hover:bg-green-100 transition-colors">
                    <IoSchoolOutline className="w-4 h-4 text-green-600" />
                  </div>
                  <span className="font-medium text-gray-900 text-sm truncate group-hover:text-green-600 transition-colors capitalize">
                    {school.schoolName.toLowerCase()}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-xs px-2 py-1 rounded-full flex-shrink-0 ${'bg-gray-100 text-gray-600'}`}>
                    {school.schoolCode}
                  </span>
                  <IoArrowForward className="w-4 h-4 text-gray-400 group-hover:text-green-600 group-hover:translate-x-1 transition-all" />
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
