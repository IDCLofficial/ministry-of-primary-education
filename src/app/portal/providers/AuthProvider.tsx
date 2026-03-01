'use client'

import React, { createContext, useContext, useEffect, useRef, useState, useCallback } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { useGetProfileQuery, useLogoutMutation } from '../store/api/authApi'
import toast from 'react-hot-toast'
import { useDispatch } from 'react-redux'
import { massInvalidateTags } from '../store/api/apiSlice'

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
  isNavigating: boolean
  refreshProfile: () => void
  isFetchingProfile: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

interface AuthProviderProps {
  children: React.ReactNode
}

const IIRS_PATH = 'portal/iirs'

export function AuthProvider({ children }: AuthProviderProps) {
  const path = usePathname()
  const router = useRouter()
  const dispatch = useDispatch()

  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [school, setSchool] = useState<School | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isNavigating, setIsNavigating] = useState(false)
  const [skipProfileQuery, setSkipProfileQuery] = useState(true)
  const [localAuthChecked, setLocalAuthChecked] = useState(false)
  // A unique ID per login session. Used as the RTK Query arg so each new
  // login gets a guaranteed-fresh cache entry rather than the previous user's.
  const [sessionId, setSessionId] = useState<string | null>(null)

  // Log every state change so we can trace the full sequence
  const isMounted = useRef(true)
  // Tracks whether a profile fetch was explicitly triggered in this session.
  // Prevents stale RTK Query cache from firing the profile effect after logout,
  // even when skipProfileQuery briefly flips back to false during re-login.
  const fetchWasRequested = useRef(false)

  useEffect(() => {
    return () => {
      isMounted.current = false
    }
  }, [])

  const {
    data: profileData,
    error: profileError,
    refetch: refetchProfile,
    isFetching: isFetchingProfile,
  } = useGetProfileQuery(sessionId as any, {
    skip: skipProfileQuery || !token || !sessionId,
  });

  const [handleLogout, { isLoading: isLoggingOut, isError: isLogoutError, isSuccess: isLogoutSuccess, reset: resetLogout }] =
    useLogoutMutation()

  // ─── Shared auth-clear helper ───────────────────────────────────────────────
  const clearAuth = useCallback(() => {
    fetchWasRequested.current = false  // invalidate any in-flight or cached fetch for this session
    setToken(null)
    setSchool(null)
    setIsAuthenticated(false)
    setSkipProfileQuery(true)
    setSessionId(null)  // nulled here; login() sets a fresh ID so the next query has a new cache key
    dispatch(massInvalidateTags(['School', 'Students']))
    localStorage.removeItem('access_token')
    localStorage.removeItem('school')
  }, [dispatch])

  // ─── Logout side-effects ────────────────────────────────────────────────────
  useEffect(() => {
    if (!isLogoutError) return
    toast.dismiss('logging-out')
    clearAuth()
    setTimeout(() => {
      if (isMounted.current) {
        router.push('/portal')
      }
    }, 100)
  }, [isLogoutError, clearAuth, router, dispatch])

  useEffect(() => {
    if (!isLogoutSuccess) return
    toast.dismiss('logging-out')
    toast.success('You have been logged out successfully.')
    clearAuth()
    setTimeout(() => {
      if (isMounted.current) {
        router.push('/portal')
      }
    }, 100)
  }, [isLogoutSuccess, clearAuth, router, dispatch])

  // ─── Initial auth check ─────────────────────────────────────────────────────
  useEffect(() => {
    if (path.includes(IIRS_PATH)) {
      setLocalAuthChecked(true)
      return
    }

    try {
      const storedToken = localStorage.getItem('access_token')
      const storedSchool = localStorage.getItem('school')

      if (storedToken && storedToken !== 'undefined' && storedToken !== 'null') {
        const restoredSessionId = crypto.randomUUID()
        setSessionId(restoredSessionId)
        setToken(storedToken)
        setSkipProfileQuery(false)
        fetchWasRequested.current = true

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
            localStorage.removeItem('school')
          }
        }
      } else {
        localStorage.removeItem('access_token')
        localStorage.removeItem('school')
      }
    } catch (error) {
      localStorage.removeItem('access_token')
      localStorage.removeItem('school')
    } finally {
      setLocalAuthChecked(true)
    }
  }, [path])

  // ─── Logout action ──────────────────────────────────────────────────────────
  const logout = useCallback(() => {
    toast.loading('Logging out...', { id: 'logging-out' })
    handleLogout()
    resetLogout()
  }, [handleLogout, resetLogout])

  // ─── Profile data / error handler ───────────────────────────────────────────
  useEffect(() => {
    if (path.includes(IIRS_PATH)) return

    // BUG FIX: Guard against stale RTK Query cache firing after logout.
    // massInvalidateTags clears the cache but RTK Query keeps the last known
    // profileData value in memory. When the effect re-runs during the logout/
    // re-login cycle, it can see stale profileData even when skipProfileQuery
    // is false (because login() already toggled it back). Using a ref that is
    // explicitly set only when we deliberately trigger a fetch ensures we never
    // act on profileData that belongs to a previous session.
    if (!fetchWasRequested.current) {
      return
    }

    if (profileData && token) {
      setSchool(profileData)
      setIsAuthenticated(true)
      localStorage.setItem('school', JSON.stringify(profileData))
      setIsLoading(false)
      return
    }

    if (profileError && token) {
      const status = (profileError as any)?.status
      if (status === 401 || status === 403) {
        logout()
      }
      setIsLoading(false)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profileData, profileError, token, path])

  // isLoading stays true until localStorage is checked AND:
  //   a) profile fetch triggered and settled (handled above), OR
  //   b) no token found so no fetch will ever fire.
  useEffect(() => {
    if (!localAuthChecked) return
    if (!token) {
      setIsLoading(false)
    }
  }, [localAuthChecked, token])

  // ─── Login ──────────────────────────────────────────────────────────────────
  const login = useCallback((newToken: string, newSchool: School) => {
    try {
      localStorage.setItem('access_token', newToken)
      localStorage.setItem('school', JSON.stringify(newSchool))

      setToken(newToken)
      setSchool(newSchool)
      setIsAuthenticated(true)

      setLocalAuthChecked(true)
      setIsLoading(true)

      // Generate a new sessionId so RTK Query creates a fresh cache entry for
      // this user — guaranteed different from any previous user's cache key.
      const newSessionId = crypto.randomUUID()
      setSessionId(newSessionId)

      fetchWasRequested.current = false  // reset so the setTimeout below is the only valid trigger
      setSkipProfileQuery(true)
      setTimeout(() => {
        if (isMounted.current) {
          fetchWasRequested.current = true
          setSkipProfileQuery(false)
        }
      }, 0)

      setIsNavigating(true)
      setTimeout(() => {
        if (!isMounted.current) {
          return
        }
        router.push('/portal/dashboard')
        setIsNavigating(false)
      }, 600)
    } catch (error) {
      console.error('[AuthProvider] login error:', error)
      setIsNavigating(false)
    }
  }, [router])

  // ─── Refresh helper ─────────────────────────────────────────────────────────
  const refreshProfile = useCallback(() => {
    if (token) refetchProfile()
  }, [token, refetchProfile])

  const value: AuthContextType = {
    isAuthenticated,
    school,
    loggingOut: isLoggingOut,
    token,
    login,
    logout,
    isLoading,
    isNavigating,
    refreshProfile,
    isFetchingProfile,
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