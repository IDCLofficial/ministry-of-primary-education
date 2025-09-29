'use client'

import React, { useState } from 'react'
import { useAuth } from '../../providers/AuthProvider'
import toast from 'react-hot-toast'

interface OnboardingCompletionSummaryProps {
  totalStudents: number
}

export default function OnboardingCompletionSummary({ totalStudents }: OnboardingCompletionSummaryProps) {
  const { school } = useAuth()
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Only show if school has students and total students equals total points (all students onboarded)
  const shouldShow = school && totalStudents > 0 && totalStudents === school.totalPoints

  const handleCompleteOnboarding = async () => {
    setIsSubmitting(true)
    
    try {
      // TODO: Implement API call to submit to Ministry of Primary & Secondary Education
      console.log('Submitting onboarding completion to ministry...')
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      toast.success('Onboarding submission sent to Ministry of Primary & Secondary Education successfully!')
      
    } catch (error) {
      console.error('Failed to submit onboarding completion:', error)
      toast.error('Failed to submit onboarding completion. Please try again.')
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
          onClick={handleCompleteOnboarding}
          disabled={isSubmitting}
          className="w-full inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-lg text-white bg-green-600 hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-all duration-200 active:scale-95 active:rotate-2"
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
    </div>
  )
}
