import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { IoMenu, IoClose, IoChevronBack, IoChevronForward } from 'react-icons/io5'
import { menuItems } from '../../utils/constants/Path.const'
import { useBeceAuth } from '../../providers/AuthProvider'
import Image from 'next/image'

export default function SideBar() {
    const pathname = usePathname()
    const { admin, logout } = useBeceAuth()
    const [isCollapsed, setIsCollapsed] = useState(false)
    const [isMobile, setIsMobile] = useState(false)

    // Check screen size and set initial collapsed state
    useEffect(() => {
        const checkScreenSize = () => {
            const mobile = window.innerWidth < 1024 // lg breakpoint
            setIsMobile(mobile)
            if (mobile) {
                setIsCollapsed(true)
            }
        }

        checkScreenSize()
        window.addEventListener('resize', checkScreenSize)
        return () => window.removeEventListener('resize', checkScreenSize)
    }, [])

    return (
        <>
            {/* Toggle Button - Fixed position on mobile/tablet */}
            {isMobile && (
                <button
                    onClick={() => setIsCollapsed(!isCollapsed)}
                    className="fixed top-4 left-4 z-50 p-2 bg-green-600 text-white rounded-lg shadow-lg hover:bg-green-700 transition-all duration-200 active:scale-95"
                    aria-label="Toggle sidebar"
                >
                    {isCollapsed ? <IoMenu className="w-6 h-6" /> : <IoClose className="w-6 h-6" />}
                </button>
            )}

            {/* Overlay for mobile */}
            {isMobile && !isCollapsed && (
                <div
                    className="fixed inset-0 bg-black/50 z-30"
                    onClick={() => setIsCollapsed(true)}
                />
            )}

            <nav className={`${isMobile ? 'fixed left-0 top-0 h-full z-60' : 'relative'
                } bg-white border-r border-gray-200 flex flex-col shrink-0 transition-all duration-300 ${isCollapsed ? (isMobile ? '-translate-x-full' : 'w-24') : 'w-64'
                }`}>
                {/* Logo/Title */}
                <div className='h-18 flex items-center justify-between border-b px-6 border-gray-200'>
                    {!isCollapsed && (
                        <h1 className='text-xl font-bold text-gray-900 transition-opacity duration-200'>
                            <abbr title="Basic Education Certificate Examination" className='no-underline'>BECE</abbr> Portal
                        </h1>
                    )}
                    {isCollapsed && !isMobile && (
                        <Image
                            src="/images/ministry-logo.png"
                            alt="logo"
                            width={60}
                            height={60}
                            className='object-contain'
                            title='Imo State Ministry of Primary and Secondary Education logo'
                        />
                    )}
                    {!isMobile && (
                        <button
                            onClick={() => setIsCollapsed(!isCollapsed)}
                            className="p-1 hover:bg-gray-100 rounded transition-colors duration-200 absolute top-1/2 -translate-y-1/2 -right-4 bg-green-600 text-white hover:text-green-700 z-40 cursor-pointer"
                            aria-label="Toggle sidebar"
                        >
                            {isCollapsed ? <IoChevronForward className="w-5 h-5" /> : <IoChevronBack className="w-5 h-5" />}
                        </button>
                    )}
                </div>

                {/* Navigation Menu */}
                <div className='flex-1 py-4 overflow-y-auto'>
                    <ul className='space-y-1 px-3'>
                        {menuItems(pathname).map((item) => (
                            <li key={item.href} className='cursor-pointer active:scale-95 active:rotate-1 transition-all duration-150'>
                                <Link
                                    href={item.href}
                                    onClick={() => isMobile && setIsCollapsed(true)}
                                    className={`flex items-center ${isCollapsed && !isMobile ? 'justify-center px-4 mx-auto w-fit' : 'px-4'} py-4 text-sm font-medium rounded-xl transition-all duration-200 ${item.active
                                            ? 'text-white bg-green-600'
                                            : 'text-gray-700 hover:bg-gray-50 bg-gray-50/50 border-2 border-transparent hover:border-green-600/20 hover:text-gray-900'
                                        }`}
                                    title={isCollapsed && !isMobile ? item.label : ''}
                                >
                                    <span className={`text-lg ${!isCollapsed ? 'mr-2' : ''}`}>
                                        {item.active ? item.iconActive : item.icon}
                                    </span>
                                    {!isCollapsed && <span>{item.label}</span>}
                                </Link>
                            </li>
                        ))}
                    </ul>
                </div>

                {/* Bottom Section - User Info & Logout */}
                <div className='p-3 border-t border-gray-200'>
                    <div className='space-y-3'>
                        {!isCollapsed ? (
                            <>
                                {/* User Email */}
                                <div className='px-3 py-2 bg-gray-50 rounded-lg border border-green-300'>
                                    <div className='flex items-center space-x-3'>
                                        <div className='w-8 h-8 bg-green-100 rounded-full flex items-center justify-center border border-green-600'>
                                            <span className='text-green-600 font-medium text-sm'>
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
                            </>
                        ) : (
                            <>
                                {/* Collapsed User Avatar */}
                                <div className='flex justify-center'>
                                    <div className='w-10 h-10 bg-green-100 rounded-full flex items-center justify-center border-2 border-green-600'>
                                        <span className='text-green-600 font-medium text-sm'>
                                            {admin?.email?.charAt(0).toUpperCase() || 'U'}
                                        </span>
                                    </div>
                                </div>

                                {/* Collapsed Logout Button */}
                                <button
                                    onClick={logout}
                                    className="w-full flex items-center justify-center p-2 text-sm font-medium rounded-lg text-red-700 bg-red-50 hover:bg-red-100 hover:text-red-800 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-all duration-200 active:scale-90 border border-red-600 cursor-pointer active:rotate-1"
                                    title="Logout"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                    </svg>
                                </button>
                            </>
                        )}
                    </div>
                </div>
            </nav>
        </>
    )
}