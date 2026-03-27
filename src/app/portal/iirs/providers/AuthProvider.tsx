'use client'

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { getProfile } from '@/lib/iirs/dataInteraction'
import {
  getSecureItem,
  setSecureItem,
  removeSecureItem,
  setPortalToken,
} from '@/app/result-checking/utils/secureStorage'

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

  // Check for existing authentication on mount (encrypted storage)
  useEffect(() => {
    setIsLoading(true)
    let cancelled = false
    getSecureItem('access_token')
      .then((storedToken) => {
        if (cancelled) return
        if (storedToken && storedToken !== 'empty') {
          setToken(storedToken)
          setPortalToken(storedToken)
        } else {
          setIsLoading(false)
        }
      })
      .catch(() => {
        if (!cancelled) {
          removeSecureItem('access_token')
          setIsLoading(false)
        }
      })
    return () => { cancelled = true }
  }, [])

  const logout = useCallback(() => {
    removeSecureItem('access_token')
    setPortalToken(null)
    setToken(null)
    setIsAuthenticated(false)
    router.replace('/portal/iirs')
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
    setSecureItem('access_token', newToken).then(() => {})
    setPortalToken(newToken)
    setToken(newToken)
    setIsAuthenticated(true)
    router.push('/portal/iirs/dashboard')
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
