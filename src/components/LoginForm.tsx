'use client'

import React, { useState, useCallback } from 'react'
import FormInput from './FormInput'
import { useDebounce } from '@/app/portal/utils/hooks/useDebounce'
import { useLoginMutation } from '@/app/portal/store/api/authApi'
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

export default function LoginForm() {
  const [formData, setFormData] = useState<LoginData>({
    email: '',
    password: ''
  })

  const [errors, setErrors] = useState<LoginErrors>({})
  const [login, { isLoading }] = useLoginMutation()
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
        
        const result = await login(sanitizedData).unwrap()
        
        // Success - store token and redirect based on isFirstLogin
        localStorage.setItem('access_token', result.access_token)
        localStorage.setItem('school', JSON.stringify(result.school))
        
        toast.success('Login successful!')
        
        if (result.school.isFirstLogin) {
          // Redirect to password creation page
          router.push('/portal/create-password')
        } else {
          // Redirect to dashboard
          router.push('/portal/dashboard')
        }
        
      } catch (error: unknown) {
        console.error('Login error:', error)
        
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
          const message = apiError.data?.message || 'New password required for first-time login'
          toast.error(message)
          // If it's a first-time login requiring new password, redirect to create password
          router.push('/portal/create-password')
        } else if (apiError?.status === 401) {
          const message = apiError.data?.message || 'Invalid credentials'
          toast.error(message)
        } else {
          const message = apiError.data?.message || 'Login failed. Please try again.'
          toast.error(message)
        }
      }
    }
  }

  return (
    <div className="max-w-md mx-auto bg-white rounded-lg shadow-lg shadow-black/5 border border-black/5 p-6">
      <h2 className="sm:text-2xl text-lg font-semibold text-gray-800 text-center mb-6">
        School Login
      </h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <FormInput
          label="Email"
          placeholder="Enter your email address"
          name="email"
          type="email"
          value={formData.email}
          onChange={handleInputChange('email')}
          error={errors.email}
          required
        />
        
        <FormInput
          label="Password"
          placeholder="Enter your password"
          name="password"
          type="password"
          value={formData.password}
          onChange={handleInputChange('password')}
          error={errors.password}
          required
        />
        
        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-blue-600 cursor-pointer active:scale-95 text-white py-3 px-4 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-transform duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? 'Logging in...' : 'Login'}
        </button>
      </form>
    </div>
  )
}
