"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { 
  useGetApplicationsQuery, 
  useUpdateApplicationStatusMutation
} from '@/store/api/schoolsApi';
import ApplicationReview from './ApplicationReview';
import { School } from "@/services/schoolService";
import { Application } from "@/lib/admin-schools/api";
import { useSchoolStatusActions } from './SchoolStatusActions';
import PaginationControls from './PaginationControls';
import SchoolDataTable from './SchoolDataTable';
import TabNavigation, { Tab } from './TabNavigation';
import SchoolSearchBar from './SchoolSearchBar';

export default function SchoolTableRTK() {
  const router = useRouter();
  const [currentTab, setCurrentTab] = useState<Tab>("notApplied");
  const [selectedApplications, setSelectedApplications] = useState<string[]>([]);
  const [page, setPage] = useState(1);
  const [showApplicationReview, setShowApplicationReview] = useState(false);


  // RTK Query hooks - using only useGetApplicationsQuery for all tabs
  const { 
    data: applicationsResponse, 
    isLoading: applicationsLoading, 
    error: applicationsError 
  } = useGetApplicationsQuery({
    page,
    limit: 20, // Use the limit from state
    status: currentTab === "notApplied" ? "not_applied" :
            currentTab === "applied" ? "pending" : 
            currentTab === "approved" ? "approved" : 
            currentTab === "rejected" ? "rejected" : 
            currentTab === "onboarded" ? "onboarded" : 
            currentTab === "completed" ? "completed" : 
            "all" // For "all" tab, fetch all statuses
  });

  // Extract data and meta from response
  const applications = applicationsResponse?.data || [];
  const meta = applicationsResponse?.meta || {
    page: 1,
    totalPages: 1,
    total: 0,
    limit: 20,
    hasNextPage: false,
    hasPrevPage: false
  };

  const [updateApplicationStatus] = useUpdateApplicationStatusMutation();

  // Custom handlers with optimistic updates for tab switching
  const handleApproveOneWithUpdate = async (id: string) => {
    // Optimistically update the cache to move item from current tab
    // This will make the item disappear from current tab immediately
    await updateApplicationStatus({
      appIds: id,
      status: 'approved'
    }).unwrap();
  };

  const handleRejectOneWithUpdate = async (id: string) => {
    await updateApplicationStatus({
      appIds: id,
      status: 'rejected'
    }).unwrap();
  };

  const handleApproveSelectedWithUpdate = async () => {
    if (selectedApplications.length === 0) return;
    await updateApplicationStatus({
      appIds: selectedApplications,
      status: 'approved'
    }).unwrap();
    setSelectedApplications([]);
  };

  const handleRejectSelectedWithUpdate = async () => {
    if (selectedApplications.length === 0) return;
    await updateApplicationStatus({
      appIds: selectedApplications,
      status: 'rejected'
    }).unwrap();
    setSelectedApplications([]);
  };

  const handleSendConfirmationWithUpdate = async () => {
    if (selectedApplications.length === 0) return;
    await updateApplicationStatus({
      appIds: selectedApplications,
      status: 'completed'
    }).unwrap();
    setSelectedApplications([]);
  };

  // Initialize SchoolStatusActions hook for SweetAlert dialogs
  const {
    handleApproveOne,
    handleRejectOne,
    handleApproveSelected,
    handleRejectSelected,
    handleSendConfirmation
  } = useSchoolStatusActions({
    onSuccess: () => {
      // RTK Query will automatically refetch due to cache invalidation
    },
    setSelectedApplications
  });

  // Server now handles all filtering, so we just return the applications
  const data = applications;
  const isLoading = applicationsLoading;

  // Handle tab change
  const handleTabChange = (tab: Tab) => {
    setCurrentTab(tab);
    setPage(1);
    setSelectedApplications([]);
  };


  // Handle selection
  const handleSelectApplication = (id: string) => {
    setSelectedApplications(prev => 
      prev.includes(id) 
        ? prev.filter(appId => appId !== id)
        : [...prev, id]
    );
  };

  const handleSelectAllApplications = () => {
    if (selectedApplications.length === data.length) {
      setSelectedApplications([]);
    } else {
      setSelectedApplications(data.map(item => item._id));
    }
  };


  const handleViewFullDetails = (item: School | Application) => {
    const isApplication = 'applicationStatus' in item;
    if (isApplication) {
      // Navigate to school details with application ID
      if (item.school?._id) {
        router.push(`/admin/schools/${item.school._id}?ad=${item._id}`);
      } else {
        console.error('Application has no associated school ID');
      }
    } else {
      // Navigate to school details
      router.push(`/admin/schools/${item._id}`);
    }
  };

  
  

  if (applicationsError) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-center">
          <p className="text-red-600 mb-4">Error loading applications</p>
          <p className="text-sm text-gray-500">{JSON.stringify(applicationsError)}</p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow">
      {/* Tab Navigation */}
      <div className="border-b border-gray-200 bg-gray-50 p-4">
        <div className="mb-4">
          <h2 className="text-lg font-semibold text-gray-900">School Applications</h2>
        </div>
          <SchoolSearchBar placeholder="Search schools by name, principal, or address..." />

        <TabNavigation 
          currentTab={currentTab} 
          onTabChange={handleTabChange} 
        />
        
      </div>

      {/* Search and Actions */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex justify-between items-center">
          
          {selectedApplications.length > 0 && (
            <div className="flex space-x-2 ml-4">
              {currentTab === "applied" && (
                <>
                  <button
                    onClick={async () => {
                      await handleApproveSelected(selectedApplications);
                      await handleApproveSelectedWithUpdate();
                    }}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    Approve Selected ({selectedApplications.length})
                  </button>
                  <button
                    onClick={async () => {
                      await handleRejectSelected(selectedApplications);
                      await handleRejectSelectedWithUpdate();
                    }}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                  >
                    Reject Selected ({selectedApplications.length})
                  </button>
                </>
              )}
              {currentTab === "onboarded" && (
                <button
                  onClick={async () => {
                    await handleSendConfirmation(selectedApplications);
                    await handleSendConfirmationWithUpdate();
                  }}
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                >
                  Send Confirmation ({selectedApplications.length})
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Table */}
      <SchoolDataTable
        data={data}
        currentTab={currentTab}
        selectedApplications={selectedApplications}
        onSelectApplication={handleSelectApplication}
        onSelectAllApplications={handleSelectAllApplications}
        onViewFullDetails={handleViewFullDetails}
      />

      {/* Pagination */}
      <PaginationControls
        currentPage={page}
        totalPages={meta.totalPages}
        hasNextPage={meta.hasNextPage}
        hasPrevPage={meta.hasPrevPage}
        isLoading={isLoading}
        onPageChange={setPage}
      />


      {data.length === 0 && !isLoading && (
        <div className="text-center py-12">
          <p className="text-gray-500">No schools found for the current filter.</p>
        </div>
      )}
    </div>
  );
}
