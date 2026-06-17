'use client'

import React, { useState, useEffect } from 'react'
import toast from 'react-hot-toast'
import { useAddSchoolMutation } from '../../store/api/authApi'

interface AddSchoolModalProps {
  isOpen: boolean
  onClose: () => void
}

const initialFormData = {
  schoolName: '',
  address: '',
  schoolCode: '',
  principal: '',
  email: '',
  phone: '',
}

export default function AddSchoolModal({ isOpen, onClose }: AddSchoolModalProps) {
  const [addSchool, { isLoading: isSubmitting }] = useAddSchoolMutation()
  const [formData, setFormData] = useState(initialFormData)
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

  // Reset form when modal closes
  useEffect(() => {
    if (!isOpen) {
      setFormData(initialFormData)
      setErrors({})
    }
  }, [isOpen])

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.schoolName.trim()) {
      newErrors.schoolName = 'School name is required'
    }

    if (!formData.address.trim()) {
      newErrors.address = 'Address is required'
    }

    if (!formData.schoolCode.trim()) {
      newErrors.schoolCode = 'School code is required'
    }

    if (!formData.principal.trim()) {
      newErrors.principal = 'Principal name is required'
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Enter a valid email address'
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) return

    try {
      const result = await addSchool({
        schoolName: formData.schoolName.trim(),
        address: formData.address.trim(),
        schoolCode: formData.schoolCode.trim(),
        principal: formData.principal.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
      }).unwrap()

      toast.success(result?.message || 'School added successfully!')
      onClose()
    } catch (error: any) {
      const errorMessage = error?.data?.message || 'Failed to add school. Please try again.'
      toast.error(errorMessage)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

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
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-gray-900">Add School</h2>
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
              onChange={(e) => handleInputChange('schoolName', e.target.value)}
              className={inputClass('schoolName')}
              placeholder="Enter school name"
            />
            {errors.schoolName && (
              <p className="mt-1 text-sm text-red-600">{errors.schoolName}</p>
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
            {errors.address && (
              <p className="mt-1 text-sm text-red-600">{errors.address}</p>
            )}
          </div>

          {/* School Code */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              School Code
            </label>
            <input
              type="text"
              value={formData.schoolCode}
              onChange={(e) => handleInputChange('schoolCode', e.target.value)}
              className={inputClass('schoolCode')}
              placeholder="Enter school code"
            />
            {errors.schoolCode && (
              <p className="mt-1 text-sm text-red-600">{errors.schoolCode}</p>
            )}
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
            {errors.principal && (
              <p className="mt-1 text-sm text-red-600">{errors.principal}</p>
            )}
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              className={inputClass('email')}
              placeholder="Enter email address"
            />
            {errors.email && (
              <p className="mt-1 text-sm text-red-600">{errors.email}</p>
            )}
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
            {errors.phone && (
              <p className="mt-1 text-sm text-red-600">{errors.phone}</p>
            )}
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
              {isSubmitting ? 'Adding...' : 'Add School'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
