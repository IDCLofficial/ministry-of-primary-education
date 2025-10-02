'use client'

import React from 'react'
import BeceProtectedRoute from '../components/ProtectedRoute'
import { useBeceAuth } from '../providers/AuthProvider'

export default function BeceDashboardPage() {
  const { admin, logout } = useBeceAuth()

  return (
    <BeceProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center">
                <h1 className="text-xl font-semibold text-gray-900">
                  BECE Admin Dashboard
                </h1>
              </div>
              <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-600">
                  Welcome, {admin?.email}
                </span>
                <button
                  onClick={logout}
                  className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200"
                >
                  Logout
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="px-4 py-6 sm:px-0">
            <div className="border-4 border-dashed border-gray-200 rounded-lg p-8">
              <div className="text-center">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  BECE Administration Portal
                </h2>
                <p className="text-gray-600 mb-6">
                  Welcome to the Basic Education Certificate Examination administration dashboard.
                </p>
                
                {/* Admin Info Card */}
                <div className="bg-white rounded-lg shadow p-6 max-w-md mx-auto">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Admin Information</h3>
                  <div className="space-y-2 text-left">
                    <p><span className="font-medium">Email:</span> {admin?.email}</p>
                    <p><span className="font-medium">Admin Type:</span> {admin?.adminType}</p>
                    <p><span className="font-medium">Percentage:</span> {admin?.percentage}%</p>
                    <p><span className="font-medium">Last Login:</span> {admin?.lastLogin ? new Date(admin.lastLogin).toLocaleString() : 'Never'}</p>
                    <p><span className="font-medium">Status:</span> 
                      <span className={`ml-2 px-2 py-1 rounded-full text-xs ${
                        admin?.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {admin?.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </p>
                  </div>
                </div>

                {/* Placeholder for future features */}
                <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-white rounded-lg shadow p-4">
                    <h4 className="font-medium text-gray-900">Schools</h4>
                    <p className="text-sm text-gray-600">Manage registered schools</p>
                  </div>
                  <div className="bg-white rounded-lg shadow p-4">
                    <h4 className="font-medium text-gray-900">Students</h4>
                    <p className="text-sm text-gray-600">View student registrations</p>
                  </div>
                  <div className="bg-white rounded-lg shadow p-4">
                    <h4 className="font-medium text-gray-900">Examinations</h4>
                    <p className="text-sm text-gray-600">Manage BECE examinations</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </BeceProtectedRoute>
  )
}
