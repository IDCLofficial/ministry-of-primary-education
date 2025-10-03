'use client'

import { useState } from 'react'
import DashboardLayout from '@/components/admin/DashboardLayout'
import StatsCards from '@/components/admin/StatsCards'
import { School } from '@/services/schoolService'
import SchoolDetailView from '@/components/admin/SchoolDetailView'
import NotificationBanner from '@/components/admin/NotificationBanner'
import { useSchoolManagement } from '@/hooks/useSchoolManagement'
import SchoolTable from '@/components/admin/SchoolTable'

export default function AdminDashboard() {
  const [selectedSchool, setSelectedSchool] = useState<School | null>(null)
  const [selectedPendingSchool, setSelectedPendingSchool] = useState<School | null>(null)
  
  const {
    selectedSchools,
    isProcessing,
    notification,
    handleSchoolSelect,
    handleSelectAll,
    handleApproveSelected,
    handleDeclineSelected,
    clearNotification
  } = useSchoolManagement()

  
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

  // If a pending school is selected, show the application review
  if (selectedPendingSchool) {
    return (
      <DashboardLayout>
        <SchoolDetailView school={selectedPendingSchool} onBack={handleBackToList} />
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
        <NotificationBanner 
          notification={notification} 
          onClose={clearNotification} 
        />
       
      

        {/* Main Content */}
        <div className="p-6">
          {/* Statistics Cards */}
          <StatsCards />

          {/* Schools Section */}
          <div className="mt-8">
       

            {/* Schools Table */}
            <div className="mb-10">
              <SchoolTable/>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
