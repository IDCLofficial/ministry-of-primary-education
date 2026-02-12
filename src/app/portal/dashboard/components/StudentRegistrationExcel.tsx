'use client'

import React, { useState, useEffect } from 'react'
import { useAuth } from '../../providers/AuthProvider'
import { ExamTypeEnum, useOnboardStudentMutation, useUpdateStudentMutation } from '../../store/api/authApi'
import CustomDropdown from './CustomDropdown'
import toast from 'react-hot-toast'
import Pagination from './Pagination'
import StudentRegistrationSkeleton from './StudentRegistrationSkeleton'
import CertificatePreviewModal from './CertificatePreviewModal'
import { FaFileAlt } from 'react-icons/fa'

interface Student {
  id: string
  studentId?: string
  fullName: string
  gender: 'Male' | 'Female'
  class: string
  examYear: number
}

interface EditableStudent extends Student {
  isEditing?: boolean
  isNew?: boolean
  isLoadingId?: boolean
}

export type SortableField = 'id' | 'name' | 'gender' | 'class' | 'year' | 'paymentStatus'
type SortDirection = 'asc' | 'desc' | null

export interface SortState {
  field: SortableField | null
  direction: SortDirection
  clickCount: number
}

interface StudentRegistrationExcelProps {
  students: Student[]
  searchTerm: string
  onSearchChange: (term: string) => void
  filters: {
    class?: string
    year?: string
    gender?: string
    sort?: string
  }
  onRefreshStudents?: () => void
  currentPage: number
  totalPages: number
  itemsPerPage: number
  totalItems: number
  onPageChange: (page: number) => void
  onItemsPerPageChange: (itemsPerPage: number) => void
  isLoading?: boolean
  handleSort: (field: SortableField) => void
  sortState: SortState
  examType: ExamTypeEnum
  isFetchingProfile?: boolean
}

