'use client'

import React, { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '../providers/AuthProvider'

interface ProtectedRouteProps {
  children: React.ReactNode
  requireAuth?: boolean
}

export default function ProtectedRoute({ children, requireAuth = true }: ProtectedRouteProps) {
  const { isAuthenticated, isLoading, isNavigating, loggingOut } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (loggingOut || isNavigating) return
    if (!isLoading && requireAuth && !isAuthenticated) {
      router.replace('/portal')
    }
  }, [isAuthenticated, isLoading, isNavigating, requireAuth, router, loggingOut])

  // Show spinner during initial auth check or post-login navigation
  if (isLoading || isNavigating) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  // Render nothing while redirect is pending
  if (requireAuth && !isAuthenticated) {
    return null
  }

  return <>{children}</>
}