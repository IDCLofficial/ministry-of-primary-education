'use client'

import React, { useState, useEffect } from 'react'
import toast from 'react-hot-toast'
import { useRouter } from 'next/navigation'
import { useUpdateSchoolMutation } from '@/app/portal/store/api/authApi'
import type { SchoolByCodeResponse } from '@/app/portal/store/api/authApi'

interface EditSchoolModalProps {
  isOpen: boolean
  onClose: () => void
  school: SchoolByCodeResponse
}

export default function EditSchoolModal({ isOpen, onClose, school }: EditSchoolModalProps) {
  const router = useRouter()
  const [updateSchool, { isLoading: isSubmitting }] = useUpdateSchoolMutation()
  const [formData, setFormData] = useState({
    schoolName: '',
    address: '',
    schoolCode: '',
    principal: '',
    phone: '',
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  // ESC key listener
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose()
      }
    }

    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [isOpen, onClose])

  // Hydrate form with current school details when opened
  useEffect(() => {
    if (isOpen) {
      setFormData({
        schoolName: school.schoolName ?? '',
        address: school.address ?? '',
        schoolCode: school.schoolCode ?? '',
        principal: school.principal ?? '',
        phone: school.phone ?? '',
      })
      setErrors({})
    }
  }, [isOpen, school])

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.schoolName.trim()) {
      newErrors.schoolName = 'School name is required'
    } else if (/[^a-zA-Z0-9\s]/.test(formData.schoolName)) {
      newErrors.schoolName = 'School name cannot contain symbols'
    }

    if (!formData.schoolCode.trim()) {
      newErrors.schoolCode = 'School code is required'
    } else if (!/^[A-Z]{2}\/\d{3}$/.test(formData.schoolCode)) {
      newErrors.schoolCode = 'Invalid format — must be 2 capital letters, a slash, then 3 digits (e.g. IN/087)'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) return

    // Only send fields that actually changed
    const fields = ['schoolName', 'address', 'schoolCode', 'principal', 'phone'] as const
    const data: Record<string, string> = {}
    fields.forEach((field) => {
      const value = formData[field].trim()
      const original = (school[field] ?? '').toString()
      if (value !== original) {
        data[field] = value
      }
    })

    if (Object.keys(data).length === 0) {
      toast('No changes to save')
      onClose()
      return
    }

    try {
      const result = await updateSchool({ id: school._id, data }).unwrap()
      toast.success(result?.message || 'School updated successfully!')
      onClose()
      router.push('/portal/dashboard')
    } catch (error: any) {
      const errorMessage = error?.data?.message || 'Failed to update school. Please try again.'
      toast.error(errorMessage)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  const handleSchoolNameChange = (value: string) => {
    handleInputChange('schoolName', value.replace(/[^a-zA-Z0-9\s]/g, ''))
  }

  const handleSchoolCodeChange = (raw: string) => {
    const upper = raw.toUpperCase()
    const noSlash = upper.replace(/\//g, '')
    const letters = noSlash.replace(/[^A-Z]/g, '').slice(0, 2)
    const digits = noSlash.slice(letters.length).replace(/[^0-9]/g, '').slice(0, 3)
    const formatted = letters.length === 2 && digits.length > 0 ? `${letters}/${digits}` : letters
    handleInputChange('schoolCode', formatted)
  }

  const SCHOOL_CODE_REGEX = /^[A-Z]{2}\/\d{3}$/
  const schoolCodeValid = SCHOOL_CODE_REGEX.test(formData.schoolCode)

  if (!isOpen) return null

  const inputClass = (field: string) =>
    `w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 transition-colors ${
      errors[field]
        ? 'border-red-300 focus:ring-red-500'
        : 'border-gray-300 focus:ring-green-500'
    }`

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
              <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-gray-900">Edit School Details</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* School Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              School Name
            </label>
            <input
              type="text"
              value={formData.schoolName}
              onChange={(e) => handleSchoolNameChange(e.target.value)}
              className={inputClass('schoolName')}
              placeholder="Enter school name"
            />
            {errors.schoolName ? (
              <p className="mt-1 text-sm text-red-600">{errors.schoolName}</p>
            ) : (
              <p className="mt-1 text-xs text-gray-500">Symbols are not allowed (e.g. & . , /)</p>
            )}
          </div>

          {/* School Code */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              School Code
            </label>
            <div className="relative">
              <input
                type="text"
                value={formData.schoolCode}
                onChange={(e) => handleSchoolCodeChange(e.target.value)}
                className={`${inputClass('schoolCode')} pr-10`}
                placeholder="e.g. IN/087"
                maxLength={6}
              />
              {schoolCodeValid && (
                <span className="absolute inset-y-0 right-3 flex items-center pointer-events-none">
                  <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                  </svg>
                </span>
              )}
            </div>
            {errors.schoolCode ? (
              <p className="mt-1 text-sm text-red-600">{errors.schoolCode}</p>
            ) : (
              <p className="mt-1 text-xs text-gray-500">
                Format: <span className="font-mono font-medium">AB/123</span> — 2 capital letters, a slash, then 3 digits
              </p>
            )}
          </div>

          {/* Address */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Address
            </label>
            <input
              type="text"
              value={formData.address}
              onChange={(e) => handleInputChange('address', e.target.value)}
              className={inputClass('address')}
              placeholder="Enter school address"
            />
          </div>

          {/* Principal */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Principal
            </label>
            <input
              type="text"
              value={formData.principal}
              onChange={(e) => handleInputChange('principal', e.target.value)}
              className={inputClass('principal')}
              placeholder="Enter principal's name"
            />
          </div>

          {/* Phone */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Phone
            </label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => handleInputChange('phone', e.target.value)}
              className={inputClass('phone')}
              placeholder="Enter phone number"
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 px-4 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {isSubmitting ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