export default function StudentRegistrationExcel({
  students,
  searchTerm,
  onSearchChange,
  onRefreshStudents,
  currentPage,
  totalPages,
  itemsPerPage,
  totalItems,
  onPageChange,
  onItemsPerPageChange,
  handleSort,
  sortState,
  isLoading = false,
  examType,
  isFetchingProfile = false,
}: StudentRegistrationExcelProps) {
  const { school } = useAuth()
  const [onboardStudent] = useOnboardStudentMutation()
  const [updateStudent] = useUpdateStudentMutation()
  const [editableStudents, setEditableStudents] = useState<EditableStudent[]>([])
  const [showNewRow, setShowNewRow] = useState(false)
  const [savingRows, setSavingRows] = useState<Set<string>>(new Set())
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [showCertificateModal, setShowCertificateModal] = useState(false)
  const [originalStudents, setOriginalStudents] = useState<Map<string, Student>>(new Map())
  const [quickAddMode, setQuickAddMode] = useState(false)
  const [lastStudentDefaults, setLastStudentDefaults] = useState<{ class: string; examYear: number; gender: 'Male' | 'Female' }>({ 
    class: 'SS3', 
    examYear: new Date().getFullYear(),
    gender: 'Male'
  })

  const examTypeToName: Record<ExamTypeEnum, string> = {
    [ExamTypeEnum.WAEC]: 'WAEC',
    [ExamTypeEnum.UBEGPT]: 'UBEGPT',
    [ExamTypeEnum.UBETMS]: 'UBETMS',
    [ExamTypeEnum.COMMON_ENTRANCE]: 'CESS',
    [ExamTypeEnum.BECE]: 'BECE',
    [ExamTypeEnum.BECE_RESIT]: 'BECE Resit',
    [ExamTypeEnum.UBEAT]: 'UBEAT',
    [ExamTypeEnum.JSCBE]: 'JSCBE'
  }

  const currentExamData = school?.exams.find(e => e.name === examType);
  const examPoints = currentExamData?.availablePoints || 0
  const examStatus = currentExamData?.status || 'approved'

  // Initialize editable students from props and track original data
  useEffect(() => {
    // Only interrupt operations when examPoints reaches 0
    if (examPoints === 0) {
      // Preserve the current state of editable students to avoid interrupting ongoing operations
      setEditableStudents(prev => {
        // Remove any new rows that haven't been saved yet
        const withoutNewRows = prev.filter(s => !s.isNew);
        // Disable editing on all existing rows
        return withoutNewRows.map(s => ({ ...s, isEditing: false }));
      });
      setShowNewRow(false);
    } else {
      // Normal update: preserve new rows and editing state
      setEditableStudents(prev => {
        // Keep any new rows that are being actively worked on
        const newRows = prev.filter(s => s.isNew);
        
        // Merge incoming students with existing new rows
        const updatedStudents = students.map(student => {
          const existing = prev.find(s => s.id === student.id);
          // Preserve editing state if it exists
          return existing ? { ...student, isEditing: existing.isEditing } : student;
        });
        
        // Add new rows at the beginning
        return [...newRows, ...updatedStudents];
      });
    }
    
    // Store original student data for change detection
    const originalMap = new Map<string, Student>()
    students.forEach(s => {
      originalMap.set(s.id, { ...s })
    })
    setOriginalStudents(originalMap)
    
    setIsRefreshing(false)
  }, [students, examPoints]);

  const classOptions = [
    { value: 'SS3', label: 'SS3' },
    { value: 'SS2', label: 'SS2' },
    { value: 'SS1', label: 'SS1' },
    { value: 'JSS3', label: 'JSS3' },
    { value: 'JSS2', label: 'JSS2' },
    { value: 'JSS1', label: 'JSS1' },
  ]

  const genderOptions = [
    { value: 'Male', label: 'Male' },
    { value: 'Female', label: 'Female' }
  ]

  const yearOptions = [
    { value: new Date().getFullYear().toString(), label: new Date().getFullYear().toString() },
    { value: (new Date().getFullYear() + 1).toString(), label: (new Date().getFullYear() + 1).toString() },
  ]

  const handleAddNewRow = () => {
    if (examPoints <= 0) {
      toast.error('No available points to onboard new students')
      return
    }
    
    const newStudent: EditableStudent = {
      id: `new-${Date.now()}`,
      fullName: '',
      gender: lastStudentDefaults.gender,
      class: lastStudentDefaults.class,
      examYear: lastStudentDefaults.examYear,
      isEditing: true,
      isNew: true
    }
    // Add new student at the top of the table
    setEditableStudents(prev => [newStudent, ...prev])
    setShowNewRow(true)
  }

  const handleEditRow = (id: string) => {
    setEditableStudents(prev =>
      prev.map(s => (s.id === id ? { ...s, isEditing: true } : s))
    )
  }

  const handleCancelEdit = (id: string) => {
    const student = editableStudents.find(s => s.id === id)
    
    setEditableStudents(prev => {
      if (student?.isNew) {
        // Remove new unsaved row
        return prev.filter(s => s.id !== id)
      }
      // Revert to original data from originalStudents map
      const original = originalStudents.get(id)
      return prev.map(s => (s.id === id && original ? { ...original, isEditing: false } : s))
    })
    
    // Only hide the add button if we're canceling a new row
    if (student?.isNew) {
      setShowNewRow(false)
    }
  }

  const handleFieldChange = (id: string, field: keyof Student, value: string | number) => {
    setEditableStudents(prev =>
      prev.map(s => (s.id === id ? { ...s, [field]: value } : s))
    )
  }

  const validateStudent = (student: EditableStudent): string | null => {
    if (!student.fullName.trim()) {
      return 'Student name is required'
    }
    if (!student.class.trim()) {
      return 'Class is required'
    }
    if (student.examYear < 2020 || student.examYear > 2030) {
      return 'Exam year must be between 2020 and 2030'
    }
    return null
  }

  const handleSaveRow = async (id: string) => {
    const student = editableStudents.find(s => s.id === id)
    if (!student || !school?.id) return

    // Prevent save operations when profile is being refetched (points updating)
    if (isFetchingProfile) {
      toast.error('Please wait, points are being updated...')
      return
    }

    const validationError = validateStudent(student)
    if (validationError) {
      toast.error(validationError)
      return
    }

    setSavingRows(prev => new Set(prev).add(id))

    try {
      if (student.isNew) {
        // Create new student
        const studentData = {
          studentName: student.fullName,
          gender: student.gender.toLowerCase() as 'male' | 'female',
          class: student.class,
          examYear: student.examYear,
          school: school.id
        }

        // Optimistically add the student to the table with loading state for ID
        const tempId = `temp-${Date.now()}`
        const optimisticStudent: EditableStudent = {
          ...student,
          id: tempId,
          isEditing: false,
          isNew: false,
          isLoadingId: true
        }
        
        // Replace the new row with optimistic student, keep other rows unchanged
        setEditableStudents(prev => [optimisticStudent, ...prev.filter(s => s.id !== id)])
        setShowNewRow(false)

        const response = await onboardStudent({
          examType: examType,
          studentData
        }).unwrap()
        
        toast.success(`Student ${response.studentName} onboarded successfully!`)
        
        // Save the student's class, year, and gender as defaults for next entry
        setLastStudentDefaults({
          class: student.class,
          examYear: student.examYear,
          gender: student.gender
        })
        
        // Update the optimistic student with actual data from response
        setEditableStudents(prev => prev.map(s => 
          s.id === tempId ? {
            ...s,
            id: response._id,
            studentId: response.studentId?.toString(),
            isLoadingId: false,
            isEditing: false
          } : s
        ))
        
        // Refresh in background without showing loader
        if (onRefreshStudents) {
          onRefreshStudents()
        }
        
        // Auto-add new row if in quick-add mode
        if (quickAddMode && examPoints > 1) {
          setTimeout(() => {
            handleAddNewRow()
          }, 100)
        }
      } else {
        // Update existing student - check if anything changed
        const original = originalStudents.get(student.id)
        
        if (original) {
          const hasChanges = 
            original.fullName !== student.fullName ||
            original.gender !== student.gender ||
            original.class !== student.class ||
            original.examYear !== student.examYear
          
          if (!hasChanges) {
            // No changes detected, just cancel edit mode for this row only
            setEditableStudents(prev =>
              prev.map(s => s.id === id ? { ...s, isEditing: false } : s)
            )
            toast.success('No changes to save')
            setSavingRows(prev => {
              const newSet = new Set(prev)
              newSet.delete(id)
              return newSet
            })
            return
          }
        }
        
        // Changes detected, proceed with update
        const updateData = {
          studentName: student.fullName,
          gender: student.gender.toLowerCase() as 'male' | 'female',
          examYear: student.examYear
        }

        const response = await updateStudent({ 
          id: student.id, 
          examType: examType,
          data: updateData,
        }).unwrap()
        
        toast.success(`Student ${response.studentName} updated successfully!`)
        
        // Update local state and cancel edit mode for this row only
        setEditableStudents(prev =>
          prev.map(s => s.id === id ? { ...s, isEditing: false } : s)
        )
        
        // Update original data with new values
        setOriginalStudents(prev => {
          const newMap = new Map(prev)
          const { ...studentData } = student
          
          newMap.set(student.id, studentData as Student)
          return newMap
        })
        
        // Note: No profile refetch needed for updates since no points are consumed
      }
    } catch (error) {
      console.error('Student operation failed:', error)
      const errorMessage = (error as { data?: { message?: string } })?.data?.message || 
        `Failed to ${student.isNew ? 'onboard' : 'update'} student. Please try again.`
      toast.error(errorMessage)
    } finally {
      setSavingRows(prev => {
        const newSet = new Set(prev)
        newSet.delete(id)
        return newSet
      })
    }
  }

  const handlePreviewCertificate = () => {
    setShowCertificateModal(true)
  }

  const getSortIcon = (field: SortableField) => {
    if (sortState.field !== field) {
      return (
        <svg className="w-4 h-4 inline ml-1 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l4-4 4 4m0 6l-4 4-4-4" />
        </svg>
      )
    }

    if (sortState.direction === 'asc') {
      return (
        <svg className="w-4 h-4 inline ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} className="text-green-600" d="M8 9l4-4 4 4" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} className="text-gray-400" d="M8 15l4 4 4-4" />
        </svg>
      )
    }

    if (sortState.direction === 'desc') {
      return (
        <svg className="w-4 h-4 inline ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} className="text-gray-400" d="M8 9l4-4 4 4" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} className="text-green-600" d="M8 15l4 4 4-4" />
        </svg>
      )
    }

    return null
  }


  // Show skeleton on initial load or when explicitly loading
  if (isLoading) {
    return <StudentRegistrationSkeleton />
  }

  return (
    <div className="bg-white rounded-xl shadow-lg shadow-black/2 border border-black/10 sm:p-6 p-3 relative">
      {/* Loading Overlay */}
      {isRefreshing && (
        <div className="absolute inset-0 bg-white/80 backdrop-blur-sm z-10 flex items-center justify-center rounded-xl">
          <div className="flex flex-col items-center gap-3">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-green-600"></div>
            <p className="text-sm font-medium text-gray-600">Updating...</p>
          </div>
        </div>
      )}
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h2 className="text-lg font-semibold text-gray-800">
            Onboarded Students <span className="text-gray-400 text-xl font-medium">({totalItems})</span>
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            Excel-style table - Click any row to edit, new rows appear at the top
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          {/* Preview Certificate Button */}
          {currentExamData && examStatus === "completed" && (
            <button
              onClick={handlePreviewCertificate}
              className="inline-flex cursor-pointer items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200"
            >
              <FaFileAlt className="mr-2" />
              Preview Certificate
            </button>
          )}

          {/* Search */}
          <div className="relative w-full sm:w-auto">
            <input
              type="text"
              placeholder="Search students..."
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full sm:w-64 pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
            <svg
              className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>
      </div>

      {/* Excel-style Table */}
      <div className="overflow-x-auto border border-gray-200 rounded-lg relative">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-16">
                #
              </th>
              <th 
                className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('id')}
              >
                Student ID {getSortIcon('id')}
              </th>
              <th 
                className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('name')}
              >
                Full Name {getSortIcon('name')}
              </th>
              <th 
                className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('gender')}
              >
                Gender {getSortIcon('gender')}
              </th>
              <th 
                className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('class')}
              >
                Class {getSortIcon('class')}
              </th>
              <th 
                className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('year')}
              >
                Exam Year {getSortIcon('year')}
              </th>
              <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-32">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {/* New Record Row - Always at top when active */}
            {showNewRow && editableStudents.find(s => s.isNew) && (() => {
              const newStudent = editableStudents.find(s => s.isNew)!
              return (
                <tr key={newStudent.id} className="bg-blue-50 border-2 border-blue-200">
                  <td className="px-4 py-3 text-sm text-gray-500">
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      New
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm">
                    <span className="text-gray-400 italic text-xs">Auto-generated</span>
                  </td>
                  <td className="px-4 py-3 text-sm">
                    <input
                      type="text"
                      value={newStudent.fullName}
                      onChange={(e) => handleFieldChange(newStudent.id, 'fullName', e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault()
                          handleSaveRow(newStudent.id)
                        }
                      }}
                      placeholder="Enter full name"
                      className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                      autoFocus
                    />
                  </td>
                  <td className="px-4 py-3 text-sm relative">
                    <div className="w-32 relative z-10">
                      <CustomDropdown
                        options={genderOptions}
                        value={newStudent.gender}
                        onChange={(value) => handleFieldChange(newStudent.id, 'gender', value)}
                        className="text-sm"
                      />
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm relative">
                    <div className="w-32 relative z-10">
                      <CustomDropdown
                        options={classOptions}
                        value={newStudent.class}
                        onChange={(value) => handleFieldChange(newStudent.id, 'class', value)}
                        className="text-sm uppercase"
                      />
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm relative">
                    <div className="w-32 relative z-10">
                      <CustomDropdown
                        options={yearOptions}
                        value={newStudent.examYear.toString()}
                        onChange={(value) => handleFieldChange(newStudent.id, 'examYear', parseInt(value))}
                        className="text-sm"
                      />
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() => handleSaveRow(newStudent.id)}
                        disabled={savingRows.has(newStudent.id)}
                        className="p-1.5 text-green-600 hover:bg-green-50 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Save"
                      >
                        {savingRows.has(newStudent.id) ? (
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-green-600"></div>
                        ) : (
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </button>
                      <button
                        onClick={() => handleCancelEdit(newStudent.id)}
                        disabled={savingRows.has(newStudent.id)}
                        className="p-1.5 text-red-600 hover:bg-red-50 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Cancel"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              )
            })()}
            
            {/* Existing Students */}
            {editableStudents.filter(s => !s.isNew).map((student, index) => (
              <tr 
                key={student.id} 
                className={`hover:bg-gray-50 transition-colors ${student.isEditing ? 'bg-blue-50' : ''}`}
              >
                <td className="px-4 py-3 text-sm text-gray-500">
                  {(currentPage - 1) * itemsPerPage + index + 1}
                </td>
                <td className="px-4 py-3 text-sm">
                  {student.isLoadingId ? (
                    <div className="flex items-center gap-2">
                      <div className="h-4 w-20 bg-gray-200 rounded animate-pulse"></div>
                    </div>
                  ) : student.isNew ? (
                    <span className="text-gray-400 italic text-xs">Auto-generated</span>
                  ) : (
                    <span className="text-gray-900">{student.studentId || '-'}</span>
                  )}
                </td>
                <td className="px-4 py-3 text-sm">
                  {student.isEditing ? (
                    <input
                      type="text"
                      value={student.fullName}
                      onChange={(e) => handleFieldChange(student.id, 'fullName', e.target.value)}
                      placeholder="Enter full name"
                      className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                      autoFocus={student.isNew}
                    />
                  ) : (
                    <span className="text-gray-900 font-medium">{student.fullName}</span>
                  )}
                </td>
                <td className="px-4 py-3 text-sm relative">
                  {student.isEditing ? (
                    <div className="w-32 relative z-10">
                      <CustomDropdown
                        options={genderOptions}
                        value={student.gender}
                        onChange={(value) => handleFieldChange(student.id, 'gender', value)}
                        className="text-sm"
                      />
                    </div>
                  ) : (
                    <span className="text-gray-900">{student.gender}</span>
                  )}
                </td>
                <td className="px-4 py-3 text-sm relative">
                  {student.isEditing ? (
                    <div className="w-32 relative z-10">
                      <CustomDropdown
                        options={classOptions}
                        value={student.class}
                        onChange={(value) => handleFieldChange(student.id, 'class', value)}
                        className="text-sm uppercase"
                      />
                    </div>
                  ) : (
                    <span className="text-gray-900 uppercase">{student.class}</span>
                  )}
                </td>
                <td className="px-4 py-3 text-sm">
                  <span className="text-gray-900">{student.examYear}</span>
                </td>
                <td className="px-4 py-3 text-sm text-center">
                  {student.isEditing ? (
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() => handleSaveRow(student.id)}
                        disabled={savingRows.has(student.id)}
                        className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 text-xs font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer"
                      >
                        {savingRows.has(student.id) ? (
                          <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white"></div>
                        ) : (
                          'Save'
                        )}
                      </button>
                      <button
                        onClick={() => handleCancelEdit(student.id)}
                        disabled={savingRows.has(student.id)}
                        className="px-3 py-1 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 text-xs font-medium disabled:opacity-50 transition-colors cursor-pointer"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => handleEditRow(student.id)}
                      className="text-blue-600 hover:text-blue-800 font-medium text-xs transition-colors cursor-pointer"
                    >
                      Edit
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add New Row Button - Only show when no new row is active */}
      {currentExamData && examStatus === "approved" && examPoints > 0 && !showNewRow && (
        <div className="mb-4 space-y-3">
          <div className="flex items-center gap-3">
            <button
              onClick={handleAddNewRow}
              className="flex-1 py-3 border-2 border-dashed rounded-lg transition-all duration-200 flex items-center justify-center gap-2 font-medium border-gray-300 text-gray-600 hover:border-green-500 hover:text-green-600 hover:bg-green-50 cursor-pointer"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Add New Student (Available Points: {examPoints})
              {isFetchingProfile && (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600 ml-2"></div>
              )}
            </button>
            
            <button
              onClick={() => setQuickAddMode(!quickAddMode)}
              className={`px-4 py-3 rounded-lg transition-all duration-200 flex items-center gap-2 font-medium whitespace-nowrap ${
                quickAddMode
                  ? 'bg-green-600 text-white hover:bg-green-700'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
              title="Quick-add mode: Auto-create new row after saving"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              Quick Add
            </button>
          </div>
          
          {quickAddMode && (
            <div className="flex items-center gap-2 text-sm text-green-700 bg-green-50 px-4 py-2 rounded-lg">
              <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
              <span>Quick-add mode active: New row will auto-create after saving. Press <kbd className="px-1.5 py-0.5 bg-white border border-green-300 rounded text-xs font-mono">Enter</kbd> to save.</span>
            </div>
          )}
        </div>
      )}

      {/* Pagination */}
      <div className="mt-6">
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          itemsPerPage={itemsPerPage}
          totalItems={totalItems}
          onPageChange={onPageChange}
          onItemsPerPageChange={onItemsPerPageChange}
        />
      </div>

      {/* Certificate Preview Modal */}
      {school && (
        <CertificatePreviewModal
          isOpen={showCertificateModal}
          onClose={() => setShowCertificateModal(false)}
          schoolName={school.schoolName}
          studentsApproved={school.numberOfStudents || 0}
          examSession={new Date().getFullYear().toString()}
          approvalId={`${examTypeToName[examType]}-IMO-${school.applicationId?.slice(-6)?.toUpperCase() || 'XXXXX'}`}
          issueDate={new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
        />
      )}
    </div>
  )
}
