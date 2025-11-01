'use client'

import DashboardLayout from '@/app/admin/schools/components/DashboardLayout'
import StatsCards from '@/app/admin/schools/components/schools/StatsCards'


export default function AdminDashboard() {


  return (
    <DashboardLayout>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white shadow-sm border-b">
          <div className="px-6 py-4">
            <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
          </div>
        </div>

        {/* Main Content */}
        <div className="p-6">
          {/* Statistics Cards */}
          <StatsCards />
<div className="flex justify-center items-center h-50">
  <h1 className="text-2xl font-semibold text-gray-900">
    WELCOME ADMIN
  </h1>

</div>
        </div>
      </div>
    </DashboardLayout>
  )
}
