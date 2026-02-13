'use client'
import { useRef, useState, useCallback } from 'react';
import { IoClose, IoDownload, IoPrint } from 'react-icons/io5';
import toast from 'react-hot-toast';
import Image from 'next/image';
import { toPng } from 'html-to-image';
import jsPDF from 'jspdf';

interface Subject {
    name: string
    exam: number
    grade: string
}

interface StudentData {
    name: string
    examNo: string
    school?: string
    schoolName?: string
    subjects: Subject[]
    overallGrade: string
}

interface CertificateModalProps {
    isOpen: boolean
    onClose: () => void
    student: StudentData | null
    schoolName?: string
}

export default function CertificateModal({ isOpen, onClose, student, schoolName }: CertificateModalProps) {
    const certificateRef = useRef<HTMLDivElement>(null);
    const [isDownloading, setIsDownloading] = useState(false);

    const downloadAsImage = useCallback(async () => {
        if (!certificateRef.current || !student) {
            toast.error('Certificate not ready')
            return
        }

        const errors: string[] = []
        if (!student.name || student.name.trim() === '') errors.push('Student name is missing')
        if (!student.examNo || student.examNo.trim() === '') errors.push('Exam number is missing')
        if (!student.subjects || !Array.isArray(student.subjects) || student.subjects.length === 0) errors.push('No subjects found')
        
        if (errors.length > 0) {
            toast.error(`Cannot download certificate: ${errors.join(', ')}`)
            return
        }

        try {
            setIsDownloading(true)
            toast.loading('Generating image...', { id: 'download-image' })
            
            await new Promise(resolve => setTimeout(resolve, 100))
            
            const dataUrl = await toPng(certificateRef.current, {
                cacheBust: true,
                pixelRatio: 2,
                backgroundColor: '#ffffff'
            })

            const link = document.createElement('a')
            link.download = `BECE-Certificate-${student.examNo}.png`
            link.href = dataUrl
            link.click()
            
            toast.success('Image downloaded successfully!', { id: 'download-image' })
        } catch (error) {
            console.error('Error generating image:', error)
            toast.error('Failed to generate image', { id: 'download-image' })
        } finally {
            setIsDownloading(false)
        }
    }, [student])

    const downloadAsPDF = useCallback(async () => {
        if (!certificateRef.current || !student) {
            toast.error('Certificate not ready')
            return
        }

        const errors: string[] = []
        if (!student.name || student.name.trim() === '') errors.push('Student name is missing')
        if (!student.examNo || student.examNo.trim() === '') errors.push('Exam number is missing')
        if (!student.subjects || !Array.isArray(student.subjects) || student.subjects.length === 0) errors.push('No subjects found')
        
        if (errors.length > 0) {
            toast.error(`Cannot download certificate: ${errors.join(', ')}`)
            return
        }

        try {
            setIsDownloading(true)
            toast.loading('Generating PDF...', { id: 'download-pdf' })
            
            await new Promise(resolve => setTimeout(resolve, 100))
            
            const dataUrl = await toPng(certificateRef.current, {
                cacheBust: true,
                pixelRatio: 2,
                backgroundColor: '#ffffff'
            })

            const pdf = new jsPDF({
                orientation: 'portrait',
                unit: 'mm',
                format: 'a4',
            })

            const imgProps = pdf.getImageProperties(dataUrl)
            const pdfWidth = pdf.internal.pageSize.getWidth()
            const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width

            pdf.addImage(dataUrl, 'PNG', 0, 0, pdfWidth, pdfHeight)
            pdf.save(`BECE-Certificate-${student.examNo}.pdf`)
            
            toast.success('PDF downloaded successfully!', { id: 'download-pdf' })
        } catch (error) {
            console.error('Error generating PDF:', error)
            toast.error('Failed to generate PDF', { id: 'download-pdf' })
        } finally {
            setIsDownloading(false)
        }
    }, [student])

    if (!isOpen || !student) return null

    const validateStudentData = (): { valid: boolean; errors: string[] } => {
        const errors: string[] = []

        if (!student.name || student.name.trim() === '') {
            errors.push('Student name is missing')
        }
        if (!student.examNo || student.examNo.trim() === '') {
            errors.push('Exam number is missing')
        }
        if (!student.subjects || student.subjects.length === 0) {
            errors.push('No subjects found')
        }
        if (student.subjects && Array.isArray(student.subjects) && student.subjects.some(s => !s.name || s.name.trim() === '')) {
            errors.push('Some subjects are missing names')
        }
        if (student.subjects && Array.isArray(student.subjects) && student.subjects.some(s => typeof s.exam !== 'number')) {
            errors.push('Some subjects have invalid scores')
        }

        return { valid: errors.length === 0, errors }
    }

    const calculateAggregate = () => {
        const gradePoints: { [key: string]: number } = {
            'A1': 1, 'B2': 2, 'B3': 3, 'C4': 4, 'C5': 5, 'C6': 6,
            'D7': 7, 'E8': 8, 'F9': 9
        }
        
        // Safety check: ensure subjects is an array
        if (!student.subjects || !Array.isArray(student.subjects)) {
            console.warn('CertificateModal: subjects is not an array', student.subjects)
            return 0
        }
        
        const totalPoints = student.subjects.reduce((sum, subject) => {
            return sum + (gradePoints[subject.grade] || 9)
        }, 0)
        
        return totalPoints
    }

    const overallGradeColor = (overallGrade: string) => {
        if (overallGrade.toLowerCase() === 'distinction') return '#32493e'
        if (overallGrade.toLowerCase() === 'credit') return '#000080'
        if (overallGrade.toLowerCase() === 'pass') return '#FF7900'
        return '#c41e3a'
    }

    const aggregate = calculateAggregate()
    const overallGrade = student.overallGrade // Use the overallGrade from API
    const school = schoolName || student.schoolName || student.school || 'N/A'

    const handlePrint = () => {
        if (!certificateRef.current) {
            toast.error('Certificate preview not ready')
            return
        }
        const validation = validateStudentData()

        if (!validation.valid) {
            toast.error(`Cannot print certificate: ${validation.errors.join(', ')}`)
            return
        }
        
        window.print()
    }

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex items-center justify-center h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
                <div
                    className="fixed inset-0 transition-opacity bg-black/75"
                    onClick={onClose}
                />

                <div className="inline-block w-full max-w-5xl my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-2xl relative z-10">
                    <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 print:hidden">
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900">
                                BECE Certificate
                            </h3>
                            <p className="text-sm text-gray-500 mt-0.5">{student.examNo}</p>
                        </div>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={downloadAsImage}
                                disabled={isDownloading}
                                className="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer active:scale-95"
                            >
                                <IoDownload className="w-4 h-4 mr-2" />
                                Image
                            </button>
                            <button
                                onClick={downloadAsPDF}
                                disabled={isDownloading}
                                className="inline-flex items-center px-3 py-2 text-sm font-medium text-white bg-green-600 border border-transparent rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer active:scale-95"
                            >
                                <IoDownload className="w-4 h-4 mr-2" />
                                PDF
                            </button>
                            <button
                                onClick={handlePrint}
                                disabled={isDownloading}
                                className="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer active:scale-95"
                            >
                                <IoPrint className="w-4 h-4 mr-2" />
                                Print
                            </button>
                            <button
                                onClick={onClose}
                                className="p-2 text-gray-400 hover:text-gray-500 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
                            >
                                <IoClose className="w-5 h-5" />
                            </button>
                        </div>
                    </div>

                    <div className="p-8 overflow-y-auto max-h-[calc(100vh-200px)]">
                        <div
                            ref={certificateRef}
                            className="relative overflow-hidden"
                            style={{
                                aspectRatio: '1.414',
                                maxWidth: '900px',
                                margin: '0 auto',
                                background: 'linear-gradient(to bottom right, #FEF3C7, #FED7AA)'
                            }}
                        >
                            {/* Green triangular corners */}
                            <div className="absolute top-0 left-0 w-0 h-0" style={{
                                borderLeft: '120px solid transparent',
                                borderTop: '120px solid #15803d'
                            }}></div>
                            <div className="absolute top-0 right-0 w-0 h-0" style={{
                                borderRight: '120px solid transparent',
                                borderTop: '120px solid #15803d',
                                zIndex: 20
                            }}></div>
                            <div className="absolute bottom-0 left-0 w-0 h-0" style={{
                                borderLeft: '120px solid transparent',
                                borderBottom: '120px solid #15803d',
                                zIndex: 20
                            }}></div>
                            <div className="absolute bottom-0 right-0 w-0 h-0" style={{
                                borderRight: '120px solid transparent',
                                borderBottom: '120px solid #15803d'
                            }}></div>

                            {/* Gold dots at corners */}
                            <div className="absolute top-3 left-3 w-3 h-3 rounded-full" style={{ backgroundColor: '#f59e0b' }}></div>
                            <div className="absolute top-3 right-3 w-3 h-3 rounded-full" style={{ backgroundColor: '#f59e0b', zIndex: 20 }}></div>
                            <div className="absolute bottom-3 left-3 w-3 h-3 rounded-full" style={{ backgroundColor: '#f59e0b', zIndex: 20 }}></div>
                            <div className="absolute bottom-3 right-3 w-3 h-3 rounded-full" style={{ backgroundColor: '#f59e0b' }}></div>

                            {/* Main Content */}
                            <div className="relative z-10 p-12 m-6" style={{
                                border: '4px solid #d97706',
                                backgroundColor: 'rgba(255, 255, 255, 0.95)'
                            }}>
                                {/* Logo */}
                                <div className="flex justify-center mb-4">
                                    <Image
                                        src="/images/ministry-logo.png"
                                        alt="Ministry Logo"
                                        width={80}
                                        height={80}
                                        className="object-contain"
                                    />
                                </div>

                                {/* Header */}
                                <div className="text-center mb-6">
                                    <h1 className="text-2xl font-bold text-gray-800 mb-2 tracking-wide uppercase">
                                        {school}
                                    </h1>
                                    <h2 className="text-3xl font-serif font-bold mb-4" style={{ color: '#15803d' }}>
                                        CERTIFICATE OF EXCELLENCE
                                    </h2>
                                    <p className="text-sm text-gray-600 italic">
                                        This certificate is awarded to
                                    </p>
                                </div>

                                {/* Student Name */}
                                <div className="text-center mb-6">
                                    <h3 className="text-2xl font-serif font-bold capitalize" style={{ color: '#166534' }}>
                                        {student.name.toLowerCase()}
                                    </h3>
                                </div>

                                {/* Achievement Text */}
                                <div className="text-center mb-6 max-w-2xl mx-auto">
                                    <p id="certificate" className="text-sm text-gray-700 leading-relaxed">
                                        in recognition of outstanding academic achievement in the
                                        <span className="font-semibold"> Basic Education Certificate Examination (BECE)</span>,
                                        demonstrating excellence and dedication to learning.
                                    </p>
                                </div>

                                {/* Student Details */}
                                <div className="grid grid-cols-3 gap-4 mb-6 text-center text-xs">
                                    <div>
                                        <p className="text-gray-500 mb-1">Exam Number</p>
                                        <p className="font-semibold text-gray-800 uppercase text-lg">{student.examNo}</p>
                                    </div>
                                    <div>
                                        <p className="text-gray-500 mb-1">Overall Grade</p>
                                        <p className="font-semibold lowercase text-lg" style={{ color: overallGradeColor(overallGrade) }}>{overallGrade}</p>
                                    </div>
                                    <div>
                                        <p className="text-gray-500 mb-1">Aggregate</p>
                                        <p className="font-semibold text-gray-800 text-lg">{aggregate}</p>
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
                                        <div className="pt-2 px-8" style={{ borderTop: '2px solid #1f2937' }}>
                                            <p className="text-sm font-semibold text-gray-800">Hr. Minister Professor Bernard Thompson Onyemechukwu Ikegwuoha</p>
                                            <p className="text-xs text-gray-600">Imo State Ministry of Primary and Secondary Education</p>
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
