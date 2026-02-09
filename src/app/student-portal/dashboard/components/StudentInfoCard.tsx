import React from 'react'
import { IoPersonCircle, IoSchool, IoLocationOutline, IoCard } from 'react-icons/io5'
import { StudentData } from '../../utils/api'

interface StudentInfoCardProps {
    student: StudentData
}

export default function StudentInfoCard({ student }: StudentInfoCardProps) {
    return (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-lg transition-shadow duration-300 overflow-hidden">
            <div className="p-6 sm:p-8">
                <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                    <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-green-600 rounded-lg flex items-center justify-center">
                        <IoPersonCircle className="w-5 h-5 text-white" />
                    </div>
                    Student Information
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    {/* Full Name */}
                    <div className="group">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="w-10 h-10 bg-gradient-to-br from-green-50 to-green-100 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                                <IoPersonCircle className="w-5 h-5 text-green-600" />
                            </div>
                            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Full Name</p>
                        </div>
                        <p className="text-base font-semibold text-gray-900 capitalize pl-[52px]">
                            {student.name.toLowerCase()}
                        </p>
                    </div>

                    {/* Exam Number */}
                    <div className="group">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="w-10 h-10 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                                <IoCard className="w-5 h-5 text-blue-600" />
                            </div>
                            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Exam Number</p>
                        </div>
                        <p className="text-base font-mono font-semibold text-gray-900 uppercase pl-[52px]">
                            {student.examNo}
                        </p>
                    </div>

                    {/* School */}
                    <div className="group">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="w-10 h-10 bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                                <IoSchool className="w-5 h-5 text-purple-600" />
                            </div>
                            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">School</p>
                        </div>
                        <p className="text-base font-semibold text-gray-900 capitalize pl-[52px]">
                            {student.schoolName.toLowerCase()}
                        </p>
                    </div>

                    {/* LGA */}
                    <div className="group">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="w-10 h-10 bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                                <IoLocationOutline className="w-5 h-5 text-orange-600" />
                            </div>
                            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">LGA</p>
                        </div>
                        <p className="text-base font-semibold text-gray-900 capitalize pl-[52px]">
                            {student.lga.toLowerCase()}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}
