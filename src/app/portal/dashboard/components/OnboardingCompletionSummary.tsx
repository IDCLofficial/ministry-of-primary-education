'use client'

import React, { useState } from 'react'
import { useAuth } from '../../providers/AuthProvider'
import { ExamTypeEnum, useUpdateApplicationStatusMutation } from '../../store/api/authApi'
import OnboardingConfirmationModal from './OnboardingConfirmationModal'
import OnboardingSuccessModal from './OnboardingSuccessModal'
import toast from 'react-hot-toast'
import Image from 'next/image'
import { RootState } from '../../store'
import { useAppSelector } from '../../store/hooks'

interface OnboardingCompletionSummaryProps {
  totalStudents: number
  examType: ExamTypeEnum
  usedPoints: number
  examNumberOfStudents: number
  pointCost: number
  isFetchingProfile?: boolean
}

export default function OnboardingCompletionSummary({ totalStudents, examType, usedPoints, pointCost, isFetchingProfile = false }: OnboardingCompletionSummaryProps) {
  // Get school from Redux store
  const { selectedSchool, schoolCode: storedSchoolCode } = useAppSelector((state: RootState) => state.school)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showConfirmationModal, setShowConfirmationModal] = useState(false)
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [completeOnboarding] = useUpdateApplicationStatusMutation()

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

  const handleShowConfirmationModal = () => {
    setShowConfirmationModal(true)
  }

  const handleCompleteOnboarding = async () => {
    if (!selectedSchool?._id) {
      toast.error('School information not available. ID is required. Please try again.')
      return
    }

    const exam = selectedSchool?.exams.find(exam => exam.name === examType)

    if (!exam?.applicationId) {
      toast.error('School information not available. Application ID is required. Please try again.')
      return
    }

    setIsSubmitting(true)

    try {
      toast.loading('Submitting to Ministry for approval...', { id: 'onboarding-completion' })

      await completeOnboarding({
        applicationId: exam.applicationId,
        examType: examType,
        data: {
          status: examType === ExamTypeEnum.WAEC ? 'onboarded' : 'completed',
          reviewNotes: `Onboarding completed for ${totalStudents} students for ${examType} exam`
        }
      }).unwrap()

      toast.dismiss('onboarding-completion')
      toast.success('Successfully submitted to Ministry!')

      // Close confirmation modal and show success modal
      setShowConfirmationModal(false)
      setShowSuccessModal(true)
      setIsSubmitting(false)
    } catch (error: unknown) {
      toast.dismiss('onboarding-completion')
      console.error('Failed to submit onboarding:', error)
      let errorMessage = 'Failed to submit to Ministry. Please try again.'

      if (error && typeof error === 'object') {
        if ('data' in error && error.data && typeof error.data === 'object' && 'message' in error.data) {
          errorMessage = error.data.message as string
        } else if ('message' in error && typeof error.message === 'string') {
          errorMessage = error.message
        }
      }

      toast.error(errorMessage)
      setIsSubmitting(false)
    }
  }

  return (
    <div className="bg-white rounded-xl shadow-lg shadow-black/2 border border-black/10 p-6 mb-6 relative">
      {/* Loading Overlay */}
      {isFetchingProfile && (
        <div className="absolute inset-0 bg-white/80 backdrop-blur-sm z-10 flex items-center justify-center rounded-xl">
          <div className="flex flex-col items-center gap-3">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
            <p className="text-xs font-medium text-gray-600">Updating...</p>
          </div>
        </div>
      )}
      <div className="text-center">
        {/* Success Icon */}
        <div className='h-fit w-full relative'>
          <Image
            src="/images/joint.png"
            alt="Success"
            width={1024}
            height={308}
            objectFit="contain"
            className='absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-10 w-auto -ml-0.5 mt-1'
          />
          <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4 relative shadow-xl shadow-black/5 border border-green-200">
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        </div>

        {/* Title */}
        <h3 className="text-lg font-semibold text-gray-800 mb-2">
          Finished Onboarding Your Students for {examType}?
        </h3>

        {/* Description */}
        <p className="text-gray-600 mb-6 text-sm">
          All {totalStudents} students have been onboarded for <span className="font-semibold text-gray-800">{examType}</span>. Submit to the Ministry when you&apos;re done.
        </p>

        {/* Review Summary */}
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
          <div className="grid grid-cols-3 gap-4 text-sm">
            <div className="text-center">
              <div className="font-semibold text-green-800">{examTypeToName[examType]}</div>
              <div className="text-green-600 text-xs">Examination</div>
            </div>
            <div className="text-center">
              <div className="font-semibold text-green-800">{totalStudents}</div>
              <div className="text-green-600 text-xs">Students</div>
            </div>
            <div className="text-center">
              <div className="font-semibold text-green-800">{usedPoints}</div>
              <div className="text-green-600 text-xs">Points Used</div>
            </div>
          </div>
        </div>

        {/* Submit Button */}
        {totalStudents > 0 && <button
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
              Submit {examTypeToName[examType]} Students
            </>
          )}
        </button>}

        {/* Info Text */}
        <p className="text-xs text-gray-500 mt-3">
          This will submit your <span className="font-medium">{examType}</span> student list to the Ministry of Primary & Secondary Education for final approval.
        </p>
      </div>

      {/* Confirmation Modal */}
      <OnboardingConfirmationModal
        isOpen={showConfirmationModal}
        onClose={() => setShowConfirmationModal(false)}
        onConfirm={handleCompleteOnboarding}
        totalStudents={totalStudents}
        examType={examType}
        usedPoints={totalStudents}
        pointCost={pointCost}
      />

      {/* Success Modal */}
      <OnboardingSuccessModal
        isOpen={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        totalStudents={totalStudents}
        examType={examType}
        status={examType === ExamTypeEnum.WAEC ? 'onboarded' : 'completed'}
      />
    </div>
  )
}