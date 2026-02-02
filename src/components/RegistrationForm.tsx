'use client'

import React, { useState, useEffect, useMemo } from 'react'
import FormInput from './FormInput'
import CustomDropdown from '@/app/portal/dashboard/components/CustomDropdown'
import { useDebounce } from '@/app/portal/utils/hooks/useDebounce'
import { RegistrationRequest, useGetSchoolNamesQuery, useRegisterSchoolMutation } from '@/app/portal/store/api/authApi'
import toast from 'react-hot-toast'
import { useRouter } from 'next/navigation'

interface RegistrationData {
  lga: string
  schoolName: string
  schoolAddress: string
  principalName: string
  contactEmail: string
  contactPhone: string
}

interface FormErrors {
  lga?: string
  schoolName?: string
  schoolAddress?: string
  principalName?: string
  contactEmail?: string
  contactPhone?: string
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
    lga: '',
    schoolName: '',
    schoolAddress: '',
    principalName: '',
    contactEmail: '',
    contactPhone: ''
  })

  const { data: schoolNames, isLoading: isLoadingSchoolNames, isFetching } = useGetSchoolNamesQuery(
    { lga: formData.lga },
    { skip: !formData.lga }
  )
  const [submitApplication, { isLoading: isSubmitting }] = useRegisterSchoolMutation()
  const router = useRouter()

  const [errors, setErrors] = useState<FormErrors>({})
  const [serverError, setServerError] = useState<string>('')

  const schoolNamesList = useMemo(() => {
    if (!schoolNames) return []
    return schoolNames
  }, [schoolNames])

  const canProceed = useMemo(() => {
    const hasErrors = Object.values(errors).some(error => error !== undefined && error !== '')
    const hasEmptyFields = Object.values(formData).some(value => value.trim() === '')
    const selectedSchool = schoolNames?.find(school => school.schoolName === formData.schoolName)
    const isSchoolEligible = selectedSchool?.hasAccount === false
    return !hasErrors && !hasEmptyFields && isSchoolEligible && !isSubmitting
  }, [errors, formData, schoolNames, isSubmitting])

  const debouncedLga = useDebounce(formData.lga, 500)
  const debouncedSchoolName = useDebounce(formData.schoolName, 500)
  const debouncedSchoolAddress = useDebounce(formData.schoolAddress, 500)
  const debouncedPrincipalName = useDebounce(formData.principalName, 500)
  const debouncedContactEmail = useDebounce(formData.contactEmail, 500)
  const debouncedContactPhone = useDebounce(formData.contactPhone, 500)

  const validateField = (field: keyof RegistrationData, value: string): string | undefined => {
    const sanitizedValue = value.trim()

    switch (field) {
      case 'lga':
        if (!sanitizedValue) return 'LGA is required'
        if (!IMO_STATE_LGAS.includes(sanitizedValue)) return 'Please select a valid LGA'
        break

      case 'schoolName':
        if (!sanitizedValue) return 'School selection is required'
        break

      case 'schoolAddress':
        if (!sanitizedValue) return 'School address is required'
        break

      case 'principalName':
        if (!sanitizedValue) return 'Principal name is required'
        if (sanitizedValue.length < 2) return 'Principal name must be at least 2 characters'
        if (!/^[a-zA-Z\s.'-]+$/.test(sanitizedValue)) return 'Please enter a valid name'
        break

      case 'contactEmail':
        if (!sanitizedValue) return 'Contact email is required'
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (!emailRegex.test(sanitizedValue)) return 'Please enter a valid email address'
        break

      case 'contactPhone':
        if (!sanitizedValue) return 'Contact phone is required'
        const phoneRegex = /^[\+]?[0-9\s\-\(\)]{10,15}$/
        if (!phoneRegex.test(sanitizedValue.replace(/\s/g, ''))) {
          return 'Please enter a valid phone number'
        }
        break
    }

    return undefined
  }

  useEffect(() => {
    if (debouncedLga) {
      const error = validateField('lga', debouncedLga)
      setErrors(prev => ({ ...prev, lga: error }))
      setFormData(prev => ({ ...prev, schoolName: '' }))
    }
  }, [debouncedLga])

  useEffect(() => {
    if (debouncedSchoolName) {
      const error = validateField('schoolName', debouncedSchoolName)
      const findExistingSchool = schoolNames?.find(school => school._id === debouncedSchoolName)
      if (findExistingSchool && findExistingSchool.hasAccount) {
        return setErrors(prev => ({ ...prev, schoolName: 'This school already has an account and cannot apply again' }))
      }
      setErrors(prev => ({ ...prev, schoolName: error }))
    }
  }, [debouncedSchoolName, schoolNames])

  useEffect(() => {
    if (debouncedSchoolAddress) {
      const error = validateField('schoolAddress', debouncedSchoolAddress)
      setErrors(prev => ({ ...prev, schoolAddress: error }))
    }
  }, [debouncedSchoolAddress])

  useEffect(() => {
    if (debouncedPrincipalName) {
      const error = validateField('principalName', debouncedPrincipalName)
      setErrors(prev => ({ ...prev, principalName: error }))
    }
  }, [debouncedPrincipalName])

  useEffect(() => {
    if (debouncedContactEmail) {
      const error = validateField('contactEmail', debouncedContactEmail)
      setErrors(prev => ({ ...prev, contactEmail: error }))
    }
  }, [debouncedContactEmail])

  useEffect(() => {
    if (debouncedContactPhone) {
      const error = validateField('contactPhone', debouncedContactPhone)
      setErrors(prev => ({ ...prev, contactPhone: error }))
    }
  }, [debouncedContactPhone])

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
        lga: formData.lga,
        schoolName: formData.schoolName,
        schoolAddress: formData.schoolAddress,
        principalName: formData.principalName,
        contactEmail: formData.contactEmail,
        contactPhone: formData.contactPhone
      }

      try {
        await submitApplication(sanitizedData).unwrap()
        
        toast.success('Registration successful! Please check your email for login credentials.')
        
        setFormData({
          lga: '',
          schoolName: '',
          schoolAddress: '',
          principalName: '',
          contactEmail: '',
          contactPhone: ''
        })

        setTimeout(() => {
          router.push('/portal')
        }, 2000)

      } catch (error: unknown) {
        console.error('Registration error:', error)
        const apiError = error as {
          status?: number;
          data?: {
            message?: string;
            error?: string;
          }
        }
        const errorMessage = apiError.data?.message || apiError.data?.error || 'Registration failed. Please try again.'
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

        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            School Name <span className="text-red-500">*</span>
          </label>
          {(isLoadingSchoolNames || isFetching) ? (
            <div className="w-full bg-gray-100 border border-gray-300 rounded-lg px-3 py-2 text-sm">
              <div className="flex items-center gap-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-green-600"></div>
                {formData.lga ? <span className="text-gray-500">Loading {formData.lga} schools...</span> : <span className="text-gray-500">Loading schools...</span>}
              </div>
            </div>
          ) : !formData.lga ? (
            <div className="w-full bg-gray-50 border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-500">
              Please select an LGA first
            </div>
          ) : schoolNamesList.length === 0 ? (
            <div className="w-full bg-gray-50 border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-500">
              No schools available for the selected LGA
            </div>
          ) : (
            <CustomDropdown
              options={schoolNamesList.map(school => ({
                value: school.schoolName,
                label: String(school.schoolName).startsWith('"') ? String(school.schoolName).slice(1) : school.schoolName
              }))}
              value={formData.schoolName}
              onChange={handleInputChange('schoolName')}
              placeholder="Select a school"
              searchable
              searchPlaceholder="Search school name..."
            />
          )}
          {errors.schoolName && (
            <p className="text-sm text-red-500 mt-1">{errors.schoolName}</p>
          )}
        </div>

        <FormInput
          label="School Address"
          placeholder="Enter school address"
          name="schoolAddress"
          type="text"
          value={formData.schoolAddress}
          onChange={handleInputChange('schoolAddress')}
          error={errors.schoolAddress}
          required
        />

        <FormInput
          label="Principal Name"
          placeholder="Enter principal's full name"
          name="principalName"
          type="text"
          value={formData.principalName}
          onChange={handleInputChange('principalName')}
          error={errors.principalName}
          required
        />

        <FormInput
          label="Contact Email"
          placeholder="Enter contact email address"
          name="contactEmail"
          type="email"
          value={formData.contactEmail}
          onChange={handleInputChange('contactEmail')}
          error={errors.contactEmail}
          required
        />

        <FormInput
          label="Contact Phone"
          placeholder="Enter contact phone number"
          name="contactPhone"
          type="tel"
          value={formData.contactPhone}
          onChange={handleInputChange('contactPhone')}
          error={errors.contactPhone}
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
