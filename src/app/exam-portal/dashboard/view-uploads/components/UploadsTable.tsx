'use client'
import { IoDocumentTextOutline, IoCalendarOutline, IoPersonOutline } from 'react-icons/io5'
import { UploadLog } from '../../../store/api/authApi'
import Pagination from '../../schools/components/Pagination'

interface UploadsTableProps {
    uploads: UploadLog[]
    isLoading?: boolean
    pagination?: {
        currentPage: number
        totalPages: number
        onPageChange: (page: number) => void
        itemsPerPage: number
        totalItems: number
    }
}

export function UploadsTable({ uploads, isLoading = false, pagination }: UploadsTableProps) {
    if (uploads.length === 0) {
        return (
            <div className="text-center py-12">
                <IoDocumentTextOutline className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No uploads found</h3>
                <p className="text-gray-500">No files have been uploaded yet</p>
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
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-100">
                        <tr>
                            <th className="text-left px-6 py-4 text-sm font-medium text-gray-900">File Details</th>
                            <th className="text-left px-6 py-4 text-sm font-medium text-gray-900">Subject & Type</th>
                            <th className="text-left px-6 py-4 text-sm font-medium text-gray-900">Upload Info</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {uploads.map((upload) => (
                            <tr key={upload._id} className="hover:bg-gray-50 transition-colors">
                                <td className="px-6 py-4">
                                    <div className="flex items-start gap-3">
                                        <div className="flex-shrink-0 w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                                            <IoDocumentTextOutline className="w-5 h-5 text-green-600" />
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <p className="text-sm font-medium text-gray-900 truncate">
                                                {upload.fileName}
                                            </p>
                                            <p className="text-sm text-gray-500">
                                                {upload.fileSize} • {upload.studentsAffected} students
                                            </p>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <div>
                                        <p className="text-sm font-medium text-gray-900">{upload.subject}</p>
                                        <p className="text-sm text-gray-500">{upload.subjectType}</p>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-2 text-sm text-gray-600">
                                        <IoCalendarOutline className="w-4 h-4" />
                                        <span>{new Date(upload.timestamp).toLocaleDateString()}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm text-gray-600 mt-1">
                                        <IoPersonOutline className="w-4 h-4" />
                                        <span>{upload.editor}</span>
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
                        itemLabel="Uploads"
                    />
                </div>
            )}
        </div>
    )
}
