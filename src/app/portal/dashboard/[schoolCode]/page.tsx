'use client'

import { useMemo, useEffect } from 'react'
import Image from 'next/image'
import { useParams } from 'next/navigation'
import { useDispatch } from 'react-redux'
import { useGetSchoolByCodeQuery } from '@/app/portal/store/api/authApi'
import { setSelectedSchool } from '@/app/portal/store/slices/schoolSlice'
import ExamHeader from '../components/ExamHeader'
import SchoolPageSkeleton from './components/SchoolPageSkeleton'
import { EXAM_TYPES, formatCurrency } from './types'
import Link from 'next/link'

export default function DashboardPage() {
  const params = useParams()
  const dispatch = useDispatch()
  const rawSchoolCode = params?.schoolCode as string
  
  const { data: school, isLoading, error } = useGetSchoolByCodeQuery(rawSchoolCode, {
    skip: !rawSchoolCode
  })

  // Store school data in Redux when fetched
  useEffect(() => {
    if (school && rawSchoolCode) {
      dispatch(setSelectedSchool({ school, schoolCode: rawSchoolCode }))
    }
  }, [school, rawSchoolCode, dispatch])

  // Map exam names from API to frontend exam IDs
  const examNameToId: Record<string, string> = useMemo(() => ({
    'UBEGPT': 'ubegpt',
    'UBETMS': 'ubetms',
    'Common-entrance': 'cess',
    'BECE': 'bece',
    'BECE-resit': 'bece-resit',
    'UBEAT': 'ubeat',
    'JSCBE': 'jscbe',
    'WAEC': 'waec'
  }), [])

  // Get exam status from school profile data
  const getExamStatus = (examId: string): 'not-applied' | 'pending' | 'approved' | 'rejected' | 'completed' | 'onboarded'=> {
    if (!school?.exams) return 'not-applied'
    
    // Find the exam in school.exams by matching the exam ID
    const exam = school.exams.find((e) => examNameToId[e.name] === examId)

    const status = exam?.status || 'not-applied'
    // Convert API format to frontend format
    return status === 'not applied' ? 'not-applied' : status
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <span className="px-2 py-1 text-xs font-semibold rounded bg-green-100 text-green-800">Approved</span>
      case 'pending':
        return <span className="px-2 py-1 text-xs font-semibold rounded bg-yellow-100 text-yellow-800">Pending</span>
      case 'rejected':
        return <span className="px-2 py-1 text-xs font-semibold rounded bg-red-100 text-red-800">Rejected</span>
      case 'completed':
        return <span className="px-2 py-1 text-xs font-semibold rounded bg-blue-100 text-blue-800">Completed</span>
      case 'onboarded':
        return <span className="px-2 py-1 text-xs font-semibold rounded bg-purple-100 text-purple-800">Onboarded</span>
      case 'pending_payment':
        return <span className="px-2 py-1 text-xs font-semibold rounded bg-orange-100 text-orange-800">Pending Payment</span>
      default:
        return <span className="px-2 py-1 text-xs font-semibold rounded bg-gray-100 text-gray-600">Not Applied</span>
    }
  }

  if (isLoading) {
    return (
      <div className='sm:p-4 p-2 bg-[#F3F3F3] min-h-screen relative w-full flex flex-col'>
        <ExamHeader isFirst={true} />
        <SchoolPageSkeleton />
      </div>
    )
  }

  if (error) {
    return (
      <div className='sm:p-4 p-2 bg-[#F3F3F3] min-h-screen relative w-full flex flex-col'>
        <ExamHeader isFirst={true} />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center max-w-md mx-auto p-6">
            <svg className="w-16 h-16 text-red-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Error Loading School</h3>
            <p className="text-sm text-gray-600 mb-4">There was an error loading the school information. Please try again.</p>
            <Link
              href="/portal/dashboard"
              className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to Dashboard
            </Link>
          </div>
        </div>
      </div>
    )
  }

  if (!school) {
    return (
      <div className='sm:p-4 p-2 bg-[#F3F3F3] min-h-screen relative w-full flex flex-col'>
        <ExamHeader isFirst={true} />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center max-w-md mx-auto p-6">
            <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">School Not Found</h3>
            <p className="text-sm text-gray-600 mb-4">The school you're looking for doesn't exist or has been removed.</p>
            <Link
              href="/portal/dashboard"
              className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to Dashboard
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className='sm:p-4 p-2 bg-[#F3F3F3] min-h-screen relative w-full flex flex-col'>
      <ExamHeader isFirst={true} />
      
      <div className="flex-1 mt-4 sm:mt-6">
        <div className="max-w-7xl mx-auto">
          <div className="mb-6 flex items-center justify-between">
            <h1 className="text-lg sm:text-xl font-bold text-gray-900">Examination Portals</h1>
            <Link
              href="/portal/faq"
              className="text-xs sm:text-sm text-blue-600 hover:text-blue-800 font-medium transition-colors flex items-center gap-1"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="hidden sm:inline">Need Help? View FAQ</span>
              <span className="sm:hidden">Help</span>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {EXAM_TYPES.map((exam) => {
              const status = getExamStatus(exam.id)
              
              return (
                <Link
                  href={`/portal/dashboard/${rawSchoolCode}/${exam.id}`}
                  key={exam.id}
                  className="bg-white border border-gray-200 rounded-lg p-4 cursor-pointer hover:border-green-500 hover:shadow-md transition-all active:scale-95 active:translate-y-1"
                >
                  <div className="flex items-start justify-between mb-3">
                    <Image
                      src={exam.iconPath}
                      alt={exam.shortName}
                      width={32}
                      height={32}
                      className="object-contain"
                    />
                    {getStatusBadge(status)}
                  </div>

                  <h3 className="text-base font-bold text-gray-900 mb-1">
                    {exam.shortName}
                  </h3>
                  
                  <p className="text-xs text-gray-500 mb-3 line-clamp-2">
                    {exam.description}
                  </p>

                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-600">Fee:</span>
                      <span className="text-sm font-semibold text-gray-900">
                        {formatCurrency(exam.fee)}
                      </span>
                    </div>
                    
                    {exam.hasLateFee && (
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-500">Late:</span>
                        <span className="text-xs font-medium text-gray-600">
                          {formatCurrency(exam.lateFee)}
                        </span>
                      </div>
                    )}
                  </div>
                </Link>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}