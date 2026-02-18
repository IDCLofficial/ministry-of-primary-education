'use client'

import React, { useState, useCallback, useEffect } from 'react'
import MultiFileUpload from './components/MultiFileUpload'
import DataTable from './components/DataTable'
import ExamModal from './components/ExamModal'
import { ExamModalProvider, useExamModal } from './contexts/ExamModalContext'
import toast from 'react-hot-toast'
import { parseCSVFile, StudentRecord } from './utils/csvParser'

interface FileOverride {
    fileName: string
    recordCount: number
    examYear: string
    lga: string
}

function UploadContent() {
    const [studentData, setStudentData] = useState<StudentRecord[]>([])
    const [isLoading, setIsLoading] = useState(false)
    const [uploadProgress, setUploadProgress] = useState({ 
        current: 0, 
        total: 0, 
        fileName: '',
        currentStep: '',
        totalRecords: 0
    })
    const [showOverrideModal, setShowOverrideModal] = useState(false)
    const [fileOverrides, setFileOverrides] = useState<FileOverride[]>([])
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
        setUploadProgress({ current: 0, total: files.length, fileName: '', currentStep: 'Initializing...', totalRecords: 0 })
        const allRecords: StudentRecord[] = []
        const fileOverrideData: FileOverride[] = []

        try {
            for (let i = 0; i < files.length; i++) {
                const file = files[i]
                
                // Step 1: Reading file
                setUploadProgress({ 
                    current: i + 1, 
                    total: files.length, 
                    fileName: file.name,
                    currentStep: 'Reading file...',
                    totalRecords: allRecords.length
                })
                await new Promise(resolve => setTimeout(resolve, 200))
                
                try {
                    // Step 2: Parsing data
                    setUploadProgress({ 
                        current: i + 1, 
                        total: files.length, 
                        fileName: file.name,
                        currentStep: 'Parsing data structure...',
                        totalRecords: allRecords.length
                    })
                    
                    const records = await parseCSVFile(file)
                    
                    // Step 3: Validating records
                    setUploadProgress({ 
                        current: i + 1, 
                        total: files.length, 
                        fileName: file.name,
                        currentStep: `Validating ${records.length} records...`,
                        totalRecords: allRecords.length
                    })
                    await new Promise(resolve => setTimeout(resolve, 150))
                    
                    allRecords.push(...records)
                    
                    // Step 4: Extracting metadata
                    setUploadProgress({ 
                        current: i + 1, 
                        total: files.length, 
                        fileName: file.name,
                        currentStep: 'Extracting metadata...',
                        totalRecords: allRecords.length
                    })
                    await new Promise(resolve => setTimeout(resolve, 100))
                    
                    const examYear = records[0]?.examYear || new Date().getFullYear()
                    const lga = records[0]?.lga || ''
                    
                    // Add to file override data with extracted values pre-filled
                    fileOverrideData.push({
                        fileName: file.name,
                        recordCount: records.length,
                        examYear: examYear.toString(),
                        lga: lga
                    })
                    
                    // Step 5: File processed successfully
                    setUploadProgress({ 
                        current: i + 1, 
                        total: files.length, 
                        fileName: file.name,
                        currentStep: `✓ Completed (${records.length} records)`,
                        totalRecords: allRecords.length
                    })
                    await new Promise(resolve => setTimeout(resolve, 200))
                    
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

                // Set file overrides and open modal automatically
                setFileOverrides(fileOverrideData)
                setShowOverrideModal(true)
            }
        } catch (error) {
            console.error('Error processing files:', error)
            toast.error('Failed to process uploaded files')
        } finally {
            setIsLoading(false)
            setUploadProgress({ current: 0, total: 0, fileName: '', currentStep: '', totalRecords: 0 })
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

    const handleUpdateFileOverride = (index: number, field: 'examYear' | 'lga', value: string) => {
        const updated = [...fileOverrides]
        updated[index][field] = value
        setFileOverrides(updated)
    }

    const handleApplyFileOverrides = () => {
        let appliedCount = 0
        
        const updatedData = studentData.map(student => {
            const fileOverride = fileOverrides.find(fo => fo.fileName === student.file.name)
            if (fileOverride && (fileOverride.examYear || fileOverride.lga)) {
                appliedCount++
                return {
                    ...student,
                    examYear: fileOverride.examYear ? parseInt(fileOverride.examYear) : student.examYear,
                    lga: fileOverride.lga || student.lga
                }
            }
            return student
        })

        setStudentData(updatedData)
        setShowOverrideModal(false)
        if (appliedCount > 0) {
            toast.success(`Override applied to ${appliedCount} records`)
        }
    }

    const handleOpenOverrideModal = () => {
        // Group data by file and create initial override state with current values
        const fileGroups = studentData.reduce((acc, record) => {
            const fileName = record.file.name
            if (!acc[fileName]) {
                acc[fileName] = {
                    fileName,
                    recordCount: 0,
                    examYear: record.examYear.toString(),
                    lga: record.lga
                }
            }
            acc[fileName].recordCount++
            return acc
        }, {} as Record<string, FileOverride>)

        setFileOverrides(Object.values(fileGroups))
        setShowOverrideModal(true)
    }

    const hasData = studentData.length > 0

    if (isLoading) {
        const progressPercentage = uploadProgress.total > 0 
            ? (uploadProgress.current / uploadProgress.total) * 100 
            : 0

        return (
            <div className='p-3 bg-white/50 backdrop-blur-[2px] h-full overflow-y-auto border border-black/10 flex items-center justify-center'>
                <div className="text-center max-w-lg w-full px-4">
                    {/* Animated Spinner */}
                    <div className="relative mb-6">
                        <div className="animate-spin rounded-full h-16 w-16 border-4 border-gray-200 border-t-green-600 mx-auto"></div>
                        <div className="absolute inset-0 flex items-center justify-center">
                            <div className="h-10 w-10 bg-green-100 rounded-full animate-pulse"></div>
                        </div>
                    </div>
                    
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">Processing BECE Files</h3>
                    
                    {uploadProgress.total > 0 && (
                        <>
                            {/* File Progress */}
                            <div className="mb-4">
                                <p className="text-sm font-medium text-gray-700 mb-1">
                                    File {uploadProgress.current} of {uploadProgress.total}
                                </p>
                                {uploadProgress.fileName && (
                                    <p className="text-xs text-gray-500 truncate px-4" title={uploadProgress.fileName}>
                                        📄 {uploadProgress.fileName}
                                    </p>
                                )}
                            </div>
                            
                            {/* Main Progress Bar */}
                            <div className="mb-4">
                                <div className="w-full bg-gray-200 rounded-full h-3 mb-2 overflow-hidden shadow-inner">
                                    <div 
                                        className="h-3 rounded-full transition-all duration-500 ease-out bg-gradient-to-r from-green-500 to-green-600 relative overflow-hidden"
                                        style={{ width: `${progressPercentage}%` }}
                                    >
                                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-30 animate-shimmer"></div>
                                    </div>
                                </div>
                                <div className="flex justify-between text-xs text-gray-600">
                                    <span>{Math.round(progressPercentage)}% Complete</span>
                                    <span>{uploadProgress.totalRecords} records loaded</span>
                                </div>
                            </div>
                            
                            {/* Current Step with Animation */}
                            {uploadProgress.currentStep && (
                                <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
                                    <div className="flex items-center justify-center space-x-2">
                                        <svg className="w-5 h-5 text-blue-600 animate-spin" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        <span className="text-sm font-medium text-blue-900 animate-pulse">
                                            {uploadProgress.currentStep}
                                        </span>
                                    </div>
                                </div>
                            )}
                            
                            {/* Activity Steps */}
                            <div className="mt-6 bg-gray-50 rounded-lg p-4 border border-gray-200">
                                <div className="space-y-2 text-left">
                                    <div className="flex items-center text-xs text-gray-600">
                                        <span className="inline-block w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></span>
                                        Reading file structure
                                    </div>
                                    <div className="flex items-center text-xs text-gray-600">
                                        <span className="inline-block w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse" style={{ animationDelay: '0.2s' }}></span>
                                        Parsing CSV/XLSX data
                                    </div>
                                    <div className="flex items-center text-xs text-gray-600">
                                        <span className="inline-block w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse" style={{ animationDelay: '0.4s' }}></span>
                                        Validating exam records
                                    </div>
                                    <div className="flex items-center text-xs text-gray-600">
                                        <span className="inline-block w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse" style={{ animationDelay: '0.6s' }}></span>
                                        Extracting metadata
                                    </div>
                                </div>
                            </div>
                        </>
                    )}
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
                        onOpenOverrideModal={handleOpenOverrideModal}
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

            {/* Override Modal */}
            {showOverrideModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[80vh] overflow-hidden flex flex-col">
                        {/* Modal Header */}
                        <div className="px-6 py-4 border-b border-gray-200">
                            <div className="flex items-center justify-between">
                                <h3 className="text-lg font-semibold text-gray-900">Override Exam Year & LGA by File</h3>
                                <button
                                    onClick={() => setShowOverrideModal(false)}
                                    className="text-gray-400 hover:text-gray-600 transition-colors"
                                >
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>
                            <p className="text-sm text-gray-500 mt-1">
                                Pre-filled with extracted data. Modify as needed or leave blank to keep original values.
                            </p>
                        </div>

                        {/* Modal Content */}
                        <div className="flex-1 overflow-y-auto px-6 py-4">
                            <div className="space-y-4">
                                {fileOverrides.map((fileOverride, index) => (
                                    <div key={index} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                                        <div className="flex items-center justify-between mb-3">
                                            <div className="flex-1">
                                                <h4 className="font-medium text-gray-900 truncate" title={fileOverride.fileName}>
                                                    {fileOverride.fileName}
                                                </h4>
                                                <p className="text-xs text-gray-500 mt-1">
                                                    {fileOverride.recordCount} record{fileOverride.recordCount !== 1 ? 's' : ''}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-2 gap-3">
                                            <div>
                                                <label className="block text-xs font-medium text-gray-700 mb-1">
                                                    Exam Year
                                                </label>
                                                <input
                                                    type="number"
                                                    placeholder="e.g. 2024"
                                                    value={fileOverride.examYear}
                                                    onChange={(e) => handleUpdateFileOverride(index, 'examYear', e.target.value)}
                                                    className="block w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-medium text-gray-700 mb-1">
                                                    LGA
                                                </label>
                                                <input
                                                    type="text"
                                                    placeholder="e.g. Owerri Municipal"
                                                    value={fileOverride.lga}
                                                    onChange={(e) => handleUpdateFileOverride(index, 'lga', e.target.value)}
                                                    className="block w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Modal Footer */}
                        <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-end space-x-3">
                            <button
                                onClick={() => setShowOverrideModal(false)}
                                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                            >
                                Skip
                            </button>
                            <button
                                onClick={handleApplyFileOverrides}
                                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors active:scale-95"
                            >
                                Apply Overrides
                            </button>
                        </div>
                    </div>
                </div>
            )}
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