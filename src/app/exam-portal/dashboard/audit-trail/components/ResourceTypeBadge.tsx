'use client'

interface ResourceTypeBadgeProps {
    type: 'file' | 'student' | 'certificate' | 'account' | 'system'
}

export function ResourceTypeBadge({ type }: ResourceTypeBadgeProps) {
    switch (type) {
        case 'file':
            return 'bg-green-100 text-green-800'
        case 'student':
            return 'bg-purple-100 text-purple-800'
        case 'certificate':
            return 'bg-green-100 text-green-800'
        case 'account':
            return 'bg-orange-100 text-orange-800'
        case 'system':
            return 'bg-gray-100 text-gray-800'
    }
}
