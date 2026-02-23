'use client'

import React, { useState, useEffect, useMemo } from 'react'
import FormInput from './FormInput'
import CustomDropdown from '@/app/portal/dashboard/components/CustomDropdown'
import { useDebounce } from '@/app/portal/utils/hooks/useDebounce'
import { RegistrationRequest, useGetSchoolNamesQuery, useRegisterSchoolMutation } from '@/app/portal/store/api/authApi'
import toast from 'react-hot-toast'
import { useRouter } from 'next/navigation'

interface RegistrationData {
  fullName: string
  lga: string
  email: string
  phone: string
}

interface FormErrors {
  fullName?: string
  lga?: string
  email?: string
  phone?: string
}

const IMO_STATE_LGAS = [
  'Aboh Mbaise',
  'Ahiazu Mbaise',
  'Ehime Mbano',
  'Ezinihitte',
  'Ideato North',
  'Ideato South',
  'Ihitte/Uboma',
  'Ikeduru',
  'Isiala Mbano',
  'Isu',
  'Mbaitoli',
  'Ngor Okpala',
  'Njaba',
  'Nkwerre',
  'Nwangele',
  'Obowo',
  'Oguta',
  'Ohaji/Egbema',
  'Okigwe',
  'Onuimo',
  'Orlu',
  'Orsu',
  'Oru East',
  'Oru West',
  'Owerri Municipal',
  'Owerri North',
  'Owerri West'
]

