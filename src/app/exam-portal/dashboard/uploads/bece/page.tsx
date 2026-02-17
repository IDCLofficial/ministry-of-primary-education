'use client'

import React, { useState, useCallback, useEffect } from 'react'
import MultiFileUpload from './components/MultiFileUpload'
import DataTable from './components/DataTable'
import ExamModal from './components/ExamModal'
import { ExamModalProvider, useExamModal } from './contexts/ExamModalContext'
import toast from 'react-hot-toast'
import { parseCSVFile, StudentRecord } from './utils/csvParser'

function UploadContent() {
    const [studentData, setStudentData] = useState<StudentRecord[]>([])
    const [isLoading, setIsLoading] = useState(false)
    const { isModalOpen, selectedStudent, closeModal, updateStudent } = useExamModal()

    // Warning message for unsaved data
    const warningMessage = "Unsaved data will be lost. Continue?"

    // Handle browser refresh/close warning
    useEffect(() => {
        const handleBeforeUnload = (e: BeforeUnloadEvent) => {
            if (studentData.length > 0) {
                e.preventDefault()
                e.returnValue = warningMessage
                return warningMessage
            }
        }

        window.addEventListener('beforeunload', handleBeforeUnload)

        return () => {
            window.removeEventListener('beforeunload', handleBeforeUnload)
        }
    }, [studentData.length, warningMessage])

    // Handle navigation via link clicks
    useEffect(() => {
        const handleLinkClick = (e: MouseEvent) => {
            if (studentData.length > 0) {
                const target = e.target as HTMLElement
                const link = target.closest('a')
                
                if (link && link.href && !link.href.includes('#') && link.href !== window.location.href) {
                    e.preventDefault()
                    const confirmed = window.confirm(warningMessage)
                    if (confirmed) {
                        // Allow navigation by programmatically clicking the link
                        window.location.href = link.href
                    }
                }
            }
        }

        // Add click listener to document to catch all link clicks
        document.addEventListener('click', handleLinkClick, true)

        return () => {
            document.removeEventListener('click', handleLinkClick, true)
        }
    }, [studentData.length, warningMessage])

    // Handle programmatic navigation (back/forward buttons, router.push, etc.)
    useEffect(() => {
        const handlePopState = () => {
            if (studentData.length > 0) {
                const confirmed = window.confirm(warningMessage)
                if (!confirmed) {
                    // Push current state back to prevent navigation
                    window.history.pushState(null, '', window.location.href)
                }
            }
        }

        window.addEventListener('popstate', handlePopState)

        return () => {
            window.removeEventListener('popstate', handlePopState)
        }
    }, [studentData.length, warningMessage])

    const handleFilesUploaded = useCallback(async (files: File[]) => {
        setIsLoading(true)
        const allRecords: StudentRecord[] = []

        try {
            for (const file of files) {
                try {
                    const records = await parseCSVFile(file)
                    allRecords.push(...records)
                    const examYear = records[0]?.examYear || new Date().getFullYear()
                    toast.success(`Successfully parsed ${records.length} records from ${file.name} (Exam Year: ${examYear})`)
                } catch (error) {
                    console.error(`Error parsing ${file.name}:`, error)
                    toast.error(`Failed to parse ${file.name}: ${error instanceof Error ? error.message : 'Unknown error'}`)
                }
            }

            if (allRecords.length > 0) {

                
                setStudentData(prev => {
                    // Create a Set of existing exam numbers for fast lookup
                    const existingExamNos = new Set(prev.map(record => record.examNo))
                    
                    // Filter out duplicates based on examNo
                    const newRecords = allRecords.filter(record => !existingExamNos.has(record.examNo))                    
                    return [...prev, ...newRecords]
                })
            }
        } catch (error) {
            console.error('Error processing files:', error)
            toast.error('Failed to process uploaded files')
        } finally {
            setIsLoading(false)
        }
    }, [])

    const handleDataChange = useCallback((newData: StudentRecord[]) => {
        setStudentData(newData)
    }, [])

    const handleStudentUpdate = useCallback((updatedStudent: StudentRecord) => {
        const updatedData = studentData.map(student => 
            student.examNo === updatedStudent.examNo ? updatedStudent : student
        )
        setStudentData(updatedData)
        updateStudent(updatedStudent)
        toast.success(`Student data updated in main dataset`)
    }, [studentData, updateStudent])

    const hasData = studentData.length > 0

    if (isLoading) {
        return (
            <div className='p-3 bg-white/50 backdrop-blur-[2px] h-full overflow-y-auto border border-black/10 flex items-center justify-center'>
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Processing uploaded files...</p>
                </div>
            </div>
        )
    }

    return (
        <React.Fragment>
            <div className={'p-3 bg-white/50 backdrop-blur-[2px] border border-black/10 m-1 mb-0 space-y-4 flex-1 overflow-auto' + (hasData ? ' overflow-y-auto' : 'overflow-hidden')}>
                {hasData ? (
                    <DataTable 
                        data={studentData}
                        onDataChange={handleDataChange}
                        className="flex-1 overflow-hidden"
                    />
                ) : (
                    /* Full screen upload when no data */
                    <MultiFileUpload 
                        onFilesUploaded={handleFilesUploaded}
                        hasData={hasData}
                        className="flex-1"
                    />
                )}
            </div>

            {/* Exam Modal */}
            <ExamModal
                isOpen={isModalOpen}
                onClose={closeModal}
                student={selectedStudent}
                onUpdate={handleStudentUpdate}
            />
        </React.Fragment>
    )
}

export default function Upload() {
    return (
        <ExamModalProvider onStudentUpdate={() => {}}>
            <UploadContent />
        </ExamModalProvider>
    )
}