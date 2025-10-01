"use client";

import { useState } from "react";
import { useSchools } from "@/hooks/useSchools";
import { useApplications, Application } from "@/hooks/useApplications";
import { School } from "@/services/schoolService";
import { changeApplicationStatus } from "@/services/schoolService";
import { Button } from "../ui";
import Swal from "sweetalert2";
import SchoolDetailView from "./SchoolDetailView";
import ApplicationReview from "./ApplicationReview";

type Tab =
  | "notApplied"
  | "applied"
  | "approved"
  | "rejected"
  | "onboarded"
  | "completed"
  | "all";

export default function SchoolsTable() {
  const [currentTab, setCurrentTab] = useState<Tab>("notApplied");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedApplications, setSelectedApplications] = useState<string[]>([]);
  const [page, setPage] = useState(1);
  const limit = 20;
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [selectedSchool, setSelectedSchool] = useState<School | Application | null>(null);
  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null);
  const [showDetailView, setShowDetailView] = useState(false);
  const [showApplicationReview, setShowApplicationReview] = useState(false);

  // --- Schools ---
  const {
    schools,
    pagination,
    isLoading: loadingSchools,
    isError: errorSchools,
    refetch: refetchSchools,
  } = useSchools(
    page, 
    limit, 
    searchTerm, 
    currentTab === "notApplied" ? "not applied" : undefined
  );

  // --- Applications ---
  const {
    applications,
    isLoading: loadingApps,
    isError: errorApps,
    refetch: refetchApps,
    mutate, // 👈 add mutate
  } = useApplications(
    currentTab === "applied"
      ? "pending"
      : currentTab === "approved"
      ? "approved"
      : currentTab === "rejected"
      ? "rejected"
      : currentTab === "onboarded"
      ? "onboarded"
      : currentTab === "completed"
      ? "completed"
      : undefined,
    searchTerm
  );

  // 👇 separate hook for approved apps so we can update both tabs
  const { mutate: mutateApproved } = useApplications("approved", searchTerm);

  const isLoading = loadingSchools || loadingApps;
  const isError = errorSchools || errorApps;

  // Decide dataset and sort by newest first
  const data: (School | Application)[] =
    currentTab === "notApplied" || currentTab === "all"
      ? schools?.slice().sort((a, b) => new Date(b.createdAt || b.updatedAt || '').getTime() - new Date(a.createdAt || a.updatedAt || '').getTime()) || []
      : applications?.slice().sort((a, b) => new Date(b.createdAt || b.updatedAt || '').getTime() - new Date(a.createdAt || a.updatedAt || '').getTime()) || [];

  // Selection handlers
  const handleSelectApplication = (appId: string) => {
    setSelectedApplications((prev) =>
      prev.includes(appId)
        ? prev.filter((id) => id !== appId)
        : [...prev, appId]
    );
  };

  const handleSelectAllApplications = () => {
    if (currentTab === "applied") {
      const allAppIds = (data as Application[]).map((app) => app._id);
      setSelectedApplications((prev) =>
        prev.length === allAppIds.length ? [] : allAppIds
      );
    }
  };

  // --- Pagination handlers ---
  const handleNext = () => setPage((prev) => prev + 1);
  const handlePrev = () => page > 1 && setPage((prev) => prev - 1);

  const canGoNext = () => {
    if (currentTab === "notApplied" || currentTab === "all") {
      return pagination?.hasNextPage || false;
    }
    return applications.length === 20;
  };

  const canGoPrev = () => page > 1;

  const handleTabChange = (tab: Tab) => {
    setCurrentTab(tab);
    setSelectedApplications([]);
    setPage(1);
  };

  // Dropdown handlers
  const handleDropdownToggle = (id: string) => {
    setOpenDropdown(openDropdown === id ? null : id);
  };

  const handleViewDetails = (school: School) => {
    setSelectedSchool(school);
    setShowDetailView(true);
    setOpenDropdown(null);
  };

  const handleViewApplicationDetails = (app: Application) => {
    // For applied applications, show ApplicationReview; for others, show SchoolDetailView
    if (currentTab === "applied") {
      setSelectedApplication(app);
      setShowApplicationReview(true);
    } else {
      setSelectedSchool(app);
      setShowDetailView(true);
    }
    setOpenDropdown(null);
  };

  const handleBackFromDetail = () => {
    setShowDetailView(false);
    setSelectedSchool(null);
  };

  const handleBackFromApplicationReview = () => {
    setShowApplicationReview(false);
    setSelectedApplication(null);
  };

  // --- Approve One ---
  const handleApproveOne = async (appId: string) => {
    // Show confirmation modal
    const result = await Swal.fire({
      title: "Confirm Approval",
      text: "Are you sure you want to approve this school?",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Yes, approve it!",
      cancelButtonText: "No, cancel",
      confirmButtonColor: "#10B981",
      cancelButtonColor: "#EF4444",
    });

    // If user cancels, return early
    if (!result.isConfirmed) return;

    // Optimistic remove from applied
    mutate((apps) => apps?.filter((a) => a._id !== appId), false);

    try {
      const [updatedApp] = await changeApplicationStatus(appId, "approved");
      await Swal.fire({
        title: "Success!",
        text: "Application approved successfully!",
        icon: "success",
        confirmButtonText: "OK",
        confirmButtonColor: "#10B981",
      });

      // Optimistic add to approved
      mutateApproved((apps) => [...(apps ?? []), updatedApp], false);

      mutate();
      mutateApproved();
    } catch (error) {
      console.error(error);

      await Swal.fire({
        title: "Error!",
        text: "Failed to approve application. Please try again.",
        icon: "error",
        confirmButtonText: "OK",
        confirmButtonColor: "#EF4444",
      });

      mutate();
    }
  };

  // --- Approve Selected ---
  const handleApproveSelected = async () => {
    // Show confirmation modal with number of schools
    const result = await Swal.fire({
      title: "Confirm Approval",
      text: `Are you sure you want to approve ${selectedApplications.length} school${selectedApplications.length > 1 ? 's' : ''}?`,
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Yes, approve them!",
      cancelButtonText: "No, cancel",
      confirmButtonColor: "#10B981",
      cancelButtonColor: "#EF4444",
    });

    // If user cancels, return early
    if (!result.isConfirmed) return;

    try {
      const updatedApps = await changeApplicationStatus(
        selectedApplications,
        "approved"
      );

      await Swal.fire({
        title: "Success!",
        text: `${selectedApplications.length} application(s) approved successfully!`,
        icon: "success",
        confirmButtonText: "OK",
        confirmButtonColor: "#10B981",
      });
       // Optimistic add
       mutateApproved((apps) => [...(apps ?? []), ...updatedApps], false);
       // Optimistic remove
    mutate(
      (apps) =>
        apps?.filter((a) => !selectedApplications.includes(a._id)) ?? [],
      false
    );

      setSelectedApplications([]);
      mutate();
      mutateApproved();
    } catch (error) {
      console.error(error);

      await Swal.fire({
        title: "Error!",
        text: "Failed to approve selected applications. Please try again.",
        icon: "error",
        confirmButtonText: "OK",
        confirmButtonColor: "#EF4444",
      });

      mutate();
    }
  };

  // --- Reject Selected (unchanged) ---
  const handleRejectSelected = async () => {
    try {
      await changeApplicationStatus(selectedApplications, "rejected");
      await Swal.fire({
        title: "Success!",
        text: `${selectedApplications.length} application(s) rejected successfully!`,
        icon: "success",
        confirmButtonText: "OK",
        confirmButtonColor: "#10B981",
      });
      refetchApps();
      setSelectedApplications([]);
    } catch (error) {
      console.error(error);
      await Swal.fire({
        title: "Error!",
        text: "Failed to reject selected applications. Please try again.",
        icon: "error",
        confirmButtonText: "OK",
        confirmButtonColor: "#EF4444",
      });
    }
  };

  // Show application review if selected (for applied tab)
  if (showApplicationReview && selectedApplication) {
    return (
      <ApplicationReview 
        application={selectedApplication} 
        onBack={handleBackFromApplicationReview}
        onApprove={async (appId: string) => {
          const result = await Swal.fire({
            title: "Confirm Approval",
            text: "Are you sure you want to approve this school?",
            icon: "question",
            showCancelButton: true,
            confirmButtonText: "Yes, approve it!",
            cancelButtonText: "No, cancel",
            confirmButtonColor: "#10b981",
            cancelButtonColor: "#6b7280",
          });

          if (result.isConfirmed) {
            try {
              await changeApplicationStatus(appId, "approved");
              await refetchApps();
              setShowApplicationReview(false);
              setSelectedApplication(null);
              Swal.fire("Approved!", "The school has been approved successfully.", "success");
            } catch (error) {
              console.error("Error approving application:", error);
              Swal.fire("Error!", "Failed to approve the application.", "error");
            }
          }
        }}
        onDeny={async (appId: string) => {
          // Handle deny logic here
          const result = await Swal.fire({
            title: "Confirm Denial",
            text: "Are you sure you want to deny this application?",
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "Yes, deny it!",
            cancelButtonText: "No, cancel",
            confirmButtonColor: "#ef4444",
            cancelButtonColor: "#6b7280",
          });

          if (result.isConfirmed) {
            try {
              await changeApplicationStatus(appId, "rejected");
              await refetchApps();
              setShowApplicationReview(false);
              setSelectedApplication(null);
              Swal.fire("Denied!", "The application has been denied.", "success");
            } catch (error) {
              console.error("Error denying application:", error);
              Swal.fire("Error!", "Failed to deny the application.", "error");
            }
          }
        }}
      />
    );
  }

  // Show detail view if selected
  if (showDetailView && selectedSchool) {
    return (
      <SchoolDetailView 
        school={selectedSchool} 
        onBack={handleBackFromDetail} 
      />
    );
  }

  return (
    <div className="p-4">
      {/* 🔖 Tabs */}
      <div className="mb-6 bg-white p-2 w-fit">
        <div className="flex flex-wrap gap-1 bg-gray-100 p-1 rounded-lg w-fit">
          <button
            onClick={() => handleTabChange("notApplied")}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
              currentTab === "notApplied"
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-[#7D7D91] hover:text-gray-900'
            }`}
          >
            Not Applied
          </button>
          <button
            onClick={() => handleTabChange("applied")}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
              currentTab === "applied"
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-[#7D7D91] hover:text-gray-900'
            }`}
          >
            Applied
          </button>
          <button
            onClick={() => handleTabChange("approved")}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
              currentTab === "approved"
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-[#7D7D91] hover:text-gray-900'
            }`}
          >
            Approved
          </button>
          <button
            onClick={() => handleTabChange("rejected")}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
              currentTab === "rejected"
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-[#7D7D91] hover:text-gray-900'
            }`}
          >
            Rejected
          </button>
          <button
            onClick={() => handleTabChange("onboarded")}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
              currentTab === "onboarded"
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-[#7D7D91] hover:text-gray-900'
            }`}
          >
            Onboarded
          </button>
          <button
            onClick={() => handleTabChange("completed")}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
              currentTab === "completed"
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-[#7D7D91] hover:text-gray-900'
            }`}
          >
            Completed
          </button>
          <button
            onClick={() => handleTabChange("all")}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
              currentTab === "all"
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-[#7D7D91] hover:text-gray-900'
            }`}
          >
            All
          </button>
        </div>
      </div>

      {/* 🔎 Search */}
      <div className="flex gap-2 mb-4">
        <input
          type="text"
          placeholder="Search for a S..."
          className="border p-2 rounded w-1/3"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
    
      </div>

      {/* Selection Actions for Applied Tab */}
      {currentTab === "applied" && (
        <div className="flex gap-2 mb-4 items-center">
          <span className="text-sm text-gray-600">
            {selectedApplications.length} of {data.length} selected
          </span>
          {selectedApplications.length > 0 && (
            <>
              <button 
                className="bg-green-500 text-white px-3 py-2 rounded-md text-sm font-medium hover:bg-green-600 transition-colors" 
                onClick={handleApproveSelected}
              >
                Approve Selected ({selectedApplications.length})
              </button>
              <button 
                className="bg-red-500 text-white px-3 py-2 rounded-md text-sm font-medium hover:bg-red-600 transition-colors" 
                onClick={handleRejectSelected}
              >
                Reject Selected ({selectedApplications.length})
              </button>
            </>
          )}
        </div>
      )}

      {/* 📋 Table */}
      {isError ? (
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <div className="text-red-600 text-lg font-medium mb-2">Failed to load data</div>
          <p className="text-red-500 text-sm">Please try refreshing the page or contact support if the problem persists.</p>
        </div>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  {currentTab === "applied" && (
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      <input
                        type="checkbox"
                        checked={selectedApplications.length === data.length && data.length > 0}
                        ref={(input) => {
                          if (input) input.indeterminate = selectedApplications.length > 0 && selectedApplications.length < data.length
                        }}
                        onChange={handleSelectAllApplications}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                    </th>
                  )}
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    School Name
                    <svg className="inline w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l4-4 4 4m0 6l-4 4-4-4" />
                    </svg>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Location
                    <svg className="inline w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l4-4 4 4m0 6l-4 4-4-4" />
                    </svg>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Principal
                    <svg className="inline w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l4-4 4 4m0 6l-4 4-4-4" />
                    </svg>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                    <svg className="inline w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l4-4 4 4m0 6l-4 4-4-4" />
                    </svg>
                  </th>
                  <th className="relative px-6 py-3">
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {isLoading ? (
                  // Loading skeleton rows
                  Array.from({ length: 8 }).map((_, index) => (
                    <tr key={`skeleton-${index}`} className="animate-pulse">
                      {currentTab === "applied" && (
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="w-4 h-4 bg-gray-200 rounded"></div>
                        </td>
                      )}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="w-5 h-5 bg-gray-200 rounded"></div>
                      </td>
                    </tr>
                  ))
                ) : data.length === 0 ? (
                  <tr>
                    <td colSpan={currentTab === "applied" ? 6 : 5} className="px-6 py-12 text-center">
                      <div className="text-gray-500">
                        <div className="text-lg font-medium mb-2">No data found</div>
                        <p className="text-sm">Try adjusting your search terms or check back later.</p>
                      </div>
                    </td>
                  </tr>
                ) : currentTab === "notApplied" || currentTab === "all" ? (
                  (data as School[]).map((school) => (
                    <tr key={school._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {school.schoolName}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {school.address}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {school.principal}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          school.status === 'approved' 
                            ? 'bg-green-100 text-green-800'
                            : school.status === 'applied' || school.status === 'pending'
                            ? 'bg-yellow-100 text-yellow-800'
                            : school.status === 'rejected'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {school.status === 'not applied' ? 'Not Applied' : 
                           school.status === 'applied' ? 'Applied' :
                           school.status === 'approved' ? 'Approved' :
                           school.status === 'rejected' ? 'Rejected' : school.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="relative">
                          <button 
                            className="text-gray-400 hover:text-gray-600"
                            onClick={() => handleDropdownToggle(school._id)}
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                            </svg>
                          </button>
                          
                          {openDropdown === school._id && (
                            <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10 border border-gray-200">
                              <div className="py-1">
                                <button
                                  onClick={() => handleViewDetails(school)}
                                  className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                                >
                                  View Full Details
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  console.log('Applications data:', data),
                  (data as Application[]).map((app) => (
                    <tr key={app._id} className="hover:bg-gray-50">
                      {currentTab === "applied" && (
                        <td className="px-6 py-4 whitespace-nowrap">
                          <input
                            type="checkbox"
                            checked={selectedApplications.includes(app._id)}
                            onChange={() => handleSelectApplication(app._id)}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                          />
                        </td>
                      )}
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {app.schoolName}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {app.address}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {app.principal}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          app.applicationStatus === 'approved' 
                            ? 'bg-green-100 text-green-800'
                            : app.applicationStatus === 'pending'
                            ? 'bg-yellow-100 text-yellow-800'
                            : app.applicationStatus === 'rejected'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {app.applicationStatus === 'pending' ? 'Applied' :
                           app.applicationStatus === 'approved' ? 'Approved' :
                           app.applicationStatus === 'rejected' ? 'Rejected' : app.applicationStatus}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="relative">
                          <button 
                            className="text-gray-400 hover:text-gray-600"
                            onClick={() => handleDropdownToggle(app._id)}
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                            </svg>
                          </button>
                          
                          {openDropdown === app._id && (
                            <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10 border border-gray-200">
                              <div className="py-1 flex flex-col">
                                <button
                                  onClick={() => handleViewApplicationDetails(app)}
                                  className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                                >
                                  View Full Details
                                </button>
                                {currentTab === "applied" && (
                                  <>
                                    <button
                                      onClick={() => handleApproveOne(app._id)}
                                      className="w-full text-left px-4 py-2 text-sm text-green-700 hover:bg-green-50 hover:text-green-900"
                                    >
                                      Approve Application
                                    </button>
                                  </>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* 📌 Pagination controls */}
          {(data.length > 0 || isLoading) && (
            <div className="flex justify-between items-center mt-4">
              <Button
                variant="outline"
                disabled={isLoading || !canGoPrev()}
                onClick={handlePrev}
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin"></div>
                    Previous
                  </div>
                ) : (
                  "Previous"
                )}
              </Button>
              <span className="text-gray-600">
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-gray-200 rounded animate-pulse"></div>
                    Loading...
                  </div>
                ) : (
                  <>
                    Page {page}
                    {pagination && ` of ${pagination.totalPages}`}
                  </>
                )}
              </span>
              <Button
                variant="outline"
                disabled={isLoading || !canGoNext()}
                onClick={handleNext}
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin"></div>
                    Next
                  </div>
                ) : (
                  "Next"
                )}
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
