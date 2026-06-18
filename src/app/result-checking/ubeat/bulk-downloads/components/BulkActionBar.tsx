'use client'

import React from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { IoCardOutline, IoClose, IoSparkles } from 'react-icons/io5'
import { formatNaira, type BulkExamConfig } from './examConfig'
import type { BulkSelectionSummary } from './types'

interface BulkActionBarProps {
    config: BulkExamConfig
    summary: BulkSelectionSummary
    onPay: () => void
    onClearSelection: () => void
    /** True while a bulk payment or download mutation is in flight. */
    isProcessing?: boolean
    /** Optional label shown while processing. */
    processingLabel?: string
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
}: BulkActionBarProps) {
    const { selectedCount, payableCount, downloadableCount, totalAmount } = summary
    const visible = selectedCount > 0

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
                                        !isProcessing && payableCount >= 20
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
                                            <span>Select {20 - payableCount} more</span>
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
