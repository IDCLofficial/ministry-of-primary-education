'use client'

import React, { useState, useEffect } from 'react'
import { ExamTypeEnum } from '../../store/api/authApi'

interface OnboardingConfirmationModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  totalStudents: number
  examType: ExamTypeEnum
  usedPoints: number
  pointCost: number
}

export default function OnboardingConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  totalStudents,
  examType,
  usedPoints,
  pointCost
}: OnboardingConfirmationModalProps) {
  const [confirmationText, setConfirmationText] = useState('');
  const [isValid, setIsValid] = useState(false);
  const [showDisclaimer, setShowDisclaimer] = useState(true);
  const [hasScrolledToBottom, setHasScrolledToBottom] = useState(false);
  const [hasAgreed, setHasAgreed] = useState(false);
  
  const accumulatedFee = usedPoints * pointCost
  
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

  const requiredText = `yes i am done ${examTypeToName[examType].toLowerCase()}`;
  
  useEffect(() => {
    setIsValid(confirmationText.toLowerCase().trim() === requiredText);
  }, [confirmationText, requiredText]);

  useEffect(() => {
    if (isOpen) {
      setConfirmationText('')
      setIsValid(false)
      setShowDisclaimer(true)
      setHasScrolledToBottom(false)
      setHasAgreed(false)
    }
  }, [isOpen])

  const handleDisclaimerScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const element = e.currentTarget
    const scrolledToBottom = element.scrollHeight - element.scrollTop <= element.clientHeight + 10
    setHasScrolledToBottom(scrolledToBottom)
  }

  const handleAgreeToDisclaimer = () => {
    setHasAgreed(true)
    setShowDisclaimer(false)
  }

  const handleConfirm = () => {
    if (isValid && hasAgreed) {
      onConfirm()
      onClose()
    }
  }

  if (!isOpen) return null

  // Show disclaimer modal first
  if (showDisclaimer) {
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col">
          {/* Disclaimer Header */}
          <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between bg-green-50">
            <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
              Important: Final Submission Notice
            </h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Scrollable Disclaimer Content */}
          <div 
            className="flex-1 overflow-y-auto px-6 py-4"
            onScroll={handleDisclaimerScroll}
          >
            <div className="prose prose-sm max-w-none">
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                <p className="text-sm text-yellow-800 font-semibold mb-2">⚠️ Critical Information</p>
                <p className="text-sm text-yellow-700">
                  Please read this document carefully. You must scroll to the bottom to activate the &ldquo;I Understand&rdquo; button.
                </p>
              </div>

              <h4 className="text-lg font-semibold text-gray-900 mb-3">Onboarding Completion Summary</h4>
              
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                <h5 className="font-semibold text-blue-900 mb-3">Payment Summary (Already Paid)</h5>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between items-center">
                    <span className="text-blue-700">Exam:</span>
                    <span className="font-semibold text-blue-900">{examTypeToName[examType]}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-blue-700">Total Students:</span>
                    <span className="font-semibold text-blue-900">{totalStudents.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-blue-700">Points Used:</span>
                    <span className="font-semibold text-blue-900">{usedPoints.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-blue-700">Cost per Point:</span>
                    <span className="font-semibold text-blue-900">₦{pointCost.toLocaleString()}</span>
                  </div>
                  <div className="border-t border-blue-300 pt-2 mt-2">
                    <div className="flex justify-between items-center">
                      <span className="font-semibold text-blue-900">Total Amount Paid:</span>
                      <span className="text-xl font-bold text-blue-900">₦{accumulatedFee.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </div>

              <h5 className="font-semibold text-gray-900 mt-4 mb-2">1. Finality of Submission</h5>
              <p className="text-sm text-gray-700 mb-3">
                By submitting this onboarding completion, you confirm that you have finished onboarding all students for <strong>{examTypeToName[examType]}</strong> and have <strong>no plans to add any additional students</strong> now or in the future for this examination.
              </p>

              <h5 className="font-semibold text-gray-900 mt-4 mb-2">2. Payment Confirmation</h5>
              <p className="text-sm text-gray-700 mb-3">
                Payment of <strong>₦{accumulatedFee.toLocaleString()}</strong> has already been completed for:
              </p>
              <ul className="text-sm text-gray-700 mb-3 list-disc pl-5 space-y-1">
                <li>Examination fees for {usedPoints.toLocaleString()} students at ₦{pointCost.toLocaleString()} per student</li>
              </ul>

              <h5 className="font-semibold text-gray-900 mt-4 mb-2">3. Ministry Review</h5>
              <p className="text-sm text-gray-700 mb-3">
                Your student list will be sent to the Ministry of Primary & Secondary Education for final approval. Once approved, you will not be able to add more students to this examination.
              </p>

              <h5 className="font-semibold text-gray-900 mt-4 mb-2">4. No Changes After Submission</h5>
              <p className="text-sm text-gray-700 mb-3">
                <strong className="text-red-600">Important:</strong> After submission:
              </p>
              <ul className="text-sm text-gray-700 mb-3 list-disc pl-5 space-y-1">
                <li>You cannot add more students to this examination</li>
                <li>Changes to the student list require formal written request to the Ministry</li>
                <li>Payment has already been processed and is non-refundable</li>
              </ul>

              <h5 className="font-semibold text-gray-900 mt-4 mb-2">5. Verification</h5>
              <p className="text-sm text-gray-700 mb-3">
                Before proceeding, please verify:
              </p>
              <ul className="text-sm text-gray-700 mb-3 list-disc pl-5 space-y-1">
                <li>All {totalStudents} students have been properly onboarded</li>
                <li>Student information is accurate and complete</li>
                <li>You have the authority to complete this submission</li>
                <li>You understand the payment amount and terms</li>
              </ul>

              <div className="bg-green-50 border border-green-200 rounded-lg p-4 mt-6 mb-4">
                <p className="text-sm text-green-800 font-semibold mb-2">✓ Acknowledgment</p>
                <p className="text-sm text-green-700">
                  By clicking &ldquo;I Understand&rdquo; below, you acknowledge that you have read and understood this notice. You confirm that you are ready to submit your student list to the Ministry for final approval.
                </p>
              </div>

              <p className="text-xs text-gray-500 mt-4 mb-8">
                Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
              </p>
            </div>
          </div>

          {/* Disclaimer Footer */}
          <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
            <div className="flex items-center justify-between gap-4">
              <button
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleAgreeToDisclaimer}
                disabled={!hasScrolledToBottom}
                className={`px-6 py-2 text-sm font-semibold rounded-lg transition-all ${
                  hasScrolledToBottom
                    ? 'bg-green-600 text-white hover:bg-green-700 cursor-pointer'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                {hasScrolledToBottom ? (
                  <span className="flex items-center gap-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    I Understand
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <svg className="w-5 h-5 animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                    </svg>
                    Scroll to bottom
                  </span>
                )}
              </button>
            </div>
            {!hasScrolledToBottom && (
              <p className="text-xs text-gray-500 mt-2 text-center">
                Please scroll through the entire document to activate the &ldquo;I Understand&rdquo; button
              </p>
            )}
          </div>
        </div>
      </div>
    )
  }

  // Show confirmation input after disclaimer is accepted
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
              Final step: Type the confirmation text below to complete the submission.
            </p>
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-4">
              <p className="text-orange-800 text-sm font-medium">
                ✓ You have acknowledged the terms. Payment of <span className="font-bold">₦{accumulatedFee.toLocaleString()}</span> has been completed.
              </p>
            </div>
          </div>

          {/* Confirmation Input */}
          <div className="mb-6">
            <label htmlFor="confirmation" className="block text-sm font-medium text-gray-700 mb-2">
              To confirm, please type: <span className="font-mono bg-gray-100 px-2 py-1 rounded text-orange-600">{requiredText}</span>
            </label>
            <input
              id="confirmation"
              type="text"
              required
              autoComplete='off'
              value={confirmationText}
              onChange={(e) => setConfirmationText(e.target.value)}
              placeholder="Type confirmation text here..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
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
                ? 'bg-green-600 text-white hover:bg-green-700 focus:ring-green-500'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            Submit {examTypeToName[examType]} List
          </button>
        </div>
      </div>
    </div>
  )
}
