import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { menuItems } from '../../utils/constants/Path.const'

export default function SideBar() {
    const pathname = usePathname()

    return (
        <nav className='w-64 bg-white h-full border-r border-gray-200 flex flex-col'>
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
                        <li key={item.href}>
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

            {/* Bottom Section */}
            <div className='p-4 border-t border-gray-200'>
                <div className='space-y-2'>
                    <Link
                        href='/bece-portal/dashboard/settings'
                        className={`flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors duration-200 ${
                            pathname.startsWith('/bece-portal/dashboard/settings')
                                ? 'bg-blue-50 text-blue-700'
                                : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                        }`}
                    >
                        <span className='mr-3 text-lg'>⚙️</span>
                        Settings
                    </Link>
                    <Link
                        href='/bece-portal/dashboard/help'
                        className={`flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors duration-200 ${
                            pathname.startsWith('/bece-portal/dashboard/help')
                                ? 'bg-blue-50 text-blue-700'
                                : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                        }`}
                    >
                        <span className='mr-3 text-lg'>❓</span>
                        Help & Support
                        <span className='ml-auto bg-green-500 text-white text-xs px-2 py-0.5 rounded-full'>
                            3
                        </span>
                    </Link>
                </div>
            </div>
        </nav>
    )
}   