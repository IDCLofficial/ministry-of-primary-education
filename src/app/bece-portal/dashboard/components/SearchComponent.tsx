"use client"
import useShortcuts from '@useverse/useshortcuts';
import React from 'react';

export default function SearchComponent() {
    const searchRef = React.useRef<HTMLInputElement>(null);
    const [searchQuery, setSearchQuery] = React.useState('');

    useShortcuts({
        shortcuts: [
            { key: '/', ctrlKey: true },
            { key: 'F', ctrlKey: true },
        ],
        onTrigger: () => {
            searchRef.current?.focus();
        }
    });
    
    return (
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
    )
}
