'use client'

import React from 'react'
import { IoClose, IoSearch } from 'react-icons/io5'
import type { BulkStatusFilter } from './types'

interface BulkResultsToolbarProps {
    /** Current search input (free-text matches against `studentName`). */
    searchQuery: string
    onSearchChange: (value: string) => void
    /** Active status filter chip. */
    statusFilter: BulkStatusFilter
    onStatusFilterChange: (value: BulkStatusFilter) => void
    /** Total cohort size across all pages (the "All" chip count). */
    totalCount: number
    /** Cohort size after applying the status filter (the active chip count). */
    filteredCount: number
    /** Cohort size after applying both the status filter and the search. */
    matchingCount: number
    /** Whether the chips are interactive. */
    disabled?: boolean
}

interface ChipDef {
    key: BulkStatusFilter
    label: string
}

const STATUS_CHIPS: readonly ChipDef[] = [
    { key: 'all', label: 'All' },
    { key: 'unpaid', label: 'Unpaid' },
    { key: 'paid', label: 'Paid' },
] as const

/**
 * Toolbar mounted above the bulk results table.
 *
 *   [ search ] [ All 340 | Unpaid 340 | Paid 0 ]
 *
 * The agent selects rows with the per-row checkboxes. There is no
 * "Select all" affordance — the server caps the response at the page
 * size, so any "select all" button that fetched in one call would be
 * a lie. The agent works one page at a time and accumulates selections
 * across pages via the cross-page `selectedIds` set.
 */
export default function BulkResultsToolbar({
    searchQuery,
    onSearchChange,
    statusFilter,
    onStatusFilterChange,
    totalCount,
    filteredCount,
    matchingCount,
    disabled = false,
}: BulkResultsToolbarProps) {
    // Per-chip counts for the badge. "Unpaid" and "Paid" show the filtered
    // count when active (so the chip matches the visible list), and 0
    // otherwise — the actual breakdown is computed by the parent and the
    // exact value is shown in the "X of Y match" caption.
    const chipCount = (key: BulkStatusFilter): number => {
        if (key === 'all') return totalCount
        if (statusFilter === key) return filteredCount
        return 0
    }

    return (
        <div className="px-4 sm:px-6 py-3 border-b border-gray-100 bg-gray-50/60 flex flex-col lg:flex-row lg:items-center gap-3">
            {/* ── Search ──────────────────────────────────────────────── */}
            <div className="relative flex-1 min-w-0 lg:max-w-sm">
                <IoSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => onSearchChange(e.target.value)}
                    placeholder="Search by student name…"
                    aria-label="Search students"
                    className="w-full pl-9 pr-9 py-2 text-sm bg-white border border-gray-200 rounded-lg placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500/40 focus:border-green-500 transition-colors"
                />
                {searchQuery && (
                    <button
                        type="button"
                        onClick={() => onSearchChange('')}
                        aria-label="Clear search"
                        className="absolute right-2 top-1/2 -translate-y-1/2 inline-flex items-center justify-center w-6 h-6 rounded-md text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
                    >
                        <IoClose className="w-3.5 h-3.5" />
                    </button>
                )}
            </div>

            {/* ── Status chips ────────────────────────────────────────── */}
            <div className="inline-flex items-center gap-0.5 bg-white border border-gray-200 rounded-lg p-0.5 self-start lg:self-auto">
                {STATUS_CHIPS.map(chip => {
                    const isActive = statusFilter === chip.key
                    const count = chipCount(chip.key)
                    return (
                        <button
                            key={chip.key}
                            type="button"
                            onClick={() => onStatusFilterChange(chip.key)}
                            disabled={disabled}
                            className={[
                                'inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-all',
                                'disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer',
                                isActive
                                    ? 'bg-green-600 text-white shadow-sm'
                                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50',
                            ].join(' ')}
                        >
                            <span>{chip.label}</span>
                            <span
                                className={[
                                    'inline-flex items-center justify-center min-w-[1.25rem] px-1 h-4 text-[10px] font-semibold rounded-full tabular-nums',
                                    isActive
                                        ? 'bg-white/20 text-white'
                                        : 'bg-gray-100 text-gray-600',
                                ].join(' ')}
                            >
                                {count}
                            </span>
                        </button>
                    )
                })}
            </div>

            {/* ── Spacer + match caption ──────────────────────────────── */}
            <div className="lg:ml-auto flex items-center gap-2">
                {searchQuery || statusFilter !== 'all' ? (
                    <span className="text-[11px] text-gray-500 hidden sm:inline">
                        {matchingCount === 0
                            ? 'No matches'
                            : `${matchingCount} of ${totalCount} match`}
                    </span>
                ) : null}
            </div>
        </div>
    )
}
