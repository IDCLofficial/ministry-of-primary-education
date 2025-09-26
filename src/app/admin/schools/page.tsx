'use client'

import { useState } from 'react'
import DashboardLayout from '@/components/admin/DashboardLayout'
import StatsCards from '@/components/admin/StatsCards'
import SchoolsTable, { School } from '@/components/admin/SchoolsTable'
import PendingSchoolsTable from '@/components/admin/PendingSchoolsTable'
import SchoolDetailView from '@/components/admin/SchoolDetailView'
import ApplicationReview from '@/components/admin/ApplicationReview'
import { Button } from '@/components/ui'
import { updateSchoolStatus } from '@/lib/api'

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('not applied')
  const [selectedSchool, setSelectedSchool] = useState<School | null>(null)
  const [selectedPendingSchool, setSelectedPendingSchool] = useState<School | null>(null)
  const [selectedSchools, setSelectedSchools] = useState<string[]>([])
  const [isProcessing, setIsProcessing] = useState(false)
  const [notification, setNotification] = useState<{ type: 'success' | 'error', message: string } | null>(null)

  
  const handleSchoolClick = (school: School) => {
    setSelectedSchool(school)
  }
  
  const handlePendingSchoolClick = (school: School) => {
    console.log(school)
    setSelectedPendingSchool(school)
  }

  const handleBackToList = () => {
    setSelectedSchool(null)
    setSelectedPendingSchool(null)
  }

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

  // If a pending school is selected, show the application review
  if (selectedPendingSchool) {
    return (
      <DashboardLayout>
        <ApplicationReview school={selectedPendingSchool} onBack={handleBackToList} />
      </DashboardLayout>
    )
  }

  // If an approved school is selected, show the detail view
  if (selectedSchool) {
    return (
      <DashboardLayout>
        <SchoolDetailView school={selectedSchool} onBack={handleBackToList} />
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-gray-50">
        {/* Notification */}
        {notification && (
          <div className={`mx-6 mt-6 p-4 rounded-lg ${
            notification.type === 'success' 
              ? 'bg-green-50 text-green-800 border border-green-200' 
              : 'bg-red-50 text-red-800 border border-red-200'
          }`}>
            <div className="flex items-center">
              {notification.type === 'success' ? (
                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              ) : (
                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              )}
              <span>{notification.message}</span>
              <button 
                onClick={() => setNotification(null)}
                className="ml-auto text-gray-400 hover:text-gray-600"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          </div>
        )}
       
      

        {/* Main Content */}
        <div className="p-6">
          {/* Statistics Cards */}
          <StatsCards />

          {/* Schools Section */}
          <div className="mt-8">
            {/* Tab Navigation */}
            <div className="mb-6 bg-white p-2 w-fit">
              <div className="flex flex-wrap gap-1 bg-gray-100 p-1 rounded-lg w-fit">
                <button
                  onClick={() => setActiveTab('not applied')}
                  className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                    activeTab === 'not applied'
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-[#7D7D91] hover:text-gray-900'
                  }`}
                >
                  Not Applied
                </button>
                <button
                  onClick={() => setActiveTab('applied')}
                  className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                    activeTab === 'applied'
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-[#7D7D91] hover:text-gray-900'
                  }`}
                >
                  Applied
                </button>
                <button
                  onClick={() => setActiveTab('approved')}
                  className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                    activeTab === 'approved'
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-[#7D7D91] hover:text-gray-900'
                  }`}
                >
                  Approved
                </button>
                <button
                  onClick={() => setActiveTab('declined')}
                  className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                    activeTab === 'declined'
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-[#7D7D91] hover:text-gray-900'
                  }`}
                >
                  Declined
                </button>
                <button
                  onClick={() => setActiveTab('onboarded')}
                  className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                    activeTab === 'onboarded'
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-[#7D7D91] hover:text-gray-900'
                  }`}
                >
                  Onboarded
                </button>
                <button
                  onClick={() => setActiveTab('completed')}
                  className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                    activeTab === 'completed'
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-[#7D7D91] hover:text-gray-900'
                  }`}
                >
                  Completed
                </button>
              </div>
            </div>

            {/* Action Buttons for Applied Tab */}
            {activeTab === 'applied' && (
              <div className="mb-6 flex items-center gap-3">
                <Button 
                  color="blue" 
                  variant="primary"
                  onClick={handleApproveSelected}
                  disabled={selectedSchools.length === 0 || isProcessing}
                >
                  {isProcessing ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Processing...
                    </>
                  ) : (
                    `Approve (${selectedSchools.length})`
                  )}
                </Button>
                <Button 
                  color="red" 
                  variant="primary"
                  onClick={handleDeclineSelected}
                  disabled={selectedSchools.length === 0 || isProcessing}
                >
                  {isProcessing ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Processing...
                    </>
                  ) : (
                    `Decline (${selectedSchools.length})`
                  )}
                </Button>
                {selectedSchools.length > 0 && (
                  <span className="text-sm text-gray-600">
                    {selectedSchools.length} school{selectedSchools.length !== 1 ? 's' : ''} selected
                  </span>
                )}
              </div>
            )}

            {/* Schools Table */}
            <div className="bg-white rounded-lg shadow-sm mb-10">
              <SchoolsTable 
                activeTab={activeTab} 
                onSchoolClick={activeTab === 'approved' || activeTab === 'onboarded' || activeTab === 'completed' ? handleSchoolClick : handlePendingSchoolClick}
                showCheckboxes={activeTab === 'applied'}
                selectedSchools={selectedSchools}
                onSchoolSelect={handleSchoolSelect}
                onSelectAll={handleSelectAll}
              />
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
