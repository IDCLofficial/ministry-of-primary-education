'use client'

import React, { useState } from 'react'
import { IoClose, IoSave, IoPencil } from 'react-icons/io5'
import toast from 'react-hot-toast'
import { UBEATStudentRecord } from '../utils/csvParser'
import useShortcuts, { KeyboardKey } from '@useverse/useshortcuts'

interface ExamModalProps {
  isOpen: boolean
  onClose: () => void
  student: UBEATStudentRecord | null
  onUpdate: (updatedStudent: UBEATStudentRecord) => void
}

export default function ExamModal({ isOpen, onClose, student, onUpdate }: ExamModalProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editedStudent, setEditedStudent] = useState<UBEATStudentRecord | null>(null)
  const [focusedField, setFocusedField] = useState<string | null>(null)
  const inputRefs = React.useRef<{ [key: string]: HTMLInputElement | null }>({})

  // Initialize edited student when modal opens or student changes
  React.useEffect(() => {
    if (student) {
      setEditedStudent({ ...student })
      setIsEditing(false)
    }
  }, [student])

  // Update edited student when the original student data changes (after save)
  React.useEffect(() => {
    if (student && !isEditing) {
      setEditedStudent({ ...student })
    }
  }, [student, isEditing])

  const subjects = [
    { key: 'mathematics', label: 'Mathematics' },
    { key: 'english', label: 'English Language' },
    { key: 'generalKnowledge', label: 'General Knowledge' },
    { key: 'igbo', label: 'Igbo Language' }
  ] as const

  const getScoreColor = (score: number, maxScore: number = 100) => {
    const percentage = (score / maxScore) * 100
    if (percentage >= 70) return 'bg-green-100 text-green-800 border-green-200'
    if (percentage >= 50) return 'bg-yellow-100 text-yellow-800 border-yellow-200'
    return 'bg-red-100 text-red-800 border-red-200'
  }

  const calculateTotal = (ca: string, exam: number) => {
    const caNum = parseFloat(ca) || 0
    return caNum + exam
  }

  const calculateAverage = () => {
    const currentStudent = isEditing ? editedStudent : student
    if (!currentStudent) return '0'
    
    const totals = subjects.map(s => {
      const subject = currentStudent.subjects[s.key]
      return calculateTotal(subject.ca, subject.exam)
    })
    const sum = totals.reduce((acc, val) => acc + val, 0)
    return (sum / subjects.length).toFixed(1)
  }

  const calculateTotalScore = () => {
    const currentStudent = isEditing ? editedStudent : student
    if (!currentStudent) return '0'
    
    const totals = subjects.map(s => {
      const subject = currentStudent.subjects[s.key]
      return calculateTotal(subject.ca, subject.exam)
    })
    const sum = totals.reduce((acc, val) => acc + val, 0)
    return sum.toFixed(0)
  }

  const handleEdit = () => {
    setIsEditing(true)
  }

  const handleDoubleClick = (subjectKey: string, field: string) => {
    setIsEditing(true)
    setFocusedField(`${subjectKey}_${field}`)
  }

  // Focus the input when editing is enabled via double-click
  React.useEffect(() => {
    if (isEditing && focusedField && inputRefs.current[focusedField]) {
      inputRefs.current[focusedField]?.focus()
      inputRefs.current[focusedField]?.select()
      setFocusedField(null)
    }
  }, [isEditing, focusedField])

  const handleSave = () => {
    if (editedStudent) {
      onUpdate(editedStudent)
      setIsEditing(false)
      toast.success(`Successfully updated UBEAT scores for ${editedStudent.studentName}`)
    }
  }

  useShortcuts({
    shortcuts: [
      { key: "Escape", enabled: isOpen },
      { key: "Enter", enabled: isEditing && isOpen }
    ],
    onTrigger: (shortcut) => {
      switch (shortcut.key) {
        case KeyboardKey.Escape:
          if (isEditing) {
            setIsEditing(false)
            return
          }
          onClose()
          break
        case KeyboardKey.Enter:
          handleSave()
          break
      }
    }
  }, [isOpen, isEditing, handleSave])

  if (!isOpen || !student) return null

  const handleCancel = () => {
    setEditedStudent({ ...student })
    setIsEditing(false)
  }

  const handleScoreChange = (subjectKey: typeof subjects[number]['key'], field: 'ca' | 'exam', value: string) => {
    if (!editedStudent) return
    
    const newSubject = { ...editedStudent.subjects[subjectKey] }
    
    if (field === 'ca') {
      // CA is stored as string, validate it's a number
      const numValue = parseFloat(value) || 0
      const clampedValue = Math.min(Math.max(numValue, 0), 30)
      newSubject.ca = clampedValue.toString()
    } else {
      // Exam is stored as number
      const numValue = parseFloat(value) || 0
      const clampedValue = Math.min(Math.max(numValue, 0), 70)
      newSubject.exam = clampedValue
    }
    
    setEditedStudent({
      ...editedStudent,
      subjects: {
        ...editedStudent.subjects,
        [subjectKey]: newSubject
      }
    })
  }

  const currentStudent = isEditing ? editedStudent : student

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        {/* Background overlay */}
        <div
          className="fixed inset-0 transition-opacity bg-black/50"
          onClick={onClose}
        />

        {/* Modal panel */}
        <div className="inline-block w-full relative z-20 max-w-4xl p-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-2xl">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-2xl font-bold text-gray-900">
                UBEAT Examination Report
              </h3>
              <p className="text-sm text-gray-600 mt-1">
                {currentStudent?.studentName} - {currentStudent?.examNumber}
              </p>
            </div>
            <div className="flex items-center space-x-2">
              {isEditing ? (
                <>
                  <button
                    onClick={handleSave}
                    className="inline-flex cursor-pointer active:scale-90 active:rotate-1 transition-all duration-150 items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                  >
                    <IoSave className="w-4 h-4 mr-2" />
                    Save
                  </button>
                  <button
                    onClick={handleCancel}
                    className="inline-flex cursor-pointer active:scale-90 active:rotate-1 transition-all duration-150 items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                  >
                    Cancel
                  </button>
                </>
              ) : (
                <button
                  onClick={handleEdit}
                  className="inline-flex cursor-pointer active:scale-90 active:rotate-1 transition-all duration-150 items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                >
                  <IoPencil className="w-4 h-4 mr-2" />
                  Edit Scores
                </button>
              )}
              <button
                onClick={onClose}
                className="p-2 text-gray-400 cursor-pointer active:scale-90 active:rotate-1 transition-all duration-150 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 rounded-md"
              >
                <IoClose className="w-6 h-6" />
              </button>
            </div>
          </div>

          {/* Student Info */}
          <div className="bg-gray-50 border border-black/5 rounded-lg p-4 mb-6">
            <h4 className="text-lg font-medium text-gray-900 mb-3">Student Information</h4>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-500">School Name</label>
                <p className="text-sm text-gray-900 mt-1 capitalize">{currentStudent?.schoolName.toLowerCase()}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">LGA</label>
                <p className="text-sm text-gray-900 mt-1 capitalize">{currentStudent?.lga.toLowerCase()}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Zone</label>
                <p className="text-sm text-gray-900 mt-1 capitalize">{currentStudent?.zone.toLowerCase()}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Full Name</label>
                <p className="text-sm text-gray-900 mt-1 capitalize">{currentStudent?.studentName.toLowerCase()}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Exam Number</label>
                <p className="text-sm text-gray-900 mt-1">{currentStudent?.examNumber}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Age / Sex</label>
                <p className="text-sm text-gray-900 mt-1">{currentStudent?.age} years / <span className="capitalize">{currentStudent?.sex}</span></p>
              </div>
            </div>
          </div>

          {/* Subjects Table */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-lg font-medium text-gray-900">Subject CA & Exam Scores</h4>
              <div className="text-right">
                <p className="text-sm text-gray-500">Average Score</p>
                <p className="text-2xl font-bold text-green-600">{calculateAverage()}%</p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Subject
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      CA (30%)
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Exam (70%)
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Total (100)
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {currentStudent && subjects.map((subject) => {
                    const subjectData = currentStudent.subjects[subject.key]
                    const caValue = parseFloat(subjectData.ca) || 0
                    const examValue = subjectData.exam
                    const totalValue = caValue + examValue
                    
                    return (
                      <tr key={subject.key} className="hover:bg-gray-50">
                        <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {subject.label}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-center">
                          {isEditing ? (
                            <input
                              ref={(el) => { inputRefs.current[`${subject.key}_ca`] = el }}
                              type="number"
                              min="0"
                              max="30"
                              value={subjectData.ca}
                              onChange={(e) => handleScoreChange(subject.key, 'ca', e.target.value)}
                              className="w-20 px-2 py-1 text-center border border-gray-300 rounded focus:ring-2 focus:ring-green-500 focus:border-transparent"
                            />
                          ) : (
                            <span
                              onDoubleClick={() => handleDoubleClick(subject.key, 'ca')}
                              className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium cursor-pointer ${getScoreColor(caValue, 30)}`}
                            >
                              {caValue.toFixed(0)}
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-center">
                          {isEditing ? (
                            <input
                              ref={(el) => { inputRefs.current[`${subject.key}_exam`] = el }}
                              type="number"
                              min="0"
                              max="70"
                              value={examValue}
                              onChange={(e) => handleScoreChange(subject.key, 'exam', e.target.value)}
                              className="w-20 px-2 py-1 text-center border border-gray-300 rounded focus:ring-2 focus:ring-green-500 focus:border-transparent"
                            />
                          ) : (
                            <span
                              onDoubleClick={() => handleDoubleClick(subject.key, 'exam')}
                              className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium cursor-pointer ${getScoreColor(examValue, 70)}`}
                            >
                              {examValue.toFixed(0)}
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-center">
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getScoreColor(totalValue)}`}>
                            {totalValue.toFixed(0)}
                          </span>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
                <tfoot className="bg-gray-50">
                  <tr>
                    <td className="px-4 py-3 text-sm font-semibold text-gray-900">
                      Total / Average
                    </td>
                    <td colSpan={2} className="px-4 py-3 text-center text-sm font-semibold text-gray-900">
                      {calculateTotalScore()} / 400
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-blue-100 text-blue-800 border border-blue-200">
                        {calculateAverage()}
                      </span>
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>

            {isEditing && (
              <p className="text-xs text-gray-500 mt-2">
                💡 Tip: Double-click on any score to quickly edit. Press Enter to save or Escape to cancel.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
