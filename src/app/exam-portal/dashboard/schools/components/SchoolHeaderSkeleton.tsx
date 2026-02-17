import React from 'react'

export default function SchoolHeaderSkeleton() {
    return (
        <div className="bg-white rounded-xl border border-gray-200 p-6 animate-pulse">
            <div className="flex items-start gap-4">
                <div className="w-16 h-16 bg-gray-200 rounded-xl flex-shrink-0"></div>
                <div className="flex-1 space-y-3">
                    <div className="h-8 bg-gray-200 rounded w-3/4"></div>
                    <div className="flex flex-wrap gap-4">
                        <div className="flex items-center gap-2">
                            <div className="w-4 h-4 bg-gray-200 rounded"></div>
                            <div className="h-4 bg-gray-200 rounded w-32"></div>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-4 h-4 bg-gray-200 rounded"></div>
                            <div className="h-4 bg-gray-200 rounded w-24"></div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
