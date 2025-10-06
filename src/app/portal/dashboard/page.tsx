'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { useAuth } from '../providers/AuthProvider'
import { useGetProfileQuery, useGetStudentsBySchoolQuery } from '../store/api/authApi'
import Header from './components/Header'
import ResponsiveFilterBar from './components/ResponsiveFilterBar'
import StudentRegistration, { SortableField, SortState } from './components/StudentRegistration'
import CostSummary from './components/CostSummary'
import OnboardingCompletionSummary from './components/OnboardingCompletionSummary'
import PaymentStatusModal from './components/PaymentStatusModal'
import PaymentModal from './components/PaymentModal'
import { useDebounce } from '../utils/hooks/useDebounce'


interface FilterState {
  class: string
  year: string
  gender: string
}

export default function DashboardPage() {
    const searchParams = useSearchParams()
    const router = useRouter()
    const { school } = useAuth()

    // Get pagination params from URL
    const currentPage = parseInt(searchParams.get('page') || '1')
    const itemsPerPage = parseInt(searchParams.get('limit') || '10')
    const urlSearchTerm = searchParams.get("searchTerm");
    const sortTerm = searchParams.get("sort");
    const classTerm = searchParams.get("class");
    const yearTerm = searchParams.get("year");
    const genderTerm = searchParams.get("gender");

    // Fetch students for the authenticated school with pagination
    const { data: studentsData, refetch: refetchStudents } = useGetStudentsBySchoolQuery(
        {
            schoolId: school?.id || '',
            page: currentPage,
            limit: itemsPerPage,
            sort: sortTerm || undefined,
            class: classTerm || undefined,
            year: yearTerm ? parseInt(yearTerm) : undefined,
            gender: genderTerm || undefined,
            searchTerm: urlSearchTerm || undefined
        },
        { skip: !school?.id }
    )

    // Refresh school profile
    const { refetch: refetchSchool } = useGetProfileQuery()

    const handleRefresh = useCallback(async () => {
        await refetchStudents()
        await refetchSchool()
    }, [refetchStudents, refetchSchool]);

    
    const [selectedStudents, setSelectedStudents] = useState<string[]>([])
    const [searchTerm, setSearchTerm] = useState<string>(urlSearchTerm || "");
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

    const handleSort = (field: SortableField) => {
        setSortState(prevState => {
          if (prevState.field === field) {
            // Same field clicked
            const newClickCount = prevState.clickCount + 1
            if (newClickCount === 1) {
              return { field, direction: 'asc', clickCount: 1 }
            } else if (newClickCount === 2) {
              return { field, direction: 'desc', clickCount: 2 }
            } else {
              // Third click - reset to default
              return { field: null, direction: null, clickCount: 0 }
            }
          } else {
            // Different field clicked - reset count and start with asc
            return { field, direction: 'asc', clickCount: 1 }
          }
        })
      }

    const debouncedSearchTerm = useDebounce(searchTerm, 500)

    
    // Functions to update URL params
    const updateUrlParams = useCallback((params: { page?: number; limit?: number, searchTerm?: string, filter?: FilterState, sort?: string }) => {
        const newSearchParams = new URLSearchParams(searchParams.toString())
        
        if (params.page !== undefined) {
            newSearchParams.set('page', params.page.toString())
        }
        if (params.limit !== undefined) {
            newSearchParams.set('limit', params.limit.toString())
        }
        
        if (params.searchTerm !== undefined) {
            newSearchParams.set('searchTerm', params.searchTerm)
        }
        
        if (params.sort !== undefined) {
            newSearchParams.set('sort', params.sort)
        }

        if (params.filter !== undefined) {
            newSearchParams.set('class', params.filter.class === "All" ? "" : params.filter.class.toLowerCase())
            newSearchParams.set('year', params.filter.year === "All" ? "" : params.filter.year.toLowerCase())
            newSearchParams.set('gender', params.filter.gender === "All" ? "" : params.filter.gender.toLowerCase()) 
        }
        
        router.push(`${window.location.pathname}?${newSearchParams.toString()}`)
    }, [searchParams, router])
    
    useEffect(()=> {
        updateUrlParams({ searchTerm: debouncedSearchTerm })
    }, [debouncedSearchTerm, updateUrlParams])
    
    useEffect(()=> {
        if (!sortState.field) return;

        updateUrlParams({ sort: `${sortState.field}-${sortState.direction}` })
    }, [sortState, updateUrlParams])
    
    useEffect(()=> {
        updateUrlParams({ filter: filters })
    }, [filters, updateUrlParams])

    const handlePageChange = useCallback((page: number) => {
        updateUrlParams({ page })
    }, [updateUrlParams])

    const handleItemsPerPageChange = useCallback((limit: number) => {
        updateUrlParams({ page: 1, limit }) // Reset to page 1 when changing items per page
    }, [updateUrlParams])
    const [paymentStatus, setPaymentStatus] = useState<'success' | 'failed' | null>(null)
    const [showPaymentModal, setShowPaymentModal] = useState(false)

    // Transform API data to match component expectations
    const students = React.useMemo(() => {
        if (!studentsData?.data) return [] // Fallback to empty array if no API data

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

    // Check for payment status URL parameter
    useEffect(() => {
        const status = searchParams.get('payment')
        if (status === 'success' || status === 'failed') {
            setPaymentStatus(status)
            handleRefresh()
        }

        
    }, [searchParams, handleRefresh]);

    const handleStudentSelect = (studentId: string, selected: boolean) => {
        if (selected) {
            setSelectedStudents(prev => [...prev, studentId])
        } else {
            setSelectedStudents(prev => prev.filter(id => id !== studentId))
        }
    }

    const handleSelectAll = (selected: boolean) => {
        if (selected) {
            setSelectedStudents(students.map(student => student.id))
        } else {
            setSelectedStudents([])
        }
    }

    const handleFilterChange = (newFilters: FilterState) => {
        setFilters(newFilters)
    }

    const handleClosePaymentModal = () => {
        setPaymentStatus(null)
        // Remove payment parameter from URL
        const newUrl = new URL(window.location.href)
        newUrl.searchParams.delete('payment')
        router.replace(newUrl.pathname + newUrl.search)
    }

    const handlePaymentSuccess = () => {
        setPaymentStatus('success')
    }

    
    const renderDashboard = () => {
        if (!school || !studentsData) {
            return null;
        }
        const hasPointsOrStudents =  school.availablePoints > 0 || studentsData.data?.length > 0
        if (hasPointsOrStudents) {
            return (
                <div className="flex-1 overflow-y-hidden mt-4 sm:mt-6 flex flex-col xl:grid xl:grid-cols-4 gap-4 sm:gap-6">
                    {/* Main Content */}
                    <div className={school?.status !== "completed" ? "xl:col-span-3 space-y-4 sm:space-y-6 order-2 xl:order-1" : "col-span-full"}>
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
                            currentPage={currentPage}
                            totalPages={studentsData?.totalPages || 1}
                            itemsPerPage={itemsPerPage}
                            totalItems={studentsData?.totalItems || 0}
                            onPageChange={handlePageChange}
                            onItemsPerPageChange={handleItemsPerPageChange}
                        />
                    </div>
    
                    {/* Sidebar */}
                    {school && school.status !== "completed" && (
                        <div className="xl:col-span-1 order-1 xl:order-2 overflow-y-auto">
                            <div className="space-y-6">
                                <OnboardingCompletionSummary
                                    totalStudents={studentsData?.totalItems || 0}
                                    handleRefresh={handleRefresh}
                                />
                                <CostSummary
                                    onPurchaseMorePoints={() => setShowPaymentModal(true)}
                                />
                            </div>
                        </div>
                    )}
                </div>
            )
        }
        
        return (
            <div className="flex-1 mt-4 sm:mt-6 flex flex-col xl:grid xl:grid-cols-4 gap-4 sm:gap-6">
                <div className="xl:col-span-4 text-center py-12">
                    <h2 className="text-xl font-semibold text-gray-600 mb-4">School Payment Portal</h2>
                    <p className="text-gray-500 mb-8">Click the button below to proceed with school payment</p>
                    <button
                        onClick={() => setShowPaymentModal(true)}
                        className="inline-flex active:scale-95 active:rotate-1 cursor-pointer items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200"
                    >
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                        Make School Payment
                    </button>
                </div>
            </div>
        )
    }

    return (
        <div className='sm:p-4 p-2 grided bg-[#F3F3F3] min-h-screen relative w-full flex flex-col'>
            <Header />
            
            {renderDashboard()}

            {/* Payment Modal */}
            <PaymentModal
                isOpen={showPaymentModal}
                onClose={() => setShowPaymentModal(false)}
                onPaymentSuccess={handlePaymentSuccess}
                numberOfStudents={studentsData?.data?.length || 10} // Default to 10 if no students data
            />

            {/* Payment Status Modal */}
            <PaymentStatusModal 
                status={paymentStatus}
                onClose={handleClosePaymentModal}
            />
        </div>
    )
}