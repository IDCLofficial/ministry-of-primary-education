"use client"
import React, { useState } from 'react'
import { useBeceAuth } from '../../providers/AuthProvider'
import useShortcuts from '@useverse/useshortcuts';
import UploadDropdown from './UploadDropdown';

export default function Header() {
    const { admin, logout } = useBeceAuth()
    const [searchQuery, setSearchQuery] = useState('')

    const searchRef = React.useRef<HTMLInputElement>(null)

    useShortcuts({
        shortcuts: [
            { key: 'F', ctrlKey: true },
        ],
        onTrigger: (shortcut) => {
            searchRef.current?.focus()
        }
    });

    const handleUploadSelect = (value: string) => {
        console.log('Upload option selected:', value)
        // TODO: Handle upload actions
        switch (value) {
            case 'upload-ca':
                // Handle CA upload
                console.log('Handling CA upload...')
                break
            case 'upload-exams':
                // Handle Exams upload
                console.log('Handling Exams upload...')
                break
            default:
                break
        }
    }

    return (
        <header className="bg-white border-b border-gray-200">
            <div className="px-6 h-18 flex items-center w-full">
                <div className="flex items-center justify-between w-full">
                    {/* Center Section - Search */}
                    <div className="flex-1 max-w-md">
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                            </div>
                            <input
                                type="text"
                                placeholder="Search or type a command"
                                value={searchQuery}
                                ref={searchRef}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="block w-full peer pl-10 pr-12 py-2 border border-black/5 rounded-lg leading-5 bg-[#f3f3f3] placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-sm"
                            />
                            <div className="absolute peer-focus:opacity-0 inset-y-0 right-0 pr-1.5 flex items-center pointer-events-none">
                                <kbd className="flex items-center gap-[0.05rem] justify-center h-7 w-8 border border-black/20 rounded text-xs font-mono bg-white shadow-lg text-gray-500 font-semibold">
                                    <span className='text-lg'>⌘</span>F
                                </kbd>
                            </div>
                        </div>
                    </div>

                    {/* Right Section - Actions */}
                    <div className="flex items-center space-x-4">
                        {/* Upload Dropdown */}
                        <UploadDropdown onSelect={handleUploadSelect} />
                        
                        {/* Logout Button */}
                        <button
                            onClick={logout}
                            className="inline-flex cursor-pointer active:scale-90 active:rotate-1 items-center px-3 py-2 border border-red-300 text-sm font-medium rounded-md text-red-700 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-all duration-200"
                        >
                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                            </svg>
                            Logout
                        </button>
                    </div>
                </div>
            </div>
        </header>
    )
}