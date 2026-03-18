'use client'

import React, { useState, useMemo, useRef } from 'react'
import { createPortal } from 'react-dom'
import { IoSearch, IoEye, IoTrash, IoCloudUpload, IoRefresh } from 'react-icons/io5'
import { useExamModal } from '../contexts/ExamModalContext'
import toast from 'react-hot-toast'
import { UBEATStudentRecord } from '../utils/csvParser'
import { useRouter } from 'next/navigation'
import { useUploadUBEATResultsMutation } from '../../../../store/api/authApi'

interface DataTableProps {
    data: UBEATStudentRecord[]
    onDataChange: (data: UBEATStudentRecord[]) => void
    onOpenOverrideModal: () => void
    className?: string
}

export default function DataTable({ data, onDataChange, onOpenOverrideModal, className = "" }: DataTableProps) {
    const [searchTerm, setSearchTerm] = useState('')
    const [selectedRows, setSelectedRows] = useState<Set<number>>(new Set())
    const [sortConfig, setSortConfig] = useState<{
        key: keyof UBEATStudentRecord | null
        direction: 'asc' | 'desc'
    }>({ key: null, direction: 'asc' })
    const [currentPage, setCurrentPage] = useState(1)
    const [itemsPerPage, setItemsPerPage] = useState(10)
    const [isSaving, setIsSaving] = useState(false)
    const [uploadProgress, setUploadProgress] = useState(0)
    const [progressMessage, setProgressMessage] = useState('')
    const [failedSchools, setFailedSchools] = useState<string[]>([])
    const [showFilesModal, setShowFilesModal] = useState(false)
    const [uploadingCount, setUploadingCount] = useState<number | null>(null)
    const uploadingCountRef = useRef<number | null>(null)
    const [mounted, setMounted] = useState(false)
    const { openModal } = useExamModal()
    const router = useRouter()
    const [uploadUBEATResults] = useUploadUBEATResultsMutation()
    React.useEffect(() => setMounted(true), [])

    const filteredData = useMemo(() => {
        return data.filter(record =>
            record.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            record.examNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
            record.schoolName.toLowerCase().includes(searchTerm.toLowerCase())
        )
    }, [data, searchTerm])

    const sortedData = useMemo(() => {
        if (!sortConfig.key) return filteredData

        return [...filteredData].sort((a, b) => {
            const aValue = a[sortConfig.key!]
            const bValue = b[sortConfig.key!]

            if (aValue < bValue) {
                return sortConfig.direction === 'asc' ? -1 : 1
            }
            if (aValue > bValue) {
                return sortConfig.direction === 'asc' ? 1 : -1
            }
            return 0
        })
    }, [filteredData, sortConfig])

    // Files/sheets in data (for "remove whole file" and batch context)
    const filesList = useMemo(() => {
        const map = new Map<string, number>()
        data.forEach(record => {
            const name = record.file.name
            map.set(name, (map.get(name) ?? 0) + 1)
        })
        return Array.from(map.entries()).map(([fileName, count]) => ({ fileName, count }))
    }, [data])

    // Pagination logic
    const totalPages = Math.ceil(sortedData.length / itemsPerPage)
    const startIndex = (currentPage - 1) * itemsPerPage
    const endIndex = startIndex + itemsPerPage
    const paginatedData = sortedData.slice(startIndex, endIndex)

    // Reset to first page when search changes
    React.useEffect(() => {
        setCurrentPage(1)
    }, [searchTerm])

    // Optimistic progress simulation based on count being uploaded
    React.useEffect(() => {
        if (!isSaving) {
            setUploadProgress(0)
            setProgressMessage('')
            setUploadingCount(null)
            return
        }

        const count = uploadingCountRef.current ?? uploadingCount ?? data.length
        // Calculate estimated time: ~3.4ms per record (1600 records in 5.44s)
        const estimatedTimeMs = count * 3.4
        const updateInterval = 100 // Update every 100ms
        const totalSteps = Math.ceil(estimatedTimeMs / updateInterval)
        let currentStep = 0

        const progressMessages = [
            'Validating student records...',
            'Grouping students by school...',
            'Transforming subject scores...',
            'Preparing data for upload...',
            'Uploading to server...',
            'Processing exam records...',
            'Finalizing upload...'
        ]

        const interval = setInterval(() => {
            currentStep++
            
            // Optimistic progress: reaches ~95% by estimated time, then slows down
            let progress
            if (currentStep < totalSteps) {
                // Smooth curve to 95%
                progress = Math.min(95, (currentStep / totalSteps) * 95)
            } else {
                // Slow crawl from 95% to 99%
                const extraSteps = currentStep - totalSteps
                progress = Math.min(99, 95 + (extraSteps * 0.5))
            }

            setUploadProgress(Math.floor(progress))

            // Update message based on progress
            const messageIndex = Math.min(
                Math.floor((progress / 100) * progressMessages.length),
                progressMessages.length - 1
            )
            setProgressMessage(progressMessages[messageIndex])

        }, updateInterval)

        return () => clearInterval(interval)
    }, [isSaving, data.length, uploadingCount])

    const handleSort = (key: keyof UBEATStudentRecord) => {
        setSortConfig(prev => ({
            key,
            direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
        }))
    }

    const handleSelectAll = (checked: boolean) => {
        if (checked) {
            setSelectedRows(new Set(sortedData.map((_, index) => index)))
        } else {
            setSelectedRows(new Set())
        }
    }

    const handleSelectRow = (index: number, checked: boolean) => {
        const newSelected = new Set(selectedRows)
        if (checked) {
            newSelected.add(index)
        } else {
            newSelected.delete(index)
        }
        setSelectedRows(newSelected)
    }

    const handleDeleteSelected = () => {
        const recordsToRemove = Array.from(selectedRows)
            .sort((a, b) => a - b)
            .map(i => sortedData[i])
        const keysToRemove = new Set(recordsToRemove.map(r => `${r.examNumber}\0${r.file.name}`))
        onDataChange(data.filter(r => !keysToRemove.has(`${r.examNumber}\0${r.file.name}`)))
        setSelectedRows(new Set())
    }

    const handleViewExam = (student: UBEATStudentRecord) => {
        openModal(student)
    }

    const handleClearData = () => {
        if (window.confirm('Are you sure you want to clear all UBEAT data? This action cannot be undone.')) {
            onDataChange([])
            toast.success('All UBEAT data cleared successfully')
        }
    }

    const handleRemoveFile = (fileName: string) => {
        const count = data.filter(r => r.file.name === fileName).length
        if (!window.confirm(`Remove the entire sheet/file "${fileName}"? This will remove ${count} record${count !== 1 ? 's' : ''} from the table.`)) return
        onDataChange(data.filter(r => r.file.name !== fileName))
        setSelectedRows(new Set())
        toast.success(`Removed ${count} record${count !== 1 ? 's' : ''} (${fileName})`)
    }

    const handleSaveToDb = async () => {
        const recordsToUpload: UBEATStudentRecord[] =
            selectedRows.size > 0
                ? Array.from(selectedRows)
                    .sort((a, b) => a - b)
                    .map(i => sortedData[i])
                : data

        if (recordsToUpload.length === 0) {
            toast.error('No records to upload. Select rows or add data.')
            return
        }

        const isPartialUpload = recordsToUpload.length < data.length
        const remainingCount = data.length - recordsToUpload.length

        if (isPartialUpload && !window.confirm(
            `Upload ${recordsToUpload.length.toLocaleString()} selected record${recordsToUpload.length !== 1 ? 's' : ''}?\n\n${remainingCount.toLocaleString()} record${remainingCount !== 1 ? 's' : ''} will remain in the table for a later upload.`
        )) return

        const startTime = performance.now()
        const countToUpload = recordsToUpload.length
        uploadingCountRef.current = countToUpload
        setUploadingCount(countToUpload)
        setIsSaving(true)

        try {
            toast.loading(isPartialUpload ? `Saving ${recordsToUpload.length} selected records...` : 'Saving UBEAT data to database...')

            // Group students by school (from recordsToUpload only)
            const schoolGroups = recordsToUpload.reduce((groups, student) => {
                const schoolName = student.schoolName
                if (!groups[schoolName]) {
                    groups[schoolName] = []
                }
                groups[schoolName].push(student)
                return groups
            }, {} as Record<string, UBEATStudentRecord[]>);

            // Transform data according to API structure
            const results = Object.entries(schoolGroups).map(([schoolName, students]) => ({
                lga: students[0]?.lga,
                examYear: students[0]?.examYear || new Date().getFullYear(),
                schoolName,
                students: students.map(student => ({
                    serialNumber: student.serialNumber,
                    examNumber: student.examNumber,
                    studentName: student.studentName,
                    age: student.age || 0,
                    sex: student.sex,
                    subjects: {
                        mathematics: {
                            ca: parseFloat(student.subjects.mathematics.ca) || 0,
                            exam: student.subjects.mathematics.exam
                        },
                        english: {
                            ca: parseFloat(student.subjects.english.ca) || 0,
                            exam: student.subjects.english.exam
                        },
                        generalKnowledge: {
                            ca: parseFloat(student.subjects.generalKnowledge.ca) || 0,
                            exam: student.subjects.generalKnowledge.exam
                        },
                        igbo: {
                            ca: parseFloat(student.subjects.igbo.ca) || 0,
                            exam: student.subjects.igbo.exam
                        }
                    }
                }))
            }));

            await uploadUBEATResults({ result: results }).unwrap()

            const elapsedTime = ((performance.now() - startTime) / 1000).toFixed(2)
            toast.dismiss()
            setUploadProgress(100)
            setProgressMessage('Upload complete!')
            await new Promise(r => setTimeout(r, 300))

            const uploadedKeys = new Set(recordsToUpload.map(r => `${r.examNumber}\0${r.file.name}`))
            const newData = data.filter(r => !uploadedKeys.has(`${r.examNumber}\0${r.file.name}`))
            onDataChange(newData)
            setSelectedRows(new Set())
            setFailedSchools([])

            if (newData.length > 0) {
                toast.success(
                    `Uploaded ${recordsToUpload.length.toLocaleString()} records in ${elapsedTime}s. ${newData.length.toLocaleString()} record${newData.length !== 1 ? 's' : ''} remaining.`
                )
            } else {
                toast.success(`Successfully saved ${recordsToUpload.length.toLocaleString()} UBEAT records to database in ${elapsedTime}s`)
                router.push('/exam-portal/dashboard/schools')
            }
        } catch (error) {
            console.error('Error saving UBEAT data:', error)
            toast.dismiss()
            toast.error('Failed to save UBEAT data to database. Please check your connection and try again.')
        } finally {
            setIsSaving(false)
            setUploadingCount(null)
            uploadingCountRef.current = null
        }
    }

    return (
        <React.Fragment>
            <div className={`bg-white border border-gray-200 rounded-lg overflow-hidden ${className}`}>
                {/* Header */}
                <div className="px-6 py-4 border-b border-gray-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="text-lg font-medium text-gray-900">
                                UBEAT Exam Data
                                {data.length > 0 && data[0]?.examYear && (
                                    <span className="ml-2 text-sm font-normal text-green-600">
                                        (Exam Year: {data[0].examYear})
                                    </span>
                                )}
                            </h3>
                            <p className="text-sm text-gray-500">
                                {data.length.toLocaleString()} total records, {filteredData.length.toLocaleString()} showing
                            </p>
                        </div>
                        <div className="flex items-center space-x-3">
                            <button
                                onClick={handleSaveToDb}
                                disabled={isSaving}
                                title={selectedRows.size > 0 ? `Upload ${selectedRows.size} selected` : 'Upload all to database'}
                                className={`inline-flex items-center gap-2 transition-all duration-200 px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white focus:outline-none focus:ring-2 focus:ring-offset-2 ${isSaving
                                    ? 'bg-gray-400 cursor-not-allowed'
                                    : 'bg-green-600 hover:bg-green-700 focus:ring-green-500 cursor-pointer active:scale-90 active:rotate-1'
                                    }`}
                            >
                                {isSaving ? (
                                    <>
                                        <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Saving...
                                    </>
                                ) : selectedRows.size > 0 ? (
                                    <>
                                        <IoCloudUpload className="w-4 h-4 flex-shrink-0" />
                                        <span>Upload selected ({selectedRows.size})</span>
                                    </>
                                ) : (
                                    <>
                                        <IoCloudUpload className="w-4 h-4 flex-shrink-0" />
                                        <span>Upload all</span>
                                    </>
                                )}
                            </button>
                            <button
                                onClick={handleClearData}
                                disabled={isSaving}
                                title='Clear UBEAT Data'
                                className={`inline-flex items-center transition-all duration-200 px-3 py-2 border text-sm font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 ${isSaving
                                        ? 'border-gray-300 text-gray-400 bg-gray-100 cursor-not-allowed'
                                        : 'border-red-300 text-red-700 bg-white hover:bg-red-50 focus:ring-red-500 cursor-pointer active:scale-90 active:rotate-1'
                                    }`}
                            >
                                <IoRefresh className="w-4 h-4" />
                            </button>
                            {selectedRows.size > 0 && (
                                <button
                                    onClick={handleDeleteSelected}
                                    disabled={isSaving}
                                    className={`inline-flex items-center transition-all duration-200 px-3 py-2 border text-sm font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 ${isSaving
                                        ? 'border-gray-300 text-gray-400 bg-gray-100 cursor-not-allowed'
                                        : 'border-red-300 text-red-700 bg-white hover:bg-red-50 focus:ring-red-500 cursor-pointer active:scale-90 active:rotate-1'
                                        }`}
                                >
                                    <IoTrash className="w-4 h-4 mr-2" />
                                    Delete ({selectedRows.size})
                                </button>
                            )}
                        </div>
                    </div>
                    {selectedRows.size > 0 && (
                        <div className="mt-3 px-4 py-2 rounded-md bg-green-50 border border-green-200">
                            <p className="text-sm font-medium text-green-800">
                                <span className="font-semibold">{selectedRows.size} rows selected</span>
                                {' — green button will upload only these. Clear selection to upload all.'}
                            </p>
                        </div>
                    )}
                    {/* Sheets / files: open in modal to save space */}
                    {filesList.length > 0 && (
                        <div className="mt-3">
                            <button
                                type="button"
                                onClick={() => setShowFilesModal(true)}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-50 border border-amber-200 text-sm font-medium text-gray-800 hover:bg-amber-100 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-1"
                            >
                                📁 Sheets / files in this upload ({filesList.length} file{filesList.length !== 1 ? 's' : ''})
                            </button>
                        </div>
                    )}
                    {/* Search and Filters */}
                    <div className="mt-4 flex items-center justify-between space-x-4">
                        <div className="flex-1 max-w-md">
                            <div className="relative">
                                <IoSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                                <input
                                    type="text"
                                    placeholder="Search by name, exam no, or school..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    disabled={isSaving}
                                    className={`block w-full pl-10 pr-3 py-2 border rounded-md leading-5 placeholder-gray-500 focus:outline-none text-sm ${isSaving
                                            ? 'border-gray-200 bg-gray-50 text-gray-400 cursor-not-allowed'
                                            : 'border-gray-300 bg-white focus:placeholder-gray-400 focus:ring-1 focus:ring-green-500 focus:border-green-500'
                                        }`}
                                />
                            </div>
                        </div>
                        <button
                            onClick={onOpenOverrideModal}
                            disabled={isSaving || data.length === 0}
                            className={`inline-flex items-center px-4 py-2 text-sm font-medium rounded-md transition-all duration-200 ${isSaving || data.length === 0
                                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                    : 'bg-blue-600 text-white hover:bg-blue-700 active:scale-95 cursor-pointer'
                                }`}
                        >
                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                            Override by File
                        </button>
                    </div>
                </div>

                {failedSchools.length > 0 && (
                    <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded-md">
                        <p className="text-sm text-red-700 font-medium">⚠️ Upload Failed</p>
                        <p className="text-xs text-red-600">
                            The following schools failed to upload: {failedSchools.join(', ')}.
                            Please retry the upload for these records.
                        </p>
                    </div>
                )}
                {/* Table */}
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left">
                                    <input
                                        type="checkbox"
                                        checked={selectedRows.size === sortedData.length && sortedData.length > 0}
                                        onChange={(e) => handleSelectAll(e.target.checked)}
                                        disabled={isSaving}
                                        className={`rounded text-green-600 focus:ring-green-500 ${isSaving ? 'border-gray-200 bg-gray-50 cursor-not-allowed' : 'border-gray-300'
                                            }`}
                                    />
                                </th>
                                {[
                                    { key: 'serialNumber', label: 'S/NO' },
                                    { key: 'studentName', label: 'Name' },
                                    { key: 'examNumber', label: 'Exam No.' },
                                    { key: 'schoolName', label: 'School' },
                                    { key: 'lga', label: 'LGA' }
                                ].map(({ key, label }) => (
                                    <th
                                        key={key}
                                        onClick={() => handleSort(key as keyof UBEATStudentRecord)}
                                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                                    >
                                        <div className="flex items-center space-x-1">
                                            <span>{label}</span>
                                            {sortConfig.key === key && (
                                                <span className="text-green-600">
                                                    {sortConfig.direction === 'asc' ? '↑' : '↓'}
                                                </span>
                                            )}
                                        </div>
                                    </th>
                                ))}
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {paginatedData.map((record, pageIndex) => {
                                const globalIndex = startIndex + pageIndex
                                return (
                                <tr key={`${record.examNumber}-${globalIndex}`} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <input
                                            type="checkbox"
                                            checked={selectedRows.has(globalIndex)}
                                            onChange={(e) => handleSelectRow(globalIndex, e.target.checked)}
                                            disabled={isSaving}
                                            className={`rounded text-green-600 focus:ring-green-500 ${isSaving ? 'border-gray-200 bg-gray-50 cursor-not-allowed' : 'border-gray-300'
                                                }`}
                                        />
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        {record.serialNumber}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 capitalize">
                                        {record.studentName.toLowerCase()}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        {record.examNumber}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        <div className="max-w-32 truncate capitalize" title={record.schoolName}>
                                            {record.schoolName.toLowerCase()}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 capitalize">
                                        {record.lga.toLowerCase()}
                                    </td>
                                    <td className=" py-4 whitespace-nowrap text-sm text-gray-500">
                                        <button
                                            onClick={() => handleViewExam(record)}
                                            disabled={isSaving}
                                            className={`px-6 flex items-center justify-center w-full ${isSaving ? 'cursor-not-allowed' : 'cursor-pointer'
                                                }`}
                                            title={isSaving ? 'Saving in progress...' : 'View Exam Details'}
                                        >
                                            <div
                                                className={`text-center p-1 transition-all duration-200 rounded border border-transparent ${isSaving
                                                    ? 'text-gray-400'
                                                    : 'text-green-600 hover:text-green-800 active:scale-90 active:rotate-1 hover:bg-green-50 hover:border-green-100'
                                                    }`}
                                            >
                                                <IoEye className="text-xl" />
                                            </div>
                                        </button>
                                    </td>
                                </tr>
                            )})}
                        </tbody>
                    </table>
                </div>
                {/* Pagination Controls */}
                {totalPages > 1 && (
                    <div className="flex items-center justify-between px-6 py-3 bg-gray-50 border-t border-gray-200">
                        <div className="flex items-center space-x-2">
                            <span className="text-sm text-gray-700">
                                Showing {startIndex + 1} to {Math.min(endIndex, sortedData.length)} of {sortedData.length} results
                            </span>
                            <select
                                value={itemsPerPage}
                                onChange={(e) => {
                                    setItemsPerPage(Number(e.target.value))
                                    setCurrentPage(1)
                                }}
                                className="ml-2 border border-gray-300 rounded px-2 py-1 text-sm"
                            >
                                <option value={5}>5 per page</option>
                                <option value={10}>10 per page</option>
                                <option value={25}>25 per page</option>
                                <option value={50}>50 per page</option>
                            </select>
                        </div>

                        <div className="flex items-center space-x-1">
                            <button
                                onClick={() => setCurrentPage(1)}
                                disabled={currentPage === 1}
                                className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed active:scale-90 active:rotate-1 transition-all duration-200 cursor-pointer"
                            >
                                First
                            </button>
                            <button
                                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                disabled={currentPage === 1}
                                className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed active:scale-90 active:rotate-1 transition-all duration-200 cursor-pointer"
                            >
                                Previous
                            </button>

                            {/* Page numbers */}
                            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                                const pageNum = Math.max(1, Math.min(totalPages - 4, currentPage - 2)) + i
                                if (pageNum > totalPages) return null
                                return (
                                    <button
                                        key={pageNum}
                                        onClick={() => setCurrentPage(pageNum)}
                                        className={`px-3 py-1 text-sm border rounded active:scale-90 active:rotate-1 transition-all duration-200 cursor-pointer ${currentPage === pageNum
                                            ? 'bg-green-600 text-white border-green-600'
                                            : 'border-gray-300 hover:bg-gray-100'
                                            }`}
                                    >
                                        {pageNum}
                                    </button>
                                )
                            })}

                            <button
                                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                disabled={currentPage === totalPages}
                                className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed active:scale-90 active:rotate-1 transition-all duration-200 cursor-pointer"
                            >
                                Next
                            </button>
                            <button
                                onClick={() => setCurrentPage(totalPages)}
                                disabled={currentPage === totalPages}
                                className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed active:scale-90 active:rotate-1 transition-all duration-200 cursor-pointer"
                            >
                                Last
                            </button>
                        </div>
                    </div>
                )}
                {sortedData.length === 0 && (
                    <div className="text-center py-12">
                        <p className="text-gray-500">No records found</p>
                    </div>
                )}

            </div>

            {/* Modals portaled outside the table */}
            {mounted && createPortal(
                <>
                    {isSaving && (
                        <div className="fixed inset-0 z-[100] bg-white/80 backdrop-blur-sm flex items-center justify-center p-4">
                            <div className="bg-white p-8 rounded-lg shadow-xl border border-gray-200 max-w-md w-full mx-4">
                                <div className="flex items-center justify-center mb-4">
                                    <svg className="animate-spin h-12 w-12 text-green-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                </div>
                                <div className="text-center">
                                    <p className="text-xl font-semibold text-gray-900 mb-2">Saving to Database</p>
                                    <p className="text-sm text-gray-600 mb-4">
                                        Processing {(uploadingCountRef.current ?? uploadingCount ?? data.length).toLocaleString()} UBEAT records...
                                    </p>
                                    <div className="mb-4">
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="text-sm font-medium text-green-700">{progressMessage}</span>
                                            <span className="text-sm font-semibold text-green-600">{uploadProgress}%</span>
                                        </div>
                                        <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                                            <div
                                                className="bg-gradient-to-r from-green-500 to-green-600 h-3 rounded-full transition-all duration-300 ease-out relative overflow-hidden"
                                                style={{ width: `${uploadProgress}%` }}
                                            >
                                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer"></div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="bg-blue-50 rounded-lg p-3 border border-blue-100">
                                        <p className="text-xs text-blue-800 flex items-center justify-center">
                                            <svg className="w-4 h-4 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                                            </svg>
                                            Please don&apos;t close this window
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                    {showFilesModal && filesList.length > 0 && (
                        <div
                            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50"
                            onClick={() => setShowFilesModal(false)}
                            role="dialog"
                            aria-modal="true"
                            aria-labelledby="ubeat-files-modal-title"
                        >
                            <div
                                className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[80vh] flex flex-col"
                                onClick={e => e.stopPropagation()}
                            >
                                <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
                                    <h3 id="ubeat-files-modal-title" className="text-lg font-semibold text-gray-900">
                                        Sheets / files in this upload ({filesList.length})
                                    </h3>
                                    <button
                                        type="button"
                                        onClick={() => setShowFilesModal(false)}
                                        className="p-2 rounded-md text-gray-500 hover:bg-gray-100 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-green-500"
                                        aria-label="Close"
                                    >
                                        <span className="text-xl leading-none">&times;</span>
                                    </button>
                                </div>
                                <p className="px-4 pt-2 text-xs text-gray-500">
                                    Remove an entire sheet/file from the table with the trash icon. Use checkboxes to upload only selected rows.
                                </p>
                                <div className="flex-1 overflow-y-auto p-4">
                                    <div className="flex flex-wrap gap-2">
                                        {filesList.map(({ fileName, count }) => (
                                            <span
                                                key={fileName}
                                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-50 border border-amber-200 text-sm"
                                            >
                                                <span className="max-w-[240px] truncate text-gray-800" title={fileName}>{fileName}</span>
                                                <span className="text-amber-700 text-xs font-medium">({count})</span>
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        handleRemoveFile(fileName)
                                                        if (filesList.length <= 1) setShowFilesModal(false)
                                                    }}
                                                    disabled={isSaving}
                                                    className="p-1 rounded-md text-red-600 hover:bg-red-50 hover:text-red-700 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                                                    title="Remove this entire sheet/file"
                                                >
                                                    <IoTrash className="w-4 h-4" />
                                                </button>
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </>,
                document.body
            )}
        </React.Fragment>
    )
}
