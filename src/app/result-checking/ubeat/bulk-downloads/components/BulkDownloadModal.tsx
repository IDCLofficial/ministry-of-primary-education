'use client'

import React from 'react'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'
import { IoArchiveOutline, IoCheckmarkCircle, IoCloseCircle } from 'react-icons/io5'
import type { BulkExamConfig } from './examConfig'

export type BulkDownloadStage =
    | 'idle'
    | 'preparing'   // server is assembling the ZIP
    | 'downloading' // browser is streaming the file
    | 'done'
    | 'error'

interface BulkDownloadModalProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    config: BulkExamConfig
    stage: BulkDownloadStage
    /** 0-100, only meaningful when stage === 'preparing' | 'downloading'. */
    progress?: number
    /** Number of certificates expected in the ZIP. */
    certificateCount: number
    /** Optional error message — shown when stage === 'error'. */
    errorMessage?: string
    /** Retry handler for the error state. */
    onRetry?: () => void
}

/**
 * Progress modal for the bulk ZIP download.
 *
 * The progress bar uses a striped animation while preparing (no real %),
 * then snaps to actual progress once the browser starts streaming.
 */
export default function BulkDownloadModal({
    open,
    onOpenChange,
    config,
    stage,
    progress = 0,
    certificateCount,
    errorMessage,
    onRetry,
}: BulkDownloadModalProps) {
    const isBusy = stage === 'preparing' || stage === 'downloading'
    const showProgress = stage === 'downloading'

    return (
        <Dialog open={open} onOpenChange={isBusy ? undefined : onOpenChange}>
            <DialogContent className="sm:max-w-md rounded-2xl p-0 overflow-hidden gap-0">
                <div
                    className={[
                        'h-1.5 w-full',
                        stage === 'error'
                            ? 'bg-gradient-to-r from-red-500 to-red-600'
                            : 'bg-gradient-to-r from-blue-500 to-blue-600',
                    ].join(' ')}
                />

                <div className="p-6">
                    <DialogHeader className="mb-4">
                        <div
                            className={[
                                'flex items-center justify-center w-12 h-12 rounded-full mb-4 mx-auto border',
                                stage === 'error'
                                    ? 'bg-red-50 border-red-100'
                                    : stage === 'done'
                                        ? 'bg-green-50 border-green-100'
                                        : 'bg-blue-50 border-blue-100',
                            ].join(' ')}
                        >
                            {stage === 'error' ? (
                                <IoCloseCircle className="w-6 h-6 text-red-600" />
                            ) : stage === 'done' ? (
                                <IoCheckmarkCircle className="w-6 h-6 text-green-600" />
                            ) : (
                                <IoArchiveOutline className="w-6 h-6 text-blue-600" />
                            )}
                        </div>

                        <DialogTitle className="text-center text-lg font-semibold text-gray-900">
                            {stage === 'error'
                                ? 'Download failed'
                                : stage === 'done'
                                    ? 'Download complete'
                                    : stage === 'preparing'
                                        ? 'Preparing your ZIP…'
                                        : `Downloading ${certificateCount} ${config.certificateLabel}s`}
                        </DialogTitle>

                        <DialogDescription className="text-sm text-gray-500 text-center mt-1 leading-relaxed">
                            {stage === 'error'
                                ? errorMessage ?? 'Something went wrong while building your ZIP file.'
                                : stage === 'done'
                                    ? `Your ZIP file has been saved. Look for ${config.zipFilenamePrefix}_<date>.zip in your downloads folder.`
                                    : stage === 'preparing'
                                        ? `We\u2019re packaging ${certificateCount} certificate${certificateCount === 1 ? '' : 's'}. This takes a few seconds.`
                                        : 'Don\u2019t close this tab — the file is streaming to your device.'}
                        </DialogDescription>
                    </DialogHeader>

                    {/* Progress bar */}
                    {(stage === 'preparing' || stage === 'downloading') && (
                        <div className="mb-4">
                            <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                                {showProgress ? (
                                    <div
                                        className="h-full bg-blue-500 transition-[width] duration-300"
                                        style={{ width: `${Math.max(0, Math.min(100, progress))}%` }}
                                    />
                                ) : (
                                    <div className="h-full w-1/3 bg-blue-500 animate-[pulse_1.4s_ease-in-out_infinite] rounded-full" />
                                )}
                            </div>
                            {showProgress && (
                                <p className="text-[11px] text-gray-500 mt-1.5 text-right tabular-nums">
                                    {Math.round(progress)}%
                                </p>
                            )}
                        </div>
                    )}

                    <DialogFooter className="sm:justify-end gap-2">
                        {stage === 'error' && onRetry && (
                            <button
                                type="button"
                                onClick={onRetry}
                                className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-semibold rounded-lg bg-red-600 hover:bg-red-700 text-white transition-colors cursor-pointer"
                            >
                                Try again
                            </button>
                        )}
                        <button
                            type="button"
                            disabled={isBusy}
                            onClick={() => onOpenChange(false)}
                            className="px-4 py-2.5 text-sm font-medium rounded-lg border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {stage === 'done' ? 'Close' : isBusy ? 'Please wait…' : 'Cancel'}
                        </button>
                    </DialogFooter>
                </div>
            </DialogContent>
        </Dialog>
    )
}
