'use client'

import React, { useState, useCallback } from 'react'
import { useParams, useSearchParams, useRouter } from 'next/navigation'
import Image from 'next/image'
import { useAuth } from '@/app/portal/providers/AuthProvider'
import { useGetStudentsBySchoolQuery } from '@/app/portal/store/api/authApi'
import ExamHeader from '../components/ExamHeader'
import { getExamById } from '../exams/types'
import ExamApplicationForm from '../components/ExamApplicationForm'
import { ExamTypeEnum } from '@/app/portal/store/api/authApi'
import ResponsiveFilterBar from '../components/ResponsiveFilterBar'
import StudentRegistrationExcel, { SortableField, SortState } from '../components/StudentRegistrationExcel'
import CostSummary from '../components/CostSummary'
import OnboardingCompletionSummary from '../components/OnboardingCompletionSummary'
import PaymentModal from '../components/PaymentModal'
import PaymentStatusModal from '../components/PaymentStatusModal'
import { useDebounce } from '@/app/portal/utils/hooks/useDebounce'
import Link from 'next/link'

interface FilterState {
  class?: string
  year?: string
  gender?: string
  sort?: string
}

type SortDirection = 'asc' | 'desc' | null

// Type guard to check if exam data has review notes
function hasReviewNotes(examData: unknown): examData is { reviewNotes: string } {
  return examData !== null && typeof examData === 'object' && 'reviewNotes' in examData && typeof (examData as { reviewNotes?: unknown }).reviewNotes === 'string'
}

