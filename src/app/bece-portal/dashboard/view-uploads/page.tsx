'use client'
import React, { useState } from 'react'
import { SearchAndFilters } from './components/SearchAndFilters'
import { UploadsTable } from './components/UploadsTable'

interface Upload {
    id: string
    fileName: string
    subject: string
    examType: 'BECE' | 'CA' | 'Mock'
    uploadDate: string
    uploadedBy: string
    fileSize: string
    status: 'processed' | 'pending' | 'error'
    studentsCount: number
}

interface FilterState {
    subject: string
    examType: string
    status: string
    dateRange: string
}

export default function ViewUploadsPage() {
    const [searchTerm, setSearchTerm] = useState('')
    const [filters, setFilters] = useState<FilterState>({
        subject: '',
        examType: '',
        status: '',
        dateRange: ''
    })

    // Mock data - replace with actual API call
    const uploads: Upload[] = [
        {
            id: '1',
            fileName: 'BECE_Mathematics_2024_Results.xlsx',
            subject: 'Mathematics',
            examType: 'BECE',
            uploadDate: '2024-10-07',
            uploadedBy: 'John Doe',
            fileSize: '2.4 MB',
            status: 'processed',
            studentsCount: 245
        },
        {
            id: '2',
            fileName: 'English_Language_CA_Term1.xlsx',
            subject: 'English Language',
            examType: 'CA',
            uploadDate: '2024-10-06',
            uploadedBy: 'Jane Smith',
            fileSize: '1.8 MB',
            status: 'processed',
            studentsCount: 189
        },
        {
            id: '3',
            fileName: 'Science_BECE_2024_Results.xlsx',
            subject: 'Science',
            examType: 'BECE',
            uploadDate: '2024-10-05',
            uploadedBy: 'Mike Johnson',
            fileSize: '3.1 MB',
            status: 'pending',
            studentsCount: 156
        },
        {
            id: '4',
            fileName: 'Social_Studies_Mock_Exam.xlsx',
            subject: 'Social Studies',
            examType: 'Mock',
            uploadDate: '2024-10-04',
            uploadedBy: 'Sarah Wilson',
            fileSize: '1.5 MB',
            status: 'error',
            studentsCount: 203
        },
        {
            id: '5',
            fileName: 'French_CA_Term2_Results.xlsx',
            subject: 'French',
            examType: 'CA',
            uploadDate: '2024-10-03',
            uploadedBy: 'David Brown',
            fileSize: '0.9 MB',
            status: 'processed',
            studentsCount: 87
        }
    ]

    const filteredUploads = uploads.filter(upload => {
        const matchesSearch = upload.fileName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            upload.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
            upload.uploadedBy.toLowerCase().includes(searchTerm.toLowerCase())

        const matchesSubject = !filters.subject || upload.subject === filters.subject
        const matchesExamType = !filters.examType || upload.examType === filters.examType
        const matchesStatus = !filters.status || upload.status === filters.status

        return matchesSearch && matchesSubject && matchesExamType && matchesStatus
    })

    return (
        <div className="p-5 bg-white/50 backdrop-blur-[2px] border border-black/10 m-1 mb-0 space-y-4 flex-1 overflow-auto">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h2 className='text-2xl font-medium'>View Uploads</h2>
                    <p className='text-gray-400 text-sm'>Manage and review uploaded examination files</p>
                </div>
                <div className="text-sm text-gray-500">
                    Total: {filteredUploads.length} files
                </div>
            </div>

            <SearchAndFilters
                searchTerm={searchTerm}
                setSearchTerm={setSearchTerm}
                filters={filters}
                setFilters={setFilters}
            />

            <UploadsTable uploads={filteredUploads} />
        </div>
    )
}
