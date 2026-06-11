'use client'

import React from 'react'
import StudentResultsRow from './StudentResultsRow'
import Pagination from '@/app/portal/dashboard/components/Pagination'
import LoadingState from './LoadingState'
import EmptyState from './EmptyState'
import BulkResultsToolbar from './BulkResultsToolbar'
import type { BulkStatusFilter, BulkStudent } from './types'
import type { BulkExamConfig } from './examConfig'

interface StudentResultsTableProps {
    config: BulkExamConfig
    students: BulkStudent[]
    selectedIds: Set<string>
    onToggleOne: (id: string, event: React.MouseEvent) => void
    isLoading: boolean
    currentPage: number
    totalPages: number
    /** Total cohort size, ignoring search + status filters. */
    totalItems: number
    /** Cohort size after the status filter (pre-search). */
    statusFilteredCount: number
    /** Cohort size after both status filter + search (== `students.length + offPage`). */
    matchingCount: number
    itemsPerPage: number
    onPageChange: (page: number) => void
    onItemsPerPageChange: (n: number) => void
    /** True while a bulk payment / download is in progress. */
    disabled?: boolean
    /** Triggered when EmptyState's "Try different filters" CTA is clicked. */
    onChangeFilters: () => void
    /** Toolbar props ───────────────────────────────────────────────── */
    searchQuery: string
    onSearchChange: (value: string) => void
    statusFilter: BulkStatusFilter
    onStatusFilterChange: (value: BulkStatusFilter) => void
    /** EmptyState context — controls the in-place recovery buttons. */
    emptyStateContext?: {
        isSearching: boolean
        searchQuery: string
        statusFilter: BulkStatusFilter
        onClearSearch: () => void
        onShowAllStatuses: () => void
        onSwitchStatus: (status: BulkStatusFilter) => void
    }
}

/**
 * Top-level results table.
 *
 * Layout invariant: the card chrome (border, header, toolbar) is always
 * rendered. Only the *body* of the card swaps between three states:
 *
 *   1. `<LoadingState>` — initial cohort fetch
 *   2. `<EmptyState>`   — current filter/search produced zero matches
 *   3. `<table>`        — happy path, with pagination at the bottom
 *
 * Selection is per-row only — the per-page master checkbox was removed
 * because the server caps the response at the page size, so any "select
 * all" affordance that didn't fetch additional pages would be a lie.
 * The agent accumulates selections across pages via the cross-page
 * `selectedIds` set maintained by the parent.
 */
export default function StudentResultsTable({
    config,
    students,
    selectedIds,
    onToggleOne,
    isLoading,
    currentPage,
    totalPages,
    totalItems,
    statusFilteredCount,
    matchingCount,
    itemsPerPage,
    onPageChange,
    onItemsPerPageChange,
    disabled = false,
    onChangeFilters,
    searchQuery,
    onSearchChange,
    statusFilter,
    onStatusFilterChange,
    emptyStateContext,
}: StudentResultsTableProps) {
    // Cross-page serial numbering — useful when the table spans many pages.
    const startSerial = (currentPage - 1) * itemsPerPage

    // The toolbar is shown once the cohort is loaded, OR while the user is
    // actively typing a search / clicking a chip. We don't want to show it
    // on the very first render before the cohort query has finished.
    const showToolbar =
        !isLoading &&
        (totalItems > 0 || searchQuery !== '' || statusFilter !== 'all')

    const isEmpty = !isLoading && students.length === 0

    return (
        <div className="bg-white rounded-3xl border border-gray-200 overflow-hidden">
            {/* Header */}
            <div className="border-b border-gray-100 px-4 sm:px-6 py-3 flex items-center justify-between gap-3">
                <div className="min-w-0">
                    <h3 className="text-sm font-semibold text-gray-900">
                        Students in this cohort
                    </h3>
                    <p className="text-xs text-gray-500 mt-0.5 truncate">
                        Tick the rows you want to pay for, then use the action bar at the bottom.
                    </p>
                </div>
                <span className="hidden sm:inline-flex text-[11px] text-gray-400 tabular-nums">
                    {selectedIds.size} selected
                </span>
            </div>

            {/* Toolbar (search + status filter chips). */}
            {showToolbar && (
                <BulkResultsToolbar
                    searchQuery={searchQuery}
                    onSearchChange={onSearchChange}
                    statusFilter={statusFilter}
                    onStatusFilterChange={onStatusFilterChange}
                    totalCount={totalItems}
                    filteredCount={statusFilteredCount}
                    matchingCount={matchingCount}
                    disabled={disabled}
                />
            )}

            {/* Body */}
            {isLoading ? (
                <LoadingState rows={itemsPerPage} />
            ) : isEmpty ? (
                <EmptyState
                    onChangeFilters={onChangeFilters}
                    context={
                        emptyStateContext
                            ? {
                                totalCohort: totalItems,
                                statusFilteredCount,
                                ...emptyStateContext,
                            }
                            : undefined
                    }
                />
            ) : (
                <>
                    {/* Table */}
                    <div className="overflow-x-auto">
                        <table className="min-w-full">
                            {/* ── Desktop column headers ─────────────────────── */}
                            <thead className="hidden md:table-header-group bg-gray-50 border-b border-gray-100">
                                <tr>
                                    <th className="px-4 py-3 text-left w-10">
                                        <span
                                            className="inline-block w-4 h-4"
                                            aria-hidden
                                        />
                                    </th>
                                    <th className="px-4 py-3 text-left text-[11px] font-semibold text-gray-500 uppercase tracking-wide w-12">#</th>
                                    <th className="px-4 py-3 text-left text-[11px] font-semibold text-gray-500 uppercase tracking-wide">Student</th>
                                    <th className="px-4 py-3 text-left text-[11px] font-semibold text-gray-500 uppercase tracking-wide">Status</th>
                                </tr>
                            </thead>

                            {/* ── Mobile header spacer ─────────────────────── */}
                            <thead className="md:hidden">
                                <tr>
                                        <th colSpan={4} className="px-3 py-2 bg-gray-50 border-b border-gray-100 text-[11px] text-gray-500">
                                            Tick rows to select · {selectedIds.size} selected
                                        </th>
                                    </tr>
                                </thead>

                                <tbody className="md:divide-y md:divide-gray-100">
                                    {students.map((student, index) => (
                                        <StudentResultsRow
                                            key={student._id}
                                            student={student}
                                            serial={startSerial + index + 1}
                                            checked={selectedIds.has(student._id)}
                                            onToggle={onToggleOne}
                                            config={config}
                                            disabled={disabled}
                                        />
                                    ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    <div className="px-4 sm:px-6 pt-2 pb-4 border-t border-gray-100">
                        <Pagination
                            currentPage={currentPage}
                            totalPages={totalPages}
                            itemsPerPage={itemsPerPage}
                            totalItems={totalItems}
                            onPageChange={onPageChange}
                            onItemsPerPageChange={onItemsPerPageChange}
                        />
                    </div>
                </>
            )}
        </div>
    )
}
