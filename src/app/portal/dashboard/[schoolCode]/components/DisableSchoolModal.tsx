'use client'

import React, { useEffect } from 'react'
import toast from 'react-hot-toast'
import { useRouter } from 'next/navigation'
import { useHideSchoolMutation } from '@/app/portal/store/api/authApi'

interface DisableSchoolModalProps {
  isOpen: boolean
  onClose: () => void
  schoolId: string
  schoolName: string
}

export default function DisableSchoolModal({ isOpen, onClose, schoolId, schoolName }: DisableSchoolModalProps) {
  const router = useRouter()
  const [hideSchool, { isLoading: isSubmitting }] = useHideSchoolMutation()

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

  const handleConfirm = async () => {
    try {
      const result = await hideSchool({ id: schoolId }).unwrap()
      toast.success(result?.message || 'School disabled successfully')
      onClose()
      router.push('/portal/dashboard')
    } catch (error: any) {
      const errorMessage = error?.data?.message || 'Failed to disable school. Please try again.'
      toast.error(errorMessage)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
              <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-gray-900">Disable School</h2>
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

        {/* Body */}
        <div className="p-6 space-y-4">
          <p className="text-sm text-gray-700">
            You are about to disable <span className="font-semibold text-gray-900">{schoolName}</span>.
          </p>

          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <h3 className="text-sm font-semibold text-red-900 mb-2">This action cannot be undone</h3>
            <p className="text-sm text-red-800">
              Once disabled, this school will no longer be returned by the system and will
              <span className="font-semibold"> disappear permanently</span> from your list.
            </p>
            <p className="text-sm text-red-800 mt-2">
              Only continue if you are certain that:
            </p>
            <ul className="mt-2 space-y-1 text-sm text-red-800 list-disc list-inside">
              <li>This is a <span className="font-semibold">duplicate school</span>, and</li>
              <li>There are <span className="font-semibold">no exam records</span> for this school.</li>
            </ul>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 p-6 border-t border-gray-200">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={isSubmitting}
            className="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            {isSubmitting ? 'Disabling...' : 'Yes, Disable'}
          </button>
        </div>
      </div>
    </div>
  )
}
