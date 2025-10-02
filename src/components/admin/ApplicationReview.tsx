'use client'

import { School } from './SchoolsTable'

interface ApplicationReviewProps {
  school: School
  onBack: () => void
}

export default function ApplicationReview({ school, onBack }: ApplicationReviewProps) {
  const handleDenyApplication = () => {
    // Handle deny logic here
    console.log('Denying application for:', school.name)
  }

  const handleApproveApplication = () => {
    // Handle approve logic here
    console.log('Approving application for:', school.name)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={onBack}
                className="flex items-center text-gray-600 hover:text-gray-900"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Application Review
              </button>
            </div>
            <div className="flex space-x-3">
              <button 
                onClick={handleDenyApplication}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Deny Application
              </button>
              <button 
                onClick={handleApproveApplication}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Approve Application
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Submitted Data */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Submitted Data</h3>
            
            <div className="space-y-6">
              <div>
                <div className="text-lg font-medium text-gray-900">{school.name}</div>
                <div className="text-sm text-gray-500">School Name</div>
              </div>

              <div>
                <div className="text-sm text-gray-900">{school.address}</div>
                <div className="text-sm text-gray-500">Address</div>
              </div>

              <div>
                <div className="text-sm text-gray-900">{school.uniqueCode}</div>
                <div className="text-sm text-gray-500">Unique Code</div>
              </div>

              <div>
                <div className="text-sm text-gray-900">{school.principal}</div>
                <div className="text-sm text-gray-500">Principal</div>
              </div>

              <div>
                <div className="text-sm text-gray-900">{school.email}</div>
                <div className="text-sm text-gray-500">Contact Email</div>
              </div>

              <div>
                <div className="text-sm text-gray-900">{school.phone}</div>
                <div className="text-sm text-gray-500">Contact Phone</div>
              </div>

              <div>
                <div className="text-sm text-gray-900">{school.students.length}</div>
                <div className="text-sm text-gray-500">Students Declared</div>
              </div>
            </div>
          </div>

          {/* System School Data */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">System School Data</h3>
            
            <div className="space-y-6">
              <div>
                <div className="text-sm text-gray-900">{school.uniqueCode}</div>
                <div className="text-sm text-gray-500">Unique Code</div>
              </div>

              <div>
                <div className="text-sm text-gray-900">{school.name}</div>
                <div className="text-sm text-gray-500">Registered Name</div>
              </div>

              <div>
                <div className="text-sm text-gray-900">{school.email.replace('@schoolmail.com', '@edu.ng')}</div>
                <div className="text-sm text-gray-500">Official Contact</div>
              </div>

              <div>
                <div className="text-sm text-gray-900">12,000</div>
                <div className="text-sm text-gray-500">Students In Our Database</div>
              </div>
            </div>
          </div>
        </div>

        {/* Application Details */}
        <div className="mt-8 bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Application Details</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <div className="text-sm text-gray-900">APP-{String(school.id).padStart(4, '0')}</div>
              <div className="text-sm text-gray-500">Application ID</div>
            </div>

            <div>
              <div className="text-sm text-gray-900">{school.applicationDate}</div>
              <div className="text-sm text-gray-500">Application Date</div>
            </div>

            <div>
              <div className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">
                Pending
              </div>
              <div className="text-sm text-gray-500 mt-1">Current Status</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
