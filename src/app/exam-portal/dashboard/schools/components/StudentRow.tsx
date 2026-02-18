import React, { useState } from 'react'
import { IoEye, IoDocumentText, IoDownload } from 'react-icons/io5'
import { Student, DisplayStudent } from '../types/student.types'

interface StudentRowProps {
    student: Student | DisplayStudent
    onViewStudent: (student: Student | DisplayStudent) => void
    onGenerateCertificate: (student: Student | DisplayStudent) => void
}

export default function StudentRow({ student, onViewStudent, onGenerateCertificate }: StudentRowProps) {
    const [isGenerating, setIsGenerating] = useState(false)
    
    // Check if this is a UBEAT student
    const isUBEAT = 'examType' in student && student.examType === 'ubeat'
    
    const handleGenerateCertificate = async () => {
        setIsGenerating(true)
        try {
            await onGenerateCertificate(student)
        } finally {
            setIsGenerating(false)
        }
    }
    return (
        <tr className="hover:bg-gray-50 transition-colors">
            <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center pl-10">
                    <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center mr-3 border border-black/10">
                        <span className="text-xs font-semibold text-gray-600">
                            {student.name.split(' ').map(n => n.charAt(0)).join('').slice(0, 2)}
                        </span>
                    </div>
                    <div>
                        <div className="text-sm font-medium text-gray-900 capitalize">
                            {student.name.toLowerCase()}
                        </div>
                    </div>
                </div>
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-mono uppercase">
                {student.examNo}
            </td>
            {/* <td className="px-6 py-4 whitespace-nowrap">
                <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full border border-black/10 ${
                    student.sex === 'M' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-pink-100 text-pink-800'
                }`}>
                    {student.sex}
                </span>
            </td> */}
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {student.subjects.length} subjects
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => onViewStudent(student)}
                        className="inline-flex items-center px-3 py-1 text-xs font-medium text-green-600 bg-green-50 border border-green-200 rounded-md hover:bg-green-100 hover:text-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-1 transition-all cursor-pointer active:scale-95"
                    >
                        <IoEye className="w-3 h-3 mr-1" />
                        View
                    </button>
                    {student.isPaid && <button
                        onClick={handleGenerateCertificate}
                        disabled={isGenerating}
                        className="inline-flex items-center px-3 py-1 text-xs font-medium text-green-600 bg-green-50 border border-green-200 rounded-md hover:bg-green-100 hover:text-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-1 transition-all cursor-pointer active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100"
                    >
                        {isGenerating ? (
                            <>
                                <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-green-600 mr-1"></div>
                                {isUBEAT ? 'Downloading...' : 'Generating...'}
                            </>
                        ) : (
                            <>
                                {isUBEAT ? (
                                    <>
                                        <IoDownload className="w-3 h-3 mr-1" />
                                        Download FSLC
                                    </>
                                ) : (
                                    <>
                                        <IoDocumentText className="w-3 h-3 mr-1" />
                                        Certificate
                                    </>
                                )}
                            </>
                        )}
                    </button>}
                    {!student.isPaid && <div className="text-sm text-gray-700 bg-gray-100 italic border-2 border-gray-300 rounded-3xl px-3 py-0.5">Yet to pay</div>}
                </div>
            </td>
        </tr>
    )
}
