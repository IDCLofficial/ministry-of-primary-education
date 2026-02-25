'use client'

import React, { useState, useEffect } from 'react'
import toast from 'react-hot-toast'
import { useRouter } from 'next/navigation'
import { useAuth } from '../../providers/AuthProvider'
import { useDeleteAccountMutation } from '../../store/api/authApi'

interface DeleteAccountModalProps {
  isOpen: boolean
  onClose: () => void
  userEmail: string
}

export default function DeleteAccountModal({ isOpen, onClose, userEmail }: DeleteAccountModalProps) {
  const [deleteAccount, { isLoading: isDeleting }] = useDeleteAccountMutation()
  const [confirmText, setConfirmText] = useState('')
  const router = useRouter()
  const { logout } = useAuth()

  const CONFIRM_TEXT = 'DELETE'

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
      setConfirmText('')
    }
  }, [isOpen])

  const handleDelete = async () => {
    if (confirmText !== CONFIRM_TEXT) {
      toast.error(`Please type "${CONFIRM_TEXT}" to confirm`)
      return
    }

    try {
      await deleteAccount().unwrap()
      
      toast.success('Account deleted successfully')
      
      // Logout user (clears auth data and redirects)
      logout()
    } catch (error: any) {
      const errorMessage = error?.data?.message || 'Failed to delete account. Please try again.'
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
            <h2 className="text-xl font-semibold text-gray-900">Delete Account</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 cursor-pointer hover:text-gray-600 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {/* Warning */}
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex gap-3">
              <svg className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <div>
                <h3 className="text-sm font-semibold text-red-900 mb-1">Warning: This action cannot be undone</h3>
                <p className="text-sm text-red-700">
                  Deleting your account will permanently remove all your data, including:
                </p>
                <ul className="mt-2 text-sm text-red-700 list-disc list-inside space-y-1">
                  <li>All school information</li>
                  <li>Student records and exam applications</li>
                  <li>Payment history</li>
                  <li>Account settings and preferences</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Account Info */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <p className="text-sm text-gray-600 mb-1">Account to be deleted:</p>
            <p className="text-sm font-semibold text-gray-900">{userEmail}</p>
          </div>

          {/* Confirmation Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Type <span className="font-bold text-red-600">{CONFIRM_TEXT}</span> to confirm
            </label>
            <input
              type="text"
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value.toUpperCase())}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 transition-colors"
              placeholder={`Type ${CONFIRM_TEXT}`}
              autoComplete="off"
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isDeleting}
              className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleDelete}
              disabled={confirmText !== CONFIRM_TEXT || isDeleting}
              className="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {isDeleting ? 'Deleting...' : 'Delete Account'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
