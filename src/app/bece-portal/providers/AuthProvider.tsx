'use client'

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useGetAdminProfileQuery } from '../store/api/authApi'

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

  // Check for existing authentication on mount
  useEffect(() => {
    const checkAuth = () => {
      try {
        const storedToken = localStorage.getItem('bece_access_token')
        const storedAdmin = localStorage.getItem('bece_admin')

        if (storedToken) {
          setToken(storedToken)
          setSkipProfileQuery(false) // Enable profile query
          
          if (storedAdmin) {
            const parsedAdmin = JSON.parse(storedAdmin) as Admin
            setAdmin(parsedAdmin)
            setIsAuthenticated(true)
          }
        }
      } catch (error) {
        console.error('Error checking BECE authentication:', error)
        // Clear invalid data
        localStorage.removeItem('bece_access_token')
        localStorage.removeItem('bece_admin')
      } finally {
        setIsLoading(false)
      }
    }

    checkAuth()
  }, [])

  const logout = useCallback(() => {
    try {
      localStorage.removeItem('bece_access_token')
      localStorage.removeItem('bece_admin')
      setToken(null)
      setAdmin(null)
      setIsAuthenticated(false)
      setSkipProfileQuery(true) // Disable profile query
      setHasHandledProfileError(false) // Reset error flag
      router.replace('/bece-portal')
    } catch (error) {
      console.error('Error during BECE logout:', error)
    }
  }, [router])

  // Handle profile data updates
  useEffect(() => {
    if (profileData && token) {
      setAdmin(profileData.admin)
      setIsAuthenticated(true)
      setHasHandledProfileError(false) // Reset error flag on success
      // Update localStorage with fresh profile data
      localStorage.setItem('bece_admin', JSON.stringify(profileData.admin))
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
    try {
      localStorage.setItem('bece_access_token', newToken)
      localStorage.setItem('bece_admin', JSON.stringify(newAdmin))
      setToken(newToken)
      setAdmin(newAdmin)
      setIsAuthenticated(true)
      setSkipProfileQuery(false) // Enable profile query for future updates
      setHasHandledProfileError(false) // Reset error flag
    } catch (error) {
      console.error('Error storing BECE authentication data:', error)
    }
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
