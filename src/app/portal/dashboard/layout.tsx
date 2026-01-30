import React from 'react'
import { AuthProvider } from '../providers/AuthProvider'
import ProtectedRoute from '../components/ProtectedRoute'
import NextTopLoader from 'nextjs-toploader';

interface DashboardLayoutProps {
  children: React.ReactNode
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <AuthProvider>
      <ProtectedRoute requireAuth={true}>
        <div className="min-h-screen bg-gray-50">
          <NextTopLoader color="lab(30.797% -29.6927 17.382)" showSpinner={false} speed={300} />
          {children}
        </div>
      </ProtectedRoute>
    </AuthProvider>
  )
}
