'use client'

import React, { createContext, useContext, useState, ReactNode } from 'react'

interface StudentRecord {
  schoolName: string
  serialNo: number
  name: string
  examNo: string
  sex: "Male" | "Female"
  age: number
  englishStudies: number
  mathematics: number
  basicScience: number
  christianReligiousStudies: number
  nationalValues: number
  culturalAndCreativeArts: number
  businessStudies: number
  history: number
  igbo: number
  hausa: number
  yoruba: number
  preVocationalStudies: number
  frenchLanguage: number
}

interface CAModalContextType {
  isModalOpen: boolean
  selectedStudent: StudentRecord | null
  openModal: (student: StudentRecord) => void
  closeModal: () => void
  updateStudent: (updatedStudent: StudentRecord) => void
}

const CAModalContext = createContext<CAModalContextType | undefined>(undefined)

interface CAModalProviderProps {
  children: ReactNode
  onStudentUpdate: (updatedStudent: StudentRecord) => void
}

export function CAModalProvider({ children, onStudentUpdate }: CAModalProviderProps) {
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
    <CAModalContext.Provider value={{
      isModalOpen,
      selectedStudent,
      openModal,
      closeModal,
      updateStudent
    }}>
      {children}
    </CAModalContext.Provider>
  )
}

export function useCAModal() {
  const context = useContext(CAModalContext)
  if (context === undefined) {
    throw new Error('useCAModal must be used within a CAModalProvider')
  }
  return context
}
