'use client'
import { IoCheckmarkCircleOutline, IoTimeOutline, IoWarningOutline } from 'react-icons/io5'

interface StatusIconProps {
    status: 'processed' | 'pending' | 'error'
}

export function StatusIcon({ status }: StatusIconProps) {
    switch (status) {
        case 'processed':
            return <IoCheckmarkCircleOutline className="w-5 h-5 text-green-600" />
        case 'pending':
            return <IoTimeOutline className="w-5 h-5 text-yellow-600" />
        case 'error':
            return <IoWarningOutline className="w-5 h-5 text-red-600" />
    }
}

interface StatusBadgeProps {
    status: 'processed' | 'pending' | 'error'
}

export function StatusBadge({ status }: StatusBadgeProps) {
    const baseClasses = "px-2 py-1 text-xs font-medium rounded-full"
    switch (status) {
        case 'processed':
            return `${baseClasses} bg-green-100 text-green-800`
        case 'pending':
            return `${baseClasses} bg-yellow-100 text-yellow-800`
        case 'error':
            return `${baseClasses} bg-red-100 text-red-800`
    }
}
