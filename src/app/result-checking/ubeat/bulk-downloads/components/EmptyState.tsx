'use client'

import React from 'react'
import { IoFilterOutline, IoSearchCircleOutline } from 'react-icons/io5'
import type { BulkStatusFilter } from './types'

interface EmptyStateProps {
    /** Triggered by the "Try different filters" CTA — used when the *whole* cohort is empty. */
    onChangeFilters: () => void

    /**
     * Optional context that unlocks in-place recovery actions. If provided,
     * `EmptyState` treats the user as "filtered into a dead-end" (the cohort
     * has data, the user's filter just doesn't match any of it) and offers
     * buttons to clear the search / switch status / show all without ever
     * leaving the results screen.
     */
    context?: {
        /** Cohort size before any user-applied filter / search. */
        totalCohort: number
        /** Cohort size after the status filter (but before the search). */
        statusFilteredCount: number
        /** True if a search query is currently typed in the toolbar. */
        isSearching: boolean
        /** Current search query (used in the heading). */
        searchQuery: string
        /** Current status filter (used to compute the "switch to other" CTA). */
        statusFilter: BulkStatusFilter
        /** Clear the in-table search input. */
        onClearSearch: () => void
        /** Set the status filter back to 'all'. */
        onShowAllStatuses: () => void
        /** Switch to a specific status filter (e.g. the "other" one). */
        onSwitchStatus: (status: BulkStatusFilter) => void
    }
}

const OTHER_STATUS: Record<Exclude<BulkStatusFilter, 'all'>, BulkStatusFilter> = {
    unpaid: 'paid',
    paid: 'unpaid',
}

const STATUS_LABEL: Record<BulkStatusFilter, string> = {
    all: 'All',
    unpaid: 'Unpaid',
    paid: 'Paid',
}

/**
 * Shown when a search has been run but the (filtered) cohort is empty.
 *
 * Two distinct presentations:
 *
 *   1. **No cohort at all** (`context` absent or `totalCohort === 0`) —
 *      render a full-card message and a single CTA that takes the user
 *      back to the search form.
 *
 *   2. **Filtered into a dead-end** (`context` present and
 *      `totalCohort > 0`) — render an in-card message and up to three
 *      one-click recovery buttons (Show all / Clear search / Switch
 *      status) so the user can recover without leaving the page.
 */
export default function EmptyState({
    onChangeFilters,
    context,
}: EmptyStateProps) {
    const isFilterDeadEnd = !!context && context.totalCohort > 0

    if (!isFilterDeadEnd) {
        return (
            <div className="bg-white rounded-3xl border border-gray-200 px-6 py-12 text-center">
                <div className="w-16 h-16 mx-auto mb-5 rounded-2xl bg-amber-50 border border-amber-100 flex items-center justify-center">
                    <IoSearchCircleOutline className="w-8 h-8 text-amber-500" />
                </div>
                <h3 className="text-base font-semibold text-gray-900 mb-2">
                    No students found for that combination
                </h3>
                <p className="text-sm text-gray-600 max-w-md mx-auto mb-6">
                    This school may not have any approved results for the selected year, or the cohort hasn't been uploaded yet. Try adjusting your filters.
                </p>
                <button
                    type="button"
                    onClick={onChangeFilters}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-green-700 bg-green-50 hover:bg-green-100 border border-green-100 transition-colors cursor-pointer"
                >
                    Try different filters
                </button>
            </div>
        )
    }

    // ── Filtered-into-a-dead-end case ────────────────────────────────────
    const {
        totalCohort,
        isSearching,
        searchQuery,
        statusFilter,
        onClearSearch,
        onShowAllStatuses,
        onSwitchStatus,
    } = context!

    const isFilteringByStatus = statusFilter !== 'all'
    const otherStatus = isFilteringByStatus ? OTHER_STATUS[statusFilter] : null
    // Every student is either paid or unpaid (see bulkApiAdapter), so the
    // "other" count is just the complement of the current filtered count.
    const otherStatusCount = isFilteringByStatus
        ? totalCohort - context!.statusFilteredCount
        : 0

    const heading = (() => {
        if (isSearching && isFilteringByStatus) {
            return `No ${STATUS_LABEL[statusFilter].toLowerCase()} students match "${searchQuery.trim()}"`
        }
        if (isSearching) {
            return `No students match "${searchQuery.trim()}"`
        }
        if (isFilteringByStatus) {
            return `No ${STATUS_LABEL[statusFilter].toLowerCase()} students in this cohort`
        }
        return 'No students to show'
    })()

    return (
        <div className="px-6 py-12 text-center">
            <div className="w-16 h-16 mx-auto mb-5 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center">
                <IoFilterOutline className="w-8 h-8 text-blue-500" />
            </div>
            <h3 className="text-base font-semibold text-gray-900 mb-2">
                {heading}
            </h3>
            <p className="text-sm text-gray-600 max-w-md mx-auto mb-6">
                The cohort has <span className="font-semibold text-gray-900">{totalCohort}</span> student{totalCohort === 1 ? '' : 's'} total. Try one of the options below to widen the view.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-2">
                <button
                    type="button"
                    onClick={onShowAllStatuses}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-green-600 hover:bg-green-700 border border-green-600 transition-colors cursor-pointer"
                >
                    Show all {totalCohort} student{totalCohort === 1 ? '' : 's'}
                </button>
                {isSearching && (
                    <button
                        type="button"
                        onClick={onClearSearch}
                        className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 border border-gray-200 transition-colors cursor-pointer"
                    >
                        Clear search
                    </button>
                )}
                {otherStatus && otherStatusCount > 0 && (
                    <button
                        type="button"
                        onClick={() => onSwitchStatus(otherStatus)}
                        title={`Show the ${otherStatusCount} ${STATUS_LABEL[otherStatus].toLowerCase()} student${otherStatusCount === 1 ? '' : 's'} instead`}
                        className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 border border-gray-200 transition-colors cursor-pointer"
                    >
                        View {otherStatusCount} {STATUS_LABEL[otherStatus].toLowerCase()}
                    </button>
                )}
            </div>
        </div>
    )
}
