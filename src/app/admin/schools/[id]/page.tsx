"use client";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import DashboardLayout from '@/components/admin/DashboardLayout';
import { 
  useGetSchoolByIdQuery, 
  useGetSchoolTransactionsQuery,
  useGetApplicationsQuery
} from "@/store/api/schoolsApi";
import { useSchoolStatusActions } from '@/components/admin/schools/SchoolStatusActions';
import { Application } from '@/lib/admin-schools/api';
import SchoolDetailsHeader from '@/components/admin/schools/SchoolDetailsHeader';
import { AuthProvider } from '@/contexts/AuthContext';
import ProtectedRoute from '@/components/admin/ProtectedRoute';
import SchoolStatsCards from '@/components/admin/schools/SchoolStatsCards';
import StudentsSection from '@/components/admin/schools/StudentsSection';
import ApplicationReviewLayout from '@/components/admin/schools/ApplicationReviewLayout';
import { useSchoolCalculations } from '@/hooks/useSchoolCalculations';
import { useStudentExport } from '@/hooks/useStudentExport';

function SchoolDetailsPageContent() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const schoolId = params.id as string;
  const applicationId = searchParams.get('ad'); // Get application ID from query params

  // RTK Query hooks
  const { 
    data: school, 
    isLoading: schoolLoading, 
    error: schoolError 
  } = useGetSchoolByIdQuery(schoolId, {
    skip: !schoolId
  });

  const { 
    data: transactionsData, 
    isLoading: transactionsLoading 
  } = useGetSchoolTransactionsQuery(schoolId, {
    skip: !schoolId || school?.status === 'not applied'
  });

  // Fetch applications to get applicationStatus
  const { 
    data: applicationsData, 
    isLoading: applicationsLoading 
  } = useGetApplicationsQuery({}, {
    skip: !schoolId
  });

  // Initialize SchoolStatusActions hook
  const {
    handleApproveOne,
    handleRejectOne,
    handleSendConfirmationSingle,
    handleReapproveOne
  } = useSchoolStatusActions({
    onSuccess: () => {
      // Refetch school data after status change
      // RTK Query will automatically refetch due to cache invalidation
    }
  });

  const transactions = transactionsData?.data || [];

  // Find the application for this school to get applicationStatus
  const schoolApplication = applicationsData?.data?.find(
    app => app.school?._id === schoolId
  );

  // Determine the status: use applicationStatus if available, otherwise fallback to school.status
  const effectiveStatus = schoolApplication?.applicationStatus || school?.status;

  // Create a fallback application object for declined schools without application data
  const applicationForReview: Application | null = schoolApplication || (effectiveStatus === 'declined' ? {
    _id: schoolId,
    school: school!,
    schoolName: school?.schoolName || '',
    address: school?.address || '',
    schoolCode: '',
    principal: school?.principal || '',
    email: school?.email || '',
    phone: school?.phone || 0,
    numberOfStudents: school?.numberOfStudents || 0,
    applicationStatus: 'declined' as const,
    createdAt: school?.createdAt || '',
    updatedAt: school?.updatedAt || '',
    __v: 0
  } : null);

  // Use custom hooks for calculations and export
  const {
    totalStudents,
    onboardedStudents,
    totalPaid,
    totalTransactionStudents,
    latestTransaction
  } = useSchoolCalculations(school, transactions);

  const { exportStudentList } = useStudentExport();

  const handleExportStudentList = () => {
    if (!school?.students) return;
    exportStudentList(school.students, school.schoolName);
  };

  // Handle status actions using the SchoolStatusActions hook
  const handleApproveSchool = async () => {
    if (!applicationId) {
      console.error('No application ID available. Make sure you navigated from the SchoolTable with appId query param.');
      return;
    }
    
    await handleApproveOne(applicationId);
  };

  const handleRejectSchool = async () => {
    if (!applicationId) {
      console.error('No application ID available. Make sure you navigated from the SchoolTable with appId query param.');
      return;
    }
    
    await handleRejectOne(applicationId);
  };

  const handleSendConfirmation = async () => {
    if (!applicationId) {
      console.error('No application ID available. Make sure you navigated from the SchoolTable with appId query param.');
      return;
    }
    
    await handleSendConfirmationSingle(applicationId);
  };

  const handleReapproveSchool = async () => {
    if (!applicationId) {
      console.error('No application ID available. Make sure you navigated from the SchoolTable with appId query param.');
      return;
    }
    
    await handleReapproveOne(applicationId);
  };

  if (schoolLoading || applicationsLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading school details...</p>
        </div>
      </div>
    );
  }

  if (schoolError || !school) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600">Failed to load school details</p>
          <button 
            onClick={() => router.back()}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  // Check if this is an applied or rejected school
  const isAppliedSchool = (effectiveStatus === 'pending' || effectiveStatus === 'rejected' || effectiveStatus === 'declined')

  return (
    <DashboardLayout>
      <div className="p-6">
        <div className="max-w-7xl mx-auto">
          {isAppliedSchool && applicationForReview ? (
            /* Application Review Layout for Applied/Rejected Schools */
            <ApplicationReviewLayout
              application={applicationForReview as Application}
              applicationId={applicationId}
              onApprove={handleApproveSchool}
              onReject={handleRejectSchool}
              onReapprove={handleReapproveSchool}
            />
          ) : (
            /* Standard Layout for Other Schools */
            <>
              {/* Page Header */}
              <SchoolDetailsHeader
                school={school}
                applicationId={applicationId}
                onApprove={handleApproveSchool}
                onReject={handleRejectSchool}
                onSendConfirmation={handleSendConfirmation}
              />

              {/* Statistics Cards */}
              <SchoolStatsCards
                school={school as any}
                transactions={transactions}
                transactionsLoading={transactionsLoading}
                totalStudents={totalStudents}
                onboardedStudents={onboardedStudents}
                totalPaid={totalPaid}
                totalTransactionStudents={totalTransactionStudents}
                latestTransaction={latestTransaction}
              />

              {/* Students Section */}
              <StudentsSection
                schoolId={schoolId}
                schoolName={school?.schoolName || ''}
                onExport={handleExportStudentList}
              />
            </>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}

export default function SchoolDetailsPageRTK() {
  return (
    <AuthProvider>
      <ProtectedRoute>
        <SchoolDetailsPageContent />
      </ProtectedRoute>
    </AuthProvider>
  );
}
