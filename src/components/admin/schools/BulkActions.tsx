import { useState } from 'react'
import { Button } from '@/components/ui'

interface BulkActionsProps {
  selectedSchools: string[]
  onSelectionChange?: (schools: string[]) => void
  refetchSchools?: () => void
}

export default function BulkActions({ 
  selectedSchools, 
  onSelectionChange,
  refetchSchools
}: BulkActionsProps) {
  const [approving, setApproving] = useState(false)
  const [declining, setDeclining] = useState(false)
  const selectedCount = selectedSchools.length

  const handleApproveButton = async () => {
    if (selectedSchools.length === 0) {
      alert("Please select at least one school to approve.");
      return;
    }

    setApproving(true);
    try {
      // Update status for each selected school
      const updatePromises = selectedSchools.map(async (schoolId) => {
        const response = await fetch(
          `https://11cd2e67d06a.ngrok-free.app/applications/${schoolId}/status`,
          {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              status: "approved",
              reviewNotes: "Approved by admin",
            }),
          }
        );

     

        if (!response.ok) {
          throw new Error(
            `Failed to approve school ${schoolId}: ${response.statusText}`
          );
        }

        // Debugging raw response
        const raw = await response.text();
      

        return raw ? JSON.parse(raw) : {};
      });

      // Wait for all updates
      await Promise.all(updatePromises);

      // Clear selection
      onSelectionChange?.([]);

      alert(`Successfully approved ${selectedSchools.length} school(s)!`);

      // Trigger a re-fetch instead of reloading the page
      refetchSchools?.();
    } catch (error) {
      console.error("Error approving schools:", error);
      alert("Failed to approve some schools. Please try again.");
    } finally {
      setApproving(false);
    }
  };

  const handleDeclineButton = async () => {
    if (selectedSchools.length === 0) {
      alert("Please select at least one school to decline.");
      return;
    }

    setDeclining(true);
    try {
      // Update status for each selected school
      const updatePromises = selectedSchools.map(async (schoolId) => {
        const response = await fetch(
          `https://11cd2e67d06a.ngrok-free.app/applications/${schoolId}/status`,
          {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              status: "declined",
              reviewNotes: "Bulk declined by admin",
            }),
          }
        );

        console.log("Declining school:", schoolId);

        if (!response.ok) {
          throw new Error(
            `Failed to decline school ${schoolId}: ${response.statusText}`
          );
        }

        const raw = await response.text();
        console.log("Server response for", schoolId, ":", raw);

        return raw ? JSON.parse(raw) : {};
      });

      // Wait for all updates
      await Promise.all(updatePromises);

      // Clear selection
      onSelectionChange?.([]);

      alert(`Successfully declined ${selectedSchools.length} school(s)!`);

      // Trigger a re-fetch instead of reloading the page
      refetchSchools?.();
    } catch (error) {
      console.error("Error declining schools:", error);
      alert("Failed to decline some schools. Please try again.");
    } finally {
      setDeclining(false);
    }
  };

  return (
    <div className="mb-6 flex items-center gap-3">
      <Button 
        color="blue" 
        variant="primary"
        onClick={handleApproveButton}
        disabled={selectedCount === 0 || approving || declining}
      >
        {approving ? (
          <>
            <svg className="animate-spin -ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Approving...
          </>
        ) : (
          `Approve (${selectedCount})`
        )}
      </Button>
      
      <Button 
        color="red" 
        variant="primary"
        onClick={handleDeclineButton}
        disabled={selectedCount === 0 || approving || declining}
      >
        {declining ? (
          <>
            <svg className="animate-spin -ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Declining...
          </>
        ) : (
          `Decline (${selectedCount})`
        )}
      </Button>
      
      {selectedCount > 0 && (
        <span className="text-sm text-gray-600">
          {selectedCount} school{selectedCount !== 1 ? 's' : ''} selected
        </span>
      )}
    </div>
  )
}
