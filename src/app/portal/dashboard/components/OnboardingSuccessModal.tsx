'use client'

import Image from 'next/image'
import React from 'react'

interface OnboardingSuccessModalProps {
  isOpen: boolean
  onClose: () => void
  totalStudents: number
}

export default function OnboardingSuccessModal({ isOpen, onClose, totalStudents }: OnboardingSuccessModalProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full mx-4 transform transition-all">
        <div className="p-6">
          {/* Success Icon */}
          <div className='h-fit w-full relative'>
            <Image
              src="/images/joint.png"
              alt="Success"
              width={1024}
              height={308}
              objectFit="contain"
              className='absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-10 w-auto -ml-[0.1] mt-1'
            />
            <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4 relative shadow-xl shadow-black/5 border border-green-200">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>

          {/* Title */}
          <h3 className="text-xl font-semibold text-gray-800 mb-2 text-center">
            Onboarding Successfully Submitted!
          </h3>
          
          {/* Description */}
          <p className="text-gray-600 mb-6 text-center">
            Your onboarding for {totalStudents} students has been successfully submitted to the Ministry of Primary & Secondary Education.
          </p>

          {/* What happens next section */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <h4 className="font-semibold text-blue-800 mb-3 flex items-center">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              What happens next:
            </h4>
            <ul className="space-y-2 text-sm text-blue-700">
              <li className="flex items-start">
                <svg className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <span>You&apos;ll receive an email from the ministry containing your <strong>Clearance Approval Slip</strong></span>
              </li>
              <li className="flex items-start">
                <svg className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <span>The email will also contain the <strong>complete list of all {totalStudents} students</strong> you&apos;ve onboarded</span>
              </li>
            </ul>
          </div>

          {/* Close Button */}
          <button
            onClick={onClose}
            className="w-full inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-lg text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-all duration-200 cursor-pointer active:scale-95 active:rotate-1"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            Got it, thanks!
          </button>
        </div>
      </div>
    </div>
  )
}
