import React from 'react'
import { IoDownload } from 'react-icons/io5'
import { StudentData } from '@/app/result-checking/utils/api'

interface StudentInfoCardProps {
    student: StudentData
    onDownload?: () => void
    isDownloading?: boolean
    yearLoading?: boolean
}

export default function StudentInfoCard({ student, onDownload, isDownloading, yearLoading }: StudentInfoCardProps) {
    return (
        <div className="bg-white rounded-3xl border border-gray-200 overflow-hidden">
            <div className="border-b border-gray-100 px-6 py-4">
                <h3 className="text-sm font-semibold text-gray-900">
                    Student Information
                </h3>
            </div>
            
            <div className="p-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-5">
                    {/* Full Name */}
                    <div>
                        <p className="text-xs font-medium text-gray-500 mb-1.5">
                            Full Name
                        </p>
                        <p className="text-sm font-medium text-gray-900 capitalize">
                            {student.name.toLowerCase()}
                        </p>
                    </div>

                    {/* Exam Number */}
                    <div>
                        <p className="text-xs font-medium text-gray-500 mb-1.5">
                            Exam Number
                        </p>
                        <p className="text-sm font-mono font-medium text-gray-900 uppercase">
                            {student.examNo}
                        </p>
                    </div>

                    {/* School */}
                    <div>
                        <p className="text-xs font-medium text-gray-500 mb-1.5">
                            School
                        </p>
                        <p className="text-sm font-medium text-gray-900 capitalize">
                            {student.school.toLowerCase()}
                        </p>
                    </div>

                    {/* LGA */}
                    <div>
                        <p className="text-xs font-medium text-gray-500 mb-1.5">
                            LGA
                        </p>
                        <p className="text-sm font-medium text-gray-900 capitalize">
                            {student.lga.toLowerCase()}
                        </p>
                    </div>
                </div>

                {onDownload && (
                    <div className="mt-6 pt-5 border-t border-gray-100">
                        {yearLoading ? (
                            <div className="h-10 w-44 rounded-xl bg-gray-200 animate-pulse" />
                        ) : (
                            <button
                                type="button"
                                onClick={onDownload}
                                disabled={isDownloading}
                                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold bg-green-600 text-white hover:bg-green-700 active:scale-[0.97] transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isDownloading ? (
                                    <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                                ) : (
                                    <IoDownload className="w-4 h-4" />
                                )}
                                <span>{isDownloading ? 'Downloading your certificate...' : 'Download Your Certificate'}</span>
                            </button>
                        )}
                    </div>
                )}
            </div>
        </div>
    )
}
