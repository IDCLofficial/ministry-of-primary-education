'use client'

import React, { createContext, useContext, useState, ReactNode } from 'react'
import { UBEATStudentRecord } from '../utils/csvParser'

interface ExamModalContextType {
  isModalOpen: boolean
  selectedStudent: UBEATStudentRecord | null
  openModal: (student: UBEATStudentRecord) => void
  closeModal: () => void
  updateStudent: (updatedStudent: UBEATStudentRecord) => void
}

const ExamModalContext = createContext<ExamModalContextType | undefined>(undefined)

interface ExamModalProviderProps {
  children: ReactNode
  onStudentUpdate: (updatedStudent: UBEATStudentRecord) => void
}

export function ExamModalProvider({ children, onStudentUpdate }: ExamModalProviderProps) {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedStudent, setSelectedStudent] = useState<UBEATStudentRecord | null>(null)

  const openModal = (student: UBEATStudentRecord) => {
    setSelectedStudent(student)
    setIsModalOpen(true)
  }

  const closeModal = () => {
    setIsModalOpen(false)
    setSelectedStudent(null)
  }

  const updateStudent = (updatedStudent: UBEATStudentRecord) => {
    onStudentUpdate(updatedStudent)
    setSelectedStudent(updatedStudent)
  }

  return (
    <ExamModalContext.Provider value={{
      isModalOpen,
      selectedStudent,
      openModal,
      closeModal,
      updateStudent
    }}>
      {children}
    </ExamModalContext.Provider>
  )
}

export function useExamModal() {
  const context = useContext(ExamModalContext)
  if (context === undefined) {
    throw new Error('useExamModal must be used within a ExamModalProvider')
  }
  return context
}
