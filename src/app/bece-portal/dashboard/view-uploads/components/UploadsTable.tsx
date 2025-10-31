'use client'
import { IoDocumentTextOutline, IoCalendarOutline, IoPersonOutline } from 'react-icons/io5'

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

interface UploadsTableProps {
    uploads: Upload[]
}

export function UploadsTable({ uploads }: UploadsTableProps) {
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
        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
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
                            <tr key={upload.id} className="hover:bg-gray-50 transition-colors">
                                <td className="px-6 py-4">
                                    <div className="flex items-start gap-3">
                                        <div className="flex-shrink-0 w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                                            <IoDocumentTextOutline className="w-5 h-5 text-blue-600" />
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <p className="text-sm font-medium text-gray-900 truncate">
                                                {upload.fileName}
                                            </p>
                                            <p className="text-sm text-gray-500">
                                                {upload.fileSize} • {upload.studentsCount} students
                                            </p>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <div>
                                        <p className="text-sm font-medium text-gray-900">{upload.subject}</p>
                                        <p className="text-sm text-gray-500">{upload.examType}</p>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-2 text-sm text-gray-600">
                                        <IoCalendarOutline className="w-4 h-4" />
                                        <span>{new Date(upload.uploadDate).toLocaleDateString()}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm text-gray-600 mt-1">
                                        <IoPersonOutline className="w-4 h-4" />
                                        <span>{upload.uploadedBy}</span>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    )
}
