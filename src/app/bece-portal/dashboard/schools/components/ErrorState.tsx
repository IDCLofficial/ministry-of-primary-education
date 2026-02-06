import React from 'react'
import { IoAlertCircleOutline, IoRefresh } from 'react-icons/io5'

interface ErrorStateProps {
    message?: string
    onRetry?: () => void
}

export default function ErrorState({ message = "Something went wrong. Please try again.", onRetry }: ErrorStateProps) {
    return (
        <div className="text-center py-12 px-4">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-red-50 rounded-full mb-4">
                <IoAlertCircleOutline className="w-10 h-10 text-red-500" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Error Loading Data
            </h3>
            <p className="text-gray-500 mb-6 max-w-md mx-auto">
                {message}
            </p>
            {onRetry && (
                <button
                    onClick={onRetry}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                    <IoRefresh className="w-4 h-4" />
                    Try Again
                </button>
            )}
        </div>
    )
}
