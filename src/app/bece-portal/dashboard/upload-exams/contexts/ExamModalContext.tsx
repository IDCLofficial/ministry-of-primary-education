'use client'

import React, { createContext, useContext, useState, ReactNode } from 'react'
import { StudentRecord } from '../../upload-ca/utils/csvParser'

interface ExamModalContextType {
  isModalOpen: boolean
  selectedStudent: StudentRecord   | null
  openModal: (student: StudentRecord) => void
  closeModal: () => void
  updateStudent: (updatedStudent: StudentRecord) => void
}

const ExamModalContext = createContext<ExamModalContextType | undefined>(undefined)

interface ExamModalProviderProps {
  children: ReactNode
  onStudentUpdate: (updatedStudent: StudentRecord) => void
}

export function ExamModalProvider({ children, onStudentUpdate }: ExamModalProviderProps) {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedStudent, setSelectedStudent] = useState<StudentRecord | null>(null)

  const openModal = (student: StudentRecord) => {
    setSelectedStudent(student)
    setIsModalOpen(true)
  }

  const closeModal = () => {
    setIsModalOpen(false)
    setSelectedStudent(null)
  }

  const updateStudent = (updatedStudent: StudentRecord) => {
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
