'use client'
import { useRef, useState, useCallback } from 'react';
import { IoClose, IoDownload } from 'react-icons/io5';
import toast from 'react-hot-toast';
import { toPng } from 'html-to-image';
import jsPDF from 'jspdf';
import useShortcuts, { KeyboardKey } from '@useverse/useshortcuts';
import Image from 'next/image';

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

    useShortcuts({
        shortcuts: [
            {
                key: KeyboardKey.Escape,
                enabled: isOpen
            }
        ],
        onTrigger: () => {
            onClose()
        }
    }, [isOpen])

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
            
            // Wait for fonts and images to load
            await document.fonts.ready
            
            // Pre-load all images
            const images = certificateRef.current.querySelectorAll('img')
            await Promise.all(
                Array.from(images).map(img => {
                    if (img.complete) return Promise.resolve()
                    return new Promise(resolve => {
                        img.onload = resolve
                        img.onerror = resolve
                    })
                })
            )
            
            // Extra wait for rendering
            await new Promise(resolve => setTimeout(resolve, 1500))
            
            const dataUrl = await toPng(certificateRef.current, {
                cacheBust: true,
                pixelRatio: 3,
                backgroundColor: '#ffffff',
                quality: 1.0
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
            
            // Wait for fonts and images to load
            await document.fonts.ready
            
            // Pre-load all images
            const images = certificateRef.current.querySelectorAll('img')
            await Promise.all(
                Array.from(images).map(img => {
                    if (img.complete) return Promise.resolve()
                    return new Promise(resolve => {
                        img.onload = resolve
                        img.onerror = resolve
                    })
                })
            )
            
            // Extra wait for rendering
            await new Promise(resolve => setTimeout(resolve, 1500))
            
            const dataUrl = await toPng(certificateRef.current, {
                cacheBust: true,
                pixelRatio: 3,
                backgroundColor: '#ffffff',
                quality: 1.0
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

    const calculateGradeFromScore = (score: number): string => {
        if (score >= 80) return 'A1'
        if (score >= 70) return 'B2'
        if (score >= 65) return 'B3'
        if (score >= 60) return 'C4'
        if (score >= 55) return 'C5'
        if (score >= 50) return 'C6'
        if (score >= 45) return 'D7'
        if (score >= 40) return 'E8'
        return 'F9'
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
            const grade = subject.grade || calculateGradeFromScore(subject.exam)
            return sum + (gradePoints[grade] || 9)
        }, 0)
        
        return totalPoints
    }

    const calculateOverallGradeFromSubjects = () => {
        if (!student.subjects || !Array.isArray(student.subjects)) return 'N/A'
        
        const gradePoints: { [key: string]: number } = {
            'A1': 1, 'B2': 2, 'B3': 3, 'C4': 4, 'C5': 5, 'C6': 6,
            'D7': 7, 'E8': 8, 'F9': 9
        }

        const totalPoints = student.subjects.reduce((sum, subject) => {
            const grade = subject.grade || calculateGradeFromScore(subject.exam)
            return sum + (gradePoints[grade] || 9)
        }, 0)

        const average = totalPoints / student.subjects.length
        if (average <= 1.5) return 'Distinction'
        if (average <= 2.5) return 'Credit'
        if (average <= 4.5) return 'Pass'
        return 'Fail'
    }

    const overallGradeColor = (overallGrade: string | undefined) => {
        if (!overallGrade) return '#000000'
        const gradeLower = overallGrade.toLowerCase()
        if (gradeLower === 'distinction') return '#32493e'
        if (gradeLower === 'credit') return '#000080'
        if (gradeLower === 'pass') return '#FF7900'
        return '#c41e3a'
    }

    const aggregate = calculateAggregate()
    const overallGrade = student.overallGrade || calculateOverallGradeFromSubjects()
    const school = schoolName || student.schoolName || student.school || 'N/A'

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex items-center justify-center h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
                <div
                    className="fixed inset-0 transition-opacity bg-black/75"
                    onClick={onClose}
                />

                <div className="inline-block w-full max-w-6xl my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-2xl relative z-10">
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
                                onClick={onClose}
                                className="p-2 text-gray-400 hover:text-gray-500 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
                            >
                                <IoClose className="w-5 h-5" />
                            </button>
                        </div>
                    </div>

                    <div className="p-4 overflow-auto max-h-[calc(100vh-150px)] flex items-start justify-center">
                        <div
                            ref={certificateRef}
                            className="relative overflow-hidden flex-shrink-0"
                            style={{
                                width: '800px',
                                minHeight: '500px',
                                background: 'linear-gradient(to bottom right, #FEF3C7, #FED7AA)'
                            }}
                        >
                            {/* Green triangular corners */}
                            <div className="absolute top-0 left-0 w-0 h-0" style={{
                                borderLeft: '100px solid transparent',
                                borderTop: '100px solid #15803d'
                            }}></div>
                            <div className="absolute top-0 right-0 w-0 h-0" style={{
                                borderRight: '100px solid transparent',
                                borderTop: '100px solid #15803d',
                                zIndex: 20
                            }}></div>
                            <div className="absolute bottom-0 left-0 w-0 h-0" style={{
                                borderLeft: '100px solid transparent',
                                borderBottom: '100px solid #15803d',
                                zIndex: 20
                            }}></div>
                            <div className="absolute bottom-0 right-0 w-0 h-0" style={{
                                borderRight: '100px solid transparent',
                                borderBottom: '100px solid #15803d'
                            }}></div>

                            {/* Gold dots at corners */}
                            <div className="absolute top-3 left-3 w-3 h-3 rounded-full" style={{ backgroundColor: '#f59e0b' }}></div>
                            <div className="absolute top-3 right-3 w-3 h-3 rounded-full" style={{ backgroundColor: '#f59e0b', zIndex: 20 }}></div>
                            <div className="absolute bottom-3 left-3 w-3 h-3 rounded-full" style={{ backgroundColor: '#f59e0b', zIndex: 20 }}></div>
                            <div className="absolute bottom-3 right-3 w-3 h-3 rounded-full" style={{ backgroundColor: '#f59e0b' }}></div>

                            {/* Main Content */}
                            <div className="relative z-10 px-10 py-8 m-5" style={{
                                border: '4px solid #d97706',
                                backgroundColor: 'rgba(255, 255, 255, 0.95)',
                                fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif'
                            }}>
                                {/* Logo */}
                                <div className="flex justify-center mb-3">
                                    <Image
                                        src="/images/ministry-logo.png"
                                        alt="Ministry Logo"
                                        width={70}
                                        height={70}
                                        className="object-contain"
                                    />
                                </div>

                                {/* Header */}
                                <div className="text-center mb-3">
                                    <h1 className="text-base font-bold text-gray-800 mb-1 tracking-wide uppercase">
                                        {school}
                                    </h1>
                                    <h2 className="text-xl font-serif font-bold mb-2" style={{ color: '#15803d', fontFamily: 'Georgia, "Times New Roman", Times, serif' }}>
                                        CERTIFICATE OF EXCELLENCE
                                    </h2>
                                    <p className="text-[10px] text-gray-600 italic">
                                        This certificate is awarded to
                                    </p>
                                </div>

                                {/* Student Name */}
                                <div className="text-center mb-3">
                                    <h3 className="text-lg font-serif font-bold capitalize" style={{ color: '#166534', fontFamily: 'Georgia, "Times New Roman", Times, serif' }}>
                                        {student.name.toLowerCase()}
                                    </h3>
                                </div>

                                {/* Achievement Text */}
                                <div className="text-center mb-3 px-4">
                                    <p id="certificate" className="text-xs text-gray-700 leading-relaxed">
                                        in recognition of outstanding academic achievement in the
                                        <span className="font-semibold"> Basic Education Certificate Examination (BECE)</span>,
                                        demonstrating excellence and dedication to learning.
                                    </p>
                                </div>

                                {/* Student Details */}
                                <div className="grid grid-cols-3 gap-3 mb-3 text-center">
                                    <div>
                                        <p className="text-gray-500 mb-1" style={{ fontSize: '9px' }}>Exam Number</p>
                                        <p className="font-bold text-gray-800 uppercase text-sm">{student.examNo}</p>
                                    </div>
                                    <div>
                                        <p className="text-gray-500 mb-1" style={{ fontSize: '9px' }}>Overall Grade</p>
                                        <p className="font-bold text-sm lowercase" style={{ color: overallGradeColor(overallGrade) }}>{overallGrade}</p>
                                    </div>
                                    <div>
                                        <p className="text-gray-500 mb-1" style={{ fontSize: '9px' }}>Aggregate</p>
                                        <p className="font-bold text-gray-800 text-sm">{aggregate}</p>
                                    </div>
                                </div>

                                {/* Date */}
                                <div className="text-center mb-8">
                                    <p className="text-xs text-gray-600">
                                        Given this {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}.
                                    </p>
                                </div>

                                {/* Signature */}
                                <div className="text-center mt-20 relative">
                                    <div className="inline-block">
                                        {/* Signature Image - Positioned absolutely above the line */}
                                        <div className="absolute left-1/2 transform -translate-x-1/2" style={{ top: '-45px' }}>
                                            <Image
                                                src="/images/signature.png"
                                                alt="Minister Signature"
                                                width={140}
                                                height={45}
                                                className="object-contain"
                                            />
                                        </div>
                                        <div className="pt-2 px-6" style={{ borderTop: '2px solid #1f2937' }}>
                                            <p className="text-[10px] font-bold text-gray-800">Hr. Minister Professor Bernard Thompson Onyemechukwu Ikegwuoha</p>
                                            <p style={{ fontSize: '9px' }} className="text-gray-600">Imo State Ministry of Primary and Secondary Education</p>
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
