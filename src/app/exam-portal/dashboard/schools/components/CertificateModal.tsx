'use client'
import React, { useRef } from 'react'
import { IoClose, IoDownload, IoPrint } from 'react-icons/io5'
import { Student } from '../types/student.types'
import html2canvas from 'html2canvas'
import jsPDF from 'jspdf'

interface CertificateModalProps {
    isOpen: boolean
    onClose: () => void
    student: Student
    schoolName: string
}

export default function CertificateModal({ isOpen, onClose, student, schoolName }: CertificateModalProps) {
    const certificateRef = useRef<HTMLDivElement>(null)
    const [isGenerating, setIsGenerating] = React.useState(false)

    if (!isOpen) return null

    // Calculate aggregate and grade
    const calculateAggregate = () => {
        const grades = student.subjects.map(subject => {
            const total = subject.exam
            if (total >= 80) return 1
            if (total >= 75) return 2
            if (total >= 70) return 3
            if (total >= 65) return 4
            if (total >= 60) return 5
            if (total >= 55) return 6
            if (total >= 50) return 7
            if (total >= 45) return 8
            return 9
        })
        return grades.reduce((sum, grade) => sum + grade, 0)
    }

    const getOverallGrade = (aggregate: number) => {
        if (aggregate <= 6) return 'Distinction'
        if (aggregate <= 12) return 'Credit'
        if (aggregate <= 18) return 'Pass'
        return 'Fail'
    }

    const aggregate = calculateAggregate()
    const overallGrade = getOverallGrade(aggregate)

    const handleDownloadPDF = async () => {
        if (!certificateRef.current) return
        
        setIsGenerating(true)
        try {
            const canvas = await html2canvas(certificateRef.current, {
                scale: 2,
                useCORS: true,
                logging: false,
                backgroundColor: '#ffffff'
            })

            const imgData = canvas.toDataURL('image/png')
            const pdf = new jsPDF({
                orientation: 'portrait',
                unit: 'mm',
                format: 'a4'
            })

            const imgWidth = 210 // A4 width in mm
            const imgHeight = (canvas.height * imgWidth) / canvas.width

            pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight)
            pdf.save(`BECE_Certificate_${student.examNo}.pdf`)
        } catch (error) {
            console.error('Error generating PDF:', error)
        } finally {
            setIsGenerating(false)
        }
    }

    const handlePrint = () => {
        window.print()
    }

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
                {/* Background overlay */}
                <div 
                    className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75"
                    onClick={onClose}
                />

                {/* Modal panel */}
                <div className="inline-block w-full max-w-4xl my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-2xl">
                    {/* Header */}
                    <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 print:hidden">
                        <h3 className="text-lg font-semibold text-gray-900">
                            BECE Certificate
                        </h3>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={handleDownloadPDF}
                                disabled={isGenerating}
                                className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-green-600 border border-transparent rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                            >
                                <IoDownload className="w-4 h-4 mr-2" />
                                {isGenerating ? 'Generating...' : 'Download PDF'}
                            </button>
                            <button
                                onClick={handlePrint}
                                className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-all"
                            >
                                <IoPrint className="w-4 h-4 mr-2" />
                                Print
                            </button>
                            <button
                                onClick={onClose}
                                className="p-2 text-gray-400 hover:text-gray-500 hover:bg-gray-100 rounded-lg transition-colors"
                            >
                                <IoClose className="w-5 h-5" />
                            </button>
                        </div>
                    </div>

                    {/* Certificate Content */}
                    <div className="p-8 overflow-y-auto max-h-[calc(100vh-200px)]">
                        <div 
                            ref={certificateRef}
                            className="bg-gradient-to-br from-amber-50 to-orange-50 relative overflow-hidden"
                            style={{ aspectRatio: '1.414', maxWidth: '800px', margin: '0 auto' }}
                        >
                            {/* Decorative Elements */}
                            <div className="absolute top-0 left-0 w-0 h-0 border-l-[120px] border-l-transparent border-t-[120px] border-t-green-700"></div>
                            <div className="absolute top-0 right-0 w-0 h-0 border-r-[120px] border-r-transparent border-t-[120px] border-t-green-700"></div>
                            <div className="absolute bottom-0 left-0 w-0 h-0 border-l-[120px] border-l-transparent border-b-[120px] border-b-green-700"></div>
                            <div className="absolute bottom-0 right-0 w-0 h-0 border-r-[120px] border-r-transparent border-b-[120px] border-b-green-700"></div>
                            
                            {/* Gold dots at corners */}
                            <div className="absolute top-3 left-3 w-3 h-3 bg-amber-500 rounded-full"></div>
                            <div className="absolute top-3 right-3 w-3 h-3 bg-amber-500 rounded-full"></div>
                            <div className="absolute bottom-3 left-3 w-3 h-3 bg-amber-500 rounded-full"></div>
                            <div className="absolute bottom-3 right-3 w-3 h-3 bg-amber-500 rounded-full"></div>

                            {/* Main Content */}
                            <div className="relative z-10 p-12 border-4 border-amber-600 m-6 bg-white/90 backdrop-blur-sm">
                                {/* Header */}
                                <div className="text-center mb-6">
                                    <h1 className="text-2xl font-bold text-gray-800 mb-2 tracking-wide uppercase">
                                        {schoolName}
                                    </h1>
                                    <h2 className="text-3xl font-serif font-bold text-green-700 mb-4">
                                        CERTIFICATE OF EXCELLENCE
                                    </h2>
                                    <p className="text-sm text-gray-600 italic">
                                        This certificate is awarded to
                                    </p>
                                </div>

                                {/* Student Name */}
                                <div className="text-center mb-6">
                                    <h3 className="text-4xl font-serif font-bold text-green-800 capitalize">
                                        {student.name.toLowerCase()}
                                    </h3>
                                </div>

                                {/* Achievement Text */}
                                <div className="text-center mb-6 max-w-2xl mx-auto">
                                    <p className="text-sm text-gray-700 leading-relaxed">
                                        in recognition of outstanding academic achievement in the
                                        <span className="font-semibold"> Basic Education Certificate Examination (BECE)</span>,
                                        demonstrating excellence and dedication to learning.
                                    </p>
                                </div>

                                {/* Student Details */}
                                <div className="grid grid-cols-3 gap-4 mb-6 text-center text-xs">
                                    <div>
                                        <p className="text-gray-500 mb-1">Exam Number</p>
                                        <p className="font-semibold text-gray-800">{student.examNo}</p>
                                    </div>
                                    <div>
                                        <p className="text-gray-500 mb-1">Overall Grade</p>
                                        <p className="font-semibold text-green-700 text-lg">{overallGrade}</p>
                                    </div>
                                    <div>
                                        <p className="text-gray-500 mb-1">Aggregate</p>
                                        <p className="font-semibold text-gray-800">{aggregate}</p>
                                    </div>
                                </div>

                                {/* Date */}
                                <div className="text-center mb-8">
                                    <p className="text-sm text-gray-600">
                                        Given this {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}.
                                    </p>
                                </div>

                                {/* Signature */}
                                <div className="text-center mt-12">
                                    <div className="inline-block">
                                        <div className="border-t-2 border-gray-800 pt-2 px-8">
                                            <p className="text-sm font-semibold text-gray-800">Director of Education</p>
                                            <p className="text-xs text-gray-600">Ministry of Primary Education</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
