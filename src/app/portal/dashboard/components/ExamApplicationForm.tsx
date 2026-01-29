'use client'

import React, { useState } from 'react'
import Image from 'next/image'
import { useAuth } from '@/app/portal/providers/AuthProvider'
import { ExamType } from '../exams/types'
import { ExamTypeEnum, useSubmitExamApplicationMutation, useGetProfileQuery } from '@/app/portal/store/api/authApi'
import FormInput from '@/components/FormInput'
import toast from 'react-hot-toast'

interface ExamApplicationFormProps {
  exam: ExamType
  onApplicationSubmit: () => void
}

export default function ExamApplicationForm({ exam, onApplicationSubmit }: ExamApplicationFormProps) {
  const { school } = useAuth()
  const [submitApplication, { isLoading: isSubmitting }] = useSubmitExamApplicationMutation()
  const { refetch: refetchProfile } = useGetProfileQuery()
  const [formData, setFormData] = useState({
    numberOfStudents: '',
    contactPerson: school?.schoolName || '',
    contactEmail: school?.email || '',
    contactPhone: ''
  })

  // Map exam IDs to ExamTypeEnum
  const getExamType = (examId: string): ExamTypeEnum => {
    const mapping: Record<string, ExamTypeEnum> = {
      'ubegpt': ExamTypeEnum.UBEGPT,
      'ubetms': ExamTypeEnum.UBETMS,
      'cess': ExamTypeEnum.COMMON_ENTRANCE,
      'bece': ExamTypeEnum.BECE,
      'bece-resit': ExamTypeEnum.BECE_RESIT,
      'ubeat': ExamTypeEnum.UBEAT,
      'jscbe': ExamTypeEnum.JSCBE,
      'waec': ExamTypeEnum.WAEC
    }
    return mapping[examId] || ExamTypeEnum.UBEGPT
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.numberOfStudents || parseInt(formData.numberOfStudents) < 1) {
      toast.error('Please enter a valid number of students')
      return
    }

    if (!school?.id) {
      toast.error('School information not found')
      return
    }

    try {
      const applicationData = {
        examType: getExamType(exam.id),
        schoolId: school.id,
        address: school.address,
        principal: formData.contactPerson,
        email: formData.contactEmail,
        phone: parseInt(formData.contactPhone.replace(/\D/g, '')),
        numberOfStudents: parseInt(formData.numberOfStudents)
      }

      console.log('Application data:', applicationData)

      await submitApplication(applicationData).unwrap()

      toast.success(`Application submitted successfully for ${exam.shortName}!`)

      // Refresh profile to get updated exam data
      await refetchProfile()

      onApplicationSubmit()
    } catch (error) {
      console.error('Application error:', error)
      const apiError = error as { data?: { message?: string; error?: string } }
      const errorMessage = apiError.data?.message || apiError.data?.error || 'Failed to submit application. Please try again.'
      toast.error(errorMessage)
    }
  }

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-4">
          <Image
            src={exam.iconPath}
            alt={exam.shortName}
            width={48}
            height={48}
            className="object-contain"
          />
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{exam.shortName}</h2>
            <p className="text-sm text-gray-600">{exam.name}</p>
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-blue-800">
            <strong>Note:</strong> Complete this form to register your school for {exam.shortName}.
            Once approved, you&apos;ll gain access to the examination dashboard.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <FormInput
          label="School Name"
          name="contactPerson"
          type="text"
          placeholder="School name"
          value={formData.contactPerson}
          onChange={(value) => setFormData(prev => ({ ...prev, contactPerson: value }))}
          disabled
          required
        />


        <FormInput
          label="Contact Email"
          name="contactEmail"
          type="email"
          placeholder="Contact email"
          value={formData.contactEmail}
          onChange={(value) => setFormData(prev => ({ ...prev, contactEmail: value }))}
          disabled
          required
        />

        <FormInput
          label="Contact Phone"
          name="contactPhone"
          type="tel"
          placeholder="Enter contact phone number"
          value={formData.contactPhone}
          onChange={(value) => setFormData(prev => ({ ...prev, contactPhone: value }))}
          required
        />

        <FormInput
          label="Number of Students"
          name="numberOfStudents"
          type="number"
          placeholder="Enter number of students"
          value={formData.numberOfStudents}
          onChange={(value) => setFormData(prev => ({ ...prev, numberOfStudents: value }))}
          required
        />

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-all duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed active:scale-95"
        >
          {isSubmitting ? 'Submitting Application...' : 'Submit Application'}
        </button>
      </form>
    </div>
  )
}
