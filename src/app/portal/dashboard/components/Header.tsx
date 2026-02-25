'use client'

import React, { useRef, useState } from 'react'
import { useAuth } from '../../providers/AuthProvider'
import Image from 'next/image'
import HeaderSkeleton from './HeaderSkeleton'
import ChangePasswordModal from './ChangePasswordModal'
import DeleteAccountModal from './DeleteAccountModal'
import { useClickAway } from "react-use";

export default function Header() {
    const { school, logout, isLoading } = useAuth()
    const [showProfileMenu, setShowProfileMenu] = useState(false)
    const [showChangePasswordModal, setShowChangePasswordModal] = useState(false)
    const [showDeleteAccountModal, setShowDeleteAccountModal] = useState(false)

    const ref = useRef<HTMLDivElement>(null)

    // Show skeleton while loading
    if (isLoading) {
        return <HeaderSkeleton />
    }

    useClickAway(ref, ()=> setShowProfileMenu(false));

    return (
        <>
            <header className='sm:p-4 sticky sm:top-4 top-2 z-50 p-2 bg-white/50 backdrop-blur-lg flex justify-between items-center rounded-xl shadow-lg shadow-black/5 border border-black/10'>
                <div className='flex gap-2 items-center'>
                    <Image
                        src="/images/ministry-logo.png"
                        alt="logo"
                        width={30}
                        height={30}
                        className='object-contain'
                    />
                    <span className='sm:text-base text-sm font-extrabold max-md:block hidden'>
                        <abbr title="Imo State Ministry of Primary and Secondary Education">MOPSE</abbr>
                    </span>
                    <span className='sm:text-base text-sm font-extrabold max-md:hidden block'>Imo State Ministry of Primary and Secondary Education</span>
                </div>
                
                {/* User Info and Actions */}
                <div className='flex items-center gap-4'>
                    {school && (
                        <div className='relative'>
                            <button
                                onClick={() => setShowProfileMenu(!showProfileMenu)}
                                className='sm:flex hidden gap-2 items-center text-right hover:bg-gray-50 rounded-lg p-2 transition-colors cursor-pointer'
                            >
                                <div>
                                    <p className='sm:text-sm text-xs font-semibold'>{school.email}</p>
                                    <p className='text-xs text-gray-500 capitalize'>AEE: {school.lga}</p>
                                </div>
                                <div className='flex items-center justify-center w-8 h-8 bg-green-100 rounded-full'>
                                    <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                    </svg>
                                </div>
                                <svg className={`w-4 h-4 text-gray-400 transition-transform ${showProfileMenu ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                            </button>

                            {/* Profile Dropdown Menu */}
                            {showProfileMenu && (
                                <>
                                    <div 
                                        className='fixed inset-0 z-40 cursor-pointer' 
                                        onClick={() => setShowProfileMenu(false)}
                                    />
                                    <div className='absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50' ref={ref}>
                                        <div className='px-4 py-3 border-b border-gray-100'>
                                            <p className='text-sm font-semibold text-gray-900'>{school.email}</p>
                                            <p className='text-xs text-gray-500 capitalize mt-1'>{school.lga} LGA</p>
                                            <p className='text-xs text-gray-400 mt-1'>{school.totalSchoolsInLga} schools</p>
                                        </div>
                                        
                                        <button
                                            onClick={() => {
                                                setShowProfileMenu(false)
                                                setShowChangePasswordModal(true)
                                            }}
                                            className='flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 transition-colors w-full text-left cursor-pointer'
                                        >
                                            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                                            </svg>
                                            <div>
                                                <p className='text-sm font-medium text-gray-900'>Change Password</p>
                                                <p className='text-xs text-gray-500'>Update your password</p>
                                            </div>
                                        </button>

                                        <button
                                            onClick={() => {
                                                setShowProfileMenu(false)
                                                setShowDeleteAccountModal(true)
                                            }}
                                            className='flex items-center gap-3 px-4 py-2.5 hover:bg-red-50 transition-colors w-full text-left cursor-pointer'
                                        >
                                            <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                            </svg>
                                            <div>
                                                <p className='text-sm font-medium text-red-600'>Delete Account</p>
                                                <p className='text-xs text-red-500'>Permanently delete account</p>
                                            </div>
                                        </button>

                                        <div className='border-t border-gray-100 mt-2 pt-2'>
                                            <button
                                                onClick={() => {
                                                    setShowProfileMenu(false)
                                                    logout()
                                                }}
                                                className='flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 transition-colors w-full text-left cursor-pointer'
                                            >
                                                <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                                </svg>
                                                <div>
                                                    <p className='text-sm font-medium text-gray-900'>Logout</p>
                                                    <p className='text-xs text-gray-500'>Sign out of your account</p>
                                                </div>
                                            </button>
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>
                    )}
                </div>

            </header>
            {/* Modals */}
            <ChangePasswordModal
                isOpen={showChangePasswordModal}
                onClose={() => setShowChangePasswordModal(false)}
            />
            <DeleteAccountModal
                isOpen={showDeleteAccountModal}
                onClose={() => setShowDeleteAccountModal(false)}
                userEmail={school?.email || ''}
            />
        </>
    )
}
