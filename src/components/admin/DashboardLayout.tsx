'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'

interface DashboardLayoutProps {
  children: React.ReactNode
}

const navigationItems = [
  { name: 'Dashboard', href: '/admin' },
  { name: 'Certificates', href: '/admin/certificates' },
  { name: 'Digitization', href: '/admin/digitization' },
  { name: 'Schools', href: '/admin/schools' },
  { name: 'Students', href: '/admin/students' },
  { name: 'Revenue', href: '/admin/revenue' },
  { name: 'Logs', href: '/admin/logs' },
  { name: 'Exceptions', href: '/admin/exceptions' },
  { name: 'Settings', href: '/admin/settings' },
]

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const pathname = usePathname()
  const [userMenuOpen, setUserMenuOpen] = useState(false)

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Navigation */}
      <nav className="admin-nav bg-white shadow-sm border-b border-gray-200">
        <div className="px-6">
          <div className="flex justify-between items-center h-16">
            {/* Logo and Brand */}
            <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-3">
              <Image src="/images/IMSG-Logo.svg" alt="IMSG Logo" width={32} height={32} className="object-contain" />
              <div>
                <span className="font-semibold text-lg text-gray-900">IMSG</span>
                <p className='text-[8px] text-gray-600'>Ministry of Primary and Secondary Education</p>
              </div>
            </div>
            </div>

            {/* Navigation Links */}
            <div className="hidden md:flex items-center space-x-2">
              {navigationItems.map((item) => {
                const isActive = pathname === item.href
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`px-1 py-2 text-[12px] font-medium rounded-md transition-colors ${
                      isActive
                        ? 'bg-blue-100 text-blue-700'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                    }`}
                  >
                    {item.name}
                  </Link>
                )
              })}
            </div>

            {/* User Menu */}
            <div className="relative">
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center space-x-3 text-sm focus:outline-none"
              >
                <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                  <span className="text-white font-medium">AD</span>
                </div>
                <span className="hidden md:block text-gray-700 font-medium">Admin</span>
                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {/* Dropdown Menu */}
              {userMenuOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50">
                  <a href="#" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                    Profile
                  </a>
                  <a href="#" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                    Settings
                  </a>
                  <div className="border-t border-gray-100"></div>
                  <a href="#" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                    Sign out
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main>{children}</main>
    </div>
  )
}
