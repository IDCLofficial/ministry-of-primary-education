'use client'

import React from 'react'
import { useAuth } from '../../providers/AuthProvider'
import Image from 'next/image'

export default function DashboardHeader() {
  const { school, logout } = useAuth()

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo and Title */}
          <div className="flex items-center gap-3">
            <Image
              src="/images/ministry-logo.png"
              alt="Ministry Logo"
              width={32}
              height={32}
              className="object-contain"
            />
            <div>
              <h1 className="text-lg font-semibold text-gray-900">IMMoE Dashboard</h1>
              {school && (
                <p className="text-sm text-gray-600">{school.schoolName}</p>
              )}
            </div>
          </div>

          {/* User Info and Actions */}
          <div className="flex items-center gap-4">
            {school && (
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">{school.schoolName}</p>
                <p className="text-xs text-gray-500">Code: {school.schoolCode}</p>
              </div>
            )}
            
            <button
              onClick={logout}
              className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              Logout
            </button>
          </div>
        </div>
      </div>
    </header>
  )
}
