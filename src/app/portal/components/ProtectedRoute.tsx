'use client'

import React, { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '../providers/AuthProvider'
import CreatePasswordForm from '@/components/CreatePasswordForm'

interface ProtectedRouteProps {
  children: React.ReactNode
  requireAuth?: boolean
}

export default function ProtectedRoute({ children, requireAuth = true }: ProtectedRouteProps) {
  const { isAuthenticated, isLoading, school, loggingOut } = useAuth()

  useEffect(()=>{
    console.log("Auth state changed", isAuthenticated);
  }, [isAuthenticated])
  const router = useRouter()

  useEffect(() => {
    if (loggingOut) return;
    if (!isLoading && requireAuth) {
      if (!isAuthenticated) {

        console.log('Not authenticated, redirecting to login', {
          isAuthenticated,
          isLoading,
          requireAuth,
        })
        // Not authenticated, redirect to login
        router.replace('/portal')
      }
    }
  }, [isAuthenticated, isLoading, requireAuth, router, loggingOut])

  // Show loading spinner while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  // If authentication is required but user is not authenticated, show nothing (redirect will happen)
  if (requireAuth && !isAuthenticated) {
    return null
  }

  if (school?.isFirstLogin) {
    return (
      <div className="min-h-screen grid place-items-center bg-[#F3F3F3]">
        <div className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8">

          <CreatePasswordForm
            school={school.email}
          />
        </div>
      </div>
    )
  }

  return <>{children}</>
}
