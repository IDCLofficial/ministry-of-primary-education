import React from 'react'
import { AuthProvider } from '../providers/AuthProvider'
import ProtectedRoute from '../components/ProtectedRoute'
import { Toaster } from 'react-hot-toast'

interface DashboardLayoutProps {
  children: React.ReactNode
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <AuthProvider>
      <ProtectedRoute requireAuth={true}>
        <div className="min-h-screen bg-gray-50">
          {children}
          <Toaster 
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: '#363636',
                color: '#fff',
              },
              success: {
                duration: 3000,
                style: {
                  background: '#10B981',
                },
              },
              error: {
                duration: 5000,
                style: {
                  background: '#EF4444',
                },
              },
            }}
          />
        </div>
      </ProtectedRoute>
    </AuthProvider>
  )
}
