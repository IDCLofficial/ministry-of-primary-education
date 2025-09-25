'use client'

import { useState, useMemo } from 'react'
import { School } from './SchoolsTable'

interface PendingSchoolsTableProps {
  schools: School[]
  onSchoolClick?: (school: School) => void
}

export default function PendingSchoolsTable({ schools, onSchoolClick }: PendingSchoolsTableProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedSchools, setSelectedSchools] = useState<number[]>([])
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(12)

  // Filter pending schools based on search term
  const filteredSchools = useMemo(() => {
    return schools.filter(school => 
      school.status === 'pending' && (
        school.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        school.uniqueCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
        school.principal.toLowerCase().includes(searchTerm.toLowerCase())
      )
    )
  }, [schools, searchTerm])

  // Paginate schools
  const paginatedSchools = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage
    return filteredSchools.slice(startIndex, startIndex + itemsPerPage)
  }, [filteredSchools, currentPage, itemsPerPage])

  const totalPages = Math.ceil(filteredSchools.length / itemsPerPage)

  const handleSelectAll = () => {
    if (selectedSchools.length === paginatedSchools.length) {
      setSelectedSchools([])
    } else {
      setSelectedSchools(paginatedSchools.map(school => school.id))
    }
  }

  const handleSelectSchool = (schoolId: number) => {
    setSelectedSchools(prev => 
      prev.includes(schoolId) 
        ? prev.filter(id => id !== schoolId)
        : [...prev, schoolId]
    )
  }

  const handleBulkApprove = () => {
    // Handle bulk approval logic here
    console.log('Approving schools:', selectedSchools)
  }

  const handleBulkReject = () => {
    // Handle bulk rejection logic here
    console.log('Rejecting schools:', selectedSchools)
  }

  return (
    <div className="p-6">
      {/* Header with Search and Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 space-y-4 sm:space-y-0">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Schools</h2>
          <p className="text-sm text-gray-600">List Of Approved Schools on the System</p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="relative">
            <input
              type="text"
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <svg
              className="absolute left-3 top-2.5 h-5 w-5 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
          {selectedSchools.length > 0 && (
            <div className="flex space-x-2">
              <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded text-sm">
                {selectedSchools.length} Selected
              </span>
              <button
                onClick={handleBulkReject}
                className="px-4 py-2 bg-red-600 text-white rounded text-sm hover:bg-red-700 transition-colors"
              >
                Deny Selected
              </button>
              <button
                onClick={handleBulkApprove}
                className="px-4 py-2 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 transition-colors"
              >
                Approve Selected
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left">
                <input
                  type="checkbox"
                  checked={selectedSchools.length === paginatedSchools.length && paginatedSchools.length > 0}
                  onChange={handleSelectAll}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Application ID
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                School Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Unique Code
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                No. of Students Declared
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Principal
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Email
              </th>
             
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {paginatedSchools.map((school) => (
              <tr 
                key={school.id} 
                className="hover:bg-gray-50 cursor-pointer"
                onClick={() => onSchoolClick && onSchoolClick(school)}
              >
                <td className="px-6 py-4 whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                  <input
                    type="checkbox"
                    checked={selectedSchools.includes(school.id)}
                    onChange={() => handleSelectSchool(school.id)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-[12px] text-gray-900">
                  APP-{String(school.id).padStart(4, '0')}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-[12px] font-medium text-gray-900">
                  {school.name}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-[12px] text-gray-500">
                  {school.uniqueCode}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-[12px] text-gray-500">
                  {school.students.length}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-[12px] text-gray-500">
                  {school.principal}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-[12px] text-gray-500">
                  {school.email}
                </td>
              
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex flex-col sm:flex-row justify-between items-center mt-6 space-y-4 sm:space-y-0">
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-700">Number Of Items displayed per page</span>
          <select
            value={itemsPerPage}
            onChange={(e) => setItemsPerPage(Number(e.target.value))}
            className="border border-gray-300 rounded px-3 py-1 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value={12}>12</option>
            <option value={24}>24</option>
            <option value={48}>48</option>
          </select>
        </div>

        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-700">
            {((currentPage - 1) * itemsPerPage) + 1}–{Math.min(currentPage * itemsPerPage, filteredSchools.length)} of {filteredSchools.length} Items
          </span>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
            className="px-3 py-1 border border-gray-300 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
          >
            ‹
          </button>
          
          {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
            const page = i + 1
            return (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`px-3 py-1 border rounded text-sm ${
                  currentPage === page
                    ? 'bg-blue-500 text-white border-blue-500'
                    : 'border-gray-300 hover:bg-gray-50'
                }`}
              >
                {page}
              </button>
            )
          })}
          
          <button
            onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage === totalPages}
            className="px-3 py-1 border border-gray-300 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
          >
            ›
          </button>
        </div>
      </div>
    </div>
  )
}
