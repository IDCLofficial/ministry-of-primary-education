'use client'

import React, { useState, useEffect } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { useAuth } from '../providers/AuthProvider'
import { useGetStudentsBySchoolQuery } from '../store/api/authApi'
import Header from './components/Header'
import ResponsiveFilterBar from './components/ResponsiveFilterBar'
import StudentRegistration from './components/StudentRegistration'
import CostSummary from './components/CostSummary'
import PaymentStatusModal from './components/PaymentStatusModal'
import PaymentModal from './components/PaymentModal'

// Mock data - replace with actual data from your API
// const mockStudents = [
//     { id: '1', studentId: '20391B2001', fullName: 'Chinedu Okorie', gender: 'Male' as const, class: 'SS3', examYear: 2025, paymentStatus: 'Not Paid' as const },
//     { id: '2', studentId: '20391B2002', fullName: 'Amaka Nwosu', gender: 'Female' as const, class: 'SS2', examYear: 2024, paymentStatus: 'Completed' as const },
//     { id: '3', studentId: '20391B2003', fullName: 'Ifeanyi Obi', gender: 'Male' as const, class: 'SS1', examYear: 2026, paymentStatus: 'Pending' as const },
//     { id: '4', studentId: '20391B2004', fullName: 'Ngozi Eze', gender: 'Female' as const, class: 'JSS3', examYear: 2025, paymentStatus: 'Not Paid' as const },
//     { id: '5', studentId: '20391B2005', fullName: 'Emeka Uche', gender: 'Male' as const, class: 'SS2', examYear: 2024, paymentStatus: 'Completed' as const },
//     { id: '6', studentId: '20391B2006', fullName: 'Adaobi Okafor', gender: 'Female' as const, class: 'JSS2', examYear: 2025, paymentStatus: 'Not Paid' as const },
//     { id: '7', studentId: '20391B2007', fullName: 'Samuel Johnson', gender: 'Male' as const, class: 'SS3', examYear: 2026, paymentStatus: 'Pending' as const },
//     { id: '8', studentId: '20391B2008', fullName: 'Blessing Chukwu', gender: 'Female' as const, class: 'SS1', examYear: 2025, paymentStatus: 'Completed' as const },
//     { id: '9', studentId: '20391B2009', fullName: 'Ugochukwu Nnamdi', gender: 'Male' as const, class: 'JSS1', examYear: 2024, paymentStatus: 'Not Paid' as const },
//     { id: '10', studentId: '20391B2010', fullName: 'Ngozi Adichie', gender: 'Female' as const, class: 'SS3', examYear: 2025, paymentStatus: 'Not Paid' as const },
//     { id: '11', studentId: '20391B2011', fullName: 'Chisom Iheanacho', gender: 'Male' as const, class: 'JSS2', examYear: 2026, paymentStatus: 'Completed' as const },
//     { id: '12', studentId: '20391B2012', fullName: 'Patience Ogu', gender: 'Female' as const, class: 'SS2', examYear: 2024, paymentStatus: 'Pending' as const },
//     { id: '13', studentId: '20391B2013', fullName: 'Kelechi Madu', gender: 'Male' as const, class: 'SS1', examYear: 2025, paymentStatus: 'Not Paid' as const },
//     { id: '14', studentId: '20391B2014', fullName: 'Peace Onyema', gender: 'Female' as const, class: 'JSS3', examYear: 2025, paymentStatus: 'Completed' as const },
//     { id: '15', studentId: '20391B2015', fullName: 'Victor Adeyemi', gender: 'Male' as const, class: 'SS3', examYear: 2026, paymentStatus: 'Not Paid' as const },
//     { id: '16', studentId: '20391B2016', fullName: 'Esther Nwaokoro', gender: 'Female' as const, class: 'SS2', examYear: 2025, paymentStatus: 'Pending' as const },
//     { id: '17', studentId: '20391B2017', fullName: 'Tunde Oladipo', gender: 'Male' as const, class: 'SS1', examYear: 2024, paymentStatus: 'Completed' as const },
//     { id: '18', studentId: '20391B2018', fullName: 'Chiamaka Nweke', gender: 'Female' as const, class: 'JSS1', examYear: 2026, paymentStatus: 'Not Paid' as const },
//     { id: '19', studentId: '20391B2019', fullName: 'Olamide Afolabi', gender: 'Male' as const, class: 'SS2', examYear: 2025, paymentStatus: 'Completed' as const },
//     { id: '20', studentId: '20391B2020', fullName: 'Joy Umeh', gender: 'Female' as const, class: 'SS3', examYear: 2024, paymentStatus: 'Pending' as const },
//     { id: '21', studentId: '20391B2021', fullName: 'Ikenna Nwankwo', gender: 'Male' as const, class: 'JSS2', examYear: 2025, paymentStatus: 'Not Paid' as const },
//     { id: '22', studentId: '20391B2022', fullName: 'Maryann Obinna', gender: 'Female' as const, class: 'SS1', examYear: 2025, paymentStatus: 'Completed' as const },
//     { id: '23', studentId: '20391B2023', fullName: 'Daniel Chike', gender: 'Male' as const, class: 'JSS3', examYear: 2026, paymentStatus: 'Not Paid' as const },
//     { id: '24', studentId: '20391B2024', fullName: 'Gloria Nwachukwu', gender: 'Female' as const, class: 'SS2', examYear: 2024, paymentStatus: 'Pending' as const },
//     { id: '25', studentId: '20391B2025', fullName: 'Anthony Eze', gender: 'Male' as const, class: 'SS3', examYear: 2025, paymentStatus: 'Not Paid' as const },
//     { id: '26', studentId: '20391B2026', fullName: 'Oluchi Nnamani', gender: 'Female' as const, class: 'JSS1', examYear: 2025, paymentStatus: 'Completed' as const },
//     { id: '27', studentId: '20391B2027', fullName: 'Michael Obi', gender: 'Male' as const, class: 'SS1', examYear: 2026, paymentStatus: 'Not Paid' as const },
//     { id: '28', studentId: '20391B2028', fullName: 'Rita Nduka', gender: 'Female' as const, class: 'SS2', examYear: 2025, paymentStatus: 'Completed' as const },
//     { id: '29', studentId: '20391B2029', fullName: 'Sunday Okafor', gender: 'Male' as const, class: 'JSS3', examYear: 2024, paymentStatus: 'Pending' as const },
//     { id: '30', studentId: '20391B2030', fullName: 'Evelyn Anya', gender: 'Female' as const, class: 'SS3', examYear: 2026, paymentStatus: 'Not Paid' as const },
//     { id: '31', studentId: '20391B2031', fullName: 'Kelvin Iroha', gender: 'Male' as const, class: 'SS2', examYear: 2025, paymentStatus: 'Completed' as const },
//     { id: '32', studentId: '20391B2032', fullName: 'Amarachi Ogu', gender: 'Female' as const, class: 'SS1', examYear: 2024, paymentStatus: 'Not Paid' as const },
//     { id: '33', studentId: '20391B2033', fullName: 'David Emeh', gender: 'Male' as const, class: 'JSS1', examYear: 2025, paymentStatus: 'Pending' as const },
//     { id: '34', studentId: '20391B2034', fullName: 'Hope Ijeoma', gender: 'Female' as const, class: 'SS3', examYear: 2025, paymentStatus: 'Completed' as const },
//     { id: '35', studentId: '20391B2035', fullName: 'Chukwudi Anozie', gender: 'Male' as const, class: 'JSS2', examYear: 2026, paymentStatus: 'Not Paid' as const },
//     { id: '36', studentId: '20391B2036', fullName: 'Vivian Opara', gender: 'Female' as const, class: 'SS2', examYear: 2025, paymentStatus: 'Pending' as const },
//     { id: '37', studentId: '20391B2037', fullName: 'Ibrahim Musa', gender: 'Male' as const, class: 'SS1', examYear: 2024, paymentStatus: 'Not Paid' as const },
//     { id: '38', studentId: '20391B2038', fullName: 'Sarah Ogbonna', gender: 'Female' as const, class: 'SS3', examYear: 2026, paymentStatus: 'Completed' as const },
//     { id: '39', studentId: '20391B2039', fullName: 'Collins Nwankwo', gender: 'Male' as const, class: 'JSS3', examYear: 2025, paymentStatus: 'Pending' as const },
//     { id: '40', studentId: '20391B2040', fullName: 'Amarachi Eze', gender: 'Female' as const, class: 'SS2', examYear: 2025, paymentStatus: 'Not Paid' as const },
//     { id: '41', studentId: '20391B2041', fullName: 'Benedict Okafor', gender: 'Male' as const, class: 'JSS1', examYear: 2025, paymentStatus: 'Completed' as const },
//     { id: '42', studentId: '20391B2042', fullName: 'Glory Akpan', gender: 'Female' as const, class: 'SS1', examYear: 2024, paymentStatus: 'Pending' as const },
//     { id: '43', studentId: '20391B2043', fullName: 'Bright Nwaogu', gender: 'Male' as const, class: 'SS3', examYear: 2025, paymentStatus: 'Not Paid' as const },
//     { id: '44', studentId: '20391B2044', fullName: 'Mercy Uzo', gender: 'Female' as const, class: 'SS2', examYear: 2026, paymentStatus: 'Completed' as const },
//     { id: '45', studentId: '20391B2045', fullName: 'Uchenna Ihejirika', gender: 'Male' as const, class: 'JSS2', examYear: 2025, paymentStatus: 'Pending' as const },
//     { id: '46', studentId: '20391B2046', fullName: 'Faith Onuoha', gender: 'Female' as const, class: 'SS1', examYear: 2025, paymentStatus: 'Not Paid' as const },
//     { id: '47', studentId: '20391B2047', fullName: 'Abdulrahman Bello', gender: 'Male' as const, class: 'SS2', examYear: 2024, paymentStatus: 'Completed' as const },
//     { id: '48', studentId: '20391B2048', fullName: 'Mariam Lawal', gender: 'Female' as const, class: 'SS3', examYear: 2026, paymentStatus: 'Not Paid' as const },
//     { id: '49', studentId: '20391B2049', fullName: 'Kingsley Obinna', gender: 'Male' as const, class: 'JSS3', examYear: 2025, paymentStatus: 'Pending' as const },
//     { id: '50', studentId: '20391B2050', fullName: 'Stella Nnorom', gender: 'Female' as const, class: 'SS2', examYear: 2025, paymentStatus: 'Completed' as const },
//     { id: '51', studentId: '20391B2051', fullName: 'Chinedu Umeh', gender: 'Male' as const, class: 'SS3', examYear: 2024, paymentStatus: 'Not Paid' as const },
//     { id: '52', studentId: '20391B2052', fullName: 'Chidera Nwachukwu', gender: 'Female' as const, class: 'SS1', examYear: 2026, paymentStatus: 'Completed' as const },
// ]
  

