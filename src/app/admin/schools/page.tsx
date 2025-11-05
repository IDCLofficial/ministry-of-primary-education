'use client'

import StatsCards from '@/app/admin/schools/components/schools/StatsCards'
import NotificationBanner from '@/app/admin/schools/components/NotificationBanner'
import { useSchoolManagement } from '@/hooks/useSchoolManagement'
import SchoolTableRTK from '@/app/admin/schools/components/schools/SchoolTable'
import { AuthProvider } from '@/contexts/AuthContext'
import ProtectedRoute from '@/app/admin/schools/components/ProtectedRoute'
import { useActivityTimeout } from '@/hooks/useActivityTimeout'

function AdminDashboardContent() {
  
  // Initialize activity timeout (5 minutes of inactivity)
  useActivityTimeout({
    timeoutMinutes: 5,
    warningMinutes: 1,
    redirectPath: '/admin/systemlogin'
  });
  
  const {
    notification,
    clearNotification
  } = useSchoolManagement()


  return (
   
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
