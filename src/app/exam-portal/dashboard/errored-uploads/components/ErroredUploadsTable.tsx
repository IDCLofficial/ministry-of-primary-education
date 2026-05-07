'use client'
import { IoDownloadOutline, IoCalendarOutline, IoLocationOutline, IoSchoolOutline } from 'react-icons/io5'
import { SkippedResult } from '../../../store/api/authApi'
import Pagination from '../../schools/components/Pagination'

interface ErroredUploadsTableProps {
    results: SkippedResult[]
    isLoading?: boolean
    pagination?: {
        currentPage: number
        totalPages: number
        onPageChange: (page: number) => void
        itemsPerPage: number
        totalItems: number
    }
    appliedFilters?: {
        uploadBatch: string | null
        lga: string | null
        schoolName: string | null
        status: string | null
    }
}

export function ErroredUploadsTable({ results, isLoading = false, pagination, appliedFilters }: ErroredUploadsTableProps) {
    
    // Convert results to CSV and download
    const handleDownloadCSV = () => {
        if (results.length === 0) return

        // CSV Headers
        const headers = [
            'Student Name',
            'Exam Number',
            'School Name',
            'LGA',
            'Exam Year',
            'Upload Batch',
            'Status',
            'Reason',
            'Uploaded At'
        ]

        // CSV Rows
        const rows = results.map(result => [
            result.studentName,
            result.examNumber,
            result.schoolName,
            result.lga,
            result.examYear.toString(),
            result.uploadBatch,
            result.status,
            result.reason,
            new Date(result.uploadedAt).toLocaleString()
        ])

        // Combine headers and rows
        const csvContent = [
            headers.join(','),
            ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
        ].join('\n')

        // Create blob and download
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
        const link = document.createElement('a')
        const url = URL.createObjectURL(blob)
        
        // Generate filename with filters and timestamp
        const filterParts = []
        if (appliedFilters?.uploadBatch) filterParts.push(`batch-${appliedFilters.uploadBatch}`)
        if (appliedFilters?.lga) filterParts.push(`lga-${appliedFilters.lga}`)
        if (appliedFilters?.schoolName) filterParts.push(`school-${appliedFilters.schoolName}`)
        if (appliedFilters?.status) filterParts.push(`status-${appliedFilters.status}`)
        
        const filterString = filterParts.length > 0 ? `_${filterParts.join('_')}` : ''
        const timestamp = new Date().toISOString().split('T')[0]
        const filename = `errored-uploads${filterString}_${timestamp}.csv`
        
        link.setAttribute('href', url)
        link.setAttribute('download', filename)
        link.style.visibility = 'hidden'
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
    }

    if (results.length === 0) {
        return (
            <div className="text-center py-12 bg-white rounded-xl border border-gray-100">
                <IoSchoolOutline className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No errored uploads found</h3>
                <p className="text-gray-500">No upload errors match your current filters</p>
            </div>
        )
    }

    return (
        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden relative">
            {isLoading && (
                <div className="absolute inset-0 bg-white/75 backdrop-blur-sm z-10 flex items-center justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
                </div>
            )}

            {/* Download Button */}
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
                <p className="text-sm text-gray-600">
                    Showing {results.length} {results.length === 1 ? 'result' : 'results'}
                </p>
                <button
                    onClick={handleDownloadCSV}
                    disabled={isLoading}
                    className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <IoDownloadOutline className="w-5 h-5" />
                    Download CSV
                </button>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-100">
                        <tr>
                            <th className="text-left px-6 py-4 text-sm font-medium text-gray-900">Student Info</th>
                            <th className="text-left px-6 py-4 text-sm font-medium text-gray-900">School & Location</th>
                            <th className="text-left px-6 py-4 text-sm font-medium text-gray-900">Upload Details</th>
                            <th className="text-left px-6 py-4 text-sm font-medium text-gray-900">Error Info</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {results.map((result) => (
                            <tr key={result._id} className="hover:bg-gray-50 transition-colors">
                                <td className="px-6 py-4">
                                    <div>
                                        <p className="text-sm font-medium text-gray-900">{result.studentName}</p>
                                        <p className="text-sm text-gray-500">Exam No: {result.examNumber}</p>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex items-start gap-2">
                                        <IoSchoolOutline className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                                        <div>
                                            <p className="text-sm font-medium text-gray-900">{result.schoolName}</p>
                                            <div className="flex items-center gap-1 text-sm text-gray-500">
                                                <IoLocationOutline className="w-3 h-3" />
                                                <span>{result.lga}</span>
                                            </div>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-2 text-sm text-gray-600">
                                            <IoCalendarOutline className="w-4 h-4" />
                                            <span>Year: {result.examYear}</span>
                                        </div>
                                        <p className="text-sm text-gray-500">Batch: {result.uploadBatch}</p>
                                        <p className="text-xs text-gray-400">
                                            {new Date(result.uploadedAt).toLocaleDateString()} at{' '}
                                            {new Date(result.uploadedAt).toLocaleTimeString()}
                                        </p>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <div>
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                            result.status === 'school_not_found' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'
                                        }`}>
                                            {result.status}
                                        </span>
                                        <p className="text-sm text-gray-600 mt-2">{result.reason}</p>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {pagination && pagination.totalPages > 1 && (
                <div className="px-6 py-4 border-t border-gray-100">
                    <Pagination
                        currentPage={pagination.currentPage}
                        totalPages={pagination.totalPages}
                        onPageChange={pagination.onPageChange}
                        itemsPerPage={pagination.itemsPerPage}
                        totalItems={pagination.totalItems}
                        disabled={isLoading}
                        itemLabel="Errored Uploads"
                    />
                </div>
            )}
        </div>
    )
}
