'use client'

import React, { useState, useCallback } from 'react'
import FormInput from './FormInput'
import { useDebounce } from '@/app/portal/utils/hooks/useDebounce'

interface LoginFormProps {
  onSubmit: (data: { uniqueCode: string; password: string }) => void
}

interface LoginData {
  uniqueCode: string
  password: string
}

interface LoginErrors {
  uniqueCode?: string
  password?: string
}

export default function LoginForm({ onSubmit }: LoginFormProps) {
  const [formData, setFormData] = useState<LoginData>({
    uniqueCode: '',
    password: ''
  })

  const [errors, setErrors] = useState<LoginErrors>({})
  const [isLoading, setIsLoading] = useState(false)

  // Debounced values for validation
  const debouncedUniqueCode = useDebounce(formData.uniqueCode, 500)
  const debouncedPassword = useDebounce(formData.password, 500)

  // Validation function
  const validateField = useCallback((field: keyof LoginData, value: string): string | undefined => {
    const sanitizedValue = value.trim()
    
    switch (field) {
      case 'uniqueCode':
        if (!sanitizedValue) return 'Unique code is required'
        if (!/^[A-Z0-9]{8}$/.test(sanitizedValue.toUpperCase())) {
          return 'Unique code must be an alphanumeric 8 digits string'
        }
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
    if (debouncedUniqueCode) {
      const error = validateField('uniqueCode', debouncedUniqueCode)
      setErrors(prev => ({ ...prev, uniqueCode: error }))
    }
  }, [debouncedUniqueCode, validateField])

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
      setIsLoading(true)
      try {
        const sanitizedData = {
          uniqueCode: formData.uniqueCode.trim().toUpperCase(),
          password: formData.password.trim()
        }
        await onSubmit(sanitizedData)
      } catch (error) {
        console.error('Login error:', error)
      } finally {
        setIsLoading(false)
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
          label="Unique Code"
          placeholder="Enter your unique code"
          name="uniqueCode"
          isUpperCase
          value={formData.uniqueCode}
          onChange={handleInputChange('uniqueCode')}
          error={errors.uniqueCode}
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
