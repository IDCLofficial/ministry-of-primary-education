'use client'

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { ExamData, useGetProfileQuery, useLogoutMutation } from '../store/api/authApi'

interface School {
  id: string
  schoolName: string
  email: string
  isFirstLogin: boolean
  address: string
  phone: string
  numberOfStudents?: number
  status?: string
  exams: ExamData[]
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
    if (isLogoutSuccess) {
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
      handleLogout()
    } catch (error) {
      console.error('Error during logout:', error)
    }
  }, [handleLogout])

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
