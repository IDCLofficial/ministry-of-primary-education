import React from 'react'
import { IoSchool, IoLocationOutline, IoChevronForward } from 'react-icons/io5'
import { School } from '../types/student.types'
import Link from 'next/link'

interface SchoolCardProps {
    school: School
}

// Helper function to safely extract LGA name
const getLgaName = (lga: string | { _id: string; name: string }): string => {
    if (typeof lga === 'string') {
        return lga
    }
    return lga?.name || 'Unknown LGA'
}

export default function SchoolCard({ school }: SchoolCardProps) {

    return (
        <Link
            href={`/bece-portal/dashboard/schools/${school.schoolCode.replace(/\//g, "-")}`} 
            className="bg-white rounded-xl border border-gray-200 hover:border-green-400 hover:shadow-lg transition-all duration-200 cursor-pointer group overflow-hidden active:scale-95 hover:scale-[1.01] hover:-translate-y-1 active:translate-y-0 active:opacity-75"
        >
            <div className="p-6">
                {/* School Icon and Name */}
                <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center group-hover:bg-green-200 transition-colors">
                            <IoSchool className="w-6 h-6 text-green-600" />
                        </div>
                        <div className="flex-1">
                            <h3 className="text-lg font-semibold text-gray-900 capitalize line-clamp-2">
                                {school.schoolName.toLowerCase()}
                            </h3>
                        </div>
                    </div>
                    <IoChevronForward className="w-5 h-5 text-gray-400 group-hover:text-green-600 group-hover:translate-x-1 transition-all flex-shrink-0" />
                </div>

                {/* School Details */}
                <div className="space-y-3">
                    {/* Location */}
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                        <IoLocationOutline className="w-4 h-4 text-gray-400" />
                        <span className="capitalize">{getLgaName(school.lga).toLowerCase()}</span>
                    </div>
                </div>

                {/* Footer Badge */}
                <div className="mt-4 pt-4 border-t border-gray-100">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-medium text-green-600 bg-green-50 px-3 py-1 rounded-full">
                            View Details
                        </span>
                        <span className="text-xs text-gray-500">
                            School Code: <div className="text-black font-medium">{school.schoolCode}</div>
                        </span>
                    </div>
                </div>
            </div>
        </Link>
    )
}
