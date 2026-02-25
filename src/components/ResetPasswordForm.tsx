'use client'

import React, { useState, useCallback } from 'react'
import FormInput from './FormInput'
import { useDebounce } from '@/app/portal/utils/hooks/useDebounce'
import { useResetPasswordMutation } from '@/app/portal/store/api/authApi'
import toast from 'react-hot-toast'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface ResetPasswordData {
  password: string
  confirmPassword: string
}

interface ResetPasswordErrors {
  password?: string
  confirmPassword?: string
}

interface ResetPasswordFormProps {
  token: string
}

export default function ResetPasswordForm({ token }: ResetPasswordFormProps) {
  const [formData, setFormData] = useState<ResetPasswordData>({
    password: '',
    confirmPassword: ''
  })

  const [errors, setErrors] = useState<ResetPasswordErrors>({})
  const [resetPassword, { isLoading: isSubmitting }] = useResetPasswordMutation()
  const [isSuccess, setIsSuccess] = useState(false)
  const router = useRouter()

  // Debounced values for validation
  const debouncedPassword = useDebounce(formData.password, 500)
  const debouncedConfirmPassword = useDebounce(formData.confirmPassword, 500)

  // Validation function
  const validateField = useCallback((field: keyof ResetPasswordData, value: string): string | undefined => {
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

  const handleInputChange = (field: keyof ResetPasswordData) => (value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }))
    }
  }

  const canProceed = React.useMemo(() => {
    return (!errors.password && !errors.confirmPassword) && 
           (formData.password === formData.confirmPassword) && 
           (formData.password.length >= 8)
  }, [errors, formData])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!canProceed) {
      toast.error('Please fill in all required fields correctly')
      return
    }

    try {
      const sanitizedData = {
        token,
        newPassword: formData.password.trim(),
        confirmPassword: formData.confirmPassword.trim()
      }

      await resetPassword(sanitizedData).unwrap()

      toast.success('Password reset successfully!')
      setIsSuccess(true)
      
      // Redirect to login after 2 seconds
      setTimeout(() => {
        router.push('/portal')
      }, 2000)
    } catch (error: any) {
      const errorMessage = error?.data?.message || 'Failed to reset password. Please try again.'
      toast.error(errorMessage)
    }
  }

  if (isSuccess) {
    return (
      <div className="max-w-md mx-auto bg-white rounded-lg shadow-lg shadow-black/5 border border-black/5 p-6">
        <div className="text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>

          <h2 className="sm:text-2xl text-lg font-semibold text-gray-800 mb-2">
            Password Reset Successful!
          </h2>

          <p className="text-gray-600 mb-6">
            Your password has been successfully reset. You can now log in with your new password.
          </p>

          <Link
            href="/portal"
            className="block w-full bg-green-600 cursor-pointer text-white py-3 px-4 rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition duration-200 font-medium text-center"
          >
            Go to Login
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-md mx-auto bg-white rounded-lg shadow-lg shadow-black/5 border border-black/5 p-6">
      <h2 className="sm:text-2xl text-lg font-semibold text-gray-800 text-center mb-2">
        Reset Password
      </h2>

      <p className="text-gray-600 text-center mb-6 text-sm">
        Create a new, secure password for your account.
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <FormInput
          label="New Password"
          placeholder="Enter a strong password"
          name="password"
          type="password"
          value={formData.password}
          onChange={handleInputChange('password')}
          error={errors.password}
          required
        />

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
          disabled={isSubmitting || !canProceed}
          className="w-full bg-green-600 cursor-pointer active:scale-95 text-white py-3 px-4 rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-transform duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? 'Resetting Password...' : 'Reset Password'}
        </button>

        <div className="text-center">
          <Link
            href="/portal"
            className="text-sm text-gray-600 hover:text-gray-800 transition-colors font-medium"
          >
            ← Back to Login
          </Link>
        </div>
      </form>
    </div>
  )
}
