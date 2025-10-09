'use client'
import React, { useState } from 'react'
import { SearchAndFilters } from './components/SearchAndFilters'
import { ActivityLog } from './components/ActivityLog'
import { ActivityModalProvider, useActivityModal, type AuditLog } from './components/ActivityModalContext'
import { StatusBadge } from './components/StatusBadge'
import { ResourceTypeBadge } from './components/ResourceTypeBadge'

interface FilterState {
    user: string
    action: string
    resourceType: string
    status: string
    dateRange: string
}

function AuditTrailContent() {
    const [searchTerm, setSearchTerm] = useState('')
    const { selectedLog, isOpen, openModal, closeModal } = useActivityModal()
    const [filters, setFilters] = useState<FilterState>({
        user: '',
        action: '',
        resourceType: '',
        status: '',
        dateRange: ''
    })

    // Mock data - replace with actual API call
    const auditLogs: AuditLog[] = [
        {
            id: '1',
            timestamp: '2024-10-07T14:30:00Z',
            user: 'John Doe',
            userRole: 'Administrator',
            action: 'upload',
            resource: 'BECE_Mathematics_2024_Results.xlsx',
            resourceType: 'file',
            details: 'Uploaded BECE Mathematics examination results',
            ipAddress: '192.168.1.100',
            status: 'success',
            metadata: {
                fileSize: '2.4 MB',
                studentsAffected: 245
            }
        },
        {
            id: '2',
            timestamp: '2024-10-07T13:15:00Z',
            user: 'Jane Smith',
            userRole: 'Teacher',
            action: 'view',
            resource: 'Student Dashboard',
            resourceType: 'system',
            details: 'Accessed student performance dashboard',
            ipAddress: '192.168.1.101',
            status: 'success'
        },
        {
            id: '3',
            timestamp: '2024-10-07T12:45:00Z',
            user: 'Mike Johnson',
            userRole: 'Data Entry Clerk',
            action: 'create',
            resource: 'Student Record - Sarah Wilson',
            resourceType: 'student',
            details: 'Created new student record for BECE registration',
            ipAddress: '192.168.1.102',
            status: 'success',
            metadata: {
                studentsAffected: 1
            }
        },
        {
            id: '4',
            timestamp: '2024-10-07T11:20:00Z',
            user: 'David Brown',
            userRole: 'Administrator',
            action: 'delete',
            resource: 'Duplicate_Science_Results.xlsx',
            resourceType: 'file',
            details: 'Deleted duplicate examination file',
            ipAddress: '192.168.1.103',
            status: 'warning',
            metadata: {
                fileSize: '1.8 MB',
                studentsAffected: 156
            }
        },
        {
            id: '5',
            timestamp: '2024-10-07T10:30:00Z',
            user: 'Sarah Wilson',
            userRole: 'Teacher',
            action: 'download',
            resource: 'English_Language_Certificates.pdf',
            resourceType: 'certificate',
            details: 'Downloaded generated certificates for distribution',
            ipAddress: '192.168.1.104',
            status: 'success',
            metadata: {
                studentsAffected: 189
            }
        },
        {
            id: '6',
            timestamp: '2024-10-07T09:15:00Z',
            user: 'Unknown User',
            userRole: 'Guest',
            action: 'login',
            resource: 'Authentication System',
            resourceType: 'system',
            details: 'Failed login attempt with invalid credentials',
            ipAddress: '203.45.67.89',
            status: 'failed'
        }
    ]

    const filteredLogs = auditLogs.filter(log => {
        const matchesSearch = log.user.toLowerCase().includes(searchTerm.toLowerCase()) ||
            log.resource.toLowerCase().includes(searchTerm.toLowerCase()) ||
            log.details.toLowerCase().includes(searchTerm.toLowerCase())

        const matchesUser = !filters.user || log.user === filters.user
        const matchesAction = !filters.action || log.action === filters.action
        const matchesResourceType = !filters.resourceType || log.resourceType === filters.resourceType
        const matchesStatus = !filters.status || log.status === filters.status

        return matchesSearch && matchesUser && matchesAction && matchesResourceType && matchesStatus
    })

    const formatTimestamp = (timestamp: string) => {
        const date = new Date(timestamp)
        return {
            date: date.toLocaleDateString(),
            time: date.toLocaleTimeString()
        }
    }

    return (
        <>
            <div className="p-5 bg-white/50 backdrop-blur-[2px] border border-black/10 m-1 mb-0 space-y-4 flex-1 overflow-auto">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h2 className='text-2xl font-medium'>Audit Trail</h2>
                        <p className='text-gray-400 text-sm'>Track all system activities and user actions</p>
                    </div>
                    <div className="text-sm text-gray-500">
                        Total: {filteredLogs.length} activities
                    </div>
                </div>

                <SearchAndFilters
                    searchTerm={searchTerm}
                    setSearchTerm={setSearchTerm}
                    filters={filters}
                    setFilters={setFilters}
                />

                <ActivityLog
                    logs={filteredLogs}
                    onLogClick={openModal}
                />
            </div>

            {/* Activity Details Modal */}
            {isOpen && selectedLog && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-xl max-w-2xl w-full max-h-[80vh] overflow-y-auto">
                        <div className="p-6 border-b border-gray-100">
                            <div className="flex items-center justify-between">
                                <h2 className="text-xl font-semibold text-gray-900">Activity Details</h2>
                                <button
                                    onClick={closeModal}
                                    className="text-gray-400 hover:text-gray-600 cursor-pointer active:scale-75 active:rotate-6 transition-all duration-150"
                                >
                                    ×
                                </button>
                            </div>
                        </div>

                        <div className="p-6 space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-sm font-medium text-gray-500">User</label>
                                    <p className="text-sm text-gray-900">{selectedLog.user}</p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-500">Role</label>
                                    <p className="text-sm text-gray-900">{selectedLog.userRole}</p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-500">Action</label>
                                    <p className="text-sm text-gray-900 capitalize">{selectedLog.action}</p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-500">Status</label>
                                    <span className={StatusBadge({ status: selectedLog.status })}>
                                        {selectedLog.status}
                                    </span>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-500">Resource Type</label>
                                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${ResourceTypeBadge({ type: selectedLog.resourceType })}`}>
                                        {selectedLog.resourceType}
                                    </span>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-500">IP Address</label>
                                    <p className="text-sm text-gray-900">{selectedLog.ipAddress}</p>
                                </div>
                            </div>

                            <div>
                                <label className="text-sm font-medium text-gray-500">Resource</label>
                                <p className="text-sm text-gray-900">{selectedLog.resource}</p>
                            </div>

                            <div>
                                <label className="text-sm font-medium text-gray-500">Details</label>
                                <p className="text-sm text-gray-900">{selectedLog.details}</p>
                            </div>

                            <div>
                                <label className="text-sm font-medium text-gray-500">Timestamp</label>
                                <p className="text-sm text-gray-900">
                                    {formatTimestamp(selectedLog.timestamp).date} at {formatTimestamp(selectedLog.timestamp).time}
                                </p>
                            </div>

                            {selectedLog.metadata && (
                                <div>
                                    <label className="text-sm font-medium text-gray-500">Additional Information</label>
                                    <div className="mt-2 space-y-1">
                                        {selectedLog.metadata.fileSize && (
                                            <p className="text-sm text-gray-900">File Size: {selectedLog.metadata.fileSize}</p>
                                        )}
                                        {selectedLog.metadata.studentsAffected && (
                                            <p className="text-sm text-gray-900">Students Affected: {selectedLog.metadata.studentsAffected}</p>
                                        )}
                                        {selectedLog.metadata.previousValue && (
                                            <p className="text-sm text-gray-900">Previous Value: {selectedLog.metadata.previousValue}</p>
                                        )}
                                        {selectedLog.metadata.newValue && (
                                            <p className="text-sm text-gray-900">New Value: {selectedLog.metadata.newValue}</p>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </>
    )
}

export default function AuditTrailPage() {
    return (
        <ActivityModalProvider>
            <AuditTrailContent />
        </ActivityModalProvider>
    )
}
