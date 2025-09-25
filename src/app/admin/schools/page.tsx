'use client'

import { useState } from 'react'
import DashboardLayout from '@/components/admin/DashboardLayout'
import StatsCards from '@/components/admin/StatsCards'
import SchoolsTable, { School, mockSchools } from '@/components/admin/SchoolsTable'
import PendingSchoolsTable from '@/components/admin/PendingSchoolsTable'
import SchoolDetailView from '@/components/admin/SchoolDetailView'
import ApplicationReview from '@/components/admin/ApplicationReview'

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('approved')
  const [selectedSchool, setSelectedSchool] = useState<School | null>(null)
  const [selectedPendingSchool, setSelectedPendingSchool] = useState<School | null>(null)

  const handleSchoolClick = (school: School) => {
    setSelectedSchool(school)
  }

  const handlePendingSchoolClick = (school: School) => {
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
       
      

        {/* Main Content */}
        <div className="p-6">
          {/* Statistics Cards */}
          <StatsCards />

          {/* Schools Section */}
          <div className="mt-8">
            {/* Tab Navigation */}
            <div className="mb-6 bg-white p-2 w-fit">
              <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg w-fit">
                <button
                  onClick={() => setActiveTab('approved')}
                  className={`px-6 py-2 w-fit text-sm font-medium rounded-md transition-colors ${
                    activeTab === 'approved'
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-[#7D7D91] hover:text-gray-900'
                  }`}
                >
                  Approved Schools
                </button>
                <button
                  onClick={() => setActiveTab('pending')}
                  className={`px-6 py-2 text-sm font-medium rounded-md transition-colors ${
                    activeTab === 'pending'
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-[#7D7D91] hover:text-gray-900'
                  }`}
                >
                  Pending Approvals
                </button>
              </div>
            </div>

            {/* Schools Table */}
            <div className="bg-white rounded-lg shadow-sm mb-10">
              {activeTab === 'approved' ? (
                <SchoolsTable activeTab={activeTab} onSchoolClick={handleSchoolClick} />
              ) : (
                <PendingSchoolsTable schools={mockSchools} onSchoolClick={handlePendingSchoolClick} />
              )}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
