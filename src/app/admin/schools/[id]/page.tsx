"use client";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { 
  useGetSchoolByIdQuery, 
  useGetSchoolTransactionsQuery,
  useGetApplicationsQuery
} from "@/app/admin/schools/store/api/schoolsApi";
import { useSchoolStatusActions } from '@/app/admin/schools/components/schools/SchoolStatusActions';
import { Application } from '@/app/admin/schools/store/api/schoolsApi';
import SchoolDetailsHeader from '@/app/admin/schools/components/schools/SchoolDetailsHeader';
import { AuthProvider } from '@/contexts/AuthContext';
import ProtectedRoute from '@/app/admin/schools/components/ProtectedRoute';
import SchoolStatsCards from '@/app/admin/schools/components/schools/SchoolStatsCards';
import StudentsSection from '@/app/admin/schools/components/schools/StudentsSection';
import ApplicationReviewLayout from '@/app/admin/schools/components/schools/ApplicationReviewLayout';
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
      // RTK Query will automatically refetch due to cache invalidation
      // The cache invalidation tags ['Application', 'School'] will trigger refetch
      console.log('Status change successful - RTK Query will automatically update the UI');
    }
  });

  const transactions = transactionsData?.data || [];

  // Find the application for this school to get applicationStatus
  const schoolApplication = applicationsData?.data?.find(
    app => app.school?._id === schoolId
  );

  // Determine the status: use applicationStatus if available, otherwise fallback to school.status
  const effectiveStatus = schoolApplication?.applicationStatus || school?.status;

  // Create a fallback application object for declined/rejected schools without application data
  const applicationForReview: Application | null = schoolApplication || ((effectiveStatus === 'declined' || effectiveStatus === 'rejected') ? {
    _id: schoolId,
    school: school!,
    schoolName: school?.schoolName || '',
    address: school?.address || '',
    schoolCode: '',
    principal: school?.principal || '',
    email: school?.email || '',
    phone: school?.phone || 0,
    numberOfStudents: school?.numberOfStudents || 0,
    applicationStatus: effectiveStatus as 'declined' | 'rejected',
    createdAt: school?.createdAt || '',
    updatedAt: school?.updatedAt || '',
    __v: 0
  } : null);

  // Create enhanced school object with Application data for completed schools
  // At this point, we know school exists due to the guard clause above
  const enhancedSchool = schoolApplication ? {
    ...school!,
    principal: schoolApplication.principal || school!.principal || '',
    email: schoolApplication.email || school!.email || '',
    address: schoolApplication.address || school!.address || '',
    schoolName: schoolApplication.schoolName || school!.schoolName || '',
    phone: schoolApplication.phone || school!.phone || 0,
    numberOfStudents: schoolApplication.numberOfStudents || school!.numberOfStudents || 0
  } : school!;

  // Use custom hooks for calculations and export
  const {
    totalStudents,
    onboardedStudents,
    totalPaid,
    totalTransactionStudents,
    latestTransaction
  } = useSchoolCalculations(enhancedSchool, transactions);

  const { exportStudentList } = useStudentExport();

  const handleExportStudentList = () => {
    if (!enhancedSchool?.students) return;
    exportStudentList(enhancedSchool.students, enhancedSchool.schoolName);
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
          <span className="loaderAnimation"></span>
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
  const isAppliedSchool = (effectiveStatus === 'pending' || effectiveStatus === 'declined' || effectiveStatus === 'rejected')

  return ( 
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
                school={enhancedSchool}
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
