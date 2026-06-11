'use client'

import React from 'react'
import { IoCheckmarkCircle, IoHourglass, IoAlertCircle } from 'react-icons/io5'
import type { BulkPaymentStatus } from './types'

interface PaymentStatusBadgeProps {
    status: BulkPaymentStatus
    /** Compact variant used inside dense tables. */
    size?: 'sm' | 'md'
}

const STATUS_STYLES: Record<BulkPaymentStatus, { icon: React.ReactNode; label: string; className: string }> = {
    paid: {
        icon: <IoCheckmarkCircle className="w-3.5 h-3.5" />,
        label: 'Paid',
        className: 'bg-green-50 text-green-700 border-green-200',
    },
    pending: {
        icon: <IoHourglass className="w-3.5 h-3.5 animate-pulse" />,
        label: 'Pending',
        className: 'bg-amber-50 text-amber-700 border-amber-200',
    },
    unpaid: {
        icon: <IoAlertCircle className="w-3.5 h-3.5" />,
        label: 'Unpaid',
        className: 'bg-gray-50 text-gray-600 border-gray-200',
    },
}

export default function PaymentStatusBadge({ status, size = 'md' }: PaymentStatusBadgeProps) {
    const style = STATUS_STYLES[status]
    return (
        <span
            className={[
                'inline-flex items-center gap-1 rounded-full font-semibold border',
                size === 'sm' ? 'px-1.5 py-0.5 text-[10px]' : 'px-2 py-0.5 text-xs',
                style.className,
            ].join(' ')}
        >
            {style.icon}
            {style.label}
        </span>
    )
}
