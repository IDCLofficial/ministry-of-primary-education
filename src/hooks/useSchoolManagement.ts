import { useState } from 'react'
import { updateSchoolStatus } from '@/lib/api'
import { School } from '@/components/admin/SchoolsTable2'

export function useSchoolManagement() {
  const [selectedSchools, setSelectedSchools] = useState<string[]>([])
  const [isProcessing, setIsProcessing] = useState(false)
  const [notification, setNotification] = useState<{ type: 'success' | 'error', message: string } | null>(null)

  const handleSchoolSelect = (schoolId: string, isSelected: boolean) => {
    if (isSelected) {
      setSelectedSchools(prev => [...prev, schoolId])
    } else {
      setSelectedSchools(prev => prev.filter(id => id !== schoolId))
    }
  }

  const handleSelectAll = (schoolIds: string[], isSelected: boolean) => {
    if (isSelected) {
      setSelectedSchools(schoolIds)
    } else {
      setSelectedSchools([])
    }
  }

  const handleApproveSelected = async () => {
    if (selectedSchools.length === 0) return
    
    console.log('🚀 Approve button clicked with selected schools:', selectedSchools)
    
    setIsProcessing(true)
    setNotification(null)
    
    try {
      const promises = selectedSchools.map(schoolId => {
        console.log('📤 Sending approve request for school ID:', schoolId)
        return updateSchoolStatus(schoolId, { 
          status: 'approved',
          reviewNotes: 'Approved by admin'
        })
      })
      
      const results = await Promise.all(promises)
      console.log('📥 All API responses received:', results)
      
      const failedUpdates = results.filter(result => !result.success)
      console.log('❌ Failed updates:', failedUpdates)
      
      if (failedUpdates.length === 0) {
        setNotification({ 
          type: 'success', 
          message: `Successfully approved ${selectedSchools.length} school(s)` 
        })
        setSelectedSchools([])
        // Refresh the page to show updated data
        window.location.reload()
      } else {
        setNotification({ 
          type: 'error', 
          message: `Failed to approve ${failedUpdates.length} school(s)` 
        })
      }
    } catch (error) {
      console.error('Error approving schools:', error)
      setNotification({ 
        type: 'error', 
        message: 'Failed to approve schools. Please try again.' 
      })
    } finally {
      setIsProcessing(false)
    }
  }

  const handleDeclineSelected = async () => {
    if (selectedSchools.length === 0) return
    
    setIsProcessing(true)
    setNotification(null)
    
    try {
      const promises = selectedSchools.map(schoolId => 
        updateSchoolStatus(schoolId, { 
          status: 'declined',
          reviewNotes: 'Bulk declined by admin'
        })
      )
      
      const results = await Promise.all(promises)
      const failedUpdates = results.filter(result => !result.success)
      
      if (failedUpdates.length === 0) {
        setNotification({ 
          type: 'success', 
          message: `Successfully declined ${selectedSchools.length} school(s)` 
        })
        setSelectedSchools([])
        // Refresh the page to show updated data
        window.location.reload()
      } else {
        setNotification({ 
          type: 'error', 
          message: `Failed to decline ${failedUpdates.length} school(s)` 
        })
      }
    } catch (error) {
      console.error('Error declining schools:', error)
      setNotification({ 
        type: 'error', 
        message: 'Failed to decline schools. Please try again.' 
      })
    } finally {
      setIsProcessing(false)
    }
  }

  const clearNotification = () => {
    setNotification(null)
  }

  return {
    selectedSchools,
    isProcessing,
    notification,
    handleSchoolSelect,
    handleSelectAll,
    handleApproveSelected,
    handleDeclineSelected,
    clearNotification
  }
}
