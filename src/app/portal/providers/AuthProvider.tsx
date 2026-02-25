'use client'

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { ExamData, useGetProfileQuery, useLogoutMutation } from '../store/api/authApi'
import toast from 'react-hot-toast'

interface School {
  id: string
  email: string
  isFirstLogin: boolean
  lga: string
  totalSchoolsInLga: number
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
  isFetchingProfile: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

interface AuthProviderProps {
  children: React.ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const path = usePathname();
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [school, setSchool] = useState<School | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [skipProfileQuery, setSkipProfileQuery] = useState(true)
  const router = useRouter()

  // Profile query - only runs when we have a token
  const { data: profileData, error: profileError, refetch: refetchProfile, isFetching: isFetchingProfile } = useGetProfileQuery(undefined, {
    skip: skipProfileQuery || !token,
  })

  const [handleLogout, { isLoading: isLoggingOut, isError: isLogoutError, isSuccess: isLogoutSuccess }] = useLogoutMutation()

  useEffect(() => {
    if (isLogoutError) {
      console.error('Logout error:', isLogoutError)
      toast.dismiss('logging-out');
      setToken(null)
      setSchool(null)
      setIsAuthenticated(false)
      setSkipProfileQuery(true) // Disable profile query
      localStorage.removeItem('access_token')
      localStorage.removeItem('school');
    
      setTimeout(() => {
        router.push('/portal')
      }, 100);
    }
  }, [isLogoutError])

  useEffect(() => {
    if (isLogoutSuccess) {
      toast.dismiss('logging-out')
      toast.success('You have been logged out successfully.')
      setToken(null)
      setSchool(null)
      setIsAuthenticated(false)
      setSkipProfileQuery(true) // Disable profile query
      localStorage.removeItem('access_token')
      localStorage.removeItem('school');

      setTimeout(() => {
        router.push('/portal')
      }, 100);
    }
  }, [isLogoutSuccess])

  // Check for existing authentication on mount
  useEffect(() => {
    const checkAuth = () => {
      if (path.includes('portal/iirs')) return;
      try {
        const storedToken = localStorage.getItem('access_token')
        const storedSchool = localStorage.getItem('school')

        // Validate token exists and is not 'undefined' string
        if (storedToken && storedToken !== 'undefined' && storedToken !== 'null') {
          setToken(storedToken)
          setSkipProfileQuery(false) // Enable profile query

          // Validate school data exists and is valid JSON
          if (storedSchool && storedSchool !== 'undefined' && storedSchool !== 'null') {
            try {
              const parsedSchool = JSON.parse(storedSchool) as School
              if (parsedSchool && typeof parsedSchool === 'object') {
                setSchool(parsedSchool)
                setIsAuthenticated(true)
              } else {
                throw new Error('Invalid school data format')
              }
            } catch (parseError) {
              console.error('Error parsing school data:', parseError)
              localStorage.removeItem('school')
            }
          }
        } else {
          // Clear invalid token
          localStorage.removeItem('access_token')
          localStorage.removeItem('school')
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
    toast.loading('Logging out...', {
      id: 'logging-out'
    })
    handleLogout()
  }, [handleLogout])

  // Handle profile data updates
  useEffect(() => {
    if (path.includes('portal/iirs')) return;

    if (profileData && token) {
      setSchool(profileData)
      setIsAuthenticated(true)
      // Update localStorage with fresh profile data
      localStorage.setItem('school', JSON.stringify(profileData))
    } else if (profileError && token) {
      // Only log and logout if we have a token but profile fetch failed
      console.error('Profile fetch error:', profileError)
      // If profile fetch fails, clear auth data
      logout()
    }
  }, [profileData, profileError, token, logout, path])

  const login = (newToken: string, newSchool: School) => {
    try {
      localStorage.setItem('access_token', newToken)
      localStorage.setItem('school', JSON.stringify(newSchool))
      
      // Batch state updates to ensure they happen together
      setToken(newToken)
      setSchool(newSchool)

      setIsAuthenticated(true)
      setIsLoading(false) // Ensure loading is complete

      profileData && refetchProfile()

      setTimeout(() => {
        router.push('/portal/dashboard')
      }, 600);
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
    loggingOut: isLoggingOut,
    token,
    login,
    logout,
    isLoading,
    refreshProfile,
    isFetchingProfile
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
