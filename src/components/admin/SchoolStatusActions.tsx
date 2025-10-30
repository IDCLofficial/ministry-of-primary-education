"use client";
import Swal from 'sweetalert2';
import { changeApplicationStatus } from '@/services/schoolService';

interface SchoolStatusActionsProps {
  onSuccess?: () => void;
  onError?: () => void;
  mutate?: (updater?: any, revalidate?: boolean) => void;
  mutateApproved?: (updater?: any, revalidate?: boolean) => void;
  refetchApps?: () => void;
  setSelectedApplications?: (apps: string[]) => void;
  setOpenDropdown?: (dropdown: string | null) => void;
}

export function useSchoolStatusActions({
  onSuccess,
  onError,
  mutate,
  mutateApproved,
  refetchApps,
  setSelectedApplications,
  setOpenDropdown
}: SchoolStatusActionsProps = {}) {

  // --- Approve One ---
  const handleApproveOne = async (appId: string) => {
    console.log(appId);
    const result = await Swal.fire({
      title: 'Confirm Approval',
      text: 'Are you sure you want to approve this school?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, approve it!'
    });

    if (result.isConfirmed) {
      // Show loading
      Swal.fire({
        title: 'Processing...',
        text: 'Approving application, please wait.',
        icon: 'info',
        allowOutsideClick: false,
        allowEscapeKey: false,
        showConfirmButton: false,
        didOpen: () => {
          Swal.showLoading();
        }
      });

      try {
        // Optimistic remove from applied
        if (mutate) {
          mutate((apps: any) => apps?.filter((a: any) => a._id !== appId), false);
        }

        const [updatedApp] = await changeApplicationStatus(appId, "approved");
        
        Swal.fire({
          title: 'Success!',
          text: 'Application approved successfully!',
          icon: 'success'
        });

        // Optimistic add to approved
        if (mutateApproved) {
          mutateApproved((apps: any) => [...(apps ?? []), updatedApp], false);
        }

        if (mutate) mutate();
        if (mutateApproved) mutateApproved();
        if (onSuccess) onSuccess();
      } catch (error) {
        console.error(error);
        Swal.fire({
          title: 'Error!',
          text: 'Failed to approve application. Please try again.',
          icon: 'error'
        });
        if (mutate) mutate();
        if (onError) onError();
      }
    }
  };

  // --- Approve Selected ---
  const handleApproveSelected = async (selectedApplications: string[]) => {
    const result = await Swal.fire({
      title: 'Confirm Approval',
      text: `Are you sure you want to approve ${selectedApplications.length} school${selectedApplications.length > 1 ? 's' : ''}?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, approve them!'
    });

    if (result.isConfirmed) {
      // Show loading
      Swal.fire({
        title: 'Processing...',
        text: 'Approving applications, please wait.',
        icon: 'info',
        allowOutsideClick: false,
        allowEscapeKey: false,
        showConfirmButton: false,
        didOpen: () => {
          Swal.showLoading();
        }
      });

      try {
        const updatedApps = await changeApplicationStatus(
          selectedApplications,
          "approved"
        );

        Swal.fire({
          title: 'Success!',
          text: `${selectedApplications.length} application(s) approved successfully!`,
          icon: 'success'
        });
        
        // Optimistic add
        if (mutateApproved) {
          mutateApproved((apps: any) => [...(apps ?? []), ...updatedApps], false);
        }
        // Optimistic remove
        if (mutate) {
          mutate(
            (apps: any) =>
              apps?.filter((a: any) => !selectedApplications.includes(a._id)) ?? [],
            false
          );
        }

        if (setSelectedApplications) setSelectedApplications([]);
        if (mutate) mutate();
        if (mutateApproved) mutateApproved();
        if (onSuccess) onSuccess();
      } catch (error) {
        console.error(error);
        Swal.fire({
          title: 'Error!',
          text: 'Failed to approve selected applications. Please try again.',
          icon: 'error'
        });
        if (mutate) mutate();
        if (onError) onError();
      }
    }
  };

  // --- Reject Selected ---
  const handleRejectSelected = async (selectedApplications: string[]) => {
    const result = await Swal.fire({
      title: 'Confirm Rejection',
      text: `Are you sure you want to reject ${selectedApplications.length} application${selectedApplications.length > 1 ? 's' : ''}?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, reject them!'
    });

    if (result.isConfirmed) {
      // Show loading
      Swal.fire({
        title: 'Processing...',
        text: 'Rejecting applications, please wait.',
        icon: 'info',
        allowOutsideClick: false,
        allowEscapeKey: false,
        showConfirmButton: false,
        didOpen: () => {
          Swal.showLoading();
        }
      });

      try {
        await changeApplicationStatus(selectedApplications, "rejected");
        
        Swal.fire({
          title: 'Success!',
          text: `${selectedApplications.length} application(s) rejected successfully!`,
          icon: 'success'
        });
        
        if (refetchApps) refetchApps();
        if (setSelectedApplications) setSelectedApplications([]);
        if (onSuccess) onSuccess();
      } catch (error) {
        console.error(error);
        Swal.fire({
          title: 'Error!',
          text: 'Failed to reject selected applications. Please try again.',
          icon: 'error'
        });
        if (onError) onError();
      }
    }
  };

  // --- Send Confirmation (Complete Selected) ---
  const handleSendConfirmation = async (selectedApplications: string[]) => {
    const result = await Swal.fire({
      title: 'Send Confirmation',
      text: `Are you sure you want to mark ${selectedApplications.length} school${selectedApplications.length > 1 ? 's' : ''} as completed?`,
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
        text: 'Sending confirmations, please wait.',
        icon: 'info',
        allowOutsideClick: false,
        allowEscapeKey: false,
        showConfirmButton: false,
        didOpen: () => {
          Swal.showLoading();
        }
      });

      try {
        await changeApplicationStatus(selectedApplications, "completed");
        
        Swal.fire({
          title: 'Success!',
          text: `${selectedApplications.length} school${selectedApplications.length > 1 ? 's' : ''} marked as completed successfully!`,
          icon: 'success'
        });
        
        if (refetchApps) refetchApps();
        if (setSelectedApplications) setSelectedApplications([]);
        if (onSuccess) onSuccess();
      } catch (error) {
        console.error(error);
        Swal.fire({
          title: 'Error!',
          text: 'Failed to send confirmations. Please try again.',
          icon: 'error'
        });
        if (onError) onError();
      }
    }
  };

  // --- Send Confirmation Single ---
  const handleSendConfirmationSingle = async (appId: string) => {
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
        await changeApplicationStatus(appId, "completed");
        
        Swal.fire({
          title: 'Success!',
          text: 'School marked as completed successfully!',
          icon: 'success'
        });
        
        if (refetchApps) refetchApps();
        if (setOpenDropdown) setOpenDropdown(null); // Close the dropdown
        if (onSuccess) onSuccess();
      } catch (error) {
        console.error(error);
        Swal.fire({
          title: 'Error!',
          text: 'Failed to send confirmation. Please try again.',
          icon: 'error'
        });
        if (onError) onError();
      }
    }
  };

  // --- Reject One ---
  const handleRejectOne = async (appId: string) => {
    const result = await Swal.fire({
      title: 'Confirm Rejection',
      text: 'Are you sure you want to reject this school application?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, reject it!'
    });

    if (result.isConfirmed) {
      // Show loading
      Swal.fire({
        title: 'Processing...',
        text: 'Rejecting application, please wait.',
        icon: 'info',
        allowOutsideClick: false,
        allowEscapeKey: false,
        showConfirmButton: false,
        didOpen: () => {
          Swal.showLoading();
        }
      });

      try {
        await changeApplicationStatus(appId, "rejected");
        
        Swal.fire({
          title: 'Success!',
          text: 'Application rejected successfully!',
          icon: 'success'
        });
        
        if (refetchApps) refetchApps();
        if (setOpenDropdown) setOpenDropdown(null);
        if (onSuccess) onSuccess();
      } catch (error) {
        console.error(error);
        Swal.fire({
          title: 'Error!',
          text: 'Failed to reject application. Please try again.',
          icon: 'error'
        });
        if (onError) onError();
      }
    }
  };

  return {
    handleApproveOne,
    handleApproveSelected,
    handleRejectSelected,
    handleSendConfirmation,
    handleSendConfirmationSingle,
    handleRejectOne
  };
}
