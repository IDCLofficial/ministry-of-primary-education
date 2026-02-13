'use client'

import React, { useState, useCallback, useEffect } from 'react'
import MultiFileUpload from './components/MultiFileUpload'
import DataTable from './components/DataTable'
import ExamModal from './components/ExamModal'
import { ExamModalProvider, useExamModal } from './contexts/ExamModalContext'
import toast from 'react-hot-toast'
import { parseCSVFile, UBEATStudentRecord } from './utils/csvParser'
import { IoChevronDown, IoChevronUp, IoInformationCircle } from 'react-icons/io5'

function UploadContent() {
    const [studentData, setStudentData] = useState<UBEATStudentRecord[]>([])
    const [isLoading, setIsLoading] = useState(false)
    const [showHelp, setShowHelp] = useState(false)
    const { isModalOpen, selectedStudent, closeModal, updateStudent } = useExamModal()

    const warningMessage = "Unsaved data will be lost. Continue?"

    useEffect(() => {
        const handleBeforeUnload = (e: BeforeUnloadEvent) => {
            if (studentData.length > 0) {
                e.preventDefault()
                e.returnValue = warningMessage
                return warningMessage
            }
        }

        window.addEventListener('beforeunload', handleBeforeUnload)
        return () => window.removeEventListener('beforeunload', handleBeforeUnload)
    }, [studentData.length])

    const handleFilesUploaded = useCallback(async (files: File[]) => {
        setIsLoading(true)
        const allRecords: UBEATStudentRecord[] = []
        let totalNewRecords = 0
        let totalDuplicates = 0

        try {
            for (const file of files) {
                try {
                    const records = await parseCSVFile(file)
                    allRecords.push(...records)
                    
                    const isXLSX = file.name.toLowerCase().endsWith('.xlsx') || file.name.toLowerCase().endsWith('.xls')
                    const fileType = isXLSX ? 'XLSX' : 'CSV'
                    
                    toast.success(
                        `✓ Parsed ${records.length} UBEAT record${records.length !== 1 ? 's' : ''} from ${fileType} file: ${file.name}`,
                        { duration: 4000 }
                    )
                } catch (error) {
                    console.error(`Error parsing ${file.name}:`, error)
                    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
                    toast.error(`✗ Failed to parse ${file.name}: ${errorMessage}`, { duration: 6000 })
                }
            }

            if (allRecords.length > 0) {
                setStudentData(prev => {
                    const existingExamNos = new Set(prev.map(record => record.examNumber))
                    const newRecords = allRecords.filter(record => !existingExamNos.has(record.examNumber))
                    totalNewRecords = newRecords.length
                    totalDuplicates = allRecords.length - newRecords.length
                    return [...prev, ...newRecords]
                })
                
                if (totalDuplicates > 0) {
                    toast.success(
                        `Added ${totalNewRecords} new record${totalNewRecords !== 1 ? 's' : ''}. Skipped ${totalDuplicates} duplicate${totalDuplicates !== 1 ? 's' : ''}.`,
                        { duration: 5000 }
                    )
                }
            }
        } catch (error) {
            console.error('Error processing files:', error)
            toast.error('Failed to process uploaded files')
        } finally {
            setIsLoading(false)
        }
    }, [])

    const handleDataChange = useCallback((newData: UBEATStudentRecord[]) => {
        setStudentData(newData)
    }, [])

    const handleStudentUpdate = useCallback((updatedStudent: UBEATStudentRecord) => {
        const updatedData = studentData.map(student => 
            student.examNumber === updatedStudent.examNumber ? updatedStudent : student
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
                    <p className="text-gray-600">Processing uploaded UBEAT files...</p>
                </div>
            </div>
        )
    }

    return (
        <React.Fragment>
            <div className={'p-3 bg-white/50 backdrop-blur-[2px] border border-black/10 m-1 mb-0 space-y-4 flex-1 overflow-auto' + (hasData ? ' overflow-y-auto' : 'overflow-hidden')}>
                {!hasData && (
                    <div className="mb-4">
                        <button
                            onClick={() => setShowHelp(!showHelp)}
                            className="w-full flex items-center justify-between px-4 py-3 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg transition-colors"
                        >
                            <div className="flex items-center gap-2">
                                <IoInformationCircle className="w-5 h-5 text-blue-600" />
                                <span className="text-sm font-medium text-blue-900">
                                    UBEAT File Format Help
                                </span>
                            </div>
                            {showHelp ? (
                                <IoChevronUp className="w-5 h-5 text-blue-600" />
                            ) : (
                                <IoChevronDown className="w-5 h-5 text-blue-600" />
                            )}
                        </button>
                        
                        {showHelp && (
                            <div className="mt-2 bg-blue-50 border border-blue-200 rounded-lg p-4 animate-in slide-in-from-top duration-200">
                                <div className="flex items-start gap-3">
                                    <svg className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                                    </svg>
                                    <div className="flex-1">
                                        <p className="text-sm font-medium text-blue-900 mb-1">Expected File Structure</p>
                                        <p className="text-sm text-blue-800 mb-2">
                                            Upload CSV or XLSX files with the following structure:
                                        </p>
                                        <ul className="text-xs text-blue-700 space-y-1 ml-4 mb-3">
                                            <li>• <strong>Row 1:</strong> Main headers (S/NO., LGA, ZONE, SCHOOL NAME, CODE NO., CANDIDATE&apos;S NAME, EXAM NO., SEX, AGE, ATTENDANCE, MATHEMATICS, , , ENGLISH LANGUAGE, , , GENERAL KNOWLEDGE, , , IGBO, , )</li>
                                            <li>• <strong>Row 2:</strong> Sub-headers for scores ( , , , , , , , , , , CAS-30%, CAS-70%, TOTAL, CAS-30%, CAS-70%, TOTAL, CAS-30%, CAS-70%, TOTAL, CAS-30%, CAS-70%, TOTAL)</li>
                                            <li>• <strong>Row 3+:</strong> Student data rows with actual values</li>
                                            <li>• <strong>Note:</strong> ATTENDANCE field supports both numeric (1, 2) and text (PRESENT, ABSENT) values</li>
                                        </ul>
                                        <div className="bg-white/50 rounded border border-blue-300 p-2 mb-2">
                                            <p className="text-xs font-semibold text-blue-900 mb-1">Subjects (4 subjects total):</p>
                                            <p className="text-xs text-blue-800">Mathematics, English Language, General Knowledge, Igbo Language</p>
                                            <p className="text-xs text-blue-700 mt-1">Each subject has: CA (30%) and Exam (70%) scores</p>
                                            <p className="text-xs text-gray-600 mt-1">Note: CA is stored as string, Exam as number</p>
                                        </div>
                                        <div className="bg-green-50 rounded border border-green-300 p-2">
                                            <p className="text-xs font-semibold text-green-900 mb-1">📊 XLSX Multi-Sheet Support:</p>
                                            <p className="text-xs text-green-800">For XLSX files, each sheet will be processed separately. All sheets must follow the same format with 2 header rows.</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                )}
                
                {hasData ? (
                    <DataTable 
                        data={studentData}
                        onDataChange={handleDataChange}
                        className="flex-1 overflow-hidden"
                    />
                ) : (
                    <MultiFileUpload 
                        onFilesUploaded={handleFilesUploaded}
                        hasData={hasData}
                        className="flex-1"
                    />
                )}
            </div>

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
