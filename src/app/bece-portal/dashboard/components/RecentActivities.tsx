'use client'
import Link from 'next/link'
import React from 'react'
import { IoCheckmarkCircle, IoTimeOutline, IoDocumentText, IoPersonAdd, IoRibbon } from 'react-icons/io5'

interface Activity {
  id: string
  type: 'upload' | 'review' | 'certificate' | 'student'
  title: string
  description: string
  time: string
  status: 'completed' | 'pending' | 'in_progress'
  amount?: string
}

function ActivityIcon({ type }: { type: Activity['type'] }) {
  const iconClass = "w-5 h-5 text-gray-600"
  
  switch (type) {
    case 'upload':
      return <IoDocumentText className={iconClass} />
    case 'review':
      return <IoTimeOutline className={iconClass} />
    case 'certificate':
      return <IoRibbon className={iconClass} />
    case 'student':
      return <IoPersonAdd className={iconClass} />
    default:
      return <IoCheckmarkCircle className={iconClass} />
  }
}

function StatusBadge({ status }: { status: Activity['status'] }) {
  const getStatusStyle = () => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800'
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'in_progress':
        return 'bg-green-100 text-green-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusStyle()}`}>
      {status.replace('_', ' ')}
    </span>
  )
}

export default function RecentActivities() {
  const activities: Activity[] = [
    {
      id: '1',
      type: 'upload',
      title: 'Mathematics Results',
      description: 'Uploaded BECE Mathematics results for 2024',
      time: '2 hours ago',
      status: 'completed',
      amount: '245 students'
    },
    {
      id: '2',
      type: 'certificate',
      title: 'Certificate Generation',
      description: 'Generated certificates for English Language',
      time: '4 hours ago',
      status: 'completed',
      amount: '189 certificates'
    },
    {
      id: '3',
      type: 'review',
      title: 'Science Results Review',
      description: 'Pending review for Science examination results',
      time: '6 hours ago',
      status: 'pending',
      amount: '156 students'
    },
    {
      id: '4',
      type: 'student',
      title: 'Student Registration',
      description: 'New student batch registered for BECE 2024',
      time: '1 day ago',
      status: 'completed',
      amount: '87 students'
    },
    {
      id: '5',
      type: 'upload',
      title: 'Social Studies CA',
      description: 'Continuous Assessment upload in progress',
      time: '2 days ago',
      status: 'in_progress',
      amount: '203 students'
    }
  ]

  return (
    <div className="bg-white rounded-xl border border-gray-100 py-3">
      <div className="flex items-center justify-between px-6 py-3 border-b border-gray-100">
        <h3 className="text-lg font-semibold text-gray-900">Recent Activities</h3>
        <Link href="/bece-portal/dashboard/audit-trail" className="text-sm text-green-600 hover:text-green-700 font-medium">
          View all
        </Link>
      </div>

      <div className="space-y-4">
        {activities.map((activity) => (
          <div key={activity.id} className="flex px-6 items-start gap-4 p-3 hover:bg-gray-50 rounded-lg transition-colors">
            <div className="flex-shrink-0 w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
              <ActivityIcon type={activity.type} />
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {activity.title}
                  </p>
                  <p className="text-sm text-gray-600 mt-1">
                    {activity.description}
                  </p>
                  <div className="flex items-center gap-3 mt-2">
                    <span className="text-xs text-gray-500">{activity.time}</span>
                    {activity.amount && (
                      <span className="text-xs text-gray-700 font-medium">
                        {activity.amount}
                      </span>
                    )}
                  </div>
                </div>
                <StatusBadge status={activity.status} />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
