'use client'
import React, { useState } from 'react'
import { useSelector } from 'react-redux'
import type { RootState } from '@/app/portal/store'
import Image from 'next/image'
import { useAuth } from '../../providers/AuthProvider'
import { ExamTypeEnum, useSubmitExamApplicationMutation, useGetProfileQuery, useGetSchoolByCodeQuery } from '@/app/portal/store/api/authApi'
import toast from 'react-hot-toast'
import { ExamType } from '../[schoolCode]/types'
import { allFAQs } from '../../data/faqData'

interface ExamApplicationFormProps {
  exam: ExamType
  onApplicationSubmit: () => void
}

export default function ExamApplicationForm({ exam, onApplicationSubmit }: ExamApplicationFormProps) {
  // Get AEE profile data (email, phone) from AuthProvider
  const { school: aeeProfile } = useAuth()
  
  // Get selected school data from Redux store
  const { selectedSchool } = useSelector((state: RootState) => state.school)

  const [submitApplication, { isLoading: isSubmitting, isSuccess }] = useSubmitExamApplicationMutation()
  const { refetch: refetchProfile } = useGetProfileQuery()
  const { refetch: refetchSchool } = useGetSchoolByCodeQuery(selectedSchool?.schoolCode.replace(/\//g, '-') || '', {
    skip: !selectedSchool?.schoolCode
  });

  const [numberOfStudents, setNumberOfStudents] = useState('')
  const [principalName, setPrincipalName] = useState('')
  const [principalNameError, setPrincipalNameError] = useState('')
  const [phoneNumber, setPhoneNumber] = useState('')
  const [phoneNumberError, setPhoneNumberError] = useState('')
  const [address, setAddress] = useState('')
  const [addressError, setAddressError] = useState('')
  const [showTermsModal, setShowTermsModal] = useState(false)
  const [hasScrolledToBottom, setHasScrolledToBottom] = useState(false)
  const [agreedToTerms, setAgreedToTerms] = useState(false)

  // Autofill fields when school data is available
  React.useEffect(() => {
    if (selectedSchool) {
      // Autofill address from actual school data if available
      if (selectedSchool.address) {
        setAddress(selectedSchool.address)
      }
      
      // Autofill phone from actual school data if available
      if (selectedSchool.phone) {
        setPhoneNumber(selectedSchool.phone)
      }
      
      // Autofill principal name from actual school data if available
      if (selectedSchool.principal) {
        setPrincipalName(selectedSchool.principal)
      }
      
      // Autofill phone from actual school data if available
      if (selectedSchool.phone) {
        setPhoneNumber(selectedSchool.phone)
      }
    }
  }, [selectedSchool, aeeProfile])

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

  const handleTermsScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const target = e.target as HTMLDivElement
    const bottom = target.scrollHeight - target.scrollTop <= target.clientHeight + 10
    if (bottom && !hasScrolledToBottom) {
      setHasScrolledToBottom(true)
    }
  }

  const handleAgreeToTerms = () => {
    setAgreedToTerms(true)
    setShowTermsModal(false)
    toast.success('Thank you for reviewing the terms and conditions')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    if (isSubmitting) return;
    if (isSuccess) return;
    e.preventDefault()

    // Validate principal's name
    if (!principalName.trim()) {
      setPrincipalNameError('Principal\'s name is required')
      toast.error('Please enter the principal\'s name')
      return
    }

    if (principalName.trim().length < 3) {
      setPrincipalNameError('Please enter a valid principal\'s name (at least 3 characters)')
      toast.error('Please enter a valid principal\'s name')
      return
    }

    // Validate phone number
    if (!phoneNumber.trim()) {
      setPhoneNumberError('Phone number is required')
      toast.error('Please enter a phone number')
      return
    }

    const phoneDigits = phoneNumber.replace(/\D/g, '')
    if (phoneDigits.length < 10) {
      setPhoneNumberError('Please enter a valid phone number (at least 10 digits)')
      toast.error('Please enter a valid phone number')
      return
    }

    // Validate address
    if (!address.trim()) {
      setAddressError('School address is required')
      toast.error('Please enter your school address')
      return
    }

    if (address.trim().length < 10) {
      setAddressError('Please enter a complete address (at least 10 characters)')
      toast.error('Please enter a complete school address')
      return
    }

    if (!numberOfStudents || parseInt(numberOfStudents) < 1) {
      toast.error('Please enter a valid number of students')
      return
    }

    setPrincipalNameError('')
    setPhoneNumberError('')

    if (!agreedToTerms) {
      toast.error('Please read and agree to the terms and conditions')
      return
    }

    if (!selectedSchool?._id) {
      toast.error('School information not found')
      return
    }

    if (!aeeProfile?.email) {
      toast.error('AEE profile information not found')
      return
    }

    setAddressError('')

    try {
      const phoneDigits = phoneNumber.replace(/\D/g, '')
      
      const applicationData = {
        examType: getExamType(exam.id),
        schoolId: selectedSchool._id,
        address: address.trim(),
        principal: principalName.trim(),
        email: aeeProfile.email,
        phone: parseInt(phoneDigits),
        numberOfStudents: parseInt(numberOfStudents)
      }

      await submitApplication(applicationData).unwrap()

      toast.success(`Application submitted successfully for ${exam.shortName}!`)

      // Refresh profile to get updated exam data
      await refetchProfile()
      await refetchSchool()
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
              <p className="text-sm font-semibold text-gray-900 capitalize">{selectedSchool?.schoolName.toLowerCase()}</p>
            </div>
            <div className="bg-white rounded-lg p-4 border border-gray-200">
              <p className="text-xs text-gray-500 mb-1">LGA</p>
              <p className="text-sm font-semibold text-gray-900 capitalize">{selectedSchool?.lga}</p>
            </div>
            <div className="bg-white rounded-lg p-4 border border-gray-200">
              <p className="text-xs text-gray-500 mb-1">Contact Email (AEE)</p>
              <p className="text-sm font-semibold text-gray-900">{aeeProfile?.email}</p>
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

            {/* Principal's Name Field */}
            <div className="space-y-2 mb-6">
              <label className="block text-sm font-semibold text-gray-700">
                Principal's Name <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <input
                  type="text"
                  disabled={isSubmitting}
                  value={principalName}
                  onChange={(e) => {
                    setPrincipalName(e.target.value)
                    if (principalNameError) setPrincipalNameError('')
                  }}
                  placeholder="Enter the principal's full name"
                  className={`w-full pl-12 pr-4 py-3.5 text-base border rounded-lg focus:outline-none focus:ring-2 transition-all ${
                    principalNameError 
                      ? 'border-red-300 focus:ring-red-500 focus:border-red-500' 
                      : 'border-gray-300 focus:ring-green-500 focus:border-transparent'
                  }`}
                  required
                />
              </div>
              {principalNameError && (
                <p className="text-xs text-red-600 mt-1 flex items-center gap-1">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  {principalNameError}
                </p>
              )}
              <p className="text-xs text-gray-500 mt-1">Enter the full name of the school principal</p>
            </div>

            {/* Phone Number Field */}
            <div className="space-y-2 mb-6">
              <label className="block text-sm font-semibold text-gray-700">
                Phone Number <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                </div>
                <input
                  type="tel"
                  disabled={isSubmitting}
                  value={phoneNumber}
                  onChange={(e) => {
                    setPhoneNumber(e.target.value)
                    if (phoneNumberError) setPhoneNumberError('')
                  }}
                  placeholder="Enter phone number (e.g., 08012345678)"
                  className={`w-full pl-12 pr-4 py-3.5 text-base border rounded-lg focus:outline-none focus:ring-2 transition-all ${
                    phoneNumberError 
                      ? 'border-red-300 focus:ring-red-500 focus:border-red-500' 
                      : 'border-gray-300 focus:ring-green-500 focus:border-transparent'
                  }`}
                  required
                />
              </div>
              {phoneNumberError && (
                <p className="text-xs text-red-600 mt-1 flex items-center gap-1">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  {phoneNumberError}
                </p>
              )}
              <p className="text-xs text-gray-500 mt-1">Enter a valid phone number (at least 10 digits)</p>
            </div>

            {/* School Address Field */}
            <div className="space-y-2 mb-6">
              <label className="block text-sm font-semibold text-gray-700">
                School Address <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute top-3 left-0 pl-4 pointer-events-none">
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <textarea
                  disabled={isSubmitting}
                  value={address}
                  onChange={(e) => {
                    setAddress(e.target.value)
                    if (addressError) setAddressError('')
                  }}
                  placeholder="Enter your complete school address"
                  rows={3}
                  className={`w-full pl-12 pr-4 py-3 text-base border rounded-lg focus:outline-none focus:ring-2 transition-all resize-none ${addressError
                      ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
                      : 'border-gray-300 focus:ring-green-500 focus:border-transparent'
                    }`}
                  required
                />
              </div>
              {addressError && (
                <p className="text-xs text-red-600 mt-1 flex items-center gap-1">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  {addressError}
                </p>
              )}
              <p className="text-xs text-gray-500 mt-1">Provide the complete physical address of your school</p>
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
                  onWheel={(e)=> e.preventDefault()}
                  value={numberOfStudents}
                  onChange={(e) => setNumberOfStudents(e.target.value)}
                  placeholder="Enter number of students"
                  className="w-full pl-12 pr-4 py-3.5 text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                  required
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">Enter the total number of students participating in this examination</p>
            </div>

            {/* Warning Disclaimer */}
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mt-4">
              <div className="flex gap-3">
                <svg className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                <div>
                  <p className="text-sm text-red-800 font-semibold mb-1">⚠️ Important Notice</p>
                  <p className="text-xs text-red-700">
                    <strong>The number of students cannot be changed or updated after your application is approved.</strong> Please ensure the count is accurate before submitting. Once approved, this number becomes final and any modifications will require a new application process.
                  </p>
                </div>
              </div>
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
                  <span className="text-sm font-semibold text-green-900 capitalize">{selectedSchool?.schoolName.toLowerCase()}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-green-700">Total Students:</span>
                  <span className="text-lg font-bold text-green-900">{numberOfStudents}</span>
                </div>
              </div>
            </div>
          )}

          {/* Terms & Conditions Agreement */}
          <div className="mb-6">
            <div className="flex items-start gap-3 p-4 bg-gray-50 border border-gray-200 rounded-lg">
              <input
                type="checkbox"
                id="termsAgreement"
                checked={agreedToTerms}
                onChange={(e) => {
                  if (e.target.checked) {
                    setShowTermsModal(true)
                    e.target.checked = false
                  } else {
                    setAgreedToTerms(false)
                  }
                }}
                className="mt-1 h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded cursor-pointer"
              />
              <label htmlFor="termsAgreement" className="flex-1 text-sm text-gray-700 cursor-pointer">
                I have read and agree to the{' '}
                <button
                  type="button"
                  onClick={() => setShowTermsModal(true)}
                  className="text-green-600 hover:text-green-700 font-semibold underline"
                >
                  Terms and Conditions
                </button>
                {' '}for exam application submission <span className="text-red-500">*</span>
              </label>
            </div>
            {!agreedToTerms && numberOfStudents && (
              <p className="text-xs text-gray-500 mt-2 flex items-center gap-1">
                <svg className="w-4 h-4 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
                Please review and accept the terms and conditions to continue
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={(isSubmitting || !numberOfStudents || parseInt(numberOfStudents) < 1 || !agreedToTerms) || isSuccess}
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

      {/* Terms & Conditions Modal */}
      {showTermsModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between bg-green-50">
              <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Terms and Conditions
              </h3>
              <button
                onClick={() => {
                  setShowTermsModal(false)
                  setHasScrolledToBottom(false)
                }}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Scrollable Content */}
            <div
              className="flex-1 overflow-y-auto px-6 py-4"
              onScroll={handleTermsScroll}
            >
              <div className="prose prose-sm max-w-none">
                <h4 className="text-lg font-semibold text-gray-900 mb-3">Exam Application Process - Important Guidelines</h4>

                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                  <p className="text-sm text-yellow-800 font-semibold mb-2">⚠️ Critical Information</p>
                  <p className="text-sm text-yellow-700">
                    Please read this document carefully. You must scroll to the bottom to activate the &ldquo;I Understand&rdquo; button.
                  </p>
                </div>

                {/* Dynamically render FAQ items from application-process category */}
                {allFAQs
                  .filter(faq => faq.category === 'application-process')
                  .map((faq, index) => (
                    <div key={index} className="mb-4">
                      <h5 className="font-semibold text-gray-900 mt-4 mb-2">{index + 1}. {faq.question}</h5>
                      <p className="text-sm text-gray-700 mb-3">
                        {faq.answer}
                      </p>
                    </div>
                  ))}

                <div className="bg-green-50 border border-green-200 rounded-lg p-4 mt-6 mb-4">
                  <p className="text-sm text-green-800 font-semibold mb-2">✓ Acknowledgment</p>
                  <p className="text-sm text-green-700">
                    By clicking &ldquo;I Understand&rdquo; below, you acknowledge that you have read, understood, and agree to abide by these terms and conditions. You confirm that the information you provide is accurate and final.
                  </p>
                </div>

                <p className="text-xs text-gray-500 mt-4 mb-8">
                  Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                </p>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
              <div className="flex items-center justify-between gap-4">
                <button
                  onClick={() => {
                    setShowTermsModal(false)
                    setHasScrolledToBottom(false)
                  }}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAgreeToTerms}
                  disabled={!hasScrolledToBottom}
                  className={`px-6 py-2 text-sm font-semibold rounded-lg transition-all ${hasScrolledToBottom
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
      )}
    </div>
  )
}
