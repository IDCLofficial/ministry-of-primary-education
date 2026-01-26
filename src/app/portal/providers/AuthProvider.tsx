'use client'

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { useGetProfileQuery } from '../store/api/authApi'

interface School {
  applicationId: string;
  id: string
  schoolName: string
  email: string
  isFirstLogin: boolean
  status: string
  address: string
  totalPoints: number
  availablePoints: number
  usedPoints: number
  numberOfStudents: number
}

interface AuthContextType {
  isAuthenticated: boolean
  school: School | null
  token: string | null
  login: (token: string, school: School) => void
  logout: () => void
  loggingOut: boolean
  isLoading: boolean
  refreshProfile: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

interface AuthProviderProps {
  children: React.ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const path = usePathname();
  const [loggingOut, setLoggingOut] = useState(false)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [school, setSchool] = useState<School | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [skipProfileQuery, setSkipProfileQuery] = useState(true)
  const router = useRouter()

  // Profile query - only runs when we have a token
  const { data: profileData, error: profileError, refetch: refetchProfile } = useGetProfileQuery(undefined, {
    skip: skipProfileQuery || !token,
  })

  // Check for existing authentication on mount
  useEffect(() => {
    const checkAuth = () => {
      if (path.includes('portal/iirs')) return;
      try {
        const storedToken = localStorage.getItem('access_token')
        const storedSchool = localStorage.getItem('school')

        if (storedToken) {
          setToken(storedToken)
          setSkipProfileQuery(false) // Enable profile query
          
          if (storedSchool) {
            const parsedSchool = JSON.parse(storedSchool) as School
            setSchool(parsedSchool)
            setIsAuthenticated(true)
          }
        }
      } catch (error) {
        console.error('Error checking authentication:', error)
        // Clear invalid data
        localStorage.removeItem('access_token')
        localStorage.removeItem('school')
      } finally {
        setIsLoading(false)
      }
    }

    checkAuth()
  }, [path])

  const logout = useCallback(() => {
    try {
      setLoggingOut(true)
      setToken(null)
      setSchool(null)
      setIsAuthenticated(false)
      setSkipProfileQuery(true) // Disable profile query
      localStorage.removeItem('access_token')
      localStorage.removeItem('school');

      setTimeout(() => {
        router.push('/portal')
      }, 100);
    } catch (error) {
      console.error('Error during logout:', error)
    }
  }, [router])

  // Handle profile data updates
  useEffect(() => {
    if (path.includes('portal/iirs')) return;

    if (profileData && token) {
      setSchool(profileData)
      setIsAuthenticated(true)
      // Update localStorage with fresh profile data
      localStorage.setItem('school', JSON.stringify(profileData))
    } else if (profileError) {
      console.error('Profile fetch error:', profileError)
      // If profile fetch fails, clear auth data
      logout()
    }
  }, [profileData, profileError, token, logout, path])

  const login = (newToken: string, newSchool: School) => {
    try {
      localStorage.setItem('access_token', newToken)
      localStorage.setItem('school', JSON.stringify(newSchool))
      refetchProfile();
      setToken(newToken)
      setSchool(newSchool)
      setIsAuthenticated(true)
    } catch (error) {
      console.error('Error storing authentication data:', error)
    }
  }


  const refreshProfile = () => {
    if (token && refetchProfile) {
      refetchProfile()
    }
  }

  const value: AuthContextType = {
    isAuthenticated,
    school,
    loggingOut,
    token,
    login,
    logout,
    isLoading,
    refreshProfile
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
