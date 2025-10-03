'use client'
import React, { useState, useEffect, useMemo } from 'react'
import { IoClose, IoSchool, IoPerson, IoCalendar, IoMale, IoFemale, IoRibbon, IoPencil, IoSave } from 'react-icons/io5'
import toast from 'react-hot-toast'
import { Student } from '../types/student.types'

interface ExamResult {
    subject: string
    caScore: number
    examScore: number
    total: number
    grade: string
}

interface StudentModalProps {
    isOpen: boolean
    onClose: () => void
    student: Student | null
    schoolName?: string
    onUpdate?: (student: Student, examResults: ExamResult[]) => void
}

export default function StudentModal({ isOpen, onClose, student, schoolName, onUpdate }: StudentModalProps) {
    const [isEditing, setIsEditing] = useState(false)
    const [editedResults, setEditedResults] = useState<ExamResult[]>([])

    // Sample exam results and grades - memoized to prevent re-creation on every render
    const initialExamResults: ExamResult[] = useMemo(() => [
        { subject: 'English Language', caScore: 25, examScore: 68, total: 93, grade: 'A1' },
        { subject: 'Mathematics', caScore: 28, examScore: 72, total: 100, grade: 'A1' },
        { subject: 'Basic Science', caScore: 22, examScore: 65, total: 87, grade: 'B2' },
        { subject: 'Social Studies', caScore: 24, examScore: 58, total: 82, grade: 'B2' },
        { subject: 'French Language', caScore: 20, examScore: 45, total: 65, grade: 'C4' },
        { subject: 'Creative Arts', caScore: 26, examScore: 62, total: 88, grade: 'B2' },
        { subject: 'Business Studies', caScore: 23, examScore: 55, total: 78, grade: 'B3' },
        { subject: 'Computer Studies', caScore: 27, examScore: 70, total: 97, grade: 'A1' },
        { subject: 'Agricultural Science', caScore: 21, examScore: 48, total: 69, grade: 'C5' }
    ], [])

    // Initialize edited results when modal opens or student changes
    useEffect(() => {
        if (student) {
            setEditedResults([...initialExamResults])
            setIsEditing(false)
        }
    }, [student, initialExamResults])

    // Update edited results when not editing
    useEffect(() => {
        if (!isEditing) {
            setEditedResults([...initialExamResults])
        }
    }, [isEditing, initialExamResults])

    if (!isOpen || !student) return null

    const examResults = isEditing ? editedResults : initialExamResults

    const calculateGrade = (total: number): string => {
        if (total >= 80) return 'A1'
        if (total >= 70) return 'B2'
        if (total >= 65) return 'B3'
        if (total >= 60) return 'C4'
        if (total >= 55) return 'C5'
        if (total >= 50) return 'C6'
        if (total >= 45) return 'D7'
        if (total >= 40) return 'E8'
        return 'F9'
    }

    const handleEdit = () => {
        setIsEditing(true)
    }

    const handleSave = () => {
        if (onUpdate) {
            onUpdate(student, editedResults)
        }
        setIsEditing(false)
        toast.success(`Successfully updated exam results for ${student.firstName} ${student.lastName}`)
    }

    const handleCancel = () => {
        setEditedResults([...initialExamResults])
        setIsEditing(false)
    }

    const handleScoreChange = (index: number, field: 'caScore' | 'examScore', value: string) => {
        const numValue = parseFloat(value) || 0
        const maxValue = field === 'caScore' ? 30 : 70
        const clampedValue = Math.min(Math.max(numValue, 0), maxValue)
        
        setEditedResults(prev => {
            const updated = [...prev]
            updated[index] = {
                ...updated[index],
                [field]: clampedValue,
                total: field === 'caScore' 
                    ? clampedValue + updated[index].examScore
                    : updated[index].caScore + clampedValue
            }
            updated[index].grade = calculateGrade(updated[index].total)
            return updated
        })
    }

    const getGradeColor = (grade: string) => {
        if (grade.startsWith('A')) return 'bg-green-100 text-green-800 border-green-200'
        if (grade.startsWith('B')) return 'bg-blue-100 text-blue-800 border-blue-200'
        if (grade.startsWith('C')) return 'bg-yellow-100 text-yellow-800 border-yellow-200'
        if (grade.startsWith('D')) return 'bg-orange-100 text-orange-800 border-orange-200'
        return 'bg-red-100 text-red-800 border-red-200'
    }

    const calculateOverallGrade = () => {
        const totalPoints = examResults.reduce((sum, result) => {
            const gradePoints = {
                'A1': 1, 'B2': 2, 'B3': 3, 'C4': 4, 'C5': 5, 'C6': 6,
                'D7': 7, 'E8': 8, 'F9': 9
            }
            return sum + (gradePoints[result.grade as keyof typeof gradePoints] || 9)
        }, 0)
        
        const average = totalPoints / examResults.length
        if (average <= 1.5) return 'Distinction'
        if (average <= 2.5) return 'Credit'
        if (average <= 4.5) return 'Pass'
        return 'Fail'
    }

    const getOverallGradeColor = (grade: string) => {
        switch (grade) {
            case 'Distinction': return 'text-green-600'
            case 'Credit': return 'text-blue-600'
            case 'Pass': return 'text-yellow-600'
            default: return 'text-red-600'
        }
    }

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0 relative">
                {/* Background overlay */}
                <div 
                    className="fixed inset-0 transition-opacity bg-black/50"
                    onClick={onClose}
                />

                {/* Modal panel */}
                <div className="inline-block w-full relative z-20 max-w-5xl p-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-2xl">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h3 className="text-2xl font-bold text-gray-900">
                                BECE Student Report
                            </h3>
                            <p className="text-sm text-gray-600 mt-1">
                                {student.firstName} {student.lastName} - {student.examNo}
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
                                    Edit Results
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
                    <div className="bg-gray-50 border border-black/5 rounded-lg p-6 mb-6">
                        <h4 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                            <IoPerson className="w-5 h-5 mr-2" />
                            Student Information
                        </h4>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                            <div>
                                <label className="text-sm font-medium text-gray-500 flex items-center">
                                    <IoSchool className="w-4 h-4 mr-1" />
                                    School Name
                                </label>
                                <p className="text-sm text-gray-900 mt-1">{schoolName || 'N/A'}</p>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-500">Full Name</label>
                                <p className="text-sm text-gray-900 mt-1">{student.firstName} {student.lastName}</p>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-500">Exam Number</label>
                                <p className="text-sm text-gray-900 mt-1 font-mono">{student.examNo}</p>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-500 flex items-center">
                                    {student.gender === 'Male' ? <IoMale className="w-4 h-4 mr-1" /> : <IoFemale className="w-4 h-4 mr-1" />}
                                    Gender
                                </label>
                                <p className="text-sm text-gray-900 mt-1">{student.gender}</p>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-500 flex items-center">
                                    <IoCalendar className="w-4 h-4 mr-1" />
                                    Date of Birth
                                </label>
                                <p className="text-sm text-gray-900 mt-1">
                                    {new Date(student.dateOfBirth).toLocaleDateString('en-GB')}
                                </p>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-500">Class</label>
                                <p className="text-sm text-gray-900 mt-1">{student.class}</p>
                            </div>
                        </div>
                    </div>

                    {/* Overall Performance */}
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
                        <h4 className="text-lg font-medium text-blue-900 mb-4 flex items-center">
                            <IoRibbon className="w-5 h-5 mr-2" />
                            Overall Performance
                        </h4>
                        <div className="grid grid-cols-3 gap-6 text-center">
                            <div>
                                <p className="text-3xl font-bold text-blue-600">
                                    {examResults.length}
                                </p>
                                <p className="text-sm text-gray-600">Subjects Taken</p>
                            </div>
                            <div>
                                <p className="text-3xl font-bold text-green-600">
                                    {examResults.filter(r => r.grade.startsWith('A') || r.grade.startsWith('B')).length}
                                </p>
                                <p className="text-sm text-gray-600">Credits (A-B)</p>
                            </div>
                            <div>
                                <p className={`text-3xl font-bold ${getOverallGradeColor(calculateOverallGrade())}`}>
                                    {calculateOverallGrade()}
                                </p>
                                <p className="text-sm text-gray-600">Overall Grade</p>
                            </div>
                        </div>
                    </div>

                    {/* Exam Results */}
                    <div className="mb-6">
                        <h4 className="text-lg font-medium text-gray-900 mb-4">BECE Examination Results</h4>
                        
                        <div className="overflow-x-auto">
                            <table className="min-w-full bg-white border border-gray-200 rounded-lg">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Subject
                                        </th>
                                        <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            CA Score (30)
                                        </th>
                                        <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Exam Score (70)
                                        </th>
                                        <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Total (100)
                                        </th>
                                        <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Grade
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {examResults.map((result, index) => (
                                        <tr key={index} className="hover:bg-gray-50">
                                            <td className="px-4 py-3 text-sm font-medium text-gray-900">
                                                {result.subject}
                                            </td>
                                            <td className="px-4 py-3 text-sm text-center text-gray-900">
                                                {isEditing ? (
                                                    <input
                                                        type="number"
                                                        min="0"
                                                        max="30"
                                                        value={result.caScore}
                                                        onChange={(e) => handleScoreChange(index, 'caScore', e.target.value)}
                                                        className="w-16 px-2 py-1 text-center border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                    />
                                                ) : (
                                                    result.caScore
                                                )}
                                            </td>
                                            <td className="px-4 py-3 text-sm text-center text-gray-900">
                                                {isEditing ? (
                                                    <input
                                                        type="number"
                                                        min="0"
                                                        max="70"
                                                        value={result.examScore}
                                                        onChange={(e) => handleScoreChange(index, 'examScore', e.target.value)}
                                                        className="w-16 px-2 py-1 text-center border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                    />
                                                ) : (
                                                    result.examScore
                                                )}
                                            </td>
                                            <td className="px-4 py-3 text-sm text-center font-semibold text-gray-900">
                                                {result.total}
                                            </td>
                                            <td className="px-4 py-3 text-center">
                                                <span className={`inline-flex px-3 py-1 text-xs font-medium rounded-full border ${getGradeColor(result.grade)}`}>
                                                    {result.grade}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Grade Legend */}
                    <div className="bg-gray-50 rounded-lg p-4">
                        <h5 className="text-sm font-medium text-gray-900 mb-3">BECE Grading System</h5>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                            <div className="flex items-center">
                                <span className="inline-block w-3 h-3 bg-green-500 rounded-full mr-2"></span>
                                <span>A1-A3: Excellent</span>
                            </div>
                            <div className="flex items-center">
                                <span className="inline-block w-3 h-3 bg-blue-500 rounded-full mr-2"></span>
                                <span>B2-B3: Very Good</span>
                            </div>
                            <div className="flex items-center">
                                <span className="inline-block w-3 h-3 bg-yellow-500 rounded-full mr-2"></span>
                                <span>C4-C6: Good</span>
                            </div>
                            <div className="flex items-center">
                                <span className="inline-block w-3 h-3 bg-red-500 rounded-full mr-2"></span>
                                <span>D7-F9: Poor</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
