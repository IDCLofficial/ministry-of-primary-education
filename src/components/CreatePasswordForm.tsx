'use client'

import React, { useState, useCallback, useMemo } from 'react'
import FormInput from './FormInput'
import { useDebounce } from '@/app/portal/utils/hooks/useDebounce'
import { useCreatePasswordMutation, useGetProfileQuery } from '@/app/portal/store/api/authApi'
import toast from 'react-hot-toast'

interface CreatePasswordFormProps {
  school: string
}

interface PasswordData {
  password: string
  confirmPassword: string
}

interface PasswordErrors {
  password?: string
  confirmPassword?: string
}

export default function CreatePasswordForm({ school }: CreatePasswordFormProps) {
  const [formData, setFormData] = useState<PasswordData>({
    password: '',
    confirmPassword: ''
  })

  const [ createPasswordMutation, { isLoading: isCreatingPassword, isSuccess } ] = useCreatePasswordMutation();
  const { refetch: refetchProfile } = useGetProfileQuery()
 
  const [errors, setErrors] = useState<PasswordErrors>({})

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

  const canProceed = useMemo(() => {
    return (!errors.password && !errors.confirmPassword) && (formData.password === formData.confirmPassword) && (formData.password.length >= 8)
  }, [errors, formData])

  const handleSubmit = async () => {
    if (!canProceed) {
      throw new Error('Please fill in all required fields')
    }

    try {
      const sanitizedData = {
        newPassword: formData.password.trim(),
        confirmPassword: formData.confirmPassword.trim()
      }

      await createPasswordMutation(sanitizedData).unwrap();
      refetchProfile();
    } catch (error) {
      const apiError = error as { data?: { message?: string } }
      setErrors((prev) => ({ ...prev, password: apiError.data?.message }))
      console.error('Password creation error:', error)
      throw new Error('Failed to create password')
    }
  }

  const submitWatcher = (e: React.FormEvent) => {
    e.preventDefault();
    const promise = handleSubmit();
    
    toast.promise(promise, {
      loading: 'Creating password...',
      success: 'Password created successfully',
      error: 'Failed to create password'
    })
  }

  return (
    <div className="max-w-md mx-auto bg-white rounded-lg shadow-lg shadow-black/5 border border-black/5 p-6">
      <h2 className="sm:text-2xl text-lg font-semibold text-gray-800 text-center mb-6">
        Create Password
      </h2>
      
      <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
        <p className="text-sm text-blue-700 capitalize">
          <strong>School Name:</strong> {school.toLowerCase()}
        </p>
        <p className="text-xs text-blue-600 mt-1">
          You&apos;re almost done! Please create a new, secure password to complete your account setup
        </p>
      </div>
      
      <form onSubmit={submitWatcher} className="space-y-4">
        <div className="relative">
          <FormInput
            label="Create Password"
            placeholder="Enter a strong password"
            name="password"
            type="password"
            value={formData.password}
            onChange={handleInputChange('password')}
            error={errors.password}
            required
          />
        </div>
        
        <div className="relative">
          <FormInput
            label="Confirm Password"
            placeholder="Confirm your password"
            name="confirmPassword"
            type="password"
            value={formData.confirmPassword}
            onChange={handleInputChange('confirmPassword')}
            error={errors.confirmPassword}
            required
          />
        </div>
        <div className="text-xs text-gray-600 bg-gray-50 p-3 rounded-lg border border-black/5">
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
          disabled={isCreatingPassword || !canProceed || isSuccess}
          className="w-full bg-blue-600 cursor-pointer active:scale-95 text-white py-3 px-4 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isCreatingPassword ? 'Creating Password...' : isSuccess ? 'Password created successfully' : 'Create Password'}
        </button>
      </form>
    </div>
  )
}
