import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { menuItems } from '../../utils/constants/Path.const'
import { useBeceAuth } from '../../providers/AuthProvider'

export default function SideBar() {
    const pathname = usePathname()
    const { admin, logout } = useBeceAuth()

    return (
        <nav className='w-64 bg-white h-full border-r border-gray-200 flex flex-col shrink-0'>
            {/* Logo/Title */}
            <div className='h-18 flex items-center border-b px-6 border-gray-200'>
                <h1 className='text-xl font-bold text-gray-900'>
                    <abbr title="Basic Education Certificate Examination" className='no-underline'>BECE</abbr> Portal
                </h1>
            </div>

            {/* Navigation Menu */}
            <div className='flex-1 py-4'>
                <ul className='space-y-1 px-3'>
                    {menuItems(pathname).map((item) => (
                        <li key={item.href} className='cursor-pointer active:scale-95 active:rotate-1 transition-all duration-150'>
                            <Link
                                href={item.href}
                                className={`flex items-center px-4 py-4 text-sm font-medium rounded-xl transition-colors duration-200 ${
                                    item.active
                                        ? 'text-white bg-blue-600'
                                        : 'text-gray-700 hover:bg-gray-50 bg-gray-50/50 border-2 border-transparent hover:border-blue-600/20 hover:text-gray-900'
                                }`}
                            >
                                <span className='mr-2 text-lg'>
                                    {item.active ? item.iconActive : item.icon}
                                </span>
                                {item.label}
                            </Link>
                        </li>
                    ))}
                </ul>
            </div>

            {/* Bottom Section - User Info & Logout */}
            <div className='p-3 border-t border-gray-200'>
                <div className='space-y-3'>
                    {/* User Email */}
                    <div className='px-3 py-2 bg-gray-50 rounded-lg border border-blue-300'>
                        <div className='flex items-center space-x-3'>
                            <div className='w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center border border-blue-600'>
                                <span className='text-blue-600 font-medium text-sm'>
                                    {admin?.email?.charAt(0).toUpperCase() || 'U'}
                                </span>
                            </div>
                            <div className='flex-1 min-w-0'>
                                <p className='text-sm font-medium text-gray-900 truncate'>
                                    {admin?.email || 'User'}
                                </p>
                                <p className='text-xs text-gray-500'>Administrator</p>
                            </div>
                        </div>
                    </div>

                    {/* Logout Button */}
                    <button
                        onClick={logout}
                        className="w-full flex items-center justify-center px-3 py-2 text-sm font-medium rounded-lg text-red-700 bg-red-50 hover:bg-red-100 hover:text-red-800 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-all duration-200 active:scale-90 border border-red-600 cursor-pointer active:rotate-1"
                    >
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
                        Logout
                    </button>
                </div>
            </div>
        </nav>
    )
}   