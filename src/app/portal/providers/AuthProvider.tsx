'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

interface School {
  id: string
  schoolName: string
  schoolCode: string
  email: string
  isFirstLogin: boolean
}

interface AuthContextType {
  isAuthenticated: boolean
  school: School | null
  token: string | null
  login: (token: string, school: School) => void
  logout: () => void
  isLoading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

interface AuthProviderProps {
  children: React.ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [school, setSchool] = useState<School | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  // Check for existing authentication on mount
  useEffect(() => {
    const checkAuth = () => {
      try {
        const storedToken = localStorage.getItem('access_token')
        const storedSchool = localStorage.getItem('school')

        if (storedToken && storedSchool) {
          const parsedSchool = JSON.parse(storedSchool) as School
          setToken(storedToken)
          setSchool(parsedSchool)
          setIsAuthenticated(true)
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
  }, [])

  const login = (newToken: string, newSchool: School) => {
    try {
      localStorage.setItem('access_token', newToken)
      localStorage.setItem('school', JSON.stringify(newSchool))
      setToken(newToken)
      setSchool(newSchool)
      setIsAuthenticated(true)
    } catch (error) {
      console.error('Error storing authentication data:', error)
    }
  }

  const logout = () => {
    try {
      localStorage.removeItem('access_token')
      localStorage.removeItem('school')
      setToken(null)
      setSchool(null)
      setIsAuthenticated(false)
      router.push('/portal')
    } catch (error) {
      console.error('Error during logout:', error)
    }
  }

  const value: AuthContextType = {
    isAuthenticated,
    school,
    token,
    login,
    logout,
    isLoading
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
