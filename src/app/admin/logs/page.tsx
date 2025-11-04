'use client'

export default function LogsPage() {
  return (
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white shadow-sm border-b">
          <div className="px-6 py-4">
            <h1 className="text-2xl font-semibold text-gray-900">Logs</h1>
            <p className="text-gray-600 mt-1">System activity and audit logs</p>
          </div>
        </div>

        {/* Main Content */}
        <div className="p-6">
          <div className="bg-white rounded-lg shadow-sm p-8 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">System Logs</h3>
            <p className="text-gray-600 mb-6">View and monitor system activities, user actions, and audit trails.</p>
            <button className="bg-gray-600 text-white px-6 py-2 rounded-lg hover:bg-gray-700 transition-colors">
              View Logs
            </button>
          </div>
        </div>
      </div>
  )
}
