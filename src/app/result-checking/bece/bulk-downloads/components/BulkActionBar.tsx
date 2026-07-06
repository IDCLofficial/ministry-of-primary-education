'use client'

import React, { useState, useRef, useEffect } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { IoCardOutline, IoClose, IoListOutline, IoSparkles } from 'react-icons/io5'
import { formatNaira, type BulkExamConfig } from './examConfig'
import type { BulkSelectionSummary, BulkStudent } from './types'

interface BulkActionBarProps {
    config: BulkExamConfig
    summary: BulkSelectionSummary
    onPay: () => void
    onClearSelection: () => void
    /** True while a bulk payment or download mutation is in flight. */
    isProcessing?: boolean
    /** Optional label shown while processing. */
    processingLabel?: string
    /** Selected students to show in the "see selected" dropdown. */
    selectedStudents?: BulkStudent[]
}

/**
 * Sticky bottom action bar that appears whenever the agent has at least
 * one selection. Lives in a fixed container so it never overlaps content
 * when the table is short.
 */
export default function BulkActionBar({
    config,
    summary,
    onPay,
    onClearSelection,
    isProcessing = false,
    processingLabel = 'Processing…',
    selectedStudents = [],
}: BulkActionBarProps) {
    const { selectedCount, payableCount, downloadableCount, totalAmount } = summary
    const visible = selectedCount > 0
    const [showSelected, setShowSelected] = useState(false)
    const dropdownRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        if (!showSelected) return
        const handleClickOutside = (e: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
                setShowSelected(false)
            }
        }
        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [showSelected])

    return (
        <AnimatePresence>
            {visible && (
                <motion.div
                    initial={{ y: 80, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: 80, opacity: 0 }}
                    transition={{ type: 'spring', stiffness: 320, damping: 28 }}
                    role="region"
                    aria-label="Bulk actions"
                    className="fixed bottom-3 left-1/2 -translate-x-1/2 z-40 w-[calc(100vw-1.5rem)] max-w-5xl"
                >
                    <div className="bg-white border border-gray-200 rounded-2xl shadow-[0_12px_40px_rgba(0,0,0,0.12)] px-3 sm:px-5 py-3">
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">

                            {/* Selection summary */}
                            <div className="flex items-center gap-3 min-w-0">
                                <button
                                    type="button"
                                    onClick={onClearSelection}
                                    disabled={isProcessing}
                                    title="Clear selection"
                                    className="flex-shrink-0 inline-flex items-center justify-center w-8 h-8 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                                >
                                    <IoClose className="w-4 h-4" />
                                </button>

                                <div className="flex items-center gap-2 min-w-0">
                                    <div className="hidden sm:flex w-9 h-9 rounded-xl bg-green-50 text-green-600 items-center justify-center flex-shrink-0">
                                        <IoSparkles className="w-4 h-4" />
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-sm font-semibold text-gray-900 truncate">
                                            {selectedCount} student{selectedCount === 1 ? '' : 's'} selected
                                        </p>
                                        <p className="text-[11px] text-gray-500 truncate">
                                            {payableCount} unpaid · {downloadableCount} ready to download
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Total amount */}

                            {/* See selected students dropdown */}
                            <div ref={dropdownRef} className="relative flex-shrink-0">
                                <button
                                    type="button"
                                    onClick={() => setShowSelected(v => !v)}
                                    disabled={isProcessing}
                                    className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium text-white bg-green-600 hover:bg-green-700 transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                                >
                                    <IoListOutline className="w-4 h-4" />
                                    <span>Click here to See selected Students</span>
                                </button>
                                <AnimatePresence>
                                    {showSelected && (
                                        <motion.div
                                            initial={{ opacity: 0, y: 8 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: 8 }}
                                            transition={{ duration: 0.15 }}
                                            className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 w-72 max-h-80 overflow-y-auto bg-white border border-gray-200 rounded-xl shadow-lg z-50"
                                        >
                                            <div className="sticky top-0 bg-white border-b border-gray-100 px-3 py-2 flex items-center justify-between">
                                                <span className="text-xs font-semibold text-gray-700">
                                                    {selectedCount} selected
                                                </span>
                                                <button
                                                    type="button"
                                                    onClick={() => setShowSelected(false)}
                                                    className="text-gray-400 hover:text-gray-600"
                                                >
                                                    <IoClose className="w-3.5 h-3.5" />
                                                </button>
                                            </div>
                                            <ul className="divide-y divide-gray-50">
                                                {selectedStudents.length === 0 ? (
                                                    <li className="px-3 py-4 text-center text-xs text-gray-400">
                                                        No students selected
                                                    </li>
                                                ) : (
                                                    selectedStudents.map((s, i) => (
                                                        <li key={s._id} className="px-3 py-2 flex items-center justify-between gap-2">
                                                            <span className="text-xs text-gray-700 truncate">
                                                                {i + 1}. {s.studentName}
                                                            </span>
                                                            <span className="text-[11px] text-gray-400 tabular-nums flex-shrink-0">
                                                                {s.examYear ?? '—'}
                                                            </span>
                                                        </li>
                                                    ))
                                                )}
                                            </ul>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>

                            <div className="hidden md:flex items-center gap-2 flex-shrink-0 px-3 py-1.5 rounded-lg bg-gray-50 border border-gray-200">
                                <span className="text-[11px] uppercase tracking-wide text-gray-500">Total due</span>
                                <span className="text-sm font-bold text-gray-900 tabular-nums">
                                    {formatNaira(totalAmount)}
                                </span>
                            </div>

                            {/* Actions */}
                            <div className="flex items-center gap-2 flex-shrink-0">
                                <button
                                    type="button"
                                    onClick={onPay}
                                    disabled={isProcessing || payableCount < 10}
                                    className={[
                                        'flex-1 md:flex-none inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all',
                                        'text-white bg-green-600 hover:bg-green-700 cursor-pointer',
                                        'disabled:opacity-50 disabled:cursor-not-allowed',
                                        !isProcessing && payableCount >= 10
                                            ? 'shadow-[0_4px_rgba(0,0,0,0.12)] active:shadow-[0_0px_rgba(0,0,0,1)] active:translate-y-1'
                                            : '',
                                    ].join(' ')}
                                >
                                    {isProcessing ? (
                                        <>
                                            <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                                            <span className="hidden sm:inline">{processingLabel}</span>
                                        </>
                                    ) : payableCount > 0 && payableCount < 10 ? (
                                        <>
                                            <IoCardOutline className="w-4 h-4" />
                                            <span>Select {10 - payableCount} more</span>
                                        </>
                                    ) : (
                                        <>
                                            <IoCardOutline className="w-4 h-4" />
                                            <span className="hidden sm:inline">
                                                Pay for {payableCount || ''} · {formatNaira(totalAmount)}
                                            </span>
                                            <span className="sm:hidden">Pay {formatNaira(totalAmount)}</span>
                                        </>
                                    )}
                                </button>


                            </div>
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    )
}
