'use client'

import { IoSchoolOutline, IoLocationOutline } from 'react-icons/io5'

interface DashboardStatsProps {
  lga: string
  totalSchools: number
  totalStudents?: number
  approvedExams?: number
}

export default function DashboardStats({ lga, totalSchools }: DashboardStatsProps) {
  const stats = [
    {
      icon: <IoLocationOutline className="w-5 h-5" />,
      label: 'Local Government Area',
      value: lga.toUpperCase(),
    },
    {
      icon: <IoSchoolOutline className="w-5 h-5" />,
      label: 'Total Schools',
      value: totalSchools.toLocaleString(),
    }
  ]

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
      {stats.map((stat, index) => (
        <div
          key={index}
          className="bg-white border border-gray-200 rounded-lg p-5 transition-all hover:shadow-sm hover:border-gray-300"
        >
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0 p-2 bg-gray-50 rounded-lg text-gray-600">
              {stat.icon}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-gray-500 mb-1.5">{stat.label}</p>
              <p className="text-2xl font-semibold text-gray-900 truncate">{stat.value}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
