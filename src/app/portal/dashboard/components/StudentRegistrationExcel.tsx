'use client'

import React, { useState, useEffect } from 'react'
import { ExamTypeEnum, Gender, useBulkOnboardStudentsMutation, useOnboardStudentMutation, useUpdateStudentMutation, SchoolByCodeResponse } from '../../store/api/authApi'
import CustomDropdown from './CustomDropdown'
import toast from 'react-hot-toast'
import Pagination from './Pagination'
import StudentRegistrationSkeleton from './StudentRegistrationSkeleton'
import CertificatePreviewModal from './CertificatePreviewModal'
import { FaFileAlt } from 'react-icons/fa'
import { IoCloudUpload, IoDownload } from 'react-icons/io5'
import * as XLSX from 'xlsx'
import { getExamById } from '../[schoolCode]/types'

interface Student {
  id: string
  studentId?: string
  fullName: string
  gender: 'Male' | 'Female'
  class: string
  examYear: number
  age?: number
}

interface EditableStudent extends Student {
  isEditing?: boolean
  isNew?: boolean
  isLoadingId?: boolean
}

interface BulkStudentRow {
  id: string
  fullName: string
  gender: 'Male' | 'Female'
  age?: number
  rowNumber: number
  source: string
  error?: string
}

const normalizeBulkGender = (value: unknown): 'Male' | 'Female' | null => {
  const normalized = String(value ?? '').trim().toLowerCase()
  if (['male', 'm', 'boy'].includes(normalized)) return 'Male'
  if (['female', 'f', 'girl'].includes(normalized)) return 'Female'
  return null
}

const findBulkValue = (row: Record<string, unknown>, candidates: string[]) => {
  const entries = Object.entries(row)
  for (const candidate of candidates) {
    const found = entries.find(([key]) => key.trim().toLowerCase().replace(/[\s_-]/g, '') === candidate)
    if (found) return found[1]
  }
  return undefined
}

const parseOptionalAge = (value: unknown): number | undefined => {
  const normalized = String(value ?? '').trim()
  if (!normalized) return undefined

  const parsed = Number(normalized)
  if (!Number.isInteger(parsed) || parsed <= 0) return undefined

  return parsed
}

const parseBulkStudentRows = async (file: File): Promise<BulkStudentRow[]> => {
  const data = await file.arrayBuffer()
  const workbook = XLSX.read(data, { type: 'array' })
  const parsedRows: BulkStudentRow[] = []

  workbook.SheetNames.forEach((sheetName) => {
    const worksheet = workbook.Sheets[sheetName]
    const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(worksheet, { defval: '' })

    rows.forEach((row, index) => {
      const fullName = String(findBulkValue(row, ['name', 'fullname', 'studentname']) ?? '').trim()
      const gender = normalizeBulkGender(findBulkValue(row, ['gender', 'sex']))
      const age = parseOptionalAge(findBulkValue(row, ['age']))
      const error = !fullName ? 'Name is required' : !gender ? 'Gender must be Male/Female or M/F' : undefined

      parsedRows.push({
        id: `${file.name}-${sheetName}-${index}`,
        fullName,
        gender: gender || 'Male',
        age,
        rowNumber: index + 2,
        source: workbook.SheetNames.length > 1 ? `${file.name} / ${sheetName}` : file.name,
        error
      })
    })
  })

  return parsedRows
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
  refetchProfile?: () => void
  examType: ExamTypeEnum
  school: SchoolByCodeResponse | null
  isFetchingProfile?: boolean
  onExportStudentList?: () => void
  allStudents: number
  isFlagged?: boolean
  onShowReconciliationModal?: () => void
}

