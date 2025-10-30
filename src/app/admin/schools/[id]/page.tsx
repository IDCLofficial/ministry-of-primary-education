"use client";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState, useMemo } from "react";
import { fetchSchoolById, fetchSchoolTransactions, School, Student, changeApplicationStatus } from "@/services/schoolService";
import { useSchoolStatusActions } from "@/components/admin/SchoolStatusActions";
import Swal from 'sweetalert2';

// Transaction interface to match the detailed structure
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

export default function SchoolDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const schoolId = params.id as string;
  const applicationId = searchParams.get('ad'); // Get application ID from query params
  const [school, setSchool] = useState<School | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingTransactions, setLoadingTransactions] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(12);

  useEffect(() => {
    async function fetchSchoolDetails() {
      try {
        setError(null);
        
        const schoolData = await fetchSchoolById(schoolId as string);
        setSchool(schoolData);

        // Fetch transactions if school is not in 'not applied' status
        if (schoolData.status !== 'not applied') {
          setLoadingTransactions(true);
          try {
            const transactionData = await fetchSchoolTransactions(schoolId as string);
            setTransactions(Array.isArray(transactionData.data) ? transactionData.data : [transactionData.data]);
          } catch (transactionError) {
            console.warn("Failed to load transactions", transactionError);
            setTransactions([]);
          } finally {
            setLoadingTransactions(false);
          }
        }
      } catch (err) {
        console.error("Failed to load details", err);
        setError(err instanceof Error ? err.message : "Failed to load school details");
      } finally {
        setLoading(false);
      }
    }

    if (schoolId) fetchSchoolDetails();
  }, [schoolId]);

  // Calculate statistics
  const totalStudents = school?.students?.length || 0;
  const onboardedStudents = school?.students?.filter((student: Student) => student.onboardingStatus === 'Onboarded').length || 0;
  
  const totalPaid = transactions.length > 0 
    ? transactions.reduce((sum, transaction) => sum + (transaction.totalAmount || 0), 0)
    : 0;
  
  const totalTransactionStudents = transactions.length > 0
    ? transactions.reduce((sum, transaction) => sum + (transaction.numberOfStudents || 0), 0)
    : 0;
  
  const latestTransaction = transactions.length > 0 
    ? transactions.sort((a, b) => {
        const dateA = new Date(a.paidAt || a.createdAt).getTime();
        const dateB = new Date(b.paidAt || b.createdAt).getTime();
        return dateB - dateA;
      })[0]
    : null;

  // Filter students based on search
  const filteredStudents = useMemo(() => {
    if (!school?.students || school.students.length === 0) {
      return [];
    }
    return school.students.filter((student: Student) =>
      student.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student._id?.includes(searchTerm) ||
      student.class?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [school?.students, searchTerm]);

  // Pagination
  const totalPages = Math.ceil(filteredStudents.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedStudents = filteredStudents.slice(startIndex, startIndex + itemsPerPage);

  const handleExportStudentList = () => {
    if (!school?.students) return;
    
    const studentData = filteredStudents.map((student, index) => ({
      'S/N': index + 1,
      'Student ID': student._id || 'N/A',
      'Name': student.name || 'N/A',
      'Gender': student.gender || 'N/A',
      'Class': student.class || 'N/A',
      'Exam Year': student.examYear || 'N/A',
      'Payment Status': student.paymentStatus || 'Pending',
      'Onboarding Status': student.onboardingStatus || 'Not Onboarded'
    }));

    const headers = Object.keys(studentData[0] || {});
    const csvContent = [
      headers.join(','),
      ...studentData.map(row => 
        headers.map(header => `"${row[header as keyof typeof row]}"`).join(',')
      )
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `${school?.schoolName.replace(/\s+/g, '_')}_Students.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Initialize the reusable school status actions
  const {
    handleApproveOne,
    handleRejectOne,
    handleSendConfirmationSingle
  } = useSchoolStatusActions({
    onSuccess: () => {
      // Refetch school data to get updated status
      if (school?._id) {
        fetchSchoolById(school._id).then(updatedSchool => {
          setSchool(updatedSchool);
        }).catch(console.error);
      }
    },
    onError: () => {
      console.log('Action failed');
    }
  });

  // Wrapper functions to handle application ID from query params
  const handleApproveSchool = () => {
    // Use application ID from query params (passed from SchoolTable)
    if (applicationId) {
      handleApproveOne(applicationId);
      console.log('Application ID from query params:', applicationId, 'School object:', school);
    } else {
      console.error('No application ID available. Make sure you navigated from the SchoolTable with appId query param.');
    }
  };

  const handleRejectSchool = () => {
    // Use application ID from query params (passed from SchoolTable)
    if (applicationId) {
      handleRejectOne(applicationId);
    } else {
      console.error('No application ID available. Make sure you navigated from the SchoolTable with appId query param.');
    }
  };

  const handleSendConfirmation = () => {
    // Use application ID from query params (passed from SchoolTable)
    if (applicationId) {
      handleSendConfirmationSingle(applicationId);
    } else {
      console.error('No application ID available. Make sure you navigated from the SchoolTable with appId query param.');
    }
  };

  if (loading) return <div className="p-6">Loading school details...</div>;
  if (error) return <div className="p-6 text-red-600">Error: {error}</div>;
  if (!school) return <div className="p-6">No school details found.</div>;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-b-gray-200 sticky top-0 z-10">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.back()}
                className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Back to Schools
              </button>
              <h1 className="text-xl font-semibold text-gray-900">{school.schoolName}</h1>
            </div>
            <div className="flex items-center space-x-3">
              {/* Action buttons based on school status */}
              {school.status === 'applied' && (
                <>
                  <button
                    onClick={handleApproveSchool}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
                  >
                    Approve Application
                  </button>
                  <button
                    onClick={handleRejectSchool}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 transition-colors"
                  >
                    Reject Application
                  </button>
                </>
              )}
              
              {school.status === 'onboarded' && (
                <button
                  onClick={handleSendConfirmation}
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
        {/* Applied School Layout - Two Column Comparison */}
        {school.status === 'applied' ? (
          <div className="space-y-8">
            {/* Application Review Section */}
            <div className="bg-white rounded-lg shadow-sm">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">Application Review</h2>
              </div>
              
              <div className="p-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Submitted Data Column */}
                  <div>
                    <h3 className="text-base font-semibold text-gray-900 mb-4">Submitted Data</h3>
                    <div className="space-y-4">
                      <div>
                        <div className="text-lg font-bold text-gray-900">{school.schoolName}</div>
                        <div className="text-sm text-gray-600">School Name</div>
                      </div>
                      
                      <div>
                        <div className="text-sm text-gray-900">{school.address}</div>
                        <div className="text-sm text-gray-600">Address</div>
                      </div>
                      
                      <div>
                        <div className="text-sm text-gray-900">SCH-{school._id.slice(-4)}</div>
                        <div className="text-sm text-gray-600">Unique Code</div>
                      </div>
                      
                      <div>
                        <div className="text-sm text-gray-900">{school.principal}</div>
                        <div className="text-sm text-gray-600">Principal</div>
                      </div>
                      
                      <div>
                        <div className="text-sm text-gray-900">{school.email}</div>
                        <div className="text-sm text-gray-600">Contact Email</div>
                      </div>
                      
                      <div>
                        <div className="text-sm text-gray-900">{school.phone ? `0${school.phone.toString().slice(-10)}` : 'N/A'}</div>
                        <div className="text-sm text-gray-600">Contact Phone</div>
                      </div>
                      
                      <div>
                        <div className="text-sm text-gray-900">{school.numberOfStudents || 0}</div>
                        <div className="text-sm text-gray-600">Students Declared</div>
                      </div>
                    </div>
                  </div>
                  
                  {/* System School Data Column */}
                  <div>
                    <h3 className="text-base font-semibold text-gray-900 mb-4">System School Data</h3>
                    <div className="space-y-4">
                      <div>
                        <div className="text-lg font-bold text-gray-900">SCH-{school._id.slice(-4)}</div>
                        <div className="text-sm text-gray-600">Unique Code</div>
                      </div>
                      
                      <div>
                        <div className="text-sm text-gray-900">{school.schoolName}</div>
                        <div className="text-sm text-gray-600">Registered Name</div>
                      </div>
                      
                      <div>
                        <div className="text-sm text-gray-900">{school.email}</div>
                        <div className="text-sm text-gray-600">Official Contact</div>
                      </div>
                      
                      <div>
                        <div className="text-lg font-bold text-blue-600">{school.students?.length || 0}</div>
                        <div className="text-sm text-gray-600">Students In Our Database</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Student List Section for Applied Schools */}
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
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Student ID
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Name
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Gender
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Class
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Exam Year
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Payment Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Onboarding Status
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
                        setItemsPerPage(Number(e.target.value));
                        setCurrentPage(1);
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
                        const pageNum = i + 1;
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
                        );
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
        ) : (
          /* Original layout for non-applied schools */
          <div className="space-y-8">
            {/* Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {school.status === 'not applied' ? (
                // Cards for Not Applied Schools
                <>
                  <div className="bg-white rounded-lg p-6 shadow-sm">
                    <div className="text-2xl font-bold text-blue-600">{totalStudents}</div>
                    <div className="text-sm text-gray-600 mt-1">Total Students</div>
                  </div>
                  <div className="bg-white rounded-lg p-6 shadow-sm">
                    <div className="text-lg font-bold text-blue-600 truncate" title={school.email}>
                      {school.email || 'N/A'}
                    </div>
                    <div className="text-sm text-gray-600 mt-1">Email Address</div>
                  </div>
                  <div className="bg-white rounded-lg p-6 shadow-sm">
                    <div className="text-2xl font-bold text-blue-600">
                      {school.phone ? `+234${school.phone.toString().slice(-10)}` : 'N/A'}
                    </div>
                    <div className="text-sm text-gray-600 mt-1">Phone Number</div>
                  </div>
                  <div className="bg-white rounded-lg p-6 shadow-sm">
                    <div className="text-lg font-bold text-blue-600">
                      {new Date(school.createdAt).toLocaleDateString('en-GB', { 
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
                  {school.status !== 'rejected' && (
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
                            <p className="break-words overflow-hidden text-ellipsis">{latestTransaction?.reference || 'N/A'}</p>
                          )}
                        </div>
                        <div className="text-sm text-gray-600 mt-1">Transaction Reference</div>
                      </div>
                      <div className="bg-white rounded-lg p-6 shadow-sm">
                        <div className="text-2xl font-bold text-blue-600">
                          {loadingTransactions ? (
                            <div className="animate-pulse bg-gray-200 h-8 w-20 rounded"></div>
                          ) : (
                            latestTransaction?.paidAt 
                              ? new Date(latestTransaction.paidAt).toLocaleDateString('en-GB')
                              : 'N/A'
                          )}
                        </div>
                        <div className="text-sm text-gray-600 mt-1">Last Payment Date</div>
                      </div>
                    </>
                  )}
                  
                  {/* School Information Cards */}
                  <div className="bg-white rounded-lg p-6 shadow-sm">
                    <div className="text-lg font-bold text-gray-900 break-words">
                      {school.principal || 'N/A'}
                    </div>
                    <div className="text-sm text-gray-600 mt-1">Principal Name</div>
                  </div>
                  
                  <div className="bg-white rounded-lg p-6 shadow-sm">
                    <div className="text-lg font-bold text-gray-900 break-words">
                      {school.email || 'N/A'}
                    </div>
                    <div className="text-sm text-gray-600 mt-1">Email Address</div>
                  </div>
                  
                  <div className="bg-white rounded-lg p-6 shadow-sm">
                    <div className="text-lg font-bold text-gray-900 break-words">
                      {school.phone || 'N/A'}
                    </div>
                    <div className="text-sm text-gray-600 mt-1">Phone Number</div>
                  </div>
                  
                  <div className="bg-white rounded-lg p-6 shadow-sm">
                    <div className="text-lg font-bold text-gray-900 break-words">
                      {school.address || 'N/A'}
                    </div>
                    <div className="text-sm text-gray-600 mt-1">School Address</div>
                  </div>
                  
                  <div className="bg-white rounded-lg p-6 shadow-sm">
                    <div className="text-lg font-bold text-blue-600">
                      {school.numberOfStudents || 0}
                    </div>
                    <div className="text-sm text-gray-600 mt-1">Total Students Declared</div>
                  </div>
                  
                  <div className="bg-white rounded-lg p-6 shadow-sm">
                    <div className="text-lg font-bold text-blue-600">
                      {school.students?.length || 0}
                    </div>
                    <div className="text-sm text-gray-600 mt-1">Total Students In Database</div>
                  </div>
                  
                  <div className="bg-white rounded-lg p-6 shadow-sm">
                    <div className="text-lg font-bold text-green-600">
                      {school.totalPoints || 0}
                    </div>
                    <div className="text-sm text-gray-600 mt-1">Total Points</div>
                  </div>
                </>
              )}
            </div>

            {/* Student List Section for non-applied schools */}
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
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Student ID
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Name
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Gender
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Class
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Exam Year
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Payment Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Onboarding Status
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
                        setItemsPerPage(Number(e.target.value));
                        setCurrentPage(1);
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
                        const pageNum = i + 1;
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
                        );
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
        )}
      </div>
    </div>
  );
}
                       