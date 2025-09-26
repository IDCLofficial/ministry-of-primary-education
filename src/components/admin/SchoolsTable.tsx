'use client'

import { useState, useMemo, useEffect } from 'react'
import { updateSchoolStatus, fetchSchools, type SchoolStatus } from '@/lib/api'

export interface Student {
  id: string
  name: string
  gender: string
  class: string
  examYear: string
  paymentStatus: 'Paid' | 'Pending'
  onboardingStatus: 'Onboarded' | 'Not Onboarded'
}

export interface School {
  id: number
  _id: string  // MongoDB ObjectId
  name: string
  uniqueCode: string
  studentsPaidFor: number
  studentsOnboarded: number
  dateApproved: string
  status: 'not applied' | SchoolStatus
  students: Student[]
  principal: string
  email: string
  phone: string
  address: string
  applicationDate: string
}

interface SchoolsTableProps {
  activeTab: string
  onSchoolClick?: (school: School) => void
  showCheckboxes?: boolean
  selectedSchools?: string[]
  onSchoolSelect?: (schoolId: string, isSelected: boolean) => void
  onSelectAll?: (schoolIds: string[], isSelected: boolean) => void
}

// Custom hook to fetch schools data
const useSchoolsData = () => {
  const [schools, setSchools] = useState<School[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchSchools = async () => {
      try {
        setLoading(true)
        const response = await fetch('/api/schools')
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        
        const data = await response.json()
        
        // Transform API data to match our School interface
        const transformedSchools: School[] = data.map((apiSchool: any) => ({
          id: apiSchool._id || apiSchool.id,
          _id: apiSchool._id,  // Preserve the MongoDB ObjectId
          name: apiSchool.schoolName || apiSchool.name,
          uniqueCode: apiSchool.schoolCode || apiSchool.uniqueCode,
          studentsPaidFor: apiSchool.students?.filter((s: any) => s.paymentStatus === 'Paid')?.length || apiSchool.studentsPaidFor || 0,
          studentsOnboarded: apiSchool.students?.filter((s: any) => s.onboardingStatus === 'Onboarded')?.length || apiSchool.studentsOnboarded || 0,
          dateApproved: apiSchool.status === 'approved' 
            ? (apiSchool.updatedAt ? new Date(apiSchool.updatedAt).toLocaleDateString() : 'Recently Approved')
            : apiSchool.status === 'applied' ? 'Under Review'
            : apiSchool.status === 'declined' ? 'Declined'
            : apiSchool.status === 'onboarded' ? 'Onboarded'
            : apiSchool.status === 'completed' ? 'Completed'
            : 'Not Applied',
          status: apiSchool.status as 'not applied' | 'applied' | 'approved' | 'declined' | 'onboarded' | 'completed',
          principal: apiSchool.principal || 'N/A',
          email: apiSchool.email || 'N/A',
          phone: apiSchool.phone?.toString() || 'N/A',
          address: apiSchool.address || 'N/A',
          applicationDate: apiSchool.createdAt ? new Date(apiSchool.createdAt).toLocaleDateString() : new Date().toLocaleDateString(),
          students: apiSchool.students || []
        }))
        
        setSchools(transformedSchools)
        setError(null)
      } catch (err) {
        console.error('Error fetching schools:', err)
        setError('Failed to fetch schools data')
        setSchools([])
      } finally {
        setLoading(false)
      }
    }

    fetchSchools()
  }, [])

  return { schools, loading, error }
}


