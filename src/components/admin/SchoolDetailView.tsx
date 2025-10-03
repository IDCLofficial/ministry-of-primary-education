'use client'

import { useState, useMemo, useEffect } from 'react'
import { School, Student, fetchSchoolTransactions, changeApplicationStatus } from '@/services/schoolService'
import Swal from 'sweetalert2'

// Transaction interface
interface Transaction {
  _id: string;
  numberOfStudents: number;
  totalAmount: number;
  pointsAwarded: number;
  paymentStatus: string;
  createdAt: string;
  paidAt?: string;
  reference: string;
  amountPerStudent: number;
  paymentNotes?: string;
  paystackTransactionId?: string;
  school: {
    _id: string;
    schoolName: string;
    email: string;
  };
}

// Application interface to match the data structure
interface Application {
  _id: string;
  school: {
    _id: string;
    schoolName: string;
    address: string;
    principal: string;
    email: string;
    students: Student[];
    status: string;
    isFirstLogin: boolean;
    totalPoints: number;
    availablePoints: number;
    usedPoints: number;
    __v: number;
    createdAt: string;
    updatedAt: string;
  };
  schoolName: string;
  address: string;
  schoolCode: string;
  principal: string;
  email: string;
  phone: number;
  numberOfStudents: number;
  applicationStatus: string;
  createdAt: string;
  updatedAt: string;
  __v: number;
  reviewNotes?: string;
  reviewedAt?: string;
}

interface SchoolDetailViewProps {
  school: School | Application
  onBack: () => void
  onStatusChange?: () => void
}

