import React from 'react'
import { StudentData } from '@/app/student-portal/utils/api'

interface StudentInfoCardProps {
    student: StudentData
}

export default function StudentInfoCard({ student }: StudentInfoCardProps) {
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
                            {student.schoolName.toLowerCase()}
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
            </div>
        </div>
    )
}
