'use client'
import React from 'react'
import Link from 'next/link'
import { 
  IoFolderOpen, 
  IoEye, 
  IoPersonAdd, 
  IoLockOpen,
  IoCloudUploadOutline,
  IoFolderOpenOutline,
  IoEyeOutline,
  IoPersonAddOutline,
  IoLockOpenOutline,
  IoCloudUpload
} from 'react-icons/io5'

interface QuickAction {
  id: string
  title: string
  description: string
  icon: React.ReactNode,
  activeIcon: React.ReactNode,
  href: string
  color: string
  bgColor: string
}

export default function QuickActions() {
  const actions: QuickAction[] = [
    {
      id: '1',
      title: 'Upload Results',
      description: 'Upload examination results',
      icon: <IoFolderOpenOutline className="w-6 h-6" />,
      activeIcon: <IoFolderOpen className="w-6 h-6" />,
      href: '/bece-portal/dashboard/uploads',
      color: 'text-gray-700',
      bgColor: 'bg-gray-50 hover:bg-gray-100'
    },
    {
      id: '3',
      title: 'View Results',
      description: 'Review and manage student results',
      icon: <IoEyeOutline className="w-6 h-6" />,
      activeIcon: <IoEye className="w-6 h-6" />,
      href: '/bece-portal/dashboard/view-results',
      color: 'text-gray-700',
      bgColor: 'bg-gray-50 hover:bg-gray-100'
    },
    {
      id: '4',
      title: 'View Uploads',
      description: 'View Upload History',
      icon: <IoCloudUploadOutline className="w-6 h-6" />,
      activeIcon: <IoCloudUpload className="w-6 h-6" />,
      href: '/bece-portal/dashboard/view-uploads',
      color: 'text-gray-700', 
      bgColor: 'bg-gray-50 hover:bg-gray-100'
    },
    {
      id: '5',
      title: 'Student Management',
      description: 'Manage student records',
      icon: <IoPersonAddOutline className="w-6 h-6" />,
      activeIcon: <IoPersonAdd className="w-6 h-6" />,
      href: '/bece-portal/dashboard/schools',
      color: 'text-gray-700',
      bgColor: 'bg-gray-50 hover:bg-gray-100'
    },
    {
      id: '6',
      title: 'Audit Trail',
      description: 'View audit trail',
      icon: <IoLockOpenOutline className="w-6 h-6" />,
      activeIcon: <IoLockOpen className="w-6 h-6" />,
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
            className={`p-4 rounded-lg border border-gray-200 transition-all duration-200 hover:bg-green-500/5 hover:border-green-500 active:scale-95 active:rotate-1 group`}
          >
            <div className="flex flex-col items-center text-center space-y-3">
              <div className={`group-hover:text-green-500 group-active:rotate-6 group-hover:scale-110 transition-transform duration-200 relative`}>
                <span className='group-hover:opacity-0 transition-all duration-200 group-hover:scale-75'>{action.icon}</span>
                <span className='absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 transition-all duration-200 opacity-0 group-hover:opacity-100 scale-75 group-hover:scale-100'>{action.activeIcon}</span>
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
