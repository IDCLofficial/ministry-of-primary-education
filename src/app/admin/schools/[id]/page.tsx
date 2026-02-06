"use client";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { 
  useGetSchoolByIdQuery, 
  useGetSchoolTransactionsQuery
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
  const examTypeParam = searchParams.get('examType'); // Get exam type from URL
  const appIdParam = searchParams.get('appId'); // Get application ID from URL

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

  // Get the specific pending exam based on examType from URL, or find any pending exam
  const pendingExam = examTypeParam 
    ? school?.exams?.find(exam => exam.name === examTypeParam && exam.status === 'pending')
    : school?.exams?.find(exam => exam.status === 'pending');
  
  const hasPendingExam = !!pendingExam;
  
  // Get applicationId from URL param first, then fall back to exam object
  const applicationId = appIdParam || pendingExam?.applicationId || null;
  console.log('Application ID:', applicationId);

  // Debug logging
  console.log('=== DEBUG INFO ===');
  console.log('School:', school);
  console.log('Exam Type Param:', examTypeParam);
  console.log('App ID Param:', appIdParam);
  console.log('Has Pending Exam:', hasPendingExam);
  console.log('Pending Exam:', pendingExam);
  console.log('Application ID:', applicationId);
  console.log('==================');

  // Determine the effective status from school's exams array
  const effectiveStatus = hasPendingExam ? 'pending' : school?.status;

  // Create application object from school data when there's a pending exam
  const applicationForReview: Application | null = (hasPendingExam && school && pendingExam) ? {
    _id: pendingExam.applicationId || schoolId,
    school: school,
    schoolName: school.schoolName,
    address: school.address,
    schoolCode: school.schoolCode || 'TBD',
    principal: school.principal,
    email: school.email,
    phone: school.phone ? Number(school.phone) : 0,
    numberOfStudents: pendingExam.numberOfStudents || school.numberOfStudents || 0,
    examType: pendingExam.name,
    applicationStatus: 'pending',
    __v: 0
  } : null;

  // Use school data directly
  const enhancedSchool = school!;

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
      console.error('No application ID available. The pending exam does not have an applicationId.');
      return;
    }
    
    await handleApproveOne(applicationId, pendingExam?.name);
  };

  const handleRejectSchool = async () => {
    if (!applicationId) {
      console.error('No application ID available. The pending exam does not have an applicationId.');
      return;
    }
    
    await handleRejectOne(applicationId, pendingExam?.name);
  };

  const handleSendConfirmation = async () => {
    if (!applicationId) {
      console.error('No application ID available. The pending exam does not have an applicationId.');
      return;
    }
    
    await handleSendConfirmationSingle(applicationId, pendingExam?.name);
  };

  const handleReapproveSchool = async () => {
    if (!applicationId) {
      console.error('No application ID available. The pending exam does not have an applicationId.');
      return;
    }
    
    await handleReapproveOne(applicationId, pendingExam?.name);
  };

  if (schoolLoading) {
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

  // Check if this is an applied school with pending status
  const isAppliedSchool = (applicationForReview?.applicationStatus === 'pending') || hasPendingExam;
  console.log('Is Applied School:', isAppliedSchool);
  console.log('Application Status:', applicationForReview?.applicationStatus);
  console.log('Has Pending Exam:', hasPendingExam);

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
