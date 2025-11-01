import { useState } from 'react'
import { useUpdateApplicationStatusMutation } from '@/app/admin/schools/store/api/schoolsApi'

export function useSchoolManagement() {
  const [selectedSchools, setSelectedSchools] = useState<string[]>([])
  const [isProcessing, setIsProcessing] = useState(false)
  const [notification, setNotification] = useState<{ type: 'success' | 'error', message: string } | null>(null)
  const [updateApplicationStatus] = useUpdateApplicationStatusMutation()

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
      console.log('📤 Sending approve request for schools:', selectedSchools)
      
      const result = await updateApplicationStatus({
        appIds: selectedSchools,
        status: 'approved'
      }).unwrap()
      
      console.log('📥 API response received:', result)
      
      // RTK Query mutation succeeded
      setNotification({ 
        type: 'success', 
        message: `Successfully approved ${selectedSchools.length} school(s)` 
      })
      setSelectedSchools([])
      // RTK Query will automatically update the cache, no need to reload
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
      
      // RTK Query mutation succeeded
      setNotification({ 
        type: 'success', 
        message: `Successfully declined ${selectedSchools.length} school(s)` 
      })
      setSelectedSchools([])
      // RTK Query will automatically update the cache, no need to reload
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
