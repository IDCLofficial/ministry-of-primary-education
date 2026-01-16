'use client'

import React, { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useBeceAuth } from '../providers/AuthProvider'

interface ProtectedRouteProps {
  children: React.ReactNode
  requireAuth?: boolean
}

export default function BeceProtectedRoute({ children, requireAuth = true }: ProtectedRouteProps) {
  const { isAuthenticated, isLoading } = useBeceAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && requireAuth) {
      if (!isAuthenticated) {
        // Not authenticated, redirect to BECE login
        router.replace('/bece-portal')
      }
    }
  }, [isAuthenticated, isLoading, requireAuth, router])

  // Show loading spinner while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading admin portal...</p>
        </div>
      </div>
    )
  }

  // If authentication is required but user is not authenticated, show nothing (redirect will happen)
  if (requireAuth && !isAuthenticated) {
    return null
  }

  return <>{children}</>
}
