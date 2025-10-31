'use client'

import DashboardLayout from '@/components/admin/DashboardLayout'
import StatsCards from '@/components/admin/schools/StatsCards'
import NotificationBanner from '@/components/admin/NotificationBanner'
import { useSchoolManagement } from '@/hooks/useSchoolManagement'
import SchoolTableRTK from '@/components/admin/schools/SchoolTable'
import { AuthProvider } from '@/contexts/AuthContext'
import ProtectedRoute from '@/components/admin/ProtectedRoute'
import { useActivityTimeout } from '@/hooks/useActivityTimeout'

function AdminDashboardContent() {
  
  // Initialize activity timeout (5 minutes of inactivity)
  useActivityTimeout({
    timeoutMinutes: 5,
    warningMinutes: 1,
    redirectPath: '/admin/systemlogin'
  });
  
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
              <SchoolTableRTK/>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}

export default function AdminDashboard() {
  return (
    <AuthProvider>
      <ProtectedRoute>
        <AdminDashboardContent />
      </ProtectedRoute>
    </AuthProvider>
  )
}
