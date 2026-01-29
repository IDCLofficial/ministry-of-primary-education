'use client'

import React, { useState, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Image from 'next/image'
import { useAuth } from '@/app/portal/providers/AuthProvider'
import { useGetStudentsBySchoolQuery } from '@/app/portal/store/api/authApi'
import Header from '../components/Header'
import { getExamById } from '../exams/types'
import ExamApplicationForm from '../components/ExamApplicationForm'
import ResponsiveFilterBar from '../components/ResponsiveFilterBar'
import StudentRegistration, { SortableField, SortState } from '../components/StudentRegistration'
import CostSummary from '../components/CostSummary'
import OnboardingCompletionSummary from '../components/OnboardingCompletionSummary'
import PaymentModal from '../components/PaymentModal'
import { useDebounce } from '@/app/portal/utils/hooks/useDebounce'

interface FilterState {
  class: string
  year: string
  gender: string
}

export default function ExamPage() {
  const params = useParams()
  const router = useRouter()
  const { school } = useAuth()
  const examId = params.examId as string
  const exam = getExamById(examId)

  // Map exam IDs to API exam names
  const examIdToName: Record<string, string> = {
    'ubegpt': 'UBEGPT',
    'ubetms': 'UBETMS',
    'cess': 'Common-entrance',
    'bece': 'BECE',
    'bece-resit': 'BECE-resit',
    'ubeat': 'UBEAT',
    'jscbe': 'JSCBE',
    'waec': 'WAEC'
  }

  // Get exam status from school profile data
  const getExamStatus = (examId: string): 'not-applied' | 'pending' | 'approved' | 'rejected' => {
    if (!school?.exams) return 'not-applied'
    
    const examName = examIdToName[examId]
    const examData = school.exams.find((e) => e.name === examName)
    const status = examData?.status || 'not applied'
    // Convert API format to frontend format
    return status === 'not applied' ? 'not-applied' : status
  }

  const [applicationStatus, setApplicationStatus] = useState<'not-applied' | 'pending' | 'approved' | 'rejected'>(
    getExamStatus(examId)
  )

  // Get exam-specific data from school profile
  const examName = examIdToName[examId]
  const currentExamData = school?.exams?.find((e) => e.name === examName)

  const [selectedStudents, setSelectedStudents] = useState<string[]>([])
  const [searchTerm, setSearchTerm] = useState<string>('')
  const [sortState, setSortState] = useState<SortState>({
    field: null,
    direction: null,
    clickCount: 0
  })
  const [filters, setFilters] = useState<FilterState>({
    class: 'All',
    year: 'All',
    gender: 'All'
  })
  const [showPaymentModal, setShowPaymentModal] = useState(false)

  const debouncedSearchTerm = useDebounce(searchTerm, 500)

  // Fetch students for the authenticated school
  const { data: studentsData, refetch: refetchStudents } = useGetStudentsBySchoolQuery(
    {
      schoolId: school?.id || '',
      page: 1,
      limit: 10,
      searchTerm: debouncedSearchTerm || undefined
    },
    { skip: !school?.id || applicationStatus !== 'approved' }
  )

  // Use exam-specific points from school profile
  const examPoints = currentExamData?.availablePoints || 0
  const examTotalPoints = currentExamData?.totalPoints || 0
  const examNumberOfStudents = currentExamData?.numberOfStudents || 0

  const handleRefresh = useCallback(async () => {
    await refetchStudents()
  }, [refetchStudents])

  const handleSort = (field: SortableField) => {
    setSortState(prevState => {
      if (prevState.field === field) {
        const newClickCount = prevState.clickCount + 1
        if (newClickCount === 1) {
          return { field, direction: 'asc', clickCount: 1 }
        } else if (newClickCount === 2) {
          return { field, direction: 'desc', clickCount: 2 }
        } else {
          return { field: null, direction: null, clickCount: 0 }
        }
      } else {
        return { field, direction: 'asc', clickCount: 1 }
      }
    })
  }

  const handleStudentSelect = (studentId: string, selected: boolean) => {
    if (selected) {
      setSelectedStudents(prev => [...prev, studentId])
    } else {
      setSelectedStudents(prev => prev.filter(id => id !== studentId))
    }
  }

  const handleSelectAll = (selected: boolean) => {
    if (selected && studentsData?.data) {
      setSelectedStudents(studentsData.data.map(student => student._id))
    } else {
      setSelectedStudents([])
    }
  }

  const handleFilterChange = (newFilters: FilterState) => {
    setFilters(newFilters)
  }

  const handleApplicationSubmit = () => {
    setApplicationStatus('pending')
  }

  const students = React.useMemo(() => {
    if (!studentsData?.data) return []

    return studentsData.data.map(student => ({
      id: student._id,
      studentId: student.studentId.toString(),
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
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Exam Not Found</h2>
            <p className="text-gray-600 mb-4">The requested examination does not exist.</p>
            <button
              onClick={() => router.push('/portal/dashboard')}
              className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors cursor-pointer"
            >
              Back to Exams
            </button>
          </div>
        </div>
      </div>
    )
  }

  // Show application form if not applied
  if (applicationStatus === 'not-applied') {
    return (
      <div className='sm:p-4 p-2 bg-[#F3F3F3] min-h-screen relative w-full flex flex-col'>
        <Header />
        
        <div className="flex-1 mt-4 sm:mt-6">
          <div className="max-w-4xl mx-auto">
            <button
              onClick={() => router.push('/portal/dashboard')}
              className="mb-4 text-green-600 hover:text-green-700 font-medium flex items-center gap-2 cursor-pointer"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back to Exams
            </button>

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
        <Header />
        
        <div className="flex-1 mt-4 sm:mt-6">
          <div className="max-w-4xl mx-auto">
            <button
              onClick={() => router.push('/portal/dashboard')}
              className="mb-4 text-green-600 hover:text-green-700 font-medium flex items-center gap-2 cursor-pointer"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back to Exams
            </button>

            <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
              <div className="flex items-center gap-3 mb-4">
                <Image
                  src={exam.iconPath}
                  alt={exam.shortName}
                  width={48}
                  height={48}
                  className="object-contain"
                />
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">{exam.shortName}</h2>
                  <p className="text-sm text-gray-600">{exam.name}</p>
                </div>
              </div>

              {applicationStatus === 'pending' && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <div className="text-2xl">⏳</div>
                    <div>
                      <h3 className="font-semibold text-yellow-900 mb-1">Application Pending</h3>
                      <p className="text-sm text-yellow-800">
                        Your application for {exam.shortName} is currently under review. 
                        You will be notified once it has been approved.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {applicationStatus === 'rejected' && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <div className="text-2xl">❌</div>
                    <div>
                      <h3 className="font-semibold text-red-900 mb-1">Application Rejected</h3>
                      <p className="text-sm text-red-800">
                        Your application for {exam.shortName} has been rejected. 
                        Please contact the administrator for more information.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Show exam dashboard if approved - use exam-specific points
  const hasPointsOrStudents = school && (examPoints > 0 || (studentsData?.data && studentsData.data.length > 0))

  return (
    <div className='sm:p-4 p-2 bg-[#F3F3F3] min-h-screen relative w-full flex flex-col'>
      <Header />
      
      <div className="flex-1 mt-4 sm:mt-6">
        <div className="mb-4 flex items-center justify-between">
          <button
            onClick={() => router.push('/portal/dashboard')}
            className="text-green-600 hover:text-green-700 font-medium flex items-center gap-2 cursor-pointer"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Exams
          </button>
          
          <div className="flex items-center gap-2">
            <Image
              src={exam.iconPath}
              alt={exam.shortName}
              width={32}
              height={32}
              className="object-contain"
            />
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900">{exam.shortName} Dashboard</h1>
          </div>
        </div>

        {hasPointsOrStudents ? (
          <div className="flex-1 overflow-y-hidden flex flex-col xl:grid xl:grid-cols-4 gap-4 sm:gap-6">
            <div className={school?.status === "approved" ? "xl:col-span-3 space-y-4 sm:space-y-6 order-2 xl:order-1" : "col-span-full"}>
              <ResponsiveFilterBar onFilterChange={handleFilterChange} />
              
              <StudentRegistration
                students={students}
                handleSort={handleSort}
                sortState={sortState}
                selectedStudents={selectedStudents}
                onStudentSelect={handleStudentSelect}
                onSelectAll={handleSelectAll}
                searchTerm={searchTerm}
                onSearchChange={setSearchTerm}
                filters={filters}
                onRefreshStudents={handleRefresh}
                currentPage={1}
                totalPages={studentsData?.totalPages || 1}
                itemsPerPage={10}
                totalItems={studentsData?.totalItems || 0}
                onPageChange={() => {}}
                onItemsPerPageChange={() => {}}
              />
            </div>

            {school && school.status === "approved" && (
              <div className="xl:col-span-1 order-1 xl:order-2 overflow-y-auto">
                <div className="space-y-6">
                  <OnboardingCompletionSummary
                    totalStudents={studentsData?.totalItems || 0}
                    handleRefresh={handleRefresh}
                  />
                  {examNumberOfStudents - examTotalPoints > 0 && (
                    <CostSummary
                      onPurchaseMorePoints={() => setShowPaymentModal(true)}
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
      />
    </div>
  )
}
