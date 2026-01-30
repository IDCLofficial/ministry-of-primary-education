'use client'

import React, { useState } from 'react'
import Image from 'next/image'
import { useAuth } from '@/app/portal/providers/AuthProvider'
import { ExamType } from '../exams/types'
import { ExamTypeEnum, useSubmitExamApplicationMutation, useGetProfileQuery } from '@/app/portal/store/api/authApi'
import toast from 'react-hot-toast'

interface ExamApplicationFormProps {
  exam: ExamType
  onApplicationSubmit: () => void
}

export default function ExamApplicationForm({ exam, onApplicationSubmit }: ExamApplicationFormProps) {
  const { school } = useAuth()
  const [submitApplication, { isLoading: isSubmitting }] = useSubmitExamApplicationMutation()
  const { refetch: refetchProfile } = useGetProfileQuery()
  const [numberOfStudents, setNumberOfStudents] = useState('')

  // Map exam IDs to ExamTypeEnum
  const getExamType = (examId: string): ExamTypeEnum => {
    const mapping: Record<string, ExamTypeEnum> = {
      'ubegpt': ExamTypeEnum.UBEGPT,
      'ubetms': ExamTypeEnum.UBETMS,
      'cess': ExamTypeEnum.COMMON_ENTRANCE,
      'bece': ExamTypeEnum.BECE,
      'bece-resit': ExamTypeEnum.BECE_RESIT,
      'ubeat': ExamTypeEnum.UBEAT,
      'jscbe': ExamTypeEnum.JSCBE,
      'waec': ExamTypeEnum.WAEC
    }
    return mapping[examId] || ExamTypeEnum.UBEGPT
  }

  const handleSubmit = async (e: React.FormEvent) => {
    if (isSubmitting) return;
    e.preventDefault()

    if (!numberOfStudents || parseInt(numberOfStudents) < 1) {
      toast.error('Please enter a valid number of students')
      return
    }

    if (!school?.id) {
      toast.error('School information not found')
      return
    }

    try {
      const applicationData = {
        examType: getExamType(exam.id),
        schoolId: school.id,
        address: school.address,
        principal: school.schoolName,
        email: school.email,
        phone: parseInt(school.phone.replace(/\D/g, '')),
        numberOfStudents: parseInt(numberOfStudents)
      }

      await submitApplication(applicationData).unwrap()

      toast.success(`Application submitted successfully for ${exam.shortName}!`)

      // Refresh profile to get updated exam data
      await refetchProfile()

      onApplicationSubmit()
    } catch (error) {
      console.error('Application error:', error)
      const apiError = error as { data?: { message?: string; error?: string } }
      const errorMessage = apiError.data?.message || apiError.data?.error || 'Failed to submit application. Please try again.'
      toast.error(errorMessage)
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
        {/* Header Section */}
        <div className="bg-green-600 p-6 text-white">
          <div className="flex items-center gap-4">
            <div className="bg-white p-3 rounded-full">
              <Image
                src={exam.iconPath}
                alt={exam.shortName}
                width={48}
                height={48}
                className="object-contain"
              />
            </div>
            <div>
              <h2 className="text-2xl font-bold">{exam.shortName}</h2>
              <p className="text-green-50 text-sm">{exam.name}</p>
            </div>
          </div>
        </div>

        {/* School Information Display */}
        <div className="p-6 bg-gray-50 border-b border-gray-200">
          <h3 className="text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2">
            <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
            School Information
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white rounded-lg p-4 border border-gray-200">
              <p className="text-xs text-gray-500 mb-1">School Name</p>
              <p className="text-sm font-semibold text-gray-900">{school?.schoolName}</p>
            </div>
            <div className="bg-white rounded-lg p-4 border border-gray-200">
              <p className="text-xs text-gray-500 mb-1">Contact Email</p>
              <p className="text-sm font-semibold text-gray-900">{school?.email}</p>
            </div>
            <div className="bg-white rounded-lg p-4 border border-gray-200">
              <p className="text-xs text-gray-500 mb-1">Contact Phone</p>
              <p className="text-sm font-semibold text-gray-900">{school?.phone}</p>
            </div>
            <div className="bg-white rounded-lg p-4 border border-gray-200">
              <p className="text-xs text-gray-500 mb-1">School Address</p>
              <p className="text-sm font-semibold text-gray-900">{school?.address}</p>
            </div>
          </div>
        </div>

        {/* Application Form */}
        <form onSubmit={handleSubmit} className="p-6">
          <div className="mb-6">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <div className="flex gap-3">
                <svg className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
                <div>
                  <p className="text-sm text-blue-800 font-medium mb-1">Application Information</p>
                  <p className="text-xs text-blue-700">
                    Enter the number of students you wish to register for {exam.shortName}. Once submitted, your application will be reviewed and you&apos;ll be notified of the status.
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700">
                Number of Students <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <input
                  type="number"
                  min="1"
                  disabled={isSubmitting}
                  value={numberOfStudents}
                  onChange={(e) => setNumberOfStudents(e.target.value)}
                  placeholder="Enter number of students"
                  className="w-full pl-12 pr-4 py-3.5 text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                  required
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">Enter the total number of students participating in this examination</p>
            </div>
          </div>

          {/* Summary Card */}
          {numberOfStudents && parseInt(numberOfStudents) > 0 && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
              <h4 className="text-sm font-semibold text-green-900 mb-3 flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Application Summary
              </h4>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-green-700">Examination:</span>
                  <span className="text-sm font-semibold text-green-900">{exam.shortName}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-green-700">School:</span>
                  <span className="text-sm font-semibold text-green-900">{school?.schoolName}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-green-700">Total Students:</span>
                  <span className="text-lg font-bold text-green-900">{numberOfStudents}</span>
                </div>
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting || !numberOfStudents || parseInt(numberOfStudents) < 1}
            className="w-full bg-green-600 text-white py-4 px-6 rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-all duration-200 font-semibold text-base disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98] shadow-lg hover:shadow-xl flex items-center justify-center gap-2 cursor-pointer"
          >
            {isSubmitting ? (
              <>
                <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Submitting Application...
              </>
            ) : (
              <>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Submit Application
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  )
}
