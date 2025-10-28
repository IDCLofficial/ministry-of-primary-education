'use client'

import React, { useState, useEffect } from 'react'

interface OnboardingConfirmationModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  totalStudents: number
}

export default function OnboardingConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  totalStudents
}: OnboardingConfirmationModalProps) {
  const [confirmationText, setConfirmationText] = useState('')
  const [isValid, setIsValid] = useState(false)
  const requiredText = 'yes i am done'

  useEffect(() => {
    setIsValid(confirmationText.toLowerCase().trim() === requiredText)
  }, [confirmationText])

  useEffect(() => {
    if (isOpen) {
      setConfirmationText('')
      setIsValid(false)
    }
  }, [isOpen])

  const handleConfirm = () => {
    if (isValid) {
      onConfirm()
      onClose()
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-[8px] flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full mx-4">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-center mb-4">
            <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
          </div>
          <h3 className="text-xl font-semibold text-gray-900 text-center">
            Final Confirmation Required
          </h3>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="text-center mb-6">
            <p className="text-gray-600 mb-4">
              You are about to complete the onboarding process for <span className="font-semibold text-gray-900">{totalStudents} students</span>.
            </p>
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-4">
              <p className="text-orange-800 text-sm font-medium">
                ⚠️ Important: This action means you are done and have no plans to make any more onboarding.
              </p>
            </div>
            <p className="text-gray-600 text-sm">
              Once submitted, your application will be sent to the Ministry of Primary & Secondary Education for final approval and you won&apos;t be able to add more students.
            </p>
          </div>

          {/* Confirmation Input */}
          <div className="mb-6">
            <label htmlFor="confirmation" className="block text-sm font-medium text-gray-700 mb-2">
              To confirm, please type: <span className="font-mono bg-gray-100 px-2 py-1 rounded text-orange-600">{requiredText}</span>
            </label>
            <input
              id="confirmation"
              type="text"
              value={confirmationText}
              onChange={(e) => setConfirmationText(e.target.value)}
              placeholder="Type confirmation text here..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            {confirmationText && !isValid && (
              <p className="mt-1 text-sm text-red-600">
                Please type exactly: &quot;{requiredText}&quot;
              </p>
            )}
            {isValid && (
              <p className="mt-1 text-sm text-green-600 flex items-center">
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Confirmation text is correct
              </p>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-all duration-200 active:scale-95 active:rotate-2 cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={!isValid}
            className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all duration-200 active:scale-95 active:rotate-2 cursor-pointer ${
              isValid
                ? 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            Complete Onboarding
          </button>
        </div>
      </div>
    </div>
  )
}
