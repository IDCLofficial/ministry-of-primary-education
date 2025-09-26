import React from 'react'
import { AuthProvider } from '../providers/AuthProvider'
import ProtectedRoute from '../components/ProtectedRoute'

interface DashboardLayoutProps {
  children: React.ReactNode
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <AuthProvider>
      <ProtectedRoute requireAuth={true}>
        <div className="min-h-screen bg-gray-50">
          {children}
        </div>
      </ProtectedRoute>
    </AuthProvider>
  )
}
