'use client'
import React from 'react'
import Link from 'next/link'
import { 
  IoFileTrayFull, 
  IoFolderOpen, 
  IoEye, 
  IoRibbon, 
  IoPersonAdd, 
  IoLockOpen
} from 'react-icons/io5'

interface QuickAction {
  id: string
  title: string
  description: string
  icon: React.ReactNode
  href: string
  color: string
  bgColor: string
}

export default function QuickActions() {
  const actions: QuickAction[] = [
    {
      id: '1',
      title: 'Upload CA',
      description: 'Upload Continuous Assessment results',
      icon: <IoFileTrayFull className="w-6 h-6" />,
      href: '/bece-portal/dashboard/upload-ca',
      color: 'text-gray-700',
      bgColor: 'bg-gray-50 hover:bg-gray-100'
    },
    {
      id: '2',
      title: 'Upload Exams',
      description: 'Upload examination results',
      icon: <IoFolderOpen className="w-6 h-6" />,
      href: '/bece-portal/dashboard/upload-exams',
      color: 'text-gray-700',
      bgColor: 'bg-gray-50 hover:bg-gray-100'
    },
    {
      id: '3',
      title: 'View Results',
      description: 'Review and manage student results',
      icon: <IoEye className="w-6 h-6" />,
      href: '/bece-portal/dashboard/view-results',
      color: 'text-gray-700',
      bgColor: 'bg-gray-50 hover:bg-gray-100'
    },
    {
      id: '4',
      title: 'Generate Certificates',
      description: 'Create and download certificates',
      icon: <IoRibbon className="w-6 h-6" />,
      href: '/bece-portal/dashboard/certificates',
      color: 'text-gray-700',
      bgColor: 'bg-gray-50 hover:bg-gray-100'
    },
    {
      id: '5',
      title: 'Student Management',
      description: 'Manage student records',
      icon: <IoPersonAdd className="w-6 h-6" />,
      href: '/bece-portal/dashboard/students',
      color: 'text-gray-700',
      bgColor: 'bg-gray-50 hover:bg-gray-100'
    },
    {
      id: '6',
      title: 'Audit Trail',
      description: 'View audit trail',
      icon: <IoLockOpen className="w-6 h-6" />,
      href: '/bece-portal/dashboard/audit-trail',
      color: 'text-gray-700',
      bgColor: 'bg-gray-50 hover:bg-gray-100'
    }
  ]

  return (
    <div className="bg-white rounded-xl border border-gray-100 p-6">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Quick Actions</h3>
        <p className="text-sm text-gray-600 mt-1">Frequently used BECE management tools</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {actions.map((action) => (
          <Link
            key={action.id}
            href={action.href}
            className={`p-4 rounded-lg border border-gray-200 transition-all duration-200 ${action.bgColor} hover:shadow-md group`}
          >
            <div className="flex flex-col items-center text-center space-y-3">
              <div className={`${action.color} group-hover:scale-110 transition-transform duration-200`}>
                {action.icon}
              </div>
              <div>
                <h4 className="font-medium text-gray-900 text-sm">
                  {action.title}
                </h4>
                <p className="text-xs text-gray-600 mt-1 leading-relaxed">
                  {action.description}
                </p>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
