'use client'

import React, { useState } from 'react'
import { IoClose, IoSave, IoPencil } from 'react-icons/io5'
import toast from 'react-hot-toast'

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

interface CAModalProps {
  isOpen: boolean
  onClose: () => void
  student: StudentRecord | null
  onUpdate: (updatedStudent: StudentRecord) => void
}

export default function CAModal({ isOpen, onClose, student, onUpdate }: CAModalProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editedStudent, setEditedStudent] = useState<StudentRecord | null>(null)

  // Initialize edited student when modal opens or student changes
  React.useEffect(() => {
    if (student) {
      setEditedStudent({ ...student })
      setIsEditing(false) // Reset edit mode when student changes
    }
  }, [student])

  // Update edited student when the original student data changes (after save)
  React.useEffect(() => {
    if (student && !isEditing) {
      setEditedStudent({ ...student })
    }
  }, [student, isEditing])

  if (!isOpen || !student) return null

  const subjects = [
    { key: 'englishStudies', label: 'English Studies' },
    { key: 'mathematics', label: 'Mathematics' },
    { key: 'basicScience', label: 'Basic Science' },
    { key: 'christianReligiousStudies', label: 'Christian Religious Studies' },
    { key: 'nationalValues', label: 'National Values' },
    { key: 'culturalAndCreativeArts', label: 'Cultural and Creative Arts' },
    { key: 'businessStudies', label: 'Business Studies' },
    { key: 'history', label: 'History' },
    { key: 'igbo', label: 'Igbo Language' },
    { key: 'hausa', label: 'Hausa Language' },
    { key: 'yoruba', label: 'Yoruba Language' },
    { key: 'preVocationalStudies', label: 'Pre-Vocational Studies' },
    { key: 'frenchLanguage', label: 'French Language' }
  ]

  const getScoreColor = (score: number) => {
    // CA scores are out of 30, so 21/30 (70%) is excellent, 15/30 (50%) is good
    if (score >= 21) return 'bg-green-100 text-green-800 border-green-200'
    if (score >= 15) return 'bg-yellow-100 text-yellow-800 border-yellow-200'
    return 'bg-red-100 text-red-800 border-red-200'
  }

  const getPercentage = (score: number) => {
    return ((score / 30) * 100).toFixed(1)
  }

  const calculateAverage = () => {
    const currentStudent = isEditing ? editedStudent : student
    if (!currentStudent) return '0'
    const scores = subjects.map(s => currentStudent[s.key as keyof StudentRecord] as number)
    const total = scores.reduce((sum, score) => sum + score, 0)
    return (total / scores.length).toFixed(1)
  }

  const handleEdit = () => {
    setIsEditing(true)
  }

  const handleSave = () => {
    if (editedStudent) {
      onUpdate(editedStudent)
      setIsEditing(false)
      toast.success(`Successfully updated CA scores for ${editedStudent.name}`)
    }
  }

  const handleCancel = () => {
    setEditedStudent({ ...student })
    setIsEditing(false)
  }

  const handleScoreChange = (subjectKey: string, value: string) => {
    if (!editedStudent) return
    const numValue = parseFloat(value) || 0
    setEditedStudent({
      ...editedStudent,
      [subjectKey]: Math.min(Math.max(numValue, 0), 30) // Clamp between 0 and 30
    })
  }

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
                Continuous Assessment Report
              </h3>
              <p className="text-sm text-gray-600 mt-1">
                {student.name} - {student.examNo}
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
                    className="inline-flex cursor-pointer active:scale-90 active:rotate-1 transition-all duration-150 items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Cancel
                  </button>
                </>
              ) : (
                <button
                  onClick={handleEdit}
                  className="inline-flex cursor-pointer active:scale-90 active:rotate-1 transition-all duration-150 items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  <IoPencil className="w-4 h-4 mr-2" />
                  Edit CA Scores
                </button>
              )}
              <button
                onClick={onClose}
                className="p-2 text-gray-400 cursor-pointer active:scale-90 active:rotate-1 transition-all duration-150 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 rounded-md"
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
                <p className="text-sm text-gray-900 mt-1">{student.schoolName}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Serial No</label>
                <p className="text-sm text-gray-900 mt-1">{student.serialNo}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Full Name</label>
                <p className="text-sm text-gray-900 mt-1">{student.name}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Exam Number</label>
                <p className="text-sm text-gray-900 mt-1">{student.examNo}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Gender</label>
                <p className="text-sm text-gray-900 mt-1">{student.sex}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Age</label>
                <p className="text-sm text-gray-900 mt-1">{student.age} years</p>
              </div>
            </div>
          </div>

          {/* CA Scores */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-lg font-medium text-gray-900">Continuous Assessment Scores</h4>
              <div className="text-right">
                <p className="text-sm text-gray-500">Average Score</p>
                <p className="text-2xl font-bold text-blue-600">{calculateAverage()}%</p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {subjects.map(({ key, label }) => {
                const currentStudent = isEditing ? editedStudent : student
                const score = currentStudent?.[key as keyof StudentRecord] as number || 0
                return (
                  <div
                    key={key}
                    className={`p-4 rounded-lg border-2 ${getScoreColor(score)}`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h5 className="font-medium text-sm">{label}</h5>
                        <div className="flex items-center space-x-2 mt-1">
                          {isEditing ? (
                            <input
                              type="number"
                              min="0"
                              max="30"
                              value={score}
                              onChange={(e) => handleScoreChange(key, e.target.value)}
                              className="w-16 px-2 py-1 text-lg font-bold border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                          ) : (
                            <span className="text-2xl font-bold">{score}</span>
                          )}
                        </div>
                      </div>
                      <div className="ml-2">
                        <div className="w-12 h-12 rounded-full bg-white bg-opacity-50 flex items-center justify-center">
                          <span className="text-xs font-bold">{getPercentage(score)}%</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Upload Summary */}
          <div className="bg-blue-50 rounded-lg p-4">
            <h4 className="text-lg font-medium text-blue-900 mb-3">Upload Summary</h4>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-green-600">
                  {subjects.filter(s => (student[s.key as keyof StudentRecord] as number) > 0).length}
                </p>
                <p className="text-sm text-gray-600">Subjects Uploaded</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-red-600">
                  {subjects.filter(s => (student[s.key as keyof StudentRecord] as number) === 0).length}
                </p>
                <p className="text-sm text-gray-600">Missing Scores</p>
              </div>
            </div>
            
            {/* Missing Subjects List */}
            {subjects.filter(s => (student[s.key as keyof StudentRecord] as number) === 0).length > 0 && (
              <div className="mt-4 p-3 bg-red-50 rounded-lg border border-red-200">
                <h5 className="text-sm font-medium text-red-800 mb-2">Missing Subjects:</h5>
                <div className="flex flex-wrap gap-2">
                  {subjects
                    .filter(s => (student[s.key as keyof StudentRecord] as number) === 0)
                    .map(subject => (
                      <span 
                        key={subject.key}
                        className="inline-flex px-2 py-1 text-xs font-medium bg-red-100 text-red-800 rounded-full"
                      >
                        {subject.label}
                      </span>
                    ))
                  }
                </div>
              </div>
            )}
            
            {/* Complete Upload Message */}
            {subjects.filter(s => (student[s.key as keyof StudentRecord] as number) === 0).length === 0 && (
              <div className="mt-4 p-3 bg-green-50 rounded-lg border border-green-200">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-green-800">
                      Complete Upload - All subjects have scores recorded
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
