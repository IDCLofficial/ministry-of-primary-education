'use client'

import React from 'react'

interface LoadingStateProps {
    /** Number of skeleton rows to render — keep close to itemsPerPage. */
    rows?: number
}

/**
 * Skeleton loader styled to match the dimensions of the loaded table,
 * so the layout doesn't jump once data arrives.
 */
export default function LoadingState({ rows = 8 }: LoadingStateProps) {
    return (
        <div className="bg-white rounded-3xl border border-gray-200 overflow-hidden">
            <div className="border-b border-gray-100 px-6 py-4">
                <div className="h-4 w-48 bg-gray-200 rounded animate-pulse mb-2" />
                <div className="h-3 w-72 bg-gray-100 rounded animate-pulse" />
            </div>

            <div className="divide-y divide-gray-100">
                {Array.from({ length: rows }).map((_, i) => (
                    <div key={i} className="flex items-center gap-4 px-6 py-4">
                        <div className="w-4 h-4 rounded bg-gray-200 animate-pulse flex-shrink-0" />
                        <div className="w-6 h-3 rounded bg-gray-100 animate-pulse flex-shrink-0" />

                        <div className="flex-1 min-w-0 space-y-2">
                            <div className="h-3 w-1/3 bg-gray-200 rounded animate-pulse" />
                            <div className="h-2.5 w-1/4 bg-gray-100 rounded animate-pulse" />
                        </div>

                        <div className="hidden md:block h-3 w-24 bg-gray-100 rounded animate-pulse" />
                        <div className="hidden md:block h-3 w-12 bg-gray-100 rounded animate-pulse" />
                        <div className="h-5 w-16 rounded-full bg-gray-100 animate-pulse" />
                        <div className="hidden sm:block h-6 w-20 rounded-md bg-gray-100 animate-pulse" />
                    </div>
                ))}
            </div>
        </div>
    )
}
