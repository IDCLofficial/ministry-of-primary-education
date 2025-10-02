'use client'

import { useState, useMemo, useEffect } from 'react'
import { School } from './SchoolsTable'
import { updateSchoolStatus } from '@/lib/api'

interface PendingSchoolsTableProps {
  onSchoolClick?: (school: School) => void
}

// Custom hook to fetch schools data (same as in SchoolsTable)
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
          id: apiSchool._id,
          _id: apiSchool._id,  // Preserve the MongoDB ObjectId
          name: apiSchool.schoolName,
          uniqueCode: apiSchool.schoolCode,
          studentsPaidFor: apiSchool.students?.filter((s: any) => s.paymentStatus === 'Paid')?.length || 0,
          studentsOnboarded: apiSchool.students?.filter((s: any) => s.onboardingStatus === 'Onboarded')?.length || 0,
          dateApproved: apiSchool.updatedAt ? new Date(apiSchool.updatedAt).toLocaleDateString() : new Date().toLocaleDateString(),
          status: apiSchool.status || 'pending', // Default to pending for this component
          principal: apiSchool.principal,
          email: apiSchool.email,
          phone: apiSchool.phone?.toString() || 'N/A',
          address: apiSchool.address,
          applicationDate: apiSchool.createdAt ? new Date(apiSchool.createdAt).toLocaleDateString() : new Date().toLocaleDateString(),
          students: apiSchool.students || []
        }))
        console.log(transformedSchools)
        console.log(data)
        setSchools(transformedSchools)
        setError(null)
      } catch (err) {
        console.error('Error fetching schools:', err)
        setError('Failed to fetch schools data')
        setSchools([]) // Empty array on error
      } finally {
        setLoading(false)
      }
    }

    fetchSchools()
  }, [])

  return { schools, loading, error }
}

export default function PendingSchoolsTable({ onSchoolClick }: PendingSchoolsTableProps) {
  const { schools, loading, error } = useSchoolsData()
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedSchools, setSelectedSchools] = useState<number[]>([])
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(12)
  const [bulkLoading, setBulkLoading] = useState(false)
  const [notification, setNotification] = useState<{ type: 'success' | 'error', message: string } | null>(null)

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

  const handleBulkApprove = async () => {
    if (selectedSchools.length === 0) return
    
    setBulkLoading(true)
    setNotification(null)
    
    try {
      const promises = selectedSchools.map(schoolId => 
        updateSchoolStatus(schoolId, { 
          status: 'approved',
          reviewNotes: 'Bulk approved by admin'
        })
      )
      
      const results = await Promise.all(promises)
      const failedUpdates = results.filter(result => !result.success)
      
      if (failedUpdates.length === 0) {
        setNotification({ 
          type: 'success', 
          message: `Successfully approved ${selectedSchools.length} school(s)` 
        })
        setSelectedSchools([])
        // Refresh the data
        window.location.reload()
      } else {
        setNotification({ 
          type: 'error', 
          message: `Failed to approve ${failedUpdates.length} school(s)` 
        })
      }
    } catch (error) {
      console.error('Error approving schools:', error)
      setNotification({ 
        type: 'error', 
        message: 'Failed to approve schools. Please try again.' 
      })
    } finally {
      setBulkLoading(false)
    }
  }

  const handleBulkReject = async () => {
    if (selectedSchools.length === 0) return
    
    setBulkLoading(true)
    setNotification(null)
    
    try {
      const promises = selectedSchools.map(schoolId => 
        updateSchoolStatus(schoolId, { 
          status: 'declined',
          reviewNotes: 'Bulk declined by admin'
        })
      )
      
      const results = await Promise.all(promises)
      const failedUpdates = results.filter(result => !result.success)
      
      if (failedUpdates.length === 0) {
        setNotification({ 
          type: 'success', 
          message: `Successfully declined ${selectedSchools.length} school(s)` 
        })
        setSelectedSchools([])
        // Refresh the data
        window.location.reload()
      } else {
        setNotification({ 
          type: 'error', 
          message: `Failed to decline ${failedUpdates.length} school(s)` 
        })
      }
    } catch (error) {
      console.error('Error declining schools:', error)
      setNotification({ 
        type: 'error', 
        message: 'Failed to decline schools. Please try again.' 
      })
    } finally {
      setBulkLoading(false)
    }
  }

  // Show loading state
  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <span className="ml-3 text-gray-600">Loading pending schools...</span>
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
          <p className="text-gray-500 text-sm mt-2">Failed to load pending schools</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6">
      {/* Notification */}
      {notification && (
        <div className={`mb-4 p-4 rounded-lg ${
          notification.type === 'success' 
            ? 'bg-green-50 text-green-800 border border-green-200' 
            : 'bg-red-50 text-red-800 border border-red-200'
        }`}>
          <div className="flex items-center">
            {notification.type === 'success' ? (
              <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            ) : (
              <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            )}
            <span>{notification.message}</span>
            <button 
              onClick={() => setNotification(null)}
              className="ml-auto text-gray-400 hover:text-gray-600"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        </div>
      )}
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
                disabled={bulkLoading}
                className="px-4 py-2 bg-red-600 text-white rounded text-sm hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
              >
                {bulkLoading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Processing...
                  </>
                ) : (
                  'Deny Selected'
                )}
              </button>
              <button
                onClick={handleBulkApprove}
                disabled={bulkLoading}
                className="px-4 py-2 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
              >
                {bulkLoading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Processing...
                  </>
                ) : (
                  'Approve Selected'
                )}
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
