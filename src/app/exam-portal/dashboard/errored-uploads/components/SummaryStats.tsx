'use client'
import { IoWarning, IoSchoolOutline, IoLocationOutline, IoCalendarOutline } from 'react-icons/io5'
import { useState } from 'react'

interface SummaryStatsProps {
    totalSkipped: number
    bySchool: {
        schoolName: string
        lga: string
        count: number
        examYears: number[]
    }[]
}

export function SummaryStats({ totalSkipped, bySchool }: SummaryStatsProps) {
    const [showDetails, setShowDetails] = useState(false)
    const topSchools = bySchool.slice(0, 5)

    return (
        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
            {/* Summary Header */}
            <div className="px-6 py-4 bg-gradient-to-r from-red-50 to-orange-50 border-b border-gray-100">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                            <IoWarning className="w-6 h-6 text-red-600" />
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900">Total Errored Uploads</h3>
                            <p className="text-sm text-gray-600">Students affected by upload errors</p>
                        </div>
                    </div>
                    <div className="text-right">
                        <p className="text-3xl font-bold text-red-600">{totalSkipped.toLocaleString()}</p>
                        <p className="text-sm text-gray-500">Records skipped</p>
                    </div>
                </div>
            </div>

            {/* Top Schools by Errors */}
            {bySchool.length > 0 && (
                <div className="px-6 py-4">
                    <div className="flex items-center justify-between mb-3">
                        <h4 className="text-sm font-medium text-gray-900">
                            Top Schools with Errors
                        </h4>
                        {bySchool.length > 5 && (
                            <button
                                onClick={() => setShowDetails(!showDetails)}
                                className="text-sm text-green-600 hover:text-green-700"
                            >
                                {showDetails ? 'Show Less' : `View All (${bySchool.length})`}
                            </button>
                        )}
                    </div>

                    <div className="space-y-3">
                        {(showDetails ? bySchool : topSchools).map((school, index) => (
                            <div 
                                key={`${school.schoolName}-${school.lga}`}
                                className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                            >
                                <div className="flex-shrink-0 w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                                    <span className="text-sm font-semibold text-red-600">{index + 1}</span>
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-start justify-between gap-2">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2">
                                                <IoSchoolOutline className="w-4 h-4 text-gray-400 flex-shrink-0" />
                                                <p className="text-sm font-medium text-gray-900 truncate">
                                                    {school.schoolName}
                                                </p>
                                            </div>
                                            <div className="flex items-center gap-2 mt-1">
                                                <IoLocationOutline className="w-4 h-4 text-gray-400 flex-shrink-0" />
                                                <p className="text-sm text-gray-600">{school.lga}</p>
                                            </div>
                                            {school.examYears.length > 0 && (
                                                <div className="flex items-center gap-2 mt-1">
                                                    <IoCalendarOutline className="w-4 h-4 text-gray-400 flex-shrink-0" />
                                                    <p className="text-xs text-gray-500">
                                                        Years: {school.examYears.join(', ')}
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                        <div className="text-right flex-shrink-0">
                                            <p className="text-lg font-bold text-red-600">{school.count}</p>
                                            <p className="text-xs text-gray-500">errors</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Info Banner */}
            <div className="px-6 py-3 bg-blue-50 border-t border-blue-100">
                <p className="text-sm text-blue-800">
                    <span className="font-medium">Note:</span> These records were skipped during upload because the school was not found in the system. 
                    Please verify school names and LGAs match the registered schools.
                </p>
            </div>
        </div>
    )
}
