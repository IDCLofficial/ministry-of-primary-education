'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname, useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import MobileSidebar from './MobileSidebar'

interface DashboardLayoutProps {
  children: React.ReactNode
}

const navigationItems = [
  { name: 'BECE', href: '/bece-portal' },
  // { name: 'Certificates', href: '/admin/certificates' },
  // { name: 'Digitization', href: '/admin/digitization' },
  { name: 'Schools', href: '/admin/schools' },
  // { name: 'Students', href: '/admin/students' },
  // { name: 'Revenue', href: '/admin/revenue' },
  // { name: 'Logs', href: '/admin/logs' },
  // { name: 'Exceptions', href: '/admin/exceptions' },
  // { name: 'Settings', href: '/admin/settings' },
]

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const pathname = usePathname()
  const router = useRouter()
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const { logout } = useAuth()

  const handleLogout = () => {
    logout()
    setUserMenuOpen(false)
    router.push('/admin/systemlogin')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile Sidebar */}
      <MobileSidebar 
        isOpen={mobileMenuOpen} 
        onClose={() => setMobileMenuOpen(false)}
        navigationItems={navigationItems}
      />

      {/* Top Navigation */}
      <nav className="admin-nav bg-white shadow-sm border-b border-gray-200">
        <div className="px-6">
          <div className="flex justify-between items-center h-16">
            {/* Mobile Menu Button & Logo */}
            <div className="flex items-center space-x-4">
             
              {/* Logo and Brand */}
              <div className="flex items-center space-x-3">
              <Image src="/images/IMSG-Logo.svg" alt="MOPSE Logo" width={32} height={32} className="object-contain" />
              <div>
                <span className="font-semibold text-lg text-gray-900">MOPSE</span>
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
                    className={`px-1 py-2 text-[14px] font-bold rounded-md transition-colors ${
                      isActive
                        ? 'bg-green-100 text-green-700'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                    }`}
                  >
                    {item.name}
                  </Link>
                )
              })}
            </div>

            {/* User Menu */}
            <div>
               {/* Mobile Menu Button */}
              <button
                onClick={() => setMobileMenuOpen(true)}
                className="relative block md:hidden p-2 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            <div className="relative hidden md:block">

              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center space-x-3 text-sm focus:outline-none"
              >
                <div className="w-8 h-8 bg-green-700 rounded-full flex items-center justify-center">
                  <span className="text-white font-medium">AD</span>
                </div>
                <span className="hidden md:block text-gray-700 font-medium">Admin</span>
                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
            </div>

              {/* Dropdown Menu */}
              
              {userMenuOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50">
                 
                 
                  <div className="border-t border-gray-100"></div>
                  <button 
                    onClick={handleLogout}
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    Sign out
                  </button>
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
