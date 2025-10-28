'use client'

import React, { useState, useEffect } from 'react'
import { useAuth } from '../../providers/AuthProvider'
import { useOnboardStudentMutation, useUpdateStudentMutation } from '../../store/api/authApi'
import CustomDropdown from './CustomDropdown'
import toast from 'react-hot-toast'

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

interface StudentOnboardingModalProps {
  isOpen: boolean
  onClose: () => void
  onStudentAdded: () => void
  studentToUpdate?: Student | null
}

interface StudentFormData {
  studentName: string
  gender: 'male' | 'female'
  class: string
  examYear: number | string
}

export default function StudentOnboardingModal({ isOpen, onClose, onStudentAdded, studentToUpdate }: StudentOnboardingModalProps) {
  const { school } = useAuth()
  const [onboardStudent] = useOnboardStudentMutation()
  const [updateStudent] = useUpdateStudentMutation()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState<StudentFormData>({
    studentName: studentToUpdate?.fullName || '',
    gender: studentToUpdate?.gender === 'Male' ? 'male' : studentToUpdate?.gender === 'Female' ? 'female' : 'male',
    class: studentToUpdate?.class || '',
    examYear: studentToUpdate?.examYear || new Date().getFullYear()
  })

  const [errors, setErrors] = useState<Partial<StudentFormData>>({})
  const [serverError, setServerError] = useState<string>('')

  // Determine if we're in update mode
  const isUpdateMode = !!studentToUpdate

  // Update form data when studentToUpdate changes
  useEffect(() => {
    if (studentToUpdate) {
      setFormData({
        studentName: studentToUpdate.fullName,
        gender: studentToUpdate.gender === 'Male' ? 'male' : 'female',
        class: studentToUpdate.class,
        examYear: studentToUpdate.examYear
      })
    } else {
      setFormData({
        studentName: '',
        gender: 'male',
        class: '',
        examYear: new Date().getFullYear()
      })
    }
    setErrors({})
    setServerError('')
  }, [studentToUpdate])

  // Check if form can proceed
  const canProceed = formData.studentName.trim() !== '' && 
                     formData.class.trim() !== '' && 
                     formData.examYear && 
                     school && 
                     (isUpdateMode || school.availablePoints > 0) && 
                     !isSubmitting

  const validateForm = (): boolean => {
    const newErrors: Partial<StudentFormData> = {}

    if (!formData.studentName.trim()) {
      newErrors.studentName = 'Student name is required'
    }

    if (!formData.class.trim()) {
      newErrors.class = 'Class is required'
    }

    const examYearNum = typeof formData.examYear === 'string' ? parseInt(formData.examYear) : formData.examYear
    if (isNaN(examYearNum) || examYearNum < 2020 || examYearNum > 2030) {
      newErrors.examYear = 'Exam year must be between 2020 and 2030'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleInputChange = (field: keyof StudentFormData, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: field === 'examYear' ? (typeof value === 'string' ? parseInt(value) || new Date().getFullYear() : value) : value
    }))

    // Clear error for this field when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: undefined
      }))
    }

    // Clear server error when user starts typing
    if (serverError) {
      setServerError('')
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    if (!school?.id) {
      toast.error('School information not found. Please try logging in again.')
      return
    }

    setIsSubmitting(true)
    setServerError('')

    try {
      if (isUpdateMode) {
        if (!studentToUpdate?.id) {
          toast.error('Student ID not found. Please try again.')
          setIsSubmitting(false)
          return
        }

        // Create the update data object matching the required format
        const examYearNum = typeof formData.examYear === 'string' ? parseInt(formData.examYear) : formData.examYear
        const updateData = {
          studentName: formData.studentName,
          gender: formData.gender,
          examYear: examYearNum
        }

        // Call the API to update the student
        const response = await updateStudent({ 
          id: studentToUpdate.id, 
          data: updateData 
        }).unwrap()
        
        console.log('Student updated successfully:', response)

        // Success - close modal and refresh data
        onStudentAdded()
        onClose()
        resetForm()
        
        toast.success(`Student ${response.studentName} updated successfully!`)
      } else {
        // Create the student data object matching the required format
        const examYearNum = typeof formData.examYear === 'string' ? parseInt(formData.examYear) : formData.examYear
        const studentData = {
          studentName: formData.studentName,
          gender: formData.gender,
          class: formData.class,
          examYear: examYearNum,
          school: school.id
        }

        // Call the API to onboard the student
        const response = await onboardStudent(studentData).unwrap()
        
        console.log('Student onboarded successfully:', response)

        // Success - close modal and refresh data
        onStudentAdded()
        onClose()
        resetForm()
        
        toast.success(`Student ${response.studentName} onboarded successfully with status: ${response.onboardingStatus}!`)
      }
    } catch (error) {
      console.error('Student operation failed:', error)
      const errorMessage = (error as { data?: { message?: string } })?.data?.message || `Failed to ${isUpdateMode ? 'update' : 'onboard'} student. Please try again.`
      setServerError(errorMessage)
      toast.error(errorMessage)
    } finally {
      setIsSubmitting(false)
    }
  }

  const resetForm = () => {
    setFormData({
      studentName: '',
      gender: 'male',
      class: '',
      examYear: new Date().getFullYear()
    })
    setErrors({})
    setServerError('')
  }

  const handleClose = () => {
    resetForm()
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/75 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            {isUpdateMode ? 'Update Student' : 'Onboard New Student'}
          </h2>
          <button
            onClick={handleClose}
            disabled={isSubmitting}
            className="text-gray-400 cursor-pointer hover:text-gray-600 transition-colors duration-200 disabled:opacity-50"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6">
          <div className="space-y-4">
            {/* Student Name */}
            <div>
              <label htmlFor="studentName" className="block text-sm font-medium text-gray-700 mb-1">
                Student Name *
              </label>
              <input
                id="studentName"
                type="text"
                value={formData.studentName}
                onChange={(e) => handleInputChange('studentName', e.target.value)}
                className={`w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.studentName ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Enter student full name"
                disabled={isSubmitting}
              />
              {errors.studentName && (
                <p className="mt-1 text-sm text-red-600">{errors.studentName}</p>
              )}
            </div>

            {/* Gender */}
            <div>
              <label htmlFor="gender" className="block text-sm font-medium text-gray-700 mb-1">
                Gender *
              </label>
              <CustomDropdown
                options={[
                  { value: 'male', label: 'Male' },
                  { value: 'female', label: 'Female' }
                ]}
                value={formData.gender}
                onChange={(value) => handleInputChange('gender', value)}
                placeholder="Select gender"
                className={isSubmitting ? 'opacity-50 pointer-events-none' : ''}
              />
            </div>

            {/* Class */}
            <div>
              <label htmlFor="class" className="block text-sm font-medium text-gray-700 mb-1">
                Class *
              </label>
              <CustomDropdown
                options={[
                  // { value: 'SS1', label: 'SS1' },
                  // { value: 'SS2', label: 'SS2' },
                  { value: 'SS3', label: 'SS3' },
                  // { value: 'JSS1', label: 'JSS1' },
                  // { value: 'JSS2', label: 'JSS2' },
                  // { value: 'JSS3', label: 'JSS3' },
                  // Add current student's class if it's not in the list (for update mode)
                  ...(isUpdateMode && studentToUpdate && !['SS1', 'SS2', 'SS3', 'JSS1', 'JSS2', 'JSS3'].includes(studentToUpdate.class) 
                    ? [{ value: studentToUpdate.class, label: studentToUpdate.class }] 
                    : [])
                ]}
                value={formData.class}
                defaultValue={formData.class || 'SS3'}
                onChange={(value) => handleInputChange('class', value)}
                placeholder="Select class"
                className={isSubmitting ? 'opacity-50 pointer-events-none' : ''}
              />
              {errors.class && (
                <p className="mt-1 text-sm text-red-600">{errors.class}</p>
              )}
            </div>

            {/* Exam Year */}
            <div>
              <label htmlFor="examYear" className="block text-sm font-medium text-gray-700 mb-1">
                Exam Year *
              </label>
              <input
                id="examYear"
                type="number"
                min="2020"
                max="2030"
                value={formData.examYear}
                className={`w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.examYear ? 'border-red-500' : 'border-gray-300'
                }`}
                disabled={true}
              />
              {errors.examYear && (
                <p className="mt-1 text-sm text-red-600">{errors.examYear}</p>
              )}
            </div>
          </div>

          {/* Points Info - Only show for new student onboarding */}
          {school && !isUpdateMode && (
            <div className="mt-6 p-3 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-800">
                <span className="font-medium">Available Points:</span> {school.availablePoints}
              </p>
              <p className="text-xs text-blue-600 mt-1">
                1 point will be deducted for onboarding this student
              </p>
            </div>
          )}

          {/* Server Error */}
          {serverError && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 mt-4">
              <p className='text-red-600 text-center text-sm font-medium'>
                {serverError}
              </p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 mt-6">
            <button
              type="button"
              onClick={handleClose}
              disabled={isSubmitting}
              className="flex-1 px-4 py-2 active:scale-95 active:rotate-2 cursor-pointer border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className={(
                `flex-1 text-white py-2 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 font-medium text-sm flex items-center justify-center active:scale-95 active:rotate-2` +
                (!canProceed ? ' bg-gray-400 opacity-50 cursor-not-allowed' : ' bg-blue-600 hover:bg-blue-700 cursor-pointer')
              )}
              disabled={!canProceed}
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  {isUpdateMode ? 'Updating...' : 'Onboarding...'}
                </>
              ) : (
                isUpdateMode ? 'Update Student' : 'Onboard Student'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
