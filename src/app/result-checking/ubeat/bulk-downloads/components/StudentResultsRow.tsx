'use client'

import React from 'react'
import PaymentStatusBadge from './PaymentStatusBadge'
import { toTitleCase } from './format'
import type { BulkStudent } from './types'
import type { BulkExamConfig } from './examConfig'

interface StudentResultsRowProps {
    student: BulkStudent
    /** Global index across pages — used for serial numbers. */
    serial: number
    checked: boolean
    onToggle: (id: string, event: React.MouseEvent) => void
    config: BulkExamConfig
    /** Disable inputs while a bulk action is running. */
    disabled?: boolean
}

/**
 * Single row of the bulk students table.
 * Renders both as a desktop table row and a mobile card via responsive
 * Tailwind classes — see `StudentResultsTable` for the desktop wrapper.
 *
 * The backend contract (`POST /{examType}/students/by-school`) only returns
 * `{ _id, name, isPaid }`, so the table is intentionally narrow: serial,
 * student name, and payment status.
 */
export default function StudentResultsRow({
    student,
    serial,
    checked,
    onToggle,
    config,
    disabled = false,
}: StudentResultsRowProps) {
    const isPaid = student.paymentStatus === 'paid'

    const handleToggle = (e: React.MouseEvent) => {
        if (disabled || isPaid) return
        e.stopPropagation()
        onToggle(student._id, e)
    }

    return (
        <>
            {/* ── Desktop row ─────────────────────────────────────────── */}
            <tr
                className={[
                    'hidden md:table-row border-b border-gray-100 transition-colors',
                    isPaid ? 'opacity-50' : checked ? 'bg-green-50/40' : 'hover:bg-gray-50',
                ].join(' ')}
            >
                <td className="px-4 py-3 align-middle">
                    <label className={isPaid ? 'inline-flex items-center' : 'inline-flex items-center cursor-pointer'}>
                        <input
                            type="checkbox"
                            checked={checked}
                            onClick={handleToggle}
                            disabled={disabled || isPaid}
                            className="w-4 h-4 rounded border-gray-300 text-green-600 focus:ring-green-500 disabled:cursor-not-allowed"
                            aria-label={`Select ${student.studentName}`}
                        />
                    </label>
                </td>
                <td className="px-4 py-3 text-sm text-gray-500 align-middle">{serial}</td>
                <td className="px-4 py-3 align-middle">
                    <p className="text-sm font-semibold text-gray-900">
                        {toTitleCase(student.studentName)}
                    </p>
                </td>
                <td className="px-4 py-3 align-middle">
                    <PaymentStatusBadge status={student.paymentStatus} />
                </td>
            </tr>

            {/* ── Mobile card ─────────────────────────────────────────── */}
            <tr className="md:hidden">
                <td colSpan={4} className="px-3 py-2">
                    <div
                        className={[
                            'flex items-start gap-3 p-3 rounded-xl border transition-colors',
                            isPaid ? 'opacity-50 bg-gray-50 border-gray-200' : checked ? 'bg-green-50/60 border-green-200' : 'bg-white border-gray-200',
                        ].join(' ')}
                    >
                        <input
                            type="checkbox"
                            checked={checked}
                            onClick={handleToggle}
                            disabled={disabled || isPaid}
                            className="mt-1 w-4 h-4 rounded border-gray-300 text-green-600 focus:ring-green-500 disabled:cursor-not-allowed flex-shrink-0"
                            aria-label={`Select ${student.studentName}`}
                        />
                        <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2">
                                <p className="text-sm font-semibold text-gray-900 truncate">
                                    {toTitleCase(student.studentName)}
                                </p>
                                <PaymentStatusBadge status={student.paymentStatus} size="sm" />
                            </div>
                            <p className="text-[11px] text-gray-500 mt-0.5">
                                #{serial}
                            </p>
                        </div>
                    </div>
                </td>
            </tr>
        </>
    )
}