export default function ExamPage() {
  const params = useParams()

  const { school, refreshProfile, isFetchingProfile } = useAuth();
  const examId = params.examId as string
  const exam = getExamById(examId)

  // Map exam IDs to API exam names
  const examIdToName: Record<string, ExamTypeEnum> = {
    'ubegpt': 'UBEGPT' as ExamTypeEnum,
    'ubetms': 'UBETMS' as ExamTypeEnum,
    'cess': 'Common-entrance' as ExamTypeEnum,
    'bece': 'BECE' as ExamTypeEnum,
    'bece-resit': 'BECE-resit' as ExamTypeEnum,
    'ubeat': 'UBEAT' as ExamTypeEnum,
    'jscbe': 'JSCBE' as ExamTypeEnum,
    'waec': 'WAEC' as ExamTypeEnum
  }

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

  // Get exam status from school profile data
  const getExamStatus = (examId: string): 'not-applied' | 'pending' | 'approved' | 'rejected' | 'completed' | 'onboarded' => {
    if (!school?.exams) return 'not-applied'
    
    const examName = examIdToName[examId]
    const examData = school.exams.find((e) => e.name === examName)
    const status = examData?.status || 'not applied'
    // Convert API format to frontend format
    return status === 'not applied' ? 'not-applied' : status
  }

  const [applicationStatus, setApplicationStatus] = useState<'not-applied' | 'pending' | 'approved' | 'rejected' | 'completed' | 'onboarded'>(
    getExamStatus(examId)
  )

  // Get exam-specific data from school profile
  const examName = examIdToName[examId]
  const currentExamData = school?.exams?.find((e) => e.name === examName);

  const [searchTerm, setSearchTerm] = useState<string>('')
  const [itemsPerPage, setItemsPerPage] = useState(10)
  const searchParams = useSearchParams()
  const router = useRouter()
  
  // Get filters and page from URL search params
  const filters: FilterState = {
    class: searchParams?.get('class') || undefined,
    year: searchParams?.get('year') || undefined,
    gender: searchParams?.get('gender') || undefined,
    sort: searchParams?.get('sort') || undefined
  }
  
  const currentPage = parseInt(searchParams?.get('page') || '1', 10)

  let sortField: SortableField | null = null
  let sortDirection: SortDirection = null
  
  const sortParam = searchParams?.get('sort')
  if (sortParam) {
    const [field, direction] = sortParam.split('-')
    if ((direction === 'asc' || direction === 'desc') && 
        ['id', 'name', 'gender', 'class', 'year', 'paymentStatus'].includes(field)) {
      sortField = field as SortableField
      sortDirection = direction
    }
  }
  
  const sortState: SortState = {
    field: sortField,
    direction: sortDirection,
    clickCount: sortField ? (sortDirection === 'asc' ? 1 : 2) : 0
  }
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [paymentStatus, setPaymentStatus] = useState<'success' | 'failed' | null>(null)

  // Check for payment status in URL params
  React.useEffect(() => {
    const payment = searchParams?.get('payment')
    if (payment === 'success') {
      setPaymentStatus('success')
      // Refetch profile to get updated points after payment
      refreshProfile()
    } else if (payment === 'failed') {
      setPaymentStatus('failed')
    }
  }, [searchParams, refreshProfile])

  const debouncedSearchTerm = useDebounce(searchTerm, 500)

  // Fetch students for the authenticated school
  const { data: studentsData, refetch: refetchStudents, isLoading } = useGetStudentsBySchoolQuery(
    {
      schoolId: school?.id || '',
      examType: examName as ExamTypeEnum,
      page: currentPage,
      limit: itemsPerPage,
      searchTerm: debouncedSearchTerm || undefined,
      class: filters.class || undefined,
      year: filters.year ? parseInt(filters.year) : undefined,
      gender: filters.gender || undefined,
      sort: filters.sort || undefined
    },
    { skip: !school?.id || applicationStatus !== 'approved' }
  )

  // Use exam-specific points from school profile
  const examPoints = currentExamData?.availablePoints || 0
  const examTotalPoints = currentExamData?.totalPoints || 0
  const examNumberOfStudents = currentExamData?.numberOfStudents || 0

  const handleRefresh = useCallback(async () => {
    await refetchStudents()
    // Refetch profile to get updated points
    refreshProfile()
  }, [refetchStudents, refreshProfile])

  const handleClosePaymentStatus = () => {
    setPaymentStatus(null)
    // Remove payment param from URL
    const params = new URLSearchParams(searchParams?.toString() || '')
    params.delete('payment')
    router.replace(`?${params.toString()}`, { scroll: false })
  }

  const handlePageChange = (page: number) => {
    const params = new URLSearchParams(searchParams?.toString() || '')
    params.set('page', page.toString())
    router.replace(`?${params.toString()}`, { scroll: false })
  }

  const handleSort = (field: SortableField) => {
    const params = new URLSearchParams(searchParams?.toString() || '')
    
    // Reset to page 1 when sorting changes
    params.set('page', '1')
    
    // Cycle through: none -> asc -> desc -> none
    if (sortState.field === field) {
      if (sortState.direction === 'asc') {
        params.set('sort', `${field}-desc`)
      } else {
        params.delete('sort')
      }
    } else {
      // New field, start with asc
      params.set('sort', `${field}-asc`)
    }
    
    router.replace(`?${params.toString()}`, { scroll: false })
  }

  const handleFilterChange = (newFilters: FilterState) => {
    // Update URL search params
    const params = new URLSearchParams(searchParams?.toString() || '')
    
    // Reset to page 1 when filters change
    params.set('page', '1')
    
    // Set or remove filter params
    if (newFilters.class !== 'All') {
      params.set('class', newFilters.class || '')
    } else {
      params.delete('class')
    }
    
    if (newFilters.year !== 'All') {
      params.set('year', newFilters.year || '')
    } else {
      params.delete('year')
    }
    
    if (newFilters.gender !== 'All') {
      params.set('gender', newFilters.gender || '')
    } else {
      params.delete('gender')
    }
    
    // Update URL without page reload
    router.push(`?${params.toString()}`, { scroll: false })
  }

  const handleApplicationSubmit = () => {
    setApplicationStatus('pending')
  }

  const students = React.useMemo(() => {
    if (!studentsData?.data) return []

    return studentsData.data.map(student => ({
      id: student._id,
      studentId: student.studentId?.toString() || '',
      fullName: student.studentName,
      gender: student.gender === 'male' ? 'Male' as const : 'Female' as const,
      class: student.class,
      examYear: student.examYear,
      paymentStatus: student.paymentStatus === 'paid' ? 'Completed' as const : 
                   student.paymentStatus === 'pending' ? 'Pending' as const : 'Not Paid' as const,
      onboardingStatus: student.onboardingStatus
    }))
  }, [studentsData])

  if (!exam) {
    return (
      <div className='sm:p-4 p-2 bg-[#F3F3F3] min-h-screen relative w-full flex flex-col'>
        <ExamHeader />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Exam Not Found</h2>
            <p className="text-gray-600 mb-4">The requested examination does not exist.</p>
          </div>
        </div>
      </div>
    )
  }

  // Show application form if not applied
  if (applicationStatus === 'not-applied') {
    return (
      <div className='sm:p-4 p-2 bg-[#F3F3F3] min-h-screen relative w-full flex flex-col'>
        <ExamHeader currentExam={exam} />
        
        <div className="flex-1 mt-4 sm:mt-6">
          <div className="max-w-4xl mx-auto">
            <ExamApplicationForm 
              exam={exam} 
              onApplicationSubmit={handleApplicationSubmit}
            />
          </div>
        </div>
      </div>
    )
  }

  // Show status for pending or rejected
  if (applicationStatus === 'pending' || applicationStatus === 'rejected') {
    return (
      <div className='sm:p-4 p-2 bg-[#F3F3F3] min-h-screen relative w-full flex flex-col'>
        <ExamHeader currentExam={exam} />
        
        <div className="flex-1 mt-4 sm:mt-6">
          <div className="max-w-3xl mx-auto">
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
              {/* Header */}
              <div className="border-b border-gray-200 p-6">
                <div className="flex items-center gap-4">
                  <div className="bg-gray-50 border border-gray-200 shadow-[inset_0px_0px_10px_2px_#E5E7EB] p-3 rounded-full">
                    <Image
                      src={exam.iconPath}
                      alt={exam.shortName}
                      width={48}
                      height={48}
                      className="object-contain rounded-full"
                    />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">{exam.shortName}</h2>
                    <p className="text-sm text-gray-600">{exam.name}</p>
                  </div>
                </div>
              </div>

              {/* School Information */}
              <div className="p-6 bg-gray-50 border-b border-gray-200">
                <h3 className="text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2">
                  <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                </div>
              </div>

              {/* Status Section */}
              <div className="p-6">
                {applicationStatus === 'pending' && (
                  <div className="space-y-6">
                    <div className="border-l-4 border-yellow-500 bg-yellow-50 p-6 rounded-r-lg">
                      <div className="flex items-start gap-4">
                        <div className="flex-shrink-0">
                          <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
                            <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          </div>
                        </div>
                        <div className="flex-1">
                          <h3 className="text-lg font-bold text-yellow-900 mb-2">Application Under Review</h3>
                          <p className="text-sm text-yellow-800 mb-4">
                            Your application for {exam.shortName} has been successfully submitted and is currently being reviewed by the Ministry of Primary and Secondary Education.
                          </p>
                          <div className="bg-white border border-yellow-200 rounded-lg p-4">
                            <h4 className="text-sm font-semibold text-yellow-900 mb-3">What happens next?</h4>
                            <ul className="space-y-2">
                              <li className="flex items-start gap-2 text-sm text-yellow-800">
                                <svg className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <span>The Ministry of Primary and Secondary Education will review your application details</span>
                              </li>
                              <li className="flex items-start gap-2 text-sm text-yellow-800">
                                <svg className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <span>You will receive an email notification once a decision is made</span>
                              </li>
                              <li className="flex items-start gap-2 text-sm text-yellow-800">
                                <svg className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <span>If approved, you&apos;ll gain access to the examination dashboard</span>
                              </li>
                            </ul>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                      <div className="flex items-start gap-3">
                        <svg className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                        </svg>
                        <div>
                          <p className="text-sm font-medium text-yellow-900 mb-1">Need assistance?</p>
                          <p className="text-sm text-yellow-800">
                            If you have any questions about your application status, please contact the Ministry of Primary and Secondary Education at <span className="font-semibold"><Link href="mailto:support@education.im.gov.ng">support@education.im.gov.ng</Link></span>
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {applicationStatus === 'rejected' && (
                  <div className="space-y-6">
                    <div className="border-l-4 border-red-500 bg-red-50 p-6 rounded-r-lg">
                      <div className="flex items-start gap-4">
                        <div className="flex-shrink-0">
                          <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                            <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </div>
                        </div>
                        <div className="flex-1">
                          <h3 className="text-lg font-bold text-red-900 mb-2">Application Not Approved</h3>
                          <p className="text-sm text-red-800 mb-4">
                            Unfortunately, your application for {exam.shortName} was not approved at this time. This decision may be due to various factors that need to be addressed.
                          </p>

                          {/* Review Notes Section */}
                          {currentExamData && currentExamData.status === 'rejected' && hasReviewNotes(currentExamData) && (
                            <div className="bg-white border-l-4 border-red-600 rounded-lg p-4 mb-4">
                              <div className="flex items-start gap-3">
                                <svg className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                                <div className="flex-1">
                                  <h4 className="text-sm font-semibold text-red-900 mb-2">Reason for Rejection</h4>
                                  <p className="text-sm text-red-800 leading-relaxed">
                                    {currentExamData.reviewNotes}
                                  </p>
                                </div>
                              </div>
                            </div>
                          )}

                          <div className="bg-white border border-red-200 rounded-lg p-4">
                            <h4 className="text-sm font-semibold text-red-900 mb-3">Next Steps</h4>
                            <ul className="space-y-2">
                              <li className="flex items-start gap-2 text-sm text-red-800">
                                <svg className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                </svg>
                                <span>Contact the Ministry of Primary and Secondary Education to understand the reason for rejection</span>
                              </li>
                              <li className="flex items-start gap-2 text-sm text-red-800">
                                <svg className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                                <span>Review and update your application information if necessary</span>
                              </li>
                              <li className="flex items-start gap-2 text-sm text-red-800">
                                <svg className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                </svg>
                                <span>You may reapply once the issues have been addressed</span>
                              </li>
                            </ul>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                      <div className="flex items-start gap-3">
                        <svg className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                        </svg>
                        <div>
                          <p className="text-sm font-medium text-red-900 mb-1">Need Support?</p>
                          <p className="text-sm text-red-800">
                            For detailed information about your application status and guidance on reapplication, please reach out to the Ministry of Primary and Secondary Education at <Link href="mailto:support@education.im.gov.ng" className="font-semibold">support@education.im.gov.ng</Link>
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Show exam dashboard if approved - use exam-specific points
  const hasPointsOrStudents = school && (currentExamData?.usedPoints || examPoints)
  
  // Check if sidebar should be visible
  const showCostSummary = examNumberOfStudents - examTotalPoints > 0
  const showSidebar = showCostSummary

  return (
    <div className='sm:p-4 p-2 bg-[#F3F3F3] min-h-screen relative w-full flex flex-col'>
      <ExamHeader currentExam={exam} />
      
      <div className="flex-1 mt-4 sm:mt-6">
        {hasPointsOrStudents ? (
          <div className={`flex-1 overflow-y-hidden flex flex-col ${showSidebar ? 'xl:grid xl:grid-cols-4' : ''} gap-4 sm:gap-6`}>
            <div className={`${showSidebar ? 'xl:col-span-3' : ''} space-y-4 sm:space-y-6 ${showSidebar ? 'order-2 xl:order-1' : ''}`}>
              <ResponsiveFilterBar onFilterChange={handleFilterChange} currentFilters={filters} />
              
              <StudentRegistrationExcel
                students={students}
                handleSort={handleSort}
                sortState={sortState}
                searchTerm={searchTerm}
                onSearchChange={setSearchTerm}
                filters={filters}
                onRefreshStudents={handleRefresh}
                isLoading={isLoading}
                currentPage={currentPage}
                totalPages={studentsData?.totalPages || 1}
                itemsPerPage={itemsPerPage}
                totalItems={studentsData?.totalItems || 0}
                onPageChange={handlePageChange}
                onItemsPerPageChange={setItemsPerPage}
                examType={getExamType(examId)}
                isFetchingProfile={isFetchingProfile}
              />
            </div>

            {showSidebar && (
              <div className="xl:col-span-1 order-1 xl:order-2 overflow-y-auto">
                <div className="space-y-6">
                  <OnboardingCompletionSummary
                    totalStudents={studentsData?.totalItems || 0}
                    handleRefresh={handleRefresh}
                    examType={examName}
                    examTotalPoints={examTotalPoints}
                    examNumberOfStudents={examNumberOfStudents}
                  />
                  {showCostSummary && (
                    <CostSummary
                      onPurchaseMorePoints={() => setShowPaymentModal(true)}
                      examPoints={examPoints}
                      examTotalPoints={examTotalPoints}
                      examNumberOfStudents={examNumberOfStudents}
                    />
                  )}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="flex-1 flex flex-col xl:grid xl:grid-cols-4 gap-4 sm:gap-6">
            <div className="xl:col-span-4 text-center py-12">
              <h2 className="text-xl font-semibold text-gray-600 mb-1">School Payment Portal</h2>
              <p className="text-gray-500 mb-4">Click the button below to proceed with school payment</p>
              <button
                onClick={() => setShowPaymentModal(true)}
                className="inline-flex active:scale-95 active:rotate-1 cursor-pointer items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-all duration-200"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                Make School Payment
              </button>
            </div>
          </div>
        )}
      </div>

      <PaymentModal
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        onPaymentSuccess={() => {}}
        numberOfStudents={10}
        examType={getExamType(examId)}
        feePerStudent={exam?.fee || 500}
      />

      <PaymentStatusModal
        status={paymentStatus}
        onClose={handleClosePaymentStatus}
      />
    </div>
  )
}
