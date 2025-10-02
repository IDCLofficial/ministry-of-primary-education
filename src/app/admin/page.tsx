'use client'

import { useState } from 'react'
import DashboardLayout from '@/components/admin/DashboardLayout'
import StatsCards from '@/components/admin/StatsCards'
import SchoolsTable from '@/components/admin/SchoolsTable'

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('approved')

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