export default function SchoolsTable({ 
  activeTab, 
  onSchoolClick, 
  showCheckboxes = false, 
  selectedSchools = [], 
  onSchoolSelect, 
  onSelectAll 
}: SchoolsTableProps) {
  const { schools, loading, error } = useSchoolsData()
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(12)

  // Filter schools based on search term and active tab
  const filteredSchools = useMemo(() => {
    return schools.filter(school => {
      const matchesSearch = school.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        school.uniqueCode.toLowerCase().includes(searchTerm.toLowerCase())
      
      const matchesTab = activeTab === 'not applied'
        ? school.status === 'not applied'
        : activeTab === 'applied'
        ? school.status === 'applied'
        : activeTab === 'approved' 
        ? school.status === 'approved'
        : activeTab === 'declined'
        ? school.status === 'declined'
        : activeTab === 'onboarded'
        ? school.status === 'onboarded'
        : activeTab === 'completed'
        ? school.status === 'completed'
        : true // Show all if no specific tab is selected
      
      return matchesSearch && matchesTab
    })
  }, [schools, searchTerm, activeTab])

  // Paginate schools
  const paginatedSchools = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage
    return filteredSchools.slice(startIndex, startIndex + itemsPerPage)
  }, [filteredSchools, currentPage, itemsPerPage])

  const totalPages = Math.ceil(filteredSchools.length / itemsPerPage)

  // Check if all visible schools are selected
  const allVisibleSelected = showCheckboxes && paginatedSchools.length > 0 && 
    paginatedSchools.every(school => selectedSchools.includes(school._id))

  // Check if some visible schools are selected
  const someVisibleSelected = showCheckboxes && 
    paginatedSchools.some(school => selectedSchools.includes(school._id))

  const handleSelectAllVisible = () => {
    if (!onSelectAll) return
    const visibleSchoolIds = paginatedSchools.map(school => school._id)
    onSelectAll(visibleSchoolIds, !allVisibleSelected)
  }

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  const handleItemsPerPageChange = (newItemsPerPage: number) => {
    setItemsPerPage(newItemsPerPage)
    setCurrentPage(1)
  }

  // Show loading state
  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <span className="ml-3 text-gray-600">Loading schools...</span>
        </div>
      </div>
    )
  }

  // Show error state
  if (error) {
    return (
      <div className="p-6">
        <div className="flex flex-col items-center justify-center h-64">
          <div className="text-red-600 mb-2">
            <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <p className="text-red-600 text-center">{error}</p>
          <p className="text-gray-500 text-sm mt-2">Please check your API endpoint or try refreshing the page</p>
          <button 
            onClick={() => window.location.reload()} 
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  // Show empty state when no schools are found
  if (!loading && schools.length === 0) {
    return (
      <div className="p-6">
        <div className="flex flex-col items-center justify-center h-64">
          <div className="text-gray-400 mb-2">
            <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          </div>
          <p className="text-gray-600 text-center">No schools found</p>
          <p className="text-gray-500 text-sm mt-2">Schools data will appear here once available from the API</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6">
      {/* Header with Search */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 space-y-4 sm:space-y-0">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Schools</h2>
          <p className="text-sm text-gray-600 my-4">List Of Approved Schools on the System</p>
        </div>
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
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {showCheckboxes && (
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <input
                    type="checkbox"
                    checked={allVisibleSelected}
                    ref={(input) => {
                      if (input) input.indeterminate = someVisibleSelected && !allVisibleSelected
                    }}
                    onChange={handleSelectAllVisible}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                </th>
              )}
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                School Name
                <svg className="inline w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l4-4 4 4m0 6l-4 4-4-4" />
                </svg>
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Unique Code
                <svg className="inline w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l4-4 4 4m0 6l-4 4-4-4" />
                </svg>
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Students Paid For
                <svg className="inline w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l4-4 4 4m0 6l-4 4-4-4" />
                </svg>
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Students Onboarded
                <svg className="inline w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l4-4 4 4m0 6l-4 4-4-4" />
                </svg>
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Date Approved
                <svg className="inline w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l4-4 4 4m0 6l-4 4-4-4" />
                </svg>
              </th>
              <th className="relative px-6 py-3">
                <span className="sr-only">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {paginatedSchools.map((school) => (
              <tr 
                key={school.id} 
                className={`hover:bg-gray-50 ${school.status === 'approved' && onSchoolClick && !showCheckboxes ? 'cursor-pointer' : ''}`}
                onClick={() => !showCheckboxes && school.status === 'approved' && onSchoolClick && onSchoolClick(school)}
              >
                {showCheckboxes && (
                  <td className="px-6 py-4 whitespace-nowrap">
                    <input
                      type="checkbox"
                      checked={selectedSchools.includes(school._id)}
                      onChange={(e) => {
                        e.stopPropagation()
                        onSchoolSelect && onSchoolSelect(school._id, e.target.checked)
                      }}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                  </td>
                )}
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {school.name}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {school.uniqueCode}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {school.studentsPaidFor.toLocaleString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {school.studentsOnboarded.toLocaleString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {school.dateApproved}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button className="text-gray-400 hover:text-gray-600">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                    </svg>
                  </button>
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
            onChange={(e) => handleItemsPerPageChange(Number(e.target.value))}
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
            onClick={() => handlePageChange(currentPage - 1)}
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
                onClick={() => handlePageChange(page)}
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
            onClick={() => handlePageChange(currentPage + 1)}
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
