'use client'

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useGetAdminProfileQuery } from '../store/api/authApi'
import {
  getSecureItem,
  setSecureItem,
  removeSecureItem,
  setExamPortalToken,
} from '@/app/result-checking/utils/secureStorage'

interface Admin {
  _id: string
  email: string
  percentage: number
  isActive: boolean
  lastLogin: string
  adminType: string
  createdAt: string
  updatedAt: string
  __v: number
}

interface BeceAuthContextType {
  isAuthenticated: boolean
  admin: Admin | null
  token: string | null
  login: (token: string, admin: Admin) => void
  logout: () => void
  isLoading: boolean
  refreshProfile: () => void
}

const BeceAuthContext = createContext<BeceAuthContextType | undefined>(undefined)

interface BeceAuthProviderProps {
  children: React.ReactNode
}

export function BeceAuthProvider({ children }: BeceAuthProviderProps) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [admin, setAdmin] = useState<Admin | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [skipProfileQuery, setSkipProfileQuery] = useState(true);
  const [hasHandledProfileError, setHasHandledProfileError] = useState(false);
  const router = useRouter();

  // Profile query - only runs when we have a token
  const { data: profileData, error: profileError, refetch: refetchProfile } = useGetAdminProfileQuery(undefined, {
    skip: skipProfileQuery || !token,
  })

  // Check for existing authentication on mount (encrypted storage)
  useEffect(() => {
    let cancelled = false
    Promise.all([
      getSecureItem('bece_access_token'),
      getSecureItem('bece_admin'),
    ])
      .then(([storedToken, storedAdmin]) => {
        if (cancelled) return
        if (storedToken) {
          setToken(storedToken)
          setExamPortalToken(storedToken)
          setSkipProfileQuery(false)
          if (storedAdmin) {
            try {
              const parsedAdmin = JSON.parse(storedAdmin) as Admin
              setAdmin(parsedAdmin)
              setIsAuthenticated(true)
            } catch {
              // ignore parse error
            }
          }
        }
      })
      .catch((error) => {
        if (!cancelled) {
          console.error('Error checking BECE authentication:', error)
          removeSecureItem('bece_access_token')
          removeSecureItem('bece_admin')
          setExamPortalToken(null)
        }
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false)
      })
    return () => { cancelled = true }
  }, [])

  const logout = useCallback(() => {
    removeSecureItem('bece_access_token')
    removeSecureItem('bece_admin')
    setExamPortalToken(null)
    setToken(null)
    setAdmin(null)
    setIsAuthenticated(false)
    setSkipProfileQuery(true)
    setHasHandledProfileError(false)
    router.replace('/exam-portal')
  }, [router])

  // Handle profile data updates
  useEffect(() => {
    if (profileData && token) {
      setAdmin(profileData.admin)
      setIsAuthenticated(true)
      setHasHandledProfileError(false) // Reset error flag on success
      // Update encrypted storage with fresh profile data
      setSecureItem('bece_admin', JSON.stringify(profileData.admin)).then(() => {})
    } else if (profileError && token && !hasHandledProfileError) {
      // Only handle profile errors once and if we actually have a token
      setHasHandledProfileError(true)
      
      // Check if it's an authentication error (401/403)
      const isAuthError = 'status' in profileError && 
        (profileError.status === 401 || profileError.status === 403)
      
      if (isAuthError) {
        console.warn('BECE: Authentication token invalid or expired, logging out...')
        logout()
      } else {
        // For non-auth errors (network issues, etc.), just log but don't logout
        console.warn('BECE: Profile fetch failed (non-auth error), using cached data')
      }
    }
  }, [profileData, profileError, token, logout, hasHandledProfileError])

  const login = (newToken: string, newAdmin: Admin) => {
    setSecureItem('bece_access_token', newToken).then(() => {})
    setSecureItem('bece_admin', JSON.stringify(newAdmin)).then(() => {})
    setExamPortalToken(newToken)
    setToken(newToken)
    setAdmin(newAdmin)
    setIsAuthenticated(true)
    setSkipProfileQuery(false)
    setHasHandledProfileError(false)
  }

  const refreshProfile = () => {
    if (token && refetchProfile) {
      refetchProfile()
    }
  }

  const value: BeceAuthContextType = {
    isAuthenticated,
    admin,
    token,
    login,
    logout,
    isLoading,
    refreshProfile
  }

  return (
    <BeceAuthContext.Provider value={value}>
      {children}
    </BeceAuthContext.Provider>
  )
}

export function useBeceAuth() {
  const context = useContext(BeceAuthContext)
  if (context === undefined) {
    throw new Error('useBeceAuth must be used within a BeceAuthProvider')
  }
  return context
}