export default function RegistrationForm() {
  const [formData, setFormData] = useState<RegistrationData>({
    fullName: '',
    lga: '',
    email: '',
    phone: ''
  })

  const [submitApplication, { isLoading: isSubmitting }] = useRegisterSchoolMutation()
  const router = useRouter()

  const [errors, setErrors] = useState<FormErrors>({})
  const [serverError, setServerError] = useState<string>('')

  const canProceed = useMemo(() => {
    const hasErrors = Object.values(errors).some(error => error !== undefined && error !== '')
    const hasEmptyFields = Object.values(formData).some(value => value.trim() === '')
    return !hasErrors && !hasEmptyFields && !isSubmitting
  }, [errors, formData, isSubmitting])

  const debouncedFullName = useDebounce(formData.fullName, 500)
  const debouncedLga = useDebounce(formData.lga, 500)
  const debouncedEmail = useDebounce(formData.email, 500)
  const debouncedPhone = useDebounce(formData.phone, 500)

  const validateField = (field: keyof RegistrationData, value: string): string | undefined => {
    const sanitizedValue = value.trim()

    switch (field) {
      case 'fullName':
        if (!sanitizedValue) return 'Full name is required'
        if (sanitizedValue.length < 2) return 'Full name must be at least 2 characters'
        if (!/^[a-zA-Z\s.'-]+$/.test(sanitizedValue)) return 'Please enter a valid name'
        break

      case 'lga':
        if (!sanitizedValue) return 'LGA is required'
        if (!IMO_STATE_LGAS.includes(sanitizedValue)) return 'Please select a valid LGA'
        break

      case 'email':
        if (!sanitizedValue) return 'Email is required'
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (!emailRegex.test(sanitizedValue)) return 'Please enter a valid email address'
        break

      case 'phone':
        if (!sanitizedValue) return 'Phone number is required'
        const phoneRegex = /^[\+]?[0-9\s\-\(\)]{10,15}$/
        if (!phoneRegex.test(sanitizedValue.replace(/\s/g, ''))) {
          return 'Please enter a valid phone number'
        }
        break
    }

    return undefined
  }

  useEffect(() => {
    if (debouncedFullName) {
      const error = validateField('fullName', debouncedFullName)
      setErrors(prev => ({ ...prev, fullName: error }))
    }
  }, [debouncedFullName])

  useEffect(() => {
    if (debouncedLga) {
      const error = validateField('lga', debouncedLga)
      setErrors(prev => ({ ...prev, lga: error }))
    }
  }, [debouncedLga])

  useEffect(() => {
    if (debouncedEmail) {
      const error = validateField('email', debouncedEmail)
      setErrors(prev => ({ ...prev, email: error }))
    }
  }, [debouncedEmail])

  useEffect(() => {
    if (debouncedPhone) {
      const error = validateField('phone', debouncedPhone)
      setErrors(prev => ({ ...prev, phone: error }))
    }
  }, [debouncedPhone])

  useEffect(() => {
    if (serverError) {
      const timer = setTimeout(() => {
        setServerError('')
      }, 10000)
      return () => clearTimeout(timer)
    }
  }, [serverError])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!canProceed) {
      toast.error('Please fix all errors before submitting')
      return
    }

    const newErrors: FormErrors = {}
    let hasErrors = false

    Object.keys(formData).forEach((key) => {
      const field = key as keyof RegistrationData
      const error = validateField(field, formData[field])
      if (error) {
        newErrors[field] = error
        hasErrors = true
      }
    })

    setErrors(newErrors)

    if (!hasErrors) {
      const sanitizedData: RegistrationRequest = {
        fullName: formData.fullName,
        lga: formData.lga,
        email: formData.email,
        phoneNumber: formData.phone
      }

      try {
        await submitApplication(sanitizedData).unwrap()

        toast.success('Registration successful! Please check your email for login credentials.')

        setFormData({
          fullName: '',
          lga: '',
          email: '',
          phone: ''
        })

        setTimeout(() => {
          router.push('/portal')
        }, 2000)

      } catch (error: unknown) {
        console.error('Registration error:', error)
        
        // Handle RTK Query error format
        const apiError = error as {
          status?: number | string;
          data?: {
            message?: string;
            error?: string;
          };
          error?: string;
        }
        
        let errorMessage = 'Registration failed. Please try again.'
        
        // Check different error formats
        if (apiError.data?.message) {
          errorMessage = apiError.data.message
        } else if (apiError.data?.error) {
          errorMessage = apiError.data.error
        } else if (apiError.error) {
          errorMessage = apiError.error
        } else if (apiError.status === 'FETCH_ERROR') {
          errorMessage = 'Network error. Please check your connection and try again.'
        } else if (apiError.status) {
          errorMessage = `Registration failed with status: ${apiError.status}`
        }
        
        console.error('Detailed error:', {
          status: apiError.status,
          data: apiError.data,
          error: apiError.error,
          fullError: error
        })
        
        setServerError(errorMessage)
        toast.error(errorMessage)
      }
    }
  }

  const lgaOptions = IMO_STATE_LGAS.map(lga => ({ value: lga, label: lga }))

  const handleInputChange = (field: keyof RegistrationData) => (value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }))
    }
    if (serverError) {
      setServerError('')
    }
  }

  return (
    <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-lg shadow-black/5 border border-black/5 p-6">
      <div className="mb-6">
        <h2 className="sm:text-2xl text-lg font-semibold text-gray-800 text-center mb-2">
          School Registration
        </h2>
        <p className="text-sm text-gray-600 text-center">
          Register your school to access the MOPSE portal
        </p>
      </div>

      {serverError && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-600">{serverError}</p>
        </div>
      )}


      <form onSubmit={handleSubmit} className="space-y-4">
        
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Local Government Area (LGA) <span className="text-red-500">*</span>
          </label>
          <CustomDropdown
            options={lgaOptions}
            value={formData.lga}
            onChange={handleInputChange('lga')}
            placeholder="Select LGA"
          />
          {errors.lga && (
            <p className="text-sm text-red-500 mt-1">{errors.lga}</p>
          )}
        </div>

        <FormInput
          label="Full Name"
          placeholder="Enter your full name"
          name="fullName"
          type="text"
          value={formData.fullName}
          onChange={handleInputChange('fullName')}
          error={errors.fullName}
          required
        />


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
          label="Phone"
          placeholder="Enter your phone number"
          name="phone"
          type="tel"
          value={formData.phone}
          onChange={handleInputChange('phone')}
          error={errors.phone}
          required
        />

        <button
          type="submit"
          disabled={!canProceed}
          className="w-full bg-green-600 cursor-pointer active:scale-95 text-white py-3 px-4 rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-transform duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100"
        >
          {isSubmitting ? 'Submitting...' : 'Register School'}
        </button>
      </form>
    </div>
  )
}
