'use client'

import React, { useState, useEffect } from 'react'
import FormInput from './FormInput'
import { useDebounce } from '@/app/portal/utils/hooks/useDebounce'

interface SchoolRegistrationData {
  schoolName: string
  schoolAddress: string
  uniqueCode: string
  principalName: string
  contactEmail: string
  contactPhone: string
  numberOfStudents: string
}

interface FormErrors {
  schoolName?: string
  schoolAddress?: string
  uniqueCode?: string
  principalName?: string
  contactEmail?: string
  contactPhone?: string
  numberOfStudents?: string
}

export default function SchoolRegistrationForm() {
  const [formData, setFormData] = useState<SchoolRegistrationData>({
    schoolName: '',
    schoolAddress: '',
    uniqueCode: '',
    principalName: '',
    contactEmail: '',
    contactPhone: '',
    numberOfStudents: ''
  })

  const [errors, setErrors] = useState<FormErrors>({})

  // Debounced values for validation
  const debouncedSchoolName = useDebounce(formData.schoolName, 500)
  const debouncedSchoolAddress = useDebounce(formData.schoolAddress, 500)
  const debouncedUniqueCode = useDebounce(formData.uniqueCode, 500)
  const debouncedPrincipalName = useDebounce(formData.principalName, 500)
  const debouncedContactEmail = useDebounce(formData.contactEmail, 500)
  const debouncedContactPhone = useDebounce(formData.contactPhone, 500)
  const debouncedNumberOfStudents = useDebounce(formData.numberOfStudents, 500)

  // Validation functions
  const validateField = (field: keyof SchoolRegistrationData, value: string): string | undefined => {
    const sanitizedValue = value.trim()
    
    switch (field) {
      case 'schoolName':
        if (!sanitizedValue) return 'School name is required'
        if (sanitizedValue.length < 2) return 'School name must be at least 2 characters'
        if (sanitizedValue.length > 100) return 'School name must be less than 100 characters'
        break
        
      case 'schoolAddress':
        if (!sanitizedValue) return 'School address is required'
        if (sanitizedValue.length < 10) return 'Please provide a complete address'
        if (sanitizedValue.length > 200) return 'Address must be less than 200 characters'
        break
        
      case 'uniqueCode':
        if (!sanitizedValue) return 'Unique code is required'
        if (!/^[A-Z0-9]{6,12}$/.test(sanitizedValue.toUpperCase())) {
          return 'Unique code must be 6-12 alphanumeric characters'
        }
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
    if (debouncedSchoolName) {
      const error = validateField('schoolName', debouncedSchoolName)
      setErrors(prev => ({ ...prev, schoolName: error }))
    }
  }, [debouncedSchoolName])

  useEffect(() => {
    if (debouncedSchoolAddress) {
      const error = validateField('schoolAddress', debouncedSchoolAddress)
      setErrors(prev => ({ ...prev, schoolAddress: error }))
    }
  }, [debouncedSchoolAddress])

  useEffect(() => {
    if (debouncedUniqueCode) {
      const error = validateField('uniqueCode', debouncedUniqueCode)
      setErrors(prev => ({ ...prev, uniqueCode: error }))
    }
  }, [debouncedUniqueCode])

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
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
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
      
      console.log('Form submitted:', sanitizedData)
      // Handle form submission logic here
      alert('Form submitted successfully!')
    } else {
      console.log('Form has validation errors:', newErrors)
    }
  }

  return (
    <div className="max-w-lg mx-auto bg-white rounded-lg shadow-lg shadow-black/5 border border-black/5 p-6">
      <h2 className="sm:text-2xl text-lg font-semibold text-gray-800 text-center mb-6">
        School Registration Request
      </h2>
      
      <form onSubmit={handleSubmit} className="gap-y-3">
        <FormInput
          label="School Name"
          placeholder="Enter school name"
          name="schoolName"
          value={formData.schoolName}
          datalist={['School A', 'School B', 'School C']}
          onChange={handleInputChange('schoolName')}
          error={errors.schoolName}
          required
        />
        
        <FormInput
          label="School Address"
          placeholder="Enter school address"
          name="schoolAddress"
          value={formData.schoolAddress}
          onChange={handleInputChange('schoolAddress')}
          error={errors.schoolAddress}
          required
        />
        
        <FormInput
          label="Unique Code"
          placeholder="Enter unique code"
          name="uniqueCode"
          value={formData.uniqueCode}
          onChange={handleInputChange('uniqueCode')}
          error={errors.uniqueCode}
          required
        />
        
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
        
        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition duration-200 font-medium"
        >
          Submit Registration
        </button>
      </form>
    </div>
  )
}
