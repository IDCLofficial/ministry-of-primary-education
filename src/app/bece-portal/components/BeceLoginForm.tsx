'use client'

import React, { useState, useCallback } from 'react'
import FormInput from '@/components/FormInput'
import { useDebounce } from '@/app/portal/utils/hooks/useDebounce'
import { useAdminLoginMutation } from '../store/api/authApi'
import { useBeceAuth } from '../providers/AuthProvider'
import toast from 'react-hot-toast'
import { useRouter } from 'next/navigation'

interface LoginData {
  email: string
  password: string
}

interface LoginErrors {
  email?: string
  password?: string
}

export default function BeceLoginForm() {
  const [formData, setFormData] = useState<LoginData>({
    email: '',
    password: ''
  })

  const [errors, setErrors] = useState<LoginErrors>({})
  const [adminLoginMutation, { isLoading }] = useAdminLoginMutation()
  const { login } = useBeceAuth()
  const router = useRouter()

  // Debounced values for validation
  const debouncedEmail = useDebounce(formData.email, 500)
  const debouncedPassword = useDebounce(formData.password, 500)

  // Validation function
  const validateField = useCallback((field: keyof LoginData, value: string): string | undefined => {
    const sanitizedValue = value.trim()

    switch (field) {
      case 'email':
        if (!sanitizedValue) return 'Email is required'
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (!emailRegex.test(sanitizedValue)) return 'Please enter a valid email address'
        break

      case 'password':
        if (!sanitizedValue) return 'Password is required'
        if (sanitizedValue.length < 6) return 'Password must be at least 6 characters'
        break
    }

    return undefined
  }, [])

  // Validation effects
  React.useEffect(() => {
    if (debouncedEmail) {
      const error = validateField('email', debouncedEmail)
      setErrors(prev => ({ ...prev, email: error }))
    }
  }, [debouncedEmail, validateField])

  React.useEffect(() => {
    if (debouncedPassword) {
      const error = validateField('password', debouncedPassword)
      setErrors(prev => ({ ...prev, password: error }))
    }
  }, [debouncedPassword, validateField])

  const handleInputChange = (field: keyof LoginData) => (value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validate all fields
    const newErrors: LoginErrors = {}
    let hasErrors = false

    Object.keys(formData).forEach((key) => {
      const field = key as keyof LoginData
      const error = validateField(field, formData[field])
      if (error) {
        newErrors[field] = error
        hasErrors = true
      }
    })

    setErrors(newErrors)

    if (!hasErrors) {
      try {
        const sanitizedData = {
          email: formData.email.trim(),
          password: formData.password.trim()
        }

        const result = await adminLoginMutation(sanitizedData).unwrap()

        // Use auth context to store authentication data
        login(result.accessToken, result.admin)

        toast.success('Admin login successful!')

        router.replace('/bece-portal/dashboard')

      } catch (error: unknown) {
        console.error('Admin Login error:', error)

        // Handle different error types
        const apiError = error as {
          status?: number;
          data?: {
            message?: string;
            error?: string;
            statusCode?: number
          }
        }

        if (apiError?.status === 400) {
          const message = apiError.data?.message || 'Invalid admin credentials'
          toast.error(message)
        } else if (apiError?.status === 401) {
          const message = apiError.data?.message || 'Invalid admin credentials'
          toast.error(message)
        } else {
          const message = apiError.data?.message || 'Admin login failed. Please try again.'
          toast.error(message)
        }
      }
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-xl p-8 max-w-md mx-auto">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          BECE Portal
        </h2>
        <p className="text-gray-600 text-sm">
          Access the BECE Administrative Portal dashboard
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <FormInput
          label="Email"
          type="email"
          name="email"
          placeholder="Enter your email"
          value={formData.email}
          onChange={handleInputChange('email')}
          error={errors.email}
          required
        />

        <FormInput
          label="Password"
          type="password"
          name="password"
          placeholder="Enter your password"
          value={formData.password}
          onChange={handleInputChange('password')}
          error={errors.password}
          required
        />

        <button
          type="submit"
          disabled={isLoading}
          className={`w-full py-3 px-4 rounded-lg font-medium text-white transition-all duration-200 active:scale-95 active:rotate-1 cursor-pointer ${
            isLoading
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-green-600 hover:bg-green-700 active:scale-95 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2'
          }`}
        >
          {isLoading ? (
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
              Signing in...
            </div>
          ) : (
            'Sign In to Admin Portal'
          )}
        </button>
      </form>
    </div>
  )
}
