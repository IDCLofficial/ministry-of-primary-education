'use client'

import React from 'react'
import { IoBusinessOutline, IoCalendarOutline, IoLocationOutline, IoPencil } from 'react-icons/io5'
import type { BulkSearchFilters } from './types'

interface SearchFilterSummaryProps {
    filters: BulkSearchFilters
    /** Total students returned by the current filters. */
    totalItems: number
    /** Called when the agent clicks "Change filters". */
    onEdit: () => void
}

/**
 * Compact summary card shown above the results table once a search has been run.
 * Lets the agent see at-a-glance what they're looking at and re-open the form.
 */
export default function SearchFilterSummary({
    filters,
    totalItems,
    onEdit,
}: SearchFilterSummaryProps) {
    return (
        <div className="bg-white rounded-2xl border border-gray-200 px-4 py-3 sm:px-6 sm:py-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm">
                    <Pill icon={<IoCalendarOutline className="w-4 h-4" />} label="Year" value={filters.examYear} />
                    <Pill icon={<IoLocationOutline className="w-4 h-4" />} label="LGA" value={filters.lga} />
                    <Pill icon={<IoBusinessOutline className="w-4 h-4" />} label="School" value={filters.school.name} truncate />
                    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-green-50 text-green-700 text-xs font-semibold border border-green-100">
                        {totalItems.toLocaleString()} student{totalItems === 1 ? '' : 's'}
                    </span>
                </div>

                <button
                    type="button"
                    onClick={onEdit}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-green-700 bg-green-50 hover:bg-green-100 border border-green-100 transition-colors cursor-pointer"
                >
                    <IoPencil className="w-3.5 h-3.5" />
                    Change filters
                </button>
            </div>
        </div>
    )
}

function Pill({
    icon,
    label,
    value,
    truncate = false,
}: {
    icon: React.ReactNode
    label: string
    value: string
    truncate?: boolean
}) {
    return (
        <span className="inline-flex items-center gap-2 min-w-0">
            <span className="flex-shrink-0 text-gray-400">{icon}</span>
            <span className="flex-shrink-0 text-xs uppercase tracking-wide text-gray-500">{label}</span>
            <span className={[
                'text-sm font-semibold text-gray-900 capitalize',
                truncate ? 'truncate max-w-[200px] sm:max-w-[300px]' : '',
            ].join(' ')}>
                {(value || '—').toLowerCase()}
            </span>
        </span>
    )
}