export default function SchoolDetailView({ school, onBack, onStatusChange }: SchoolDetailViewProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(12)
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loadingTransactions, setLoadingTransactions] = useState(false)
  
  // Determine if this is an Application or School
  const isApplication = 'applicationStatus' in school
  
  // Get the display data based on type
  const displayData = isApplication ? {
    _id: school._id,
    schoolName: school.schoolName,
    address: school.address,
    principal: school.principal,
    email: school.email,
    status: school.applicationStatus,
    students: school.school?.students || [],
    totalPoints: school.school?.totalPoints || 0,
    availablePoints: school.school?.availablePoints || 0,
    usedPoints: school.school?.usedPoints || 0,
    isFirstLogin: school.school?.isFirstLogin || true,
    createdAt: school.createdAt,
    updatedAt: school.updatedAt,
    numberOfStudents: school.numberOfStudents,
    phone: school.phone,
    reviewNotes: (school as Application).reviewNotes,
    reviewedAt: (school as Application).reviewedAt
  } : school as School

  // Fetch transactions for the school
  useEffect(() => {
    const fetchTransactions = async () => {
      if (displayData.status !== 'not applied') {
        setLoadingTransactions(true)
        try {
          console.log(displayData)
          const schoolId = isApplication ? (school as Application).school._id : (school as School)._id
          console.log(schoolId)
          const transactionData = await fetchSchoolTransactions(schoolId)
          console.log(transactionData)
          setTransactions(Array.isArray(transactionData.data) ? transactionData.data : [transactionData.data])
        } catch (error) {
          console.error('Failed to fetch transactions:', error)
          setTransactions([])
        } finally {
          setLoadingTransactions(false)
        }
      }
    }

    fetchTransactions()
  }, [displayData._id, displayData.status, isApplication])

  // Calculate statistics from transactions and students
  const totalStudents = displayData.students?.length || 0
  const onboardedStudents = displayData.students?.filter((student: Student) => student.onboardingStatus === 'Onboarded').length || 0
  console.log(transactions)
  // Calculate totals across all transactions
  const totalPaid = transactions.length > 0 
    ? transactions.reduce((sum, transaction) => sum + (transaction.totalAmount || 0), 0)
    : 0
  
  const totalTransactionStudents = transactions.length > 0
    ? transactions.reduce((sum, transaction) => sum + (transaction.numberOfStudents || 0), 0)
    : 0
  
  // Get latest transaction (most recent by date)
  const latestTransaction = transactions.length > 0 
    ? transactions.sort((a, b) => {
        const dateA = new Date(a.paidAt || a.createdAt).getTime()
        const dateB = new Date(b.paidAt || b.createdAt).getTime()
        return dateB - dateA // Sort descending (newest first)
      })[0]
    : null
  
  const lastPaymentDate = latestTransaction?.paidAt 
    ? new Date(latestTransaction.paidAt) 
    : (latestTransaction?.createdAt ? new Date(latestTransaction.createdAt) : new Date())

  // Filter students based on search
  const filteredStudents = useMemo(() => {
    if (!displayData.students || displayData.students.length === 0) {
      return []
    }
    return displayData.students.filter((student: Student) =>
      student.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student._id?.includes(searchTerm) ||
      student.class?.toLowerCase().includes(searchTerm.toLowerCase())
    )
  }, [displayData.students, searchTerm])

  // Pagination
  const totalPages = Math.ceil(filteredStudents.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const paginatedStudents = filteredStudents.slice(startIndex, startIndex + itemsPerPage)

  // --- Send Confirmation Single ---
  const handleSendConfirmationSingle = async () => {
    const result = await Swal.fire({
      title: 'Send Confirmation',
      text: 'Are you sure you want to mark this school as completed?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#7c3aed',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, send confirmation!'
    });

    if (result.isConfirmed) {
      // Show loading
      Swal.fire({
        title: 'Processing...',
        text: 'Sending confirmation, please wait.',
        icon: 'info',
        allowOutsideClick: false,
        allowEscapeKey: false,
        showConfirmButton: false,
        didOpen: () => {
          Swal.showLoading();
        }
      });

      try {
        await changeApplicationStatus(displayData._id, "completed");
        
        Swal.fire({
          title: 'Success!',
          text: 'School marked as completed successfully!',
          icon: 'success'
        });
        
        // Call the callback to refresh data in parent component
        if (onStatusChange) {
          onStatusChange();
        }
        
        // Go back to the main view
        onBack();
      } catch (error) {
        console.error(error);
        Swal.fire({
          title: 'Error!',
          text: 'Failed to send confirmation. Please try again.',
          icon: 'error'
        });
      }
    }
  };

  const handleExportStudentList = () => {
    const studentData = filteredStudents.map((student, index) => ({
      'S/N': index + 1,
      'Student ID': student._id || 'N/A',
      'Name': student.name || 'N/A',
      'Gender': student.gender || 'N/A',
      'Class': student.class || 'N/A',
      'Exam Year': student.examYear || 'N/A',
      'Payment Status': student.paymentStatus || 'Pending',
      'Onboarding Status': student.onboardingStatus || 'Not Onboarded'
    }))

    const headers = Object.keys(studentData[0] || {})
    const csvContent = [
      headers.join(','),
      ...studentData.map(row => 
        headers.map(header => `"${row[header as keyof typeof row]}"`).join(',')
      )
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', `${displayData.schoolName.replace(/\s+/g, '_')}_Students.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <div className="fixed inset-0 bg-gray-50 z-50 overflow-y-auto">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-b-gray-200 sticky top-0 z-10">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <button
                onClick={onBack}
                className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Application Review
              </button>
            </div>
            <div className="flex items-center space-x-3">
              {displayData.status === 'onboarded' && (
                <button
                  onClick={handleSendConfirmationSingle}
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg text-sm font-medium hover:bg-purple-700 transition-colors"
                >
                  Send Confirmation
                </button>
              )}
              <button
                onClick={handleExportStudentList}
                className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
              >
                Export Student List
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="px-4 sm:px-6 lg:px-8 py-8">
        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {displayData.status === 'not applied' ? (
            // Cards for Not Applied Schools
            <>
              <div className="bg-white rounded-lg p-6 shadow-sm">
                <div className="text-2xl font-bold text-blue-600">{totalStudents}</div>
                <div className="text-sm text-gray-600 mt-1">Total Students</div>
              </div>
              <div className="bg-white rounded-lg p-6 shadow-sm">
                <div className="text-lg font-bold text-blue-600 truncate" title={displayData.email}>
                  {displayData.email || 'N/A'}
                </div>
                <div className="text-sm text-gray-600 mt-1">Email Address</div>
              </div>
              <div className="bg-white rounded-lg p-6 shadow-sm">
                <div className="text-2xl font-bold text-blue-600">
                  {displayData.phone ? `+234${displayData.phone.toString().slice(-10)}` : 'N/A'}
                </div>
                <div className="text-sm text-gray-600 mt-1">Phone Number</div>
              </div>
              <div className="bg-white rounded-lg p-6 shadow-sm">
                <div className="text-lg font-bold text-blue-600">
                  {new Date(displayData.createdAt).toLocaleDateString('en-GB', { 
                    day: 'numeric', 
                    month: 'short', 
                    year: 'numeric' 
                  })}
                </div>
                <div className="text-sm text-gray-600 mt-1">Registration Date</div>
              </div>
            </>
          ) : (
            // Cards for Applied/Approved Schools (Payment-related)
            <>
           {displayData.status !== 'rejected' &&
           <> 
              <div className="bg-white rounded-lg p-6 shadow-sm">
                <div className="text-2xl font-bold text-blue-600">
                  {loadingTransactions ? (
                    <div className="animate-pulse bg-gray-200 h-8 w-24 rounded"></div>
                  ) : (
                    `₦${totalPaid.toLocaleString()}`
                  )}
                </div>
                <div className="text-sm text-gray-600 mt-1">Total Paid</div>
              </div>
              <div className="bg-white rounded-lg p-6 shadow-sm">
                <div className="text-2xl font-bold text-blue-600">
                  {loadingTransactions ? (
                    <div className="animate-pulse bg-gray-200 h-8 w-16 rounded"></div>
                  ) : (
                    totalTransactionStudents
                  )}
                </div>
                <div className="text-sm text-gray-600 mt-1">No. of Students Paid For</div>
              </div>
              <div className="bg-white rounded-lg p-6 shadow-sm">
                <div className="text-lg font-bold text-blue-600 w-[80%]">
                  {loadingTransactions ? (
                    <div className="animate-pulse bg-gray-200 h-6 w-32 rounded"></div>
                  ) : (
                    <p className="break-words overflow-hidden text-ellipsis">{latestTransaction?.reference || '0'}</p>
                  )}
                </div>
                <div className="text-sm text-gray-600 mt-1">Transaction Reference</div>
              </div>
              <div className="bg-white rounded-lg p-6 shadow-sm">
                <div className="text-2xl font-bold text-blue-600">
                  {loadingTransactions ? (
                    <div className="animate-pulse bg-gray-200 h-8 w-20 rounded"></div>
                  ) : (
                    0  
                  )}
                </div>
                <div className="text-sm text-gray-600 mt-1">Last Payment Date</div>
              </div>
              </>
          }
              {/* School Information Cards */}
              <div className="bg-white rounded-lg p-6 shadow-sm">
                <div className="text-lg font-bold text-gray-900 break-words">
                  {displayData.principal || 'N/A'}
                </div>
                <div className="text-sm text-gray-600 mt-1">Principal Name</div>
              </div>
              
              <div className="bg-white rounded-lg p-6 shadow-sm">
                <div className="text-lg font-bold text-gray-900 break-words">
                  {displayData.email || 'N/A'}
                </div>
                <div className="text-sm text-gray-600 mt-1">Email Address</div>
              </div>
              
              <div className="bg-white rounded-lg p-6 shadow-sm">
                <div className="text-lg font-bold text-gray-900 break-words">
                  {displayData.phone || 'N/A'}
                </div>
                <div className="text-sm text-gray-600 mt-1">Phone Number</div>
              </div>
              
              <div className="bg-white rounded-lg p-6 shadow-sm">
                <div className="text-lg font-bold text-gray-900 break-words">
                  {displayData.address || 'N/A'}
                </div>
                <div className="text-sm text-gray-600 mt-1">School Address</div>
              </div>
              
              <div className="bg-white rounded-lg p-6 shadow-sm">
                <div className="text-lg font-bold text-blue-600">
                  {displayData.numberOfStudents || 0}
                </div>
                <div className="text-sm text-gray-600 mt-1">Total Students Declared</div>
              </div>
              <div className="bg-white rounded-lg p-6 shadow-sm">
                <div className="text-lg font-bold text-blue-600">
                  {displayData.students?.length || 0}
                </div>
                <div className="text-sm text-gray-600 mt-1">Total Students In Database</div>
              </div>
              
              <div className="bg-white rounded-lg p-6 shadow-sm">
                <div className="text-lg font-bold text-green-600">
                  {displayData.totalPoints || 0}
                </div>
                <div className="text-sm text-gray-600 mt-1">Total Points</div>
              </div>
            </>
          )}
        </div>

        {/* Student List Section */}
        <div className="bg-white rounded-lg shadow-sm">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">Student List</h2>
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                  <input
                    type="text"
                    placeholder="Search..."
                    className="block w-64 pl-10 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100">
                    Student ID ↑
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100">
                    Name ↑
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100">
                    Gender ↑
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100">
                    Class ↑
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100">
                    Exam Year ↑
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100">
                    Payment Status ↑
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100">
                    Onboarding Status ↑
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {paginatedStudents.map((student, index) => (
                  <tr key={student._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {student._id || `STU${String(startIndex + index + 1).padStart(6, '0')}`}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {student.name || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {student.gender || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {student.class || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {student.examYear || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        student.paymentStatus === 'Paid' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {student.paymentStatus || 'Pending'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        student.onboardingStatus === 'Onboarded' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {student.onboardingStatus || 'Not Onboarded'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="px-6 py-4 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-700">Number of items displayed per page</span>
                <select
                  value={itemsPerPage}
                  onChange={(e) => {
                    setItemsPerPage(Number(e.target.value))
                    setCurrentPage(1)
                  }}
                  className="border border-gray-300 rounded px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value={12}>12</option>
                  <option value={24}>24</option>
                  <option value={50}>50</option>
                  <option value={100}>100</option>
                </select>
                <span className="text-sm text-gray-700">
                  {startIndex + 1}-{Math.min(startIndex + itemsPerPage, filteredStudents.length)} of {filteredStudents.length} items
                </span>
              </div>
              
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="p-2 border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                
                <div className="flex items-center space-x-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    const pageNum = i + 1
                    return (
                      <button
                        key={pageNum}
                        onClick={() => setCurrentPage(pageNum)}
                        className={`px-3 py-1 rounded text-sm ${
                          currentPage === pageNum
                            ? 'bg-blue-600 text-white'
                            : 'border border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        {pageNum}
                      </button>
                    )
                  })}
                </div>
                
                <button
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  className="p-2 border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
