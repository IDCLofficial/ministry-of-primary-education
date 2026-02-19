'use client'

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { getProfile } from '@/lib/iirs/dataInteraction';

export interface UserProfile {
  id: string
  name: string
  email: string
  percentage: number
  state: string
  totalEarnings: number
  totalAmountProcessed: number
  adminType: "iirs_admin" | "iirs_user"
}

interface AuthContextType {
  isAuthenticated: boolean
  user: UserProfile | null
  role: "admin" | "user" | null
  token: string | null
  login: (token: string) => void
  logout: () => void
  isLoading: boolean
  refreshProfile: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

interface AuthProviderProps {
  children: React.ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [user, setUser] = useState<UserProfile | null>(null)
  const [role, setRole] = useState<"admin" | "user" | null>("user");
  const [token, setToken] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const router = useRouter()

  // Profile query - only runs when we have a token

  // Check for existing authentication on mount
  useEffect(() => {
    const checkAuth = () => {
      setIsLoading(true)
      try {
        const storedToken = localStorage.getItem('access_token') || 'empty'

        if (storedToken) {
          setToken(storedToken)
        }
      } catch (error) {
        console.error('Error checking authentication:', error)
        // Clear invalid data
        localStorage.removeItem('access_token')
      }
    }

    checkAuth()
  }, [])

  const logout = useCallback(() => {
    try {
      localStorage.removeItem('access_token')
      setToken(null)
      setIsAuthenticated(false)
      console.log("logging out from AuthProvider->user")
      router.replace('/portal/iirs')
    } catch (error) {
      console.error('Error during logout:', error)
    }
  }, [router])

  const getUserProfile = useCallback(async () => {
    try {
      const userProfile = await getProfile(token as string)
      setUser(userProfile)
      setRole(userProfile.adminType === "iirs_admin" ? "admin" : "user")
      setIsAuthenticated(true)
    } catch (error) {
      setIsAuthenticated(false)
      throw error
    }finally {
      setIsLoading(false)
    }
  }, [token])

  const refreshProfile = () => {
    if (!token) return;
    getUserProfile()
  }

  // Handle profile data updates
  useEffect(() => {
    if (!token) return;
    if (token === 'empty') {
      setIsAuthenticated(false);
      setIsLoading(false);
      return;
    };

    getUserProfile()
  }, [token, getUserProfile])


  const login = (newToken: string) => {
    try {
      localStorage.setItem('access_token', newToken)
      setToken(newToken)
      setIsAuthenticated(true)
      router.push('/portal/iirs/dashboard')
    } catch (error) {
      console.error('Error storing authentication data:', error)
    }
  }


  const value: AuthContextType = {
    isAuthenticated,
    user,
    role,
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
