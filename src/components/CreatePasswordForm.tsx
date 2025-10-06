'use client'

import React, { useState, useCallback } from 'react'
import FormInput from './FormInput'
import { useDebounce } from '@/app/portal/utils/hooks/useDebounce'

interface CreatePasswordFormProps {
  school: string
  onSubmit: (data: { password: string; confirmPassword: string }) => void
}

interface PasswordData {
  password: string
  confirmPassword: string
}

interface PasswordErrors {
  password?: string
  confirmPassword?: string
}

export default function CreatePasswordForm({ school, onSubmit }: CreatePasswordFormProps) {
  const [formData, setFormData] = useState<PasswordData>({
    password: '',
    confirmPassword: ''
  })

  const [errors, setErrors] = useState<PasswordErrors>({})
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  // Debounced values for validation
  const debouncedPassword = useDebounce(formData.password, 500)
  const debouncedConfirmPassword = useDebounce(formData.confirmPassword, 500)

  // Validation function
  const validateField = useCallback((field: keyof PasswordData, value: string): string | undefined => {
    const sanitizedValue = value.trim()
    
    switch (field) {
      case 'password':
        if (!sanitizedValue) return 'Password is required'
        if (sanitizedValue.length < 8) return 'Password must be at least 8 characters'
        if (!/(?=.*[a-z])/.test(sanitizedValue)) return 'Password must contain at least one lowercase letter'
        if (!/(?=.*[A-Z])/.test(sanitizedValue)) return 'Password must contain at least one uppercase letter'
        if (!/(?=.*\d)/.test(sanitizedValue)) return 'Password must contain at least one number'
        if (!/(?=.*[@$!%*?&])/.test(sanitizedValue)) return 'Password must contain at least one special character'
        break
        
      case 'confirmPassword':
        if (!sanitizedValue) return 'Please confirm your password'
        if (sanitizedValue !== formData.password.trim()) return 'Passwords do not match'
        break
    }
    
    return undefined
  }, [formData.password])

  // Validation effects
  React.useEffect(() => {
    if (debouncedPassword) {
      const error = validateField('password', debouncedPassword)
      setErrors(prev => ({ ...prev, password: error }))
    }
  }, [debouncedPassword, validateField])

  React.useEffect(() => {
    if (debouncedConfirmPassword) {
      const error = validateField('confirmPassword', debouncedConfirmPassword)
      setErrors(prev => ({ ...prev, confirmPassword: error }))
    }
  }, [debouncedConfirmPassword, formData.password, validateField])

  const handleInputChange = (field: keyof PasswordData) => (value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validate all fields
    const newErrors: PasswordErrors = {}
    let hasErrors = false
    
    Object.keys(formData).forEach((key) => {
      const field = key as keyof PasswordData
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
          password: formData.password.trim(),
          confirmPassword: formData.confirmPassword.trim()
        }
        await onSubmit(sanitizedData)
      } catch (error) {
        console.error('Password creation error:', error)
      } finally {
        setIsLoading(false)
      }
    }
  }

  return (
    <div className="max-w-md mx-auto bg-white rounded-lg shadow-lg shadow-black/5 border border-black/5 p-6">
      <h2 className="sm:text-2xl text-lg font-semibold text-gray-800 text-center mb-6">
        Create Password
      </h2>
      
      <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
        <p className="text-sm text-blue-700">
          <strong>School Name:</strong> {school}
        </p>
        <p className="text-xs text-blue-600 mt-1">
          Please create a secure password for your account
        </p>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="relative">
          <FormInput
            label="Create Password"
            placeholder="Enter a strong password"
            name="password"
            type={showPassword ? "text" : "password"}
            value={formData.password}
            onChange={handleInputChange('password')}
            error={errors.password}
            required
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-8 text-gray-500 hover:text-gray-700"
          >
            {showPassword ? '👁️' : '👁️‍🗨️'}
          </button>
        </div>
        
        <div className="relative">
          <FormInput
            label="Confirm Password"
            placeholder="Confirm your password"
            name="confirmPassword"
            type={showConfirmPassword ? "text" : "password"}
            value={formData.confirmPassword}
            onChange={handleInputChange('confirmPassword')}
            error={errors.confirmPassword}
            required
          />
          <button
            type="button"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            className="absolute right-3 top-8 text-gray-500 hover:text-gray-700"
          >
            {showConfirmPassword ? '👁️' : '👁️‍🗨️'}
          </button>
        </div>
        
        <div className="text-xs text-gray-600 bg-gray-50 p-3 rounded-lg">
          <p className="font-medium mb-2">Password requirements:</p>
          <ul className="space-y-1">
            <li>• At least 8 characters long</li>
            <li>• One uppercase letter (A-Z)</li>
            <li>• One lowercase letter (a-z)</li>
            <li>• One number (0-9)</li>
            <li>• One special character (@$!%*?&)</li>
          </ul>
        </div>
        
        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-blue-600 cursor-pointer active:scale-95 text-white py-3 px-4 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? 'Creating Password...' : 'Create Password'}
        </button>
      </form>
    </div>
  )
}
