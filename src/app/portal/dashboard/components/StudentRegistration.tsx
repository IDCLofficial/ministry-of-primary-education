'use client'

import React, { useState, useMemo } from 'react'
import Pagination from './Pagination'
import CustomCheckbox from './CustomCheckbox'
import CustomDropdown from './CustomDropdown'
import StudentOnboardingModal from './StudentOnboardingModal'
import { useAuth } from '../../providers/AuthProvider'

interface Student {
  id: string
  studentId: string
  fullName: string
  gender: 'Male' | 'Female'
  class: string
  examYear: number
  paymentStatus: 'Not Paid' | 'Completed' | 'Pending'
  onboardingStatus: 'onboarded' | 'pending' | 'not_onboarded'
}

interface StudentRegistrationProps {
  students: Student[]
  selectedStudents: string[]
  onStudentSelect: (studentId: string, selected: boolean) => void
  onSelectAll: (selected: boolean) => void
  searchTerm: string
  onSearchChange: (term: string) => void
  filters: {
    class: string
    year: string
    gender: string
  }
  onRefreshStudents?: () => void
  // Server-side pagination props
  currentPage: number
  totalPages: number
  itemsPerPage: number
  totalItems: number
  onPageChange: (page: number) => void
  onItemsPerPageChange: (itemsPerPage: number) => void
}

type SortableField = 'studentId' | 'fullName' | 'gender' | 'class' | 'examYear' | 'paymentStatus'
type SortDirection = 'asc' | 'desc' | null

interface SortState {
  field: SortableField | null
  direction: SortDirection
  clickCount: number
}

