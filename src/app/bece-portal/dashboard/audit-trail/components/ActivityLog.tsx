'use client'
import { IoCalendarOutline, IoPersonOutline, IoTimeOutline } from 'react-icons/io5'
import { ActionIcon } from './ActionIcon'
import { StatusBadge } from './StatusBadge'
import { ResourceTypeBadge } from './ResourceTypeBadge'

interface AuditLog {
    id: string
    timestamp: string
    user: string
    userRole: string
    action: 'upload' | 'download' | 'delete' | 'view' | 'create' | 'update' | 'login' | 'logout'
    resource: string
    resourceType: 'file' | 'student' | 'certificate' | 'account' | 'system'
    details: string
    ipAddress: string
    status: 'success' | 'failed' | 'warning'
    metadata?: {
        fileSize?: string
        studentsAffected?: number
        previousValue?: string
        newValue?: string
    }
}

interface ActivityLogProps {
    logs: AuditLog[]
    onLogClick?: (log: AuditLog) => void
}

export function ActivityLog({ logs, onLogClick }: ActivityLogProps) {
    if (logs.length === 0) {
        return (
            <div className="text-center py-12">
                <IoTimeOutline className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No activities found</h3>
                <p className="text-gray-500">No activities have been logged yet</p>
            </div>
        )
    }

    const formatTimestamp = (timestamp: string) => {
        const date = new Date(timestamp)
        return {
            date: date.toLocaleDateString(),
            time: date.toLocaleTimeString()
        }
    }

    return (
        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
            <div className="space-y-0">
                {logs.map((log, index) => {
                    const { date, time } = formatTimestamp(log.timestamp)
                    return (
                        <div
                            key={log.id}
                            className={`p-6 hover:bg-gray-50 transition-colors cursor-pointer ${index !== logs.length - 1 ? 'border-b border-gray-100' : ''
                                }`}
                            onClick={() => onLogClick?.(log)}
                        >
                            <div className="flex items-start gap-4">
                                {/* Action Icon */}
                                <div className="flex-shrink-0 w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                                    <ActionIcon action={log.action} />
                                </div>

                                {/* Main Content */}
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-3 mb-2">
                                                <h3 className="text-sm font-medium text-gray-900">
                                                    {log.user} • {log.action}
                                                </h3>
                                                <span className={`px-2 py-1 text-xs font-medium rounded-full ${ResourceTypeBadge({ type: log.resourceType })}`}>
                                                    {log.resourceType}
                                                </span>
                                                <span className={StatusBadge({ status: log.status })}>
                                                    {log.status}
                                                </span>
                                            </div>

                                            <p className="text-sm text-gray-600 mb-2">
                                                {log.details}
                                            </p>

                                            <p className="text-sm font-medium text-gray-700 mb-3">
                                                Resource: {log.resource}
                                            </p>

                                            <div className="flex items-center gap-6 text-xs text-gray-500">
                                                <div className="flex items-center gap-1">
                                                    <IoCalendarOutline className="w-4 h-4" />
                                                    <span>{date} at {time}</span>
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    <IoPersonOutline className="w-4 h-4" />
                                                    <span>{log.userRole}</span>
                                                </div>
                                                <span>IP: {log.ipAddress}</span>
                                                {log.metadata?.studentsAffected && (
                                                    <span>{log.metadata.studentsAffected} students affected</span>
                                                )}
                                                {log.metadata?.fileSize && (
                                                    <span>Size: {log.metadata.fileSize}</span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )
                })}
            </div>
        </div>
    )
}