interface FilterState {
  class: string
  year: string
  gender: string
}

export default function DashboardPage() {
    const searchParams = useSearchParams()
    const router = useRouter()
    const { school } = useAuth()
    
    const [selectedStudents, setSelectedStudents] = useState<string[]>([])
    const [searchTerm, setSearchTerm] = useState('')
    const [filters, setFilters] = useState<FilterState>({
        class: 'All',
        year: 'All',
        gender: 'All'
    })
    const [paymentStatus, setPaymentStatus] = useState<'success' | 'failed' | null>(null)
    const [showPaymentModal, setShowPaymentModal] = useState(false)

    // Fetch students for the authenticated school
    const { data: studentsData, refetch: refetchStudents } = useGetStudentsBySchoolQuery(
        school?.id || '', 
        { skip: !school?.id }
    )

    // Transform API data to match component expectations
    const students = React.useMemo(() => {
        if (!studentsData) return [] // Fallback to mock data if no API data
        
        return studentsData.map(student => ({
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
        }

        
    }, [searchParams])

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
        const hasNoPointsAndNoStudents = school?.availablePoints === 0 && studentsData?.length === 0
        if (hasNoPointsAndNoStudents) {
            return (
                <div className="mt-4 sm:mt-6 flex flex-col xl:grid xl:grid-cols-4 gap-4 sm:gap-6">
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
            <div className="mt-4 sm:mt-6 flex flex-col xl:grid xl:grid-cols-4 gap-4 sm:gap-6">
                {/* Main Content */}
                <div className="xl:col-span-3 space-y-4 sm:space-y-6 order-2 xl:order-1">
                    <ResponsiveFilterBar onFilterChange={handleFilterChange} />
                    
                    <StudentRegistration
                        students={students}
                        selectedStudents={selectedStudents}
                        onStudentSelect={handleStudentSelect}
                        onSelectAll={handleSelectAll}
                        searchTerm={searchTerm}
                        onSearchChange={setSearchTerm}
                        filters={filters}
                        onRefreshStudents={refetchStudents}
                    />
                </div>

                {/* Sidebar */}
                <div className="xl:col-span-1 order-1 xl:order-2">
                    <div className="sticky top-4">
                        <CostSummary
                            onPurchaseMorePoints={() => setShowPaymentModal(true)}
                        />
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className='sm:p-4 p-2 grided bg-[#F3F3F3] min-h-screen relative w-full'>
            <Header />
            
            {renderDashboard()}

            {/* Payment Modal */}
            <PaymentModal
                isOpen={showPaymentModal}
                onClose={() => setShowPaymentModal(false)}
                onPaymentSuccess={handlePaymentSuccess}
                numberOfStudents={studentsData?.length || 10} // Default to 10 if no students data
            />

            {/* Payment Status Modal */}
            <PaymentStatusModal 
                status={paymentStatus}
                onClose={handleClosePaymentModal}
            />
        </div>
    )
}
