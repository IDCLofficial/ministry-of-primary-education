import { IoPersonCircle, IoSchool, IoLocationOutline } from 'react-icons/io5'
import { StudentData } from '../../utils/demoData'

interface StudentInfoCardProps {
    student: StudentData
}

export default function StudentInfoCard({ student }: StudentInfoCardProps) {
    return (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden animate-fadeIn-y hover:shadow-lg transition-all duration-300">
            {/* Header with gradient */}
            <div className="bg-gradient-to-r from-green-600 to-green-700 px-6 py-8">
                <div className="flex items-center gap-4">
                    <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center border-4 border-white/30 group-hover:scale-110 transition-transform duration-300">
                        <IoPersonCircle className="w-12 h-12 text-white animate-pulse-slow" />
                    </div>
                    <div className="flex-1">
                        <h2 className="text-2xl font-bold text-white capitalize mb-1">
                            {student.name.toLowerCase()}
                        </h2>
                        <p className="text-green-100 font-mono text-sm">
                            Exam No: {student.examNo}
                        </p>
                    </div>
                </div>
            </div>

            {/* Student Details */}
            <div className="p-6">
                <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">
                    Personal Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* School */}
                    <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg hover:bg-green-50 transition-all duration-200 cursor-pointer group">
                        <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:scale-110 group-hover:rotate-6 transition-transform duration-200">
                            <IoSchool className="w-5 h-5 text-green-600" />
                        </div>
                        <div>
                            <p className="text-xs text-gray-500 font-medium">School</p>
                            <p className="text-sm text-gray-900 font-medium capitalize">
                                {student.schoolName.toLowerCase()}
                            </p>
                        </div>
                    </div>

                    {/* Location */}
                    <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg hover:bg-green-50 transition-all duration-200 cursor-pointer group">
                        <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:scale-110 group-hover:rotate-6 transition-transform duration-200">
                            <IoLocationOutline className="w-5 h-5 text-green-600" />
                        </div>
                        <div>
                            <p className="text-xs text-gray-500 font-medium">Address</p>
                            <p className="text-sm text-gray-900 font-medium capitalize">
                                {student.lga.toLowerCase()}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