export default function StudentRegistrationExcel({
  students,
  searchTerm,
  onSearchChange,
  onRefreshStudents,
  school,
  currentPage,
  totalPages,
  itemsPerPage,
  totalItems,
  onPageChange,
  onItemsPerPageChange,
  handleSort,
  sortState,
  refetchProfile,
  isLoading = false,
  examType,
  isFetchingProfile = false,
  onExportStudentList,
  allStudents,
  isFlagged = false,
  onShowReconciliationModal
}: StudentRegistrationExcelProps) {
  const examTypeData = getExamById(examType === "Common-entrance" ? "CESS" : examType)
  const [onboardStudent] = useOnboardStudentMutation()
  const [bulkOnboardStudents] = useBulkOnboardStudentsMutation()
  const [updateStudent] = useUpdateStudentMutation()
  const [editableStudents, setEditableStudents] = useState<EditableStudent[]>([])
  const [showNewRow, setShowNewRow] = useState(false)
  const [savingRows, setSavingRows] = useState<Set<string>>(new Set())
  const [failedRows, setFailedRows] = useState<Set<string>>(new Set())
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [pendingNewStudents, setPendingNewStudents] = useState<Set<string>>(new Set())
  const [showCertificateModal, setShowCertificateModal] = useState(false)
  const [originalStudents, setOriginalStudents] = useState<Map<string, Student>>(new Map())
  const [quickAddMode, setQuickAddMode] = useState(false)
  const [lastStudentDefaults, setLastStudentDefaults] = useState<{ class: string; examYear: number; gender: 'Male' | 'Female' }>({
    class: examTypeData?.class || 'SS3',
    examYear: new Date().getFullYear(),
    gender: 'Male'
  })
  const [showBulkUploadModal, setShowBulkUploadModal] = useState(false)
  const [bulkRows, setBulkRows] = useState<BulkStudentRow[]>([])
  const [bulkFileName, setBulkFileName] = useState('')
  const [isParsingBulkFile, setIsParsingBulkFile] = useState(false)
  const [isBulkUploading, setIsBulkUploading] = useState(false)
  const [bulkUploadProgress, setBulkUploadProgress] = useState({ completed: 0, total: 0 })

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

  const currentExamData = school?.exams?.find(e => e.name === examType);
  const examPoints = currentExamData?.availablePoints || 0
  const examStatus = currentExamData?.status || 'approved'
  
  // Calculate actual available points accounting for pending saves
  const actualAvailablePoints = examPoints - pendingNewStudents.size

  // Initialize editable students from props and track original data
  useEffect(() => {
    const originalMap = new Map<string, Student>()
    students.forEach(s => originalMap.set(s.id, { ...s }))
    setOriginalStudents(originalMap)

    setEditableStudents(prev => {
      // Keep new rows that haven't been saved yet
      const newRows = prev.filter(s => s.isNew)

      // Map students from props, preserving editing state if student exists in prev
      const updatedStudents = students.map(student => {
        const existing = prev.find(s => s.id === student.id && !s.isNew)
        return existing ? { ...student, isEditing: existing.isEditing } : { ...student }
      })

      // Combine: new rows first, then updated students
      return [...newRows, ...updatedStudents]
    })

    // Close new row if points exhausted
    if (examPoints === 0 && students.length > 0) {
      setShowNewRow(false)
    }

    setIsRefreshing(false)
  }, [students, examPoints]);

  const genderOptions = [
    { value: 'Male', label: 'Male' },
    { value: 'Female', label: 'Female' }
  ]

  const yearOptions = [
    { value: new Date().getFullYear().toString(), label: new Date().getFullYear().toString() },
  ]

  const handleAddNewRow = () => {
    if (isFlagged) {
      onShowReconciliationModal?.()
      return
    }

    if (actualAvailablePoints <= 0) {
      toast.error('No available points to onboard new students')
      return
    }

    const newStudentId = `new-${Date.now()}`
    const newStudent: EditableStudent = {
      id: newStudentId,
      fullName: '',
      gender: lastStudentDefaults.gender,
      class: lastStudentDefaults.class,
      examYear: lastStudentDefaults.examYear,
      isEditing: true,
      isNew: true
    }
    // Add new student at the top of the table
    setEditableStudents(prev => [newStudent, ...prev])
    setPendingNewStudents(prev => new Set(prev).add(newStudentId))
    setShowNewRow(true)
  }

  const handleEditRow = (id: string) => {
    if (isFlagged) {
      onShowReconciliationModal?.()
      return
    }
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
      // Remove from pending new students
      setPendingNewStudents(prev => {
        const newSet = new Set(prev)
        newSet.delete(id)
        return newSet
      })
    }
  }

  const handleFieldChange = (id: string, field: keyof Student, value: string | number | undefined) => {
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

  const handleOpenBulkUpload = () => {
    if (isFlagged) {
      onShowReconciliationModal?.()
      return
    }
    if (actualAvailablePoints <= 0) {
      toast.error('No available points to onboard new students')
      return
    }
    setShowBulkUploadModal(true)
  }

  const handleBulkFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) return

    const fileName = file.name.toLowerCase()
    if (!fileName.endsWith('.csv') && !fileName.endsWith('.xlsx') && !fileName.endsWith('.xls')) {
      toast.error('Only CSV, XLSX, and XLS files are allowed')
      return
    }

    setIsParsingBulkFile(true)
    setBulkFileName(file.name)
    try {
      const rows = await parseBulkStudentRows(file)
      setBulkRows(rows)
      toast.success(`Parsed ${rows.length} student${rows.length !== 1 ? 's' : ''}`)
    } catch (error) {
      console.error('Bulk upload parsing failed:', error)
      toast.error('Could not parse file. Use columns: name, gender')
      setBulkRows([])
    } finally {
      setIsParsingBulkFile(false)
    }
  }

  const handleBulkRowChange = (id: string, field: 'fullName' | 'gender' | 'age', value: string) => {
    setBulkRows(prev => prev.map(row => {
      if (row.id !== id) return row
      const updated = {
        ...row,
        [field]: field === 'gender' ? value as 'Male' | 'Female' : field === 'age' ? parseOptionalAge(value) : value
      }
      return { ...updated, error: updated.fullName.trim() ? undefined : 'Name is required' }
    }))
  }

  const handleBulkRowDelete = (id: string) => {
    setBulkRows(prev => prev.filter(row => row.id !== id))
  }

  const handleBulkUploadStudents = async () => {
    if (!school?._id) return
    if (isFlagged) {
      onShowReconciliationModal?.()
      return
    }
    if (isFetchingProfile) {
      toast.error('Please wait, points are being updated...')
      return
    }

    const validRows = bulkRows.filter(row => !row.error && row.fullName.trim())
    if (validRows.length === 0) {
      toast.error('No valid students to upload')
      return
    }
    if (validRows.length > actualAvailablePoints) {
      toast.error(`You only have ${actualAvailablePoints} available point${actualAvailablePoints !== 1 ? 's' : ''}`)
      return
    }

    setIsBulkUploading(true)
    setBulkUploadProgress({ completed: 0, total: validRows.length })

    try {
      const students = validRows.map(row => ({
        studentName: row.fullName.toLowerCase().split(' ').filter(Boolean).map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' '),
        gender: row.gender === 'Male' ? Gender.MALE : Gender.FEMALE,
        class: examTypeData?.class || 'N/A',
        examYear: lastStudentDefaults.examYear,
        ...(row.age ? { age: row.age } : {})
      }))

      await bulkOnboardStudents({
        examType,
        data: {
          school: school._id,
          students
        }
      }).unwrap()

      setBulkUploadProgress({ completed: students.length, total: students.length })
      toast.success(`${students.length} student${students.length !== 1 ? 's' : ''} onboarded successfully`)
      onRefreshStudents?.()
      refetchProfile?.()
      setBulkRows([])
      setBulkFileName('')
      setShowBulkUploadModal(false)
    } catch (error) {
      console.error('Bulk student upload failed:', error)
      toast.error((error as { data?: { message?: string } })?.data?.message || 'Bulk upload failed')
    } finally {
      setIsBulkUploading(false)
    }
  }

  const handleSaveRow = async (id: string) => {
    const student = editableStudents.find(s => s.id === id)
    if (!student || !school?._id) return

    // Prevent save operations when account is flagged
    if (isFlagged) {
      onShowReconciliationModal?.()
      return
    }

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
          studentName: student.fullName.toLowerCase().split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' '),
          gender: student.gender.toLowerCase() as 'male' | 'female',
          class: examTypeData?.class || 'N/A',
          examYear: student.examYear,
          school: school._id,
          ...(student.age ? { age: student.age } : {})
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
        
        // Remove from pending new students immediately (optimistic)
        setPendingNewStudents(prev => {
          const newSet = new Set(prev)
          newSet.delete(id)
          return newSet
        })

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

        // Remove from failed rows if it was there
        setFailedRows(prev => {
          const newSet = new Set(prev)
          newSet.delete(id)
          return newSet
        })

        // Refresh in background without showing loader
        if (onRefreshStudents) {
          onRefreshStudents()
        }
        if (refetchProfile) {
          refetchProfile()
        }
        
        // Ensure pending student is removed (in case optimistic removal failed)
        setPendingNewStudents(prev => {
          const newSet = new Set(prev)
          newSet.delete(id)
          return newSet
        })

        // Auto-add new row after successful save if in quick-add mode
        if (quickAddMode && actualAvailablePoints > 0) {
          handleAddNewRow()
        }
      } else {
        // Update existing student - check if anything changed
        const original = originalStudents.get(student.id)

        if (original) {
          const hasChanges =
            original.fullName !== student.fullName ||
            original.gender !== student.gender ||
            original.class !== student.class ||
            original.examYear !== student.examYear ||
            original.age !== student.age

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
          examYear: student.examYear,
          ...(student.age ? { age: student.age } : {})
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

        // Remove from failed rows if it was there
        setFailedRows(prev => {
          const newSet = new Set(prev)
          newSet.delete(id)
          return newSet
        })

        // Note: No profile refetch needed for updates since no points are consumed
      }
    } catch (error) {
      if (refetchProfile) {
        refetchProfile()
      }
      console.error('Student operation failed:', error)
      const errorMessage = (error as { data?: { message?: string } })?.data?.message ||
        `Failed to ${student.isNew ? 'onboard' : 'update'} student. Please try again.`
      toast.error(errorMessage)

      // If it was a new student that failed, remove it from state
      if (student.isNew) {
        setEditableStudents(prev => prev.filter(s => s.id !== id))
        setShowNewRow(false)
        // Remove from pending students
        setPendingNewStudents(prev => {
          const newSet = new Set(prev)
          newSet.delete(id)
          return newSet
        })
      } else {
        // For existing students, keep them in edit mode
        setEditableStudents(prev => prev.map(s => 
          s.id === id ? { ...s, isEditing: true } : s
        ))
        // Mark row as failed for retry
        setFailedRows(prev => new Set(prev).add(id))
      }
    } finally {
      setSavingRows(prev => {
        const newSet = new Set(prev)
        newSet.delete(id)
        return newSet
      })
    }
  }

  const handleRetry = (id: string) => {
    // Remove from failed state and retry save
    setFailedRows(prev => {
      const newSet = new Set(prev)
      newSet.delete(id)
      return newSet
    })
    handleSaveRow(id)
  }

  const handlePreviewCertificate = () => {
    setShowCertificateModal(true)
  }

  const handleExportAllStudentList = () => {
    if (onExportStudentList) {
      onExportStudentList()
    }
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

  if (!currentExamData) {
    return <div>Exam not found</div>
  }

  return (
    <div className="bg-white rounded-xl shadow-lg shadow-black/2 border border-black/10 sm:p-6 p-3 relative">
      {/* Loading Overlay - for refresh, page changes, or profile refetch */}
      {(isRefreshing || isLoading || isFetchingProfile) && (
        <div className="absolute inset-0 bg-white/80 backdrop-blur-sm z-10 flex items-center justify-center rounded-xl">
          <div className="flex flex-col items-center gap-3">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-green-600"></div>
            <p className="text-sm font-medium text-gray-600">{isRefreshing || isFetchingProfile ? 'Updating...' : 'Loading...'}</p>
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
          {currentExamData && examStatus === "completed" && (
            <button
              onClick={handleExportAllStudentList}
              title="Export Student List"
              className="inline-flex cursor-pointer items-center px-4 py-2 border-2 border-blue-600 text-blue-600 text-sm font-medium rounded-lg hover:bg-blue-700 hover:text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200"
            >
              <IoDownload />
              <span className="ml-2">Export</span>
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
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Age
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
              {examStatus === "approved" && <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-32">
                Actions
              </th>}
            </tr>
          </thead>
          {/* {JSON.stringify(students)} */}
          <tbody className="bg-white divide-y divide-gray-200">
            {/* New Record Row - Always at top when active */}
            {showNewRow && editableStudents.find(s => s.isNew) && (() => {
              const newStudent = editableStudents.find(s => s.isNew)!
              return (
                <tr onBlur={() => {
                  if (newStudent.fullName.trim() === '' && !quickAddMode) {
                    handleCancelEdit(newStudent.id)
                  } 
                }} key={newStudent.id} className="bg-blue-50 border-2 border-blue-200">
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
                  <td className="px-4 py-3 text-sm">
                    <input
                      type="number"
                      min="1"
                      value={newStudent.age || ''}
                      onChange={(e) => handleFieldChange(newStudent.id, 'age', e.target.value ? parseInt(e.target.value, 10) : undefined)}
                      placeholder="Optional"
                      className="w-24 px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                  </td>
                  <td className="px-4 py-3 text-sm relative">
                    <div className="w-32 relative z-10 uppercase text-sm">
                      {examTypeData?.class}
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
                      {failedRows.has(newStudent.id) ? (
                        <button
                          onClick={() => handleRetry(newStudent.id)}
                          disabled={savingRows.has(newStudent.id)}
                          className="px-3 py-1 bg-orange-600 text-white rounded hover:bg-orange-700 text-xs font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer flex items-center gap-1"
                          title="Retry"
                        >
                          {savingRows.has(newStudent.id) ? (
                            <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white"></div>
                          ) : (
                            <>
                              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                              </svg>
                              Retry
                            </>
                          )}
                        </button>
                      ) : (
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
                      )}
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
                <td className="px-4 py-3 text-sm">
                  {student.isEditing ? (
                    <input
                      type="number"
                      min="1"
                      value={student.age || ''}
                      onChange={(e) => handleFieldChange(student.id, 'age', e.target.value ? parseInt(e.target.value, 10) : undefined)}
                      placeholder="Optional"
                      className="w-24 px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                  ) : (
                    <span className="text-gray-900">{student.age || '-'}</span>
                  )}
                </td>
                <td className="px-4 py-3 text-sm relative">
                  {student.isEditing ? (
                    <div className="w-32 relative z-10 uppercase text-sm">
                      {examTypeData?.class}
                    </div>
                  ) : (
                    <span className="text-gray-900 uppercase">{student.class}</span>
                  )}
                </td>
                <td className="px-4 py-3 text-sm">
                  {student.isEditing ? (
                    <div className="w-32 relative z-10">
                      <CustomDropdown
                        options={yearOptions}
                        value={String(student.examYear)}
                        onChange={(value) => handleFieldChange(student.id, 'examYear', value)}
                        className="text-sm"
                      />
                    </div>
                  ) :
                    (<span className="text-gray-900">{student.examYear}</span>)}
                </td>
                {examStatus === "approved" && <td className="px-4 py-3 text-sm text-center">
                  {student.isEditing ? (
                    <div className="flex items-center justify-center gap-2">
                      {failedRows.has(student.id) ? (
                        <button
                          onClick={() => handleRetry(student.id)}
                          disabled={savingRows.has(student.id)}
                          className="px-3 py-1 bg-orange-600 text-white rounded hover:bg-orange-700 text-xs font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer flex items-center gap-1"
                        >
                          {savingRows.has(student.id) ? (
                            <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white"></div>
                          ) : (
                            <>
                              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                              </svg>
                              Retry
                            </>
                          )}
                        </button>
                      ) : (
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
                      )}
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
                </td>}
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
              onClick={handleOpenBulkUpload}
              className="px-4 py-3 rounded-lg transition-all duration-200 flex items-center gap-2 font-medium whitespace-nowrap cursor-pointer bg-green-600 text-white hover:bg-green-700"
            >
              <IoCloudUpload className="w-5 h-5" />
              Bulk Upload
            </button>

            <button
              onClick={() => {
                if (isFlagged) {
                  onShowReconciliationModal?.()
                  return
                }
                setQuickAddMode(!quickAddMode)
              }}
              className={`px-4 py-3 rounded-lg transition-all duration-200 flex items-center gap-2 font-medium whitespace-nowrap cursor-pointer ${quickAddMode
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
          examType={examType}
          onClose={() => setShowCertificateModal(false)}
          schoolName={school.schoolName}
          studentsApproved={allStudents}
          examSession={new Date().getFullYear().toString()}
          approvalId={`${examTypeToName[examType]}-IMO-${currentExamData.applicationId.slice(-6)?.toUpperCase() || 'XXXXX'}`}
          issueDate={new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
        />
      )}

      {showBulkUploadModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Bulk Upload Students</h3>
                <p className="text-sm text-gray-500">Upload CSV or Excel with columns: name, gender, age optional</p>
              </div>
              <button
                onClick={() => setShowBulkUploadModal(false)}
                disabled={isBulkUploading}
                className="p-2 text-gray-400 hover:text-gray-600 disabled:opacity-50"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-4">
              <label className="border-2 border-dashed border-gray-300 rounded-lg p-8 flex flex-col items-center justify-center text-center cursor-pointer hover:border-green-500 hover:bg-green-50 transition-colors">
                <IoCloudUpload className="w-10 h-10 text-green-600 mb-3" />
                <span className="text-sm font-medium text-gray-900">
                  {isParsingBulkFile ? 'Parsing file...' : bulkFileName || 'Click to upload CSV or Excel'}
                </span>
                <span className="text-xs text-gray-500 mt-1">Accepted columns: name/fullName/studentName, gender/sex, and optional age</span>
                <input
                  type="file"
                  accept=".csv,.xlsx,.xls,text/csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel"
                  onChange={handleBulkFileChange}
                  disabled={isParsingBulkFile || isBulkUploading}
                  className="hidden"
                />
              </label>

              {bulkRows.length > 0 && (
                <div className="border border-gray-200 rounded-lg overflow-hidden">
                  <div className="px-4 py-3 bg-gray-50 border-b border-gray-200 flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{bulkRows.length} parsed row{bulkRows.length !== 1 ? 's' : ''}</p>
                      <p className="text-xs text-gray-500">{bulkRows.filter(row => row.error).length} row{bulkRows.filter(row => row.error).length !== 1 ? 's' : ''} need attention</p>
                    </div>
                    <p className="text-xs text-gray-500">Available points: {actualAvailablePoints}</p>
                  </div>

                  <div className="max-h-80 overflow-y-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50 sticky top-0">
                        <tr>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Row</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Gender</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Age</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase text-center">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-100">
                        {bulkRows.map(row => (
                          <tr key={row.id}>
                            <td className="px-4 py-2 text-sm text-gray-500">{row.rowNumber}</td>
                            <td className="px-4 py-2 min-w-[180px] sm:min-w-0">
                              <input
                                type="text"
                                value={row.fullName}
                                onChange={(e) => handleBulkRowChange(row.id, 'fullName', e.target.value)}
                                className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                              />
                            </td>
                            <td className="px-4 py-2">
                              <select
                                value={row.gender}
                                onChange={(e) => handleBulkRowChange(row.id, 'gender', e.target.value)}
                                className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                              >
                                <option value="Male">Male</option>
                                <option value="Female">Female</option>
                              </select>
                            </td>
                            <td className="px-4 py-2">
                              <input
                                type="number"
                                min="1"
                                value={row.age || ''}
                                onChange={(e) => handleBulkRowChange(row.id, 'age', e.target.value)}
                                placeholder="Optional"
                                className="w-24 px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                              />
                            </td>
                            <td className="px-4 py-2 text-sm">
                              {row.error ? (
                                <span className="text-red-600">{row.error}</span>
                              ) : (
                                <span className="text-green-600">Ready</span>
                              )}
                            </td>
                            <td className="px-4 py-2 text-center">
                              <button
                                type="button"
                                onClick={() => handleBulkRowDelete(row.id)}
                                disabled={isBulkUploading}
                                className="px-3 py-1 text-xs font-medium text-red-600 border border-red-200 rounded hover:bg-red-50 disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                Delete
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {isBulkUploading && (
                <div className="bg-green-50 border border-green-100 rounded-lg p-4">
                  <div className="flex justify-between text-sm text-green-800 mb-2">
                    <span>Uploading students...</span>
                    <span>{bulkUploadProgress.completed}/{bulkUploadProgress.total}</span>
                  </div>
                  <div className="w-full bg-green-100 rounded-full h-2">
                    <div
                      className="bg-green-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${bulkUploadProgress.total ? (bulkUploadProgress.completed / bulkUploadProgress.total) * 100 : 0}%` }}
                    />
                  </div>
                </div>
              )}
            </div>

            <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-end gap-3">
              <button
                onClick={() => setShowBulkUploadModal(false)}
                disabled={isBulkUploading}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleBulkUploadStudents}
                disabled={isBulkUploading || isParsingBulkFile || bulkRows.length === 0 || bulkRows.some(row => row.error)}
                className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isBulkUploading ? 'Uploading...' : 'Upload Students'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
