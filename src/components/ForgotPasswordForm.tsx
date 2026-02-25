'use client'

import React, { useState, useCallback } from 'react'
import FormInput from './FormInput'
import { useDebounce } from '@/app/portal/utils/hooks/useDebounce'
import { useForgotPasswordMutation } from '@/app/portal/store/api/authApi'
import toast from 'react-hot-toast'
import Link from 'next/link'

interface ForgotPasswordData {
  email: string
}

interface ForgotPasswordErrors {
  email?: string
}

export default function ForgotPasswordForm() {
  const [formData, setFormData] = useState<ForgotPasswordData>({
    email: ''
  })

  const [errors, setErrors] = useState<ForgotPasswordErrors>({})
  const [forgotPassword, { isLoading: isSubmitting }] = useForgotPasswordMutation()
  const [isSuccess, setIsSuccess] = useState(false)

  // Debounced values for validation
  const debouncedEmail = useDebounce(formData.email, 500)

  // Validation function
  const validateField = useCallback((field: keyof ForgotPasswordData, value: string): string | undefined => {
    const sanitizedValue = value.trim()

    switch (field) {
      case 'email':
        if (!sanitizedValue) return 'Email is required'
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (!emailRegex.test(sanitizedValue)) return 'Please enter a valid email address'
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

  const handleInputChange = (field: keyof ForgotPasswordData) => (value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    console.log(formData)

    // Validate email
    const error = validateField('email', formData.email)
    if (error) {
      setErrors({ email: error })
      return
    }

    try {
      const sanitizedData = {
        email: formData.email.trim()
      }

      await forgotPassword(sanitizedData).unwrap()

      toast.success('Password reset link sent to your email!')
      setIsSuccess(true)
    } catch (error: any) {
      const errorMessage = error?.data?.message || 'Failed to send reset link. Please try again.'
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
            Check Your Email
          </h2>
          
          <p className="text-gray-600 mb-6">
            We&apos;ve sent a password reset link to <span className="font-semibold text-gray-800">{formData.email}</span>
          </p>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <p className="text-sm text-blue-700">
              <strong>Next steps:</strong>
            </p>
            <ul className="text-sm text-blue-600 mt-2 space-y-1 text-left list-disc list-inside">
              <li>Check your email inbox</li>
              <li>Click the reset link in the email</li>
              <li>Create a new password</li>
            </ul>
          </div>

          <div className="space-y-3">
            <Link
              href="/portal"
              className="block w-full bg-green-600 cursor-pointer text-white py-3 px-4 rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition duration-200 font-medium text-center"
            >
              Back to Login
            </Link>
            
            <button
              onClick={() => {
                setIsSuccess(false)
                setFormData({ email: '' })
              }}
              className="w-full text-gray-600 hover:text-gray-800 py-2 text-sm font-medium transition-colors"
            >
              Resend reset link
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-md mx-auto bg-white rounded-lg shadow-lg shadow-black/5 border border-black/5 p-6">
      <h2 className="sm:text-2xl text-lg font-semibold text-gray-800 text-center mb-2">
        Forgot Password?
      </h2>
      
      <p className="text-gray-600 text-center mb-6 text-sm">
        Enter your email address and we&apos;ll send you a link to reset your password.
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <FormInput
          label="Email Address"
          placeholder="Enter your registered email"
          name="email"
          type="email"
          value={formData.email}
          onChange={handleInputChange('email')}
          error={errors.email}
          required
        />

        <button
          type="submit"
          disabled={isSubmitting || !!errors.email}
          className="w-full bg-green-600 cursor-pointer active:scale-95 text-white py-3 px-4 rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-transform duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? 'Sending...' : 'Send Reset Link'}
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