export default function StudentRegistration({
  students,
  selectedStudents,
  onStudentSelect,
  onSelectAll,
  searchTerm,
  onSearchChange,
  filters,
  onRefreshStudents,
  currentPage: currentPageProp,
  totalPages: totalPagesProp,
  itemsPerPage: itemsPerPageProp,
  totalItems: totalItemsProp,
  onPageChange,
  onItemsPerPageChange
}: StudentRegistrationProps) {
  const { school } = useAuth()
  const [showOnboardingModal, setShowOnboardingModal] = useState(false)
  const [updateStudent, setUpdateStudent] = useState<Student | null>(null)
  
  // Check if selection should be disabled
  const isSelectionDisabled = process.env.NEXT_PUBLIC_ENV === 'temp'
  const [sortState, setSortState] = useState<SortState>({
    field: null,
    direction: null,
    clickCount: 0
  })

  // Handle column sorting
  const handleSort = (field: SortableField) => {
    setSortState(prevState => {
      if (prevState.field === field) {
        // Same field clicked
        const newClickCount = prevState.clickCount + 1
        if (newClickCount === 1) {
          return { field, direction: 'asc', clickCount: 1 }
        } else if (newClickCount === 2) {
          return { field, direction: 'desc', clickCount: 2 }
        } else {
          // Third click - reset to default
          return { field: null, direction: null, clickCount: 0 }
        }
      } else {
        // Different field clicked - reset count and start with asc
        return { field, direction: 'asc', clickCount: 1 }
      }
    })
  }

  // Note: With server-side pagination, filtering and sorting should be handled by the API
  // For now, we'll keep the client-side logic but it should be moved to the server

  // For server-side pagination, use students directly (already paginated by server)
  const paginatedStudents = students

  const allCurrentPageSelected = paginatedStudents.length > 0 && 
    paginatedStudents.every(student => selectedStudents.includes(student.id))
  
  const someCurrentPageSelected = paginatedStudents.some(student => selectedStudents.includes(student.id))
  const isIndeterminate = someCurrentPageSelected && !allCurrentPageSelected

  const handleSelectAllCurrentPage = () => {
    if (isIndeterminate || allCurrentPageSelected) {
      // If indeterminate or all selected, deselect all
      paginatedStudents.forEach(student => {
        onStudentSelect(student.id, false)
      })
    } else {
      // If none selected, select all
      paginatedStudents.forEach(student => {
        onStudentSelect(student.id, true)
      })
    }
  }

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'Completed':
        return 'bg-green-100 text-green-800'
      case 'Pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'Not Paid':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getOnboardingStatusColor = (status: string) => {
    switch (status) {
      case 'onboarded':
        return 'bg-green-100 text-green-800'
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'not_onboarded':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const handleStudentAdded = () => {
    // Trigger a refetch of students data
    setShowOnboardingModal(false)
    setUpdateStudent(null)
    if (onRefreshStudents) {
      onRefreshStudents()
    }
  }

  const handleUpdateStudent = (student: Student) => {
    setUpdateStudent(student)
    setShowOnboardingModal(true)
  }

  const getSortIcon = (field: SortableField) => {
    if (sortState.field !== field) {
      // Default state - both arrows gray
      return (
        <svg className="w-4 h-4 inline ml-1 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l4-4 4 4m0 6l-4 4-4-4" />
        </svg>
      )
    }

    if (sortState.direction === 'asc') {
      // Ascending - up arrow blue, down arrow gray
      return (
        <svg className="w-4 h-4 inline ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} className="text-blue-600" d="M8 9l4-4 4 4" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} className="text-gray-400" d="M8 15l4 4 4-4" />
        </svg>
      )
    }

    if (sortState.direction === 'desc') {
      // Descending - up arrow gray, down arrow blue
      return (
        <svg className="w-4 h-4 inline ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} className="text-gray-400" d="M8 9l4-4 4 4" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} className="text-blue-600" d="M8 15l4 4 4-4" />
        </svg>
      )
    }

    return null
  }

  return (
    <div className="bg-white rounded-xl shadow-lg shadow-black/2 border border-black/10 sm:p-6 p-3">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h2 className="text-lg font-semibold text-gray-800">Onboarded Students <span className="text-gray-400 text-xl font-medium">({totalItemsProp})</span></h2>
          <p className="text-sm text-gray-600 mt-1">
            Manage your school&apos;s student records and onboarding status
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          {/* Onboard Student Button */}
          {school && school.availablePoints > 0 && (
            <button
              onClick={() => setShowOnboardingModal(true)}
              className="inline-flex cursor-pointer active:scale-95 active:rotate-2 items-center px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-all duration-200"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Onboard Student
            </button>
          )}
          
          {/* Search */}
          <div className="relative w-full sm:w-auto">
            <input
              type="text"
              placeholder="Search by Name or ID..."
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full sm:w-64 pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Desktop Table - Hidden on mobile */}
      <div className="hidden lg:block overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">
                S/N
              </th>
              {!isSelectionDisabled && <th className="text-left py-3 px-4">
                <CustomCheckbox
                  checked={allCurrentPageSelected}
                  indeterminate={isIndeterminate}
                  onChange={handleSelectAllCurrentPage}
                  size="md"
                  disabled={isSelectionDisabled}
                />
              </th>}
              <th 
                className="text-left py-3 px-4 text-sm font-medium text-gray-600 cursor-pointer hover:bg-gray-50 transition-colors duration-150"
                onClick={() => handleSort('studentId')}
              >
                Student ID
                {getSortIcon('studentId')}
              </th>
              <th 
                className="text-left py-3 px-4 text-sm font-medium text-gray-600 cursor-pointer hover:bg-gray-50 transition-colors duration-150"
                onClick={() => handleSort('fullName')}
              >
                Full Name
                {getSortIcon('fullName')}
              </th>
              <th 
                className="text-left py-3 px-4 text-sm font-medium text-gray-600 cursor-pointer hover:bg-gray-50 transition-colors duration-150"
                onClick={() => handleSort('gender')}
              >
                Gender
                {getSortIcon('gender')}
              </th>
              <th 
                className="text-left py-3 px-4 text-sm font-medium text-gray-600 cursor-pointer hover:bg-gray-50 transition-colors duration-150"
                onClick={() => handleSort('class')}
              >
                Class
                {getSortIcon('class')}
              </th>
              <th 
                className="text-left py-3 px-4 text-sm font-medium text-gray-600 cursor-pointer hover:bg-gray-50 transition-colors duration-150"
                onClick={() => handleSort('examYear')}
              >
                Exam Year
                {getSortIcon('examYear')}
              </th>
              <th 
                className="text-left py-3 px-4 text-sm font-medium text-gray-600 cursor-pointer hover:bg-gray-50 transition-colors duration-150"
                onClick={() => handleSort('paymentStatus')}
              >
                Payment Status
                {getSortIcon('paymentStatus')}
              </th>
              <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">
                Onboarding Status
              </th>
              <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Actions</th>
            </tr>
          </thead>
          <tbody>
            {paginatedStudents.map((student, index) => (
              <tr key={student.id} className="border-b border-gray-100 hover:bg-gray-50">
                <td className="py-3 px-4 text-sm text-gray-600">{(currentPageProp - 1) * itemsPerPageProp + index + 1}</td>
                {!isSelectionDisabled && <td className="py-3 px-4">
                  <CustomCheckbox
                    checked={selectedStudents.includes(student.id)}
                    onChange={(checked) => onStudentSelect(student.id, checked)}
                    size="md"
                    disabled={isSelectionDisabled}
                  />
                </td>}
                <td className="py-3 px-4 text-sm text-gray-900">{student.studentId}</td>
                <td className="py-3 px-4 text-sm text-gray-900">{student.fullName}</td>
                <td className="py-3 px-4 text-sm text-gray-600">{student.gender}</td>
                <td className="py-3 px-4 text-sm text-gray-600">{student.class}</td>
                <td className="py-3 px-4 text-sm text-gray-600">{student.examYear}</td>
                <td className="py-3 px-4">
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${getPaymentStatusColor(student.paymentStatus)}`}>
                    {student.paymentStatus}
                  </span>
                </td>
                <td className="py-3 px-4">
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${getOnboardingStatusColor(student.onboardingStatus)}`}>
                    {student.onboardingStatus.replace('_', ' ')}
                  </span>
                </td>
                <td className="py-3 px-4">
                  <button 
                    onClick={() => handleUpdateStudent(student)}
                    className="text-blue-600 cursor-pointer hover:text-blue-800 text-sm font-medium transition-colors duration-200"
                  >
                    Update
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Card Layout - Visible on mobile/tablet */}
      <div className="lg:hidden space-y-3">
        {/* Mobile Header with Select All */}
        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center gap-3">
            <CustomCheckbox
              checked={allCurrentPageSelected}
              indeterminate={isIndeterminate}
              onChange={handleSelectAllCurrentPage}
              size="md"
              disabled={isSelectionDisabled}
            />
            <span className="text-sm font-medium text-gray-700">
              {allCurrentPageSelected ? 'Deselect All' : isIndeterminate ? 'Select All' : 'Select All'}
            </span>
          </div>
          
          {/* Mobile Sort Dropdown */}
          <div className="relative">
            <CustomDropdown
              options={[
                { value: '', label: 'Sort by...' },
                { value: 'fullName', label: 'Name' },
                { value: 'studentId', label: 'Student ID' },
                { value: 'class', label: 'Class' },
                { value: 'examYear', label: 'Year' },
                { value: 'paymentStatus', label: 'Payment' }
              ]}
              value={sortState.field || ''}
              onChange={(value: string) => {
                const field = value as SortableField
                if (field) handleSort(field)
              }}
              className="min-w-[120px]"
            />
          </div>
        </div>

        {/* Student Cards */}
        {paginatedStudents.map((student, index) => (
          <div key={student.id} className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
            <div className="flex items-start gap-3">
              {/* S/N */}
              <div className="pt-1 text-sm text-gray-500 font-medium min-w-[30px]">
                {(currentPageProp - 1) * itemsPerPageProp + index + 1}.
              </div>
              
              {/* Checkbox */}
              {!isSelectionDisabled && <div className="pt-1">
                <CustomCheckbox
                  checked={selectedStudents.includes(student.id)}
                  onChange={(checked) => onStudentSelect(student.id, checked)}
                  size="md"
                  disabled={isSelectionDisabled}
                />
              </div>}
              
              {/* Student Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="text-base font-medium text-gray-900 truncate">
                      {student.fullName}
                    </h3>
                    <p className="text-sm text-gray-500 mt-1">
                      ID: {student.studentId}
                    </p>
                  </div>
                  
                  {/* More Options */}
                  <button className="text-gray-400 hover:text-gray-600 p-1">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                    </svg>
                  </button>
                </div>
                
                {/* Student Details */}
                <div className="mt-3 grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <span className="text-gray-500">Class:</span>
                    <span className="ml-1 font-medium text-gray-900">{student.class}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Gender:</span>
                    <span className="ml-1 font-medium text-gray-900">{student.gender}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Exam Year:</span>
                    <span className="ml-1 font-medium text-gray-900">{student.examYear}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Payment:</span>
                    <span className={`ml-1 px-2 py-0.5 text-xs font-medium rounded-full ${getPaymentStatusColor(student.paymentStatus)}`}>
                      {student.paymentStatus}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-500">Onboarding:</span>
                    <span className={`ml-1 px-2 py-0.5 text-xs font-medium rounded-full ${getOnboardingStatusColor(student.onboardingStatus)}`}>
                      {student.onboardingStatus.replace('_', ' ')}
                    </span>
                  </div>
                </div>
                
                {/* Update Action */}
                <div className="mt-3 pt-3 border-t border-gray-100">
                  <button 
                    onClick={() => handleUpdateStudent(student)}
                    className="text-blue-600 hover:text-blue-800 text-sm font-medium transition-colors duration-200"
                  >
                    Update Student
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      <Pagination
        currentPage={currentPageProp}
        totalPages={totalPagesProp}
        itemsPerPage={itemsPerPageProp}
        totalItems={totalItemsProp}
        onPageChange={onPageChange}
        onItemsPerPageChange={onItemsPerPageChange}
      />

      {/* Student Onboarding Modal */}
      <StudentOnboardingModal
        isOpen={showOnboardingModal}
        onClose={() => {
          setShowOnboardingModal(false)
          setUpdateStudent(null)
        }}
        onStudentAdded={handleStudentAdded}
        studentToUpdate={updateStudent}
      />
    </div>
  )
}
