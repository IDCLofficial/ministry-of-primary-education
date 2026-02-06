'use client'

import React, { useState, useMemo } from 'react'
import { IoSearch, IoEye, IoTrash, IoCloudUpload, IoRefresh } from 'react-icons/io5'
import { useExamModal } from '../contexts/ExamModalContext'
import toast from 'react-hot-toast'
import { StudentRecord } from '../utils/csvParser'
import { useRouter } from 'next/navigation'
import { BeceResultUpload, useUploadBeceExamResultsMutation } from '../../../store/api/authApi'

interface DataTableProps {
    data: StudentRecord[]
    onDataChange: (data: StudentRecord[]) => void
    className?: string
}

export default function DataTable({ data, onDataChange, className = "" }: DataTableProps) {
    const [searchTerm, setSearchTerm] = useState('')
    const [selectedRows, setSelectedRows] = useState<Set<number>>(new Set())
    const [sortConfig, setSortConfig] = useState<{
        key: keyof StudentRecord | null
        direction: 'asc' | 'desc'
    }>({ key: null, direction: 'asc' })
    const [currentPage, setCurrentPage] = useState(1)
    const [itemsPerPage, setItemsPerPage] = useState(10)
    const [isSaving, setIsSaving] = useState(false)
    const [failedSchools, setFailedSchools] = useState<string[]>([])
    const { openModal } = useExamModal()
    const router = useRouter()
    const [uploadBeceExamResults] = useUploadBeceExamResultsMutation()

    const filteredData = useMemo(() => {
        return data.filter(record =>
            record.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            record.examNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
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

    // Pagination logic
    const totalPages = Math.ceil(sortedData.length / itemsPerPage)
    const startIndex = (currentPage - 1) * itemsPerPage
    const endIndex = startIndex + itemsPerPage
    const paginatedData = sortedData.slice(startIndex, endIndex)

    // Reset to first page when search changes
    React.useEffect(() => {
        setCurrentPage(1)
    }, [searchTerm])

    const handleSort = (key: keyof StudentRecord) => {
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
        const indicesToDelete = Array.from(selectedRows).sort((a, b) => b - a)
        const newData = [...data]

        indicesToDelete.forEach(index => {
            newData.splice(index, 1)
        })

        onDataChange(newData)
        setSelectedRows(new Set())
    }

    const handleViewExam = (student: StudentRecord) => {
        openModal(student)
    }

    const handleClearData = () => {
        if (window.confirm('Are you sure you want to clear all Exam data? This action cannot be undone.')) {
            onDataChange([])
            toast.success('All Exam data cleared successfully')
        }
    }

    const handleSaveToDb = async () => {
        const startTime = performance.now()
        setIsSaving(true)

        try {
            toast.loading('Saving Exams data to database...')

            // Group students by school
            const schoolGroups = data.reduce((groups, student) => {
                const schoolName = student.schoolName
                if (!groups[schoolName]) {
                    groups[schoolName] = []
                }
                groups[schoolName].push(student)
                return groups
            }, {} as Record<string, StudentRecord[]>)

            const filesWithStudentsCount: { fileName: string, fileSize: number, students: number }[] = data.reduce((files, student) => {
                const filename = student.file.name
                const existingFile = files.find(file => file.fileName === filename)

                if (existingFile) {
                    existingFile.students++
                } else {
                    files.push({ fileName: filename, fileSize: student.file.size, students: 1 })
                }

                return files
            }, [] as { fileName: string, fileSize: number, students: number }[])

            // Transform data according to API structure
            const results = Object.entries(schoolGroups).map(([schoolName, students]) => ({
                schoolName,
                lga: students[0]?.lga,
                students: students.map(student => ({
                    name: student.name,
                    examNo: student.examNo,
                    subjects: [
                        { name: 'English Studies', exam: student.englishStudies },
                        { name: 'Mathematics', exam: student.mathematics },
                        { name: 'Basic Science', exam: student.basicScience },
                        { name: 'Christian Religious Studies', exam: student.christianReligiousStudies },
                        { name: 'National Values', exam: student.nationalValues },
                        { name: 'Cultural and Creative Arts', exam: student.culturalAndCreativeArts },
                        { name: 'Business Studies', exam: student.businessStudies },
                        { name: 'Igbo Language', exam: student.igbo },
                        { name: 'Pre-Vocational Studies', exam: student.preVocationalStudies }
                    ].filter(subject => subject.exam > 0)
                }))
            }));

            await uploadBeceExamResults({ result: results as BeceResultUpload[], file: filesWithStudentsCount }).unwrap()

            const endTime = performance.now()
            const elapsedTime = ((endTime - startTime) / 1000).toFixed(2)

            toast.dismiss()

            // Clear data and show success message
            onDataChange([])
            setFailedSchools([])
            toast.success(
                `Successfully saved ${data.length} score records to database in ${elapsedTime}s`
            )

            router.push('/bece-portal/dashboard/schools')

        } catch (error) {
            const endTime = performance.now()
            const elapsedTime = ((endTime - startTime) / 1000).toFixed(2)

            console.error('Error saving score data:', error);

            toast.dismiss()
            toast.error(`Failed to save score data to database (${elapsedTime}s)`);
            toast.error('Please check your connection and try again.')
        } finally {
            setIsSaving(false)
        }
    }

    return (
        <React.Fragment>
            <div className={`bg-white border border-gray-200 rounded-lg overflow-hidden ${className}`}>
                {/* Header */}
                <div className="px-6 py-4 border-b border-gray-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="text-lg font-medium text-gray-900">Exam Data</h3>
                            <p className="text-sm text-gray-500">
                                {data.length} total records, {filteredData.length} showing
                            </p>
                        </div>
                        <div className="flex items-center space-x-3">
                            <button
                                onClick={handleSaveToDb}
                                disabled={isSaving}
                                title={isSaving ? 'Saving to Database...' : 'Save to Database'}
                                className={`inline-flex items-center transition-all duration-200 px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white focus:outline-none focus:ring-2 focus:ring-offset-2 ${isSaving
                                    ? 'bg-gray-400 cursor-not-allowed'
                                    : 'bg-green-600 hover:bg-green-700 focus:ring-green-500 cursor-pointer active:scale-90 active:rotate-1'
                                    }`}
                            >
                                {isSaving ? (
                                    <>
                                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Saving...
                                    </>
                                ) : (
                                    <IoCloudUpload className="w-4 h-4" />
                                )}
                            </button>
                            <button
                                onClick={handleClearData}
                                disabled={isSaving}
                                title='Clear Exams Data'
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
                    {/* Search and Filters */}
                    <div className="mt-4 flex items-center space-x-4">
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
                                    { key: 'serialNo', label: 'S/NO' },
                                    { key: 'name', label: 'Name' },
                                    { key: 'examNo', label: 'Exam No.' },
                                    { key: 'schoolName', label: 'School' }
                                ].map(({ key, label }) => (
                                    <th
                                        key={key}
                                        onClick={() => handleSort(key as keyof StudentRecord)}
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
                            {paginatedData.map((record, index) => (
                                <tr key={`${record.examNo}-${index}`} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <input
                                            type="checkbox"
                                            checked={selectedRows.has(index)}
                                            onChange={(e) => handleSelectRow(index, e.target.checked)}
                                            disabled={isSaving}
                                            className={`rounded text-green-600 focus:ring-green-500 ${isSaving ? 'border-gray-200 bg-gray-50 cursor-not-allowed' : 'border-gray-300'
                                                }`}
                                        />
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        {record.serialNo}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                        {record.name}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        {record.examNo}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        <div className="max-w-32 truncate" title={record.schoolName}>
                                            {record.schoolName}
                                        </div>
                                    </td>
                                    <td className=" py-4 whitespace-nowrap text-sm text-gray-500">
                                        <button
                                            onClick={() => handleViewExam(record)}
                                            disabled={isSaving}
                                            className={`px-6 flex items-center justify-center w-full ${isSaving ? 'cursor-not-allowed' : 'cursor-pointer'
                                                }`}
                                            title={isSaving ? 'Saving in progress...' : 'View CA Details'}
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
                            ))}
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

                {/* Loading Overlay */}
                {isSaving && (
                    <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-50">
                        <div className="bg-white p-6 rounded-lg shadow-lg border border-gray-200 flex items-center space-x-4">
                            <svg className="animate-spin h-8 w-8 text-green-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            <div>
                                <p className="text-lg font-medium text-gray-900">Saving to Database</p>
                                <p className="text-sm text-gray-500">Please wait while we save your CA data...</p>
                            </div>
                        </div>
                    </div>
                )}

            </div>
        </React.Fragment>
    )
}
