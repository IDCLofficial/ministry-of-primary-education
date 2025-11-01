'use client'

import DashboardLayout from '@/app/admin/schools/admin/DashboardLayout'

export default function DigitizationPage() {
  return (
    <DashboardLayout>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white shadow-sm border-b">
          <div className="px-6 py-4">
            <h1 className="text-2xl font-semibold text-gray-900">Digitization</h1>
            <p className="text-gray-600 mt-1">Digital transformation and record management</p>
          </div>
        </div>

        {/* Main Content */}
        <div className="p-6">
          <div className="bg-white rounded-lg shadow-sm p-8 text-center">
            <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Digital Records Management</h3>
            <p className="text-gray-600 mb-6">Digitize and manage educational records, documents, and administrative processes.</p>
            <button className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition-colors">
              Start Digitization
            </button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
