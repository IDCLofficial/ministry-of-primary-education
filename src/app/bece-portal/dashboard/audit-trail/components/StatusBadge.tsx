'use client'

interface StatusBadgeProps {
    status: 'success' | 'failed' | 'warning'
}

export function StatusBadge({ status }: StatusBadgeProps) {
    const baseClasses = "px-2 py-1 text-xs font-medium rounded-full"
    switch (status) {
        case 'success':
            return `${baseClasses} bg-green-100 text-green-800`
        case 'failed':
            return `${baseClasses} bg-red-100 text-red-800`
        case 'warning':
            return `${baseClasses} bg-yellow-100 text-yellow-800`
    }
}
