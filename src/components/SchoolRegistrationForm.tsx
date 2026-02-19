'use client'

import React, { useState, useEffect, useMemo } from 'react'
import FormInput from './FormInput'
import CustomDropdown from '@/app/portal/dashboard/components/CustomDropdown'
import { useDebounce } from '@/app/portal/utils/hooks/useDebounce'
import { useGetSchoolNamesQuery, useSubmitSchoolApplicationMutation } from '@/app/portal/store/api/authApi'
import toast from 'react-hot-toast'
import { useRouter } from 'next/navigation'

interface SchoolRegistrationData {
  schoolId: string
  schoolAddress: string
  principalName: string
  contactEmail: string
  contactPhone: string
  numberOfStudents: string
}

interface FormErrors {
  schoolId?: string
  schoolAddress?: string
  principalName?: string
  contactEmail?: string
  contactPhone?: string
  numberOfStudents?: string
}

export default function SchoolRegistrationForm() {
  // Router for navigation
  const router = useRouter()

  const [formData, setFormData] = useState<SchoolRegistrationData>({
    schoolId: '',
    schoolAddress: '',
    principalName: '',
    contactEmail: '',
    contactPhone: '',
    numberOfStudents: ''
  })

  // Fetch school names from API based on selected LGA (schoolAddress)
  const { data: schoolNames, isLoading: isLoadingSchoolNames } = useGetSchoolNamesQuery(
    { lga: formData.schoolAddress },
    { skip: !formData.schoolAddress }
  )

  // Submit school application mutation
  const [submitApplication, { isLoading: isSubmitting }] = useSubmitSchoolApplicationMutation()

  const [errors, setErrors] = useState<FormErrors>({})
  const [serverError, setServerError] = useState<string>('')

  // Transform school names for datalist
  const schoolNamesList = schoolNames || []

  // Check if form can proceed (no errors and all required fields filled)
  const canProceed = useMemo(() => {
    const hasErrors = Object.values(errors).some(error => error !== undefined && error !== '')
    const hasEmptyFields = Object.values(formData).some(value => value.trim() === '')

    // Check if selected school is eligible (only "not applied" schools can proceed)
    const selectedSchool = schoolNames?.find(school => school._id === formData.schoolId)
    const isSchoolEligible = selectedSchool?.status === 'not applied'

    return !hasErrors && !hasEmptyFields && isSchoolEligible && !isSubmitting
  }, [errors, formData, schoolNames, isSubmitting])

  // Debounced values for validation
  const debouncedSchoolId = useDebounce(formData.schoolId, 500)
  const debouncedSchoolAddress = useDebounce(formData.schoolAddress, 500)
  const debouncedPrincipalName = useDebounce(formData.principalName, 500)
  const debouncedContactEmail = useDebounce(formData.contactEmail, 500)
  const debouncedContactPhone = useDebounce(formData.contactPhone, 500)
  const debouncedNumberOfStudents = useDebounce(formData.numberOfStudents, 500)

  // Validation functions
  const validateField = (field: keyof SchoolRegistrationData, value: string): string | undefined => {
    const sanitizedValue = value.trim()

    switch (field) {
      case 'schoolId':
        if (!sanitizedValue) return 'School selection is required'
        break

      case 'schoolAddress':
        if (!sanitizedValue) return 'School location is required'
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

      case 'numberOfStudents':
        if (!sanitizedValue) return 'Number of students is required'
        const num = parseInt(sanitizedValue)
        if (isNaN(num) || num < 1) return 'Please enter a valid number of students'
        if (num > 10000) return 'Number seems too large, please verify'
        break
    }

    return undefined
  }

  // Validation effects for debounced values
  useEffect(() => {
    if (debouncedSchoolId) {
      const error = validateField('schoolId', debouncedSchoolId)
      const findExistingSchool = schoolNames?.find(school => school._id === debouncedSchoolId)
      if (findExistingSchool && findExistingSchool.status === 'approved') {
        return setErrors(prev => ({ ...prev, schoolId: 'This school has already been approved and cannot apply again' }))
      }

      if (findExistingSchool && findExistingSchool.status === 'applied') {
        return setErrors(prev => ({ ...prev, schoolId: 'This school has already applied and cannot apply again' }))
      }

      if (findExistingSchool && findExistingSchool.status === 'pending') {
        return setErrors(prev => ({ ...prev, schoolId: 'This school already has a pending application. Please wait for the current application to be processed' }))
      }

      if (findExistingSchool && findExistingSchool.status === 'rejected') {
        return setErrors(prev => ({ ...prev, schoolId: 'This school\'s previous application was rejected. Please contact our support team for assistance' }))
      }

      setErrors(prev => ({ ...prev, schoolId: error }))
    }
  }, [debouncedSchoolId, schoolNames])

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
    if (debouncedNumberOfStudents) {
      const error = validateField('numberOfStudents', debouncedNumberOfStudents)
      setErrors(prev => ({ ...prev, numberOfStudents: error }))
    }
  }, [debouncedNumberOfStudents])

  const handleInputChange = (field: keyof SchoolRegistrationData) => (value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }))
    }
    // Clear server error when form is updated
    if (serverError) {
      setServerError('')
    }
  }

  // Clear server error after 5 seconds
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

    // Check if form can proceed
    if (!canProceed) {
      toast.error('Please fix all errors before submitting')
      return
    }

    // Validate all fields before submission
    const newErrors: FormErrors = {}
    let hasErrors = false

    Object.keys(formData).forEach((key) => {
      const field = key as keyof SchoolRegistrationData
      const error = validateField(field, formData[field])
      if (error) {
        newErrors[field] = error
        hasErrors = true
      }
    })

    setErrors(newErrors)

    if (!hasErrors) {
      // Sanitize all data before submission
      const sanitizedData = Object.keys(formData).reduce((acc, key) => {
        const field = key as keyof SchoolRegistrationData
        acc[field] = formData[field].trim()
        return acc
      }, {} as SchoolRegistrationData)

      try {
        // Transform data to match API schema
        const applicationData = {
          schoolId: sanitizedData.schoolId,
          address: sanitizedData.schoolAddress,
          principal: sanitizedData.principalName,
          email: sanitizedData.contactEmail,
          phone: parseInt(sanitizedData.contactPhone.replace(/\D/g, '')), // Remove non-digits
          numberOfStudents: parseInt(sanitizedData.numberOfStudents)
        }

        const result = await submitApplication(applicationData).unwrap()

        // Success notification with server message
        const successMessage = result?.message || 'Application submitted successfully!'
        toast.success(successMessage)

        setFormData({
          schoolId: '',
          schoolAddress: '',
          principalName: '',
          contactEmail: '',
          contactPhone: '',
          numberOfStudents: ''
        })

        // Redirect to success page with URL parameter
        router.push('/portal/application?submitted=true')
      } catch (error: unknown) {
        console.error('Application submission failed:', error)

        // Handle different error types with server messages
        const apiError = error as {
          status?: number;
          data?: {
            message?: string;
            error?: string;
            statusCode?: number
          }
        }

        if (apiError?.status === 404) {
          const message = apiError.data?.message || 'School code not found in our system'
          setServerError(message)
          toast.error(message)
        } else if (apiError?.status === 409) {
          const message = apiError.data?.message || 'School already has a pending application'
          setServerError(message)
          toast.error(message)
        } else if (apiError?.status === 400) {
          const message = apiError.data?.message || 'Invalid application data. Please check your inputs.'
          setServerError(message)
          toast.error(message)
        } else if (apiError?.status === 201) {
          // This shouldn't happen in catch block, but just in case
          const message = apiError.data?.message || 'Application submitted successfully!'
          toast.success(message)
        } else {
          // Handle network errors and other issues
          const message = apiError.data?.message || 'Failed to submit application. Please try again.'
          setServerError(message)
          toast.error(message)
        }
      }
    } else {
      console.error('Form has validation errors:', newErrors)
      toast.error('Please fix all validation errors before submitting')
    }
  }

  return (
    <div className="max-w-lg mx-auto bg-white rounded-lg shadow-lg shadow-black/5 border border-black/5 sm:p-6 p-4">
      <h2 className="sm:text-2xl text-lg font-semibold text-gray-800 text-center mb-6">
        School Registration Request
      </h2>

      <form onSubmit={handleSubmit} className="gap-y-3">
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            School Name <span className="text-red-500">*</span>
          </label>
          {isLoadingSchoolNames ? (
            <div className="w-full bg-gray-100 border border-gray-300 rounded-lg px-3 py-2 text-sm">
              <div className="flex items-center gap-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-green-600"></div>
                <span className="text-gray-500">Loading schools...</span>
              </div>
            </div>
          ) : (
            <CustomDropdown
              options={schoolNamesList.map(school => ({
                value: school._id,
                label: String(school.schoolName).startsWith(`"`) ? String(school.schoolName).slice(1) : school.schoolName
              }))}
              value={formData.schoolId}
              onChange={handleInputChange('schoolId')}
              placeholder="Select a school"
              className="w-full"
              searchable
              searchPlaceholder='Search school name...'
            />
          )}
          {errors.schoolId && (
            <p className="mt-1 text-sm text-red-600">{errors.schoolId}</p>
          )}
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            School <abbr title="Local Government Area">LGA</abbr>. <span className="text-red-500">*</span>
          </label>
          <CustomDropdown
            options={[
              "Aboh Mbaise",
              "Ahiazu Mbaise",
              "Ehime Mbano",
              "Ezinihitte",
              "Ideato North",
              "Ideato South",
              "Ihitte/Uboma",
              "Ikeduru",
              "Isiala Mbano",
              "Mbaitoli",
              "Isu",
              "Ngor Okpala",
              "Njaba",
              "Nkwerre",
              "Nwangele",
              "Obowo",
              "Oguta",
              "Ohaji/Egbema",
              "Okigwe",
              "Orlu",
              "Orsu",
              "Oru East",
              "Oru West",
              "Owerri Municipal",
              "Owerri North",
              "Unuimo",
              "Owerri West"
            ].map(location => ({
              value: location,
              label: location
            }))}
            searchable
            searchPlaceholder='Search LGA...'
            value={formData.schoolAddress}
            onChange={handleInputChange('schoolAddress')}
            placeholder="Select school location"
            className="w-full"
          />
          {errors.schoolAddress && (
            <p className="mt-1 text-sm text-red-600">{errors.schoolAddress}</p>
          )}
        </div>

        <FormInput
          label="Principal's Name"
          placeholder="Enter principal's name"
          name="principalName"
          value={formData.principalName}
          onChange={handleInputChange('principalName')}
          error={errors.principalName}
          required
        />

        <FormInput
          label="Contact Email"
          placeholder="Enter contact email"
          name="contactEmail"
          type="email"
          value={formData.contactEmail}
          onChange={handleInputChange('contactEmail')}
          error={errors.contactEmail}
          required
        />

        <FormInput
          label="Contact Phone"
          placeholder="Enter contact phone"
          name="contactPhone"
          type="tel"
          value={formData.contactPhone}
          onChange={handleInputChange('contactPhone')}
          error={errors.contactPhone}
          required
        />

        <FormInput
          label="Number of Students"
          placeholder="Enter number of students"
          name="numberOfStudents"
          type="number"
          value={formData.numberOfStudents}
          onChange={handleInputChange('numberOfStudents')}
          error={errors.numberOfStudents}
          required
        />

        {serverError && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
            <p className='text-red-600 text-center text-sm font-medium'>
              {serverError}
            </p>
          </div>
        )}

        <button
          type="submit"
          className={(
            `w-full text-white py-3 px-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition duration-200 font-medium` +
            (!canProceed ? ' bg-gray-400 opacity-50 cursor-not-allowed' : ' bg-green-600 hover:bg-green-700 cursor-pointer')
          )}
          disabled={!canProceed}
        >
          {isSubmitting ? 'Submitting...' : 'Submit Registration'}
        </button>
      </form>
    </div>
  )
}