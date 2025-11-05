'use client'

import React, { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from './AuthProvider'

interface ProtectedRouteProps {
    children: React.ReactNode
    redirectTo?: string
}

export default function ProtectedRoute({ children, redirectTo = '/portal/iirs' }: ProtectedRouteProps) {
    const { isAuthenticated, isLoading } = useAuth()
    const router = useRouter()

    useEffect(() => {
        // Only redirect if not loading and not authenticated
        if (!isLoading && !isAuthenticated) {
            router.replace(redirectTo)
        }
    }, [isAuthenticated, isLoading, router, redirectTo])

    // Show loading state while checking authentication
    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-50">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-green-600 mx-auto mb-4"></div>
                    <p className="text-gray-600 font-medium">Verifying authentication...</p>
                </div>
            </div>
        )
    }

    // Don't render children if not authenticated
    if (!isAuthenticated) {
        return null
    }

    // Render protected content
    return <>{children}</>
}