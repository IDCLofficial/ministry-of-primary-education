'use client'

import React, { useState } from 'react'
import { useAuth } from '../../providers/AuthProvider'
import { useUpdateApplicationStatusMutation } from '../../store/api/authApi'
import OnboardingConfirmationModal from './OnboardingConfirmationModal'
import toast from 'react-hot-toast'

interface OnboardingCompletionSummaryProps {
  totalStudents: number
  handleRefresh: () => void
}

export default function OnboardingCompletionSummary({ totalStudents, handleRefresh }: OnboardingCompletionSummaryProps) {
  const { school } = useAuth()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showConfirmationModal, setShowConfirmationModal] = useState(false)
  const [updateApplicationStatus] = useUpdateApplicationStatusMutation()

  // Only show if school has students and total students equals total points (all students onboarded)
  const shouldShow = school && totalStudents > 0 && totalStudents === school.totalPoints

  const handleShowConfirmationModal = () => {
    setShowConfirmationModal(true)
  }

  const handleCompleteOnboarding = async () => {
    if (!school?.id) {
      toast.error('School information not available. Please try again.')
      return
    }

    setIsSubmitting(true)
    
    try {
      console.log('Submitting onboarding completion to ministry...')
      
      await updateApplicationStatus({
        applicationId: school.id,
        data: {
          status: 'completed',
          reviewNotes: `Onboarding completed for ${totalStudents} students`
        }
      }).unwrap()
      
      toast.success('Onboarding submission sent to Ministry of Primary & Secondary Education successfully!')
      
      handleRefresh()
    } catch (error: unknown) {
      console.error('Failed to submit onboarding completion:', error)
      let errorMessage = 'Failed to submit onboarding completion. Please try again.'
      
      if (error && typeof error === 'object') {
        if ('data' in error && error.data && typeof error.data === 'object' && 'message' in error.data) {
          errorMessage = error.data.message as string
        } else if ('message' in error && typeof error.message === 'string') {
          errorMessage = error.message
        }
      }
      
      toast.error(errorMessage)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!shouldShow) return null

  return (
    <div className="bg-white rounded-xl shadow-lg shadow-black/2 border border-black/10 p-6 mb-6">
      <div className="text-center">
        {/* Success Icon */}
        <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
          <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>

        {/* Title */}
        <h3 className="text-xl font-semibold text-gray-800 mb-2">
          Onboarding Complete!
        </h3>
        
        {/* Description */}
        <p className="text-gray-600 mb-6">
          Congratulations! You have successfully onboarded all {totalStudents} students. 
          You can now submit your student list to the Ministry of Primary & Secondary Education for approval.
        </p>

        {/* Review Summary */}
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="text-center">
              <div className="font-semibold text-green-800">{totalStudents}</div>
              <div className="text-green-600">Students Onboarded</div>
            </div>
            <div className="text-center">
              <div className="font-semibold text-green-800">{school?.totalPoints}</div>
              <div className="text-green-600">Points Used</div>
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <button
          onClick={handleShowConfirmationModal}
          disabled={isSubmitting}
          className="w-full inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-lg text-white bg-green-600 hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-all duration-200 active:scale-95 active:rotate-2 cursor-pointer"
        >
          {isSubmitting ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
              Submitting to Ministry...
            </>
          ) : (
            <>
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Complete Onboarding
            </>
          )}
        </button>

        {/* Info Text */}
        <p className="text-xs text-gray-500 mt-3">
          This will submit your student list to the Ministry of Primary & Secondary Education for final approval.
        </p>
      </div>

      {/* Confirmation Modal */}
      <OnboardingConfirmationModal
        isOpen={showConfirmationModal}
        onClose={() => setShowConfirmationModal(false)}
        onConfirm={handleCompleteOnboarding}
        totalStudents={totalStudents}
      />
    </div>
  )
}
