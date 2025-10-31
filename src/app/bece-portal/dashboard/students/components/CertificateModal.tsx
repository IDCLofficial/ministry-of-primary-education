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
            const total = subject.ca + subject.exam
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

    const getGrade = (total: number) => {
        if (total >= 80) return 'A1'
        if (total >= 75) return 'A2'
        if (total >= 70) return 'A3'
        if (total >= 65) return 'B2'
        if (total >= 60) return 'B3'
        if (total >= 55) return 'C4'
        if (total >= 50) return 'C5'
        if (total >= 45) return 'C6'
        if (total >= 40) return 'D7'
        if (total >= 35) return 'E8'
        return 'F9'
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
                                className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                            >
                                <IoDownload className="w-4 h-4 mr-2" />
                                {isGenerating ? 'Generating...' : 'Download PDF'}
                            </button>
                            <button
                                onClick={handlePrint}
                                className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all"
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
                            className="bg-white p-12 border-8 border-double border-blue-900"
                            style={{ minHeight: '297mm' }}
                        >
                            {/* Header */}
                            <div className="text-center mb-8">
                                <div className="mb-4">
                                    <div className="w-20 h-20 mx-auto bg-blue-900 rounded-full flex items-center justify-center mb-4">
                                        <span className="text-3xl font-bold text-white">MOE</span>
                                    </div>
                                </div>
                                <h1 className="text-3xl font-bold text-blue-900 mb-2">
                                    MINISTRY OF PRIMARY EDUCATION
                                </h1>
                                <h2 className="text-xl font-semibold text-gray-700 mb-1">
                                    BASIC EDUCATION CERTIFICATE EXAMINATION
                                </h2>
                                <p className="text-sm text-gray-600">
                                    {new Date().getFullYear()}
                                </p>
                            </div>

                            {/* Certificate Body */}
                            <div className="mb-8">
                                <p className="text-center text-lg mb-6">
                                    This is to certify that
                                </p>
                                <h3 className="text-3xl font-bold text-center text-blue-900 mb-6 uppercase">
                                    {student.name}
                                </h3>
                                <div className="grid grid-cols-2 gap-4 mb-6 max-w-2xl mx-auto">
                                    <div className="text-center">
                                        <p className="text-sm text-gray-600">Exam Number</p>
                                        <p className="text-lg font-semibold text-gray-900">{student.examNo}</p>
                                    </div>
                                    <div className="text-center">
                                        <p className="text-sm text-gray-600">Gender</p>
                                        <p className="text-lg font-semibold text-gray-900">{student.sex === 'M' ? 'Male' : 'Female'}</p>
                                    </div>
                                    <div className="text-center col-span-2">
                                        <p className="text-sm text-gray-600">School</p>
                                        <p className="text-lg font-semibold text-gray-900">{schoolName}</p>
                                    </div>
                                </div>
                                <p className="text-center text-lg mb-8">
                                    has successfully completed the Basic Education Certificate Examination
                                </p>
                            </div>

                            {/* Results Table */}
                            <div className="mb-8">
                                <h4 className="text-lg font-semibold text-gray-900 mb-4 text-center">
                                    EXAMINATION RESULTS
                                </h4>
                                <table className="w-full border-collapse border border-gray-300">
                                    <thead>
                                        <tr className="bg-gray-100">
                                            <th className="border border-gray-300 px-4 py-2 text-left">Subject</th>
                                            <th className="border border-gray-300 px-4 py-2 text-center">CA (30)</th>
                                            <th className="border border-gray-300 px-4 py-2 text-center">Exam (70)</th>
                                            <th className="border border-gray-300 px-4 py-2 text-center">Total (100)</th>
                                            <th className="border border-gray-300 px-4 py-2 text-center">Grade</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {student.subjects.map((subject, index) => {
                                            const total = subject.ca + subject.exam
                                            const grade = getGrade(total)
                                            return (
                                                <tr key={index}>
                                                    <td className="border border-gray-300 px-4 py-2">{subject.name}</td>
                                                    <td className="border border-gray-300 px-4 py-2 text-center">{subject.ca}</td>
                                                    <td className="border border-gray-300 px-4 py-2 text-center">{subject.exam}</td>
                                                    <td className="border border-gray-300 px-4 py-2 text-center font-semibold">{total}</td>
                                                    <td className="border border-gray-300 px-4 py-2 text-center font-semibold">{grade}</td>
                                                </tr>
                                            )
                                        })}
                                    </tbody>
                                </table>
                            </div>

                            {/* Summary */}
                            <div className="mb-8 bg-blue-50 p-6 rounded-lg border border-blue-200">
                                <div className="grid grid-cols-2 gap-4 text-center">
                                    <div>
                                        <p className="text-sm text-gray-600 mb-1">Aggregate Score</p>
                                        <p className="text-3xl font-bold text-blue-900">{aggregate}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-600 mb-1">Overall Grade</p>
                                        <p className="text-3xl font-bold text-blue-900">{overallGrade}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Footer */}
                            <div className="mt-12 pt-8 border-t border-gray-300">
                                <div className="grid grid-cols-2 gap-8">
                                    <div className="text-center">
                                        <div className="border-t-2 border-gray-400 pt-2 inline-block min-w-[200px]">
                                            <p className="text-sm font-semibold">Director of Education</p>
                                        </div>
                                    </div>
                                    <div className="text-center">
                                        <div className="border-t-2 border-gray-400 pt-2 inline-block min-w-[200px]">
                                            <p className="text-sm font-semibold">Date: {new Date().toLocaleDateString()}</p>
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
