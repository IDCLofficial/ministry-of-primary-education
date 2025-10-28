'use client'

import React from 'react'

export default function HeaderSkeleton() {
    return (
        <header className='sm:p-4 sticky sm:top-4 top-2 z-50 p-2 bg-white/50 backdrop-blur-lg flex justify-between items-center rounded-xl shadow-lg shadow-black/5 border border-black/10'>
            {/* Logo and Brand Skeleton */}
            <div className='flex gap-2 items-center'>
                <div className='w-[30px] h-[30px] bg-gray-200 rounded animate-pulse'></div>
                <div className='w-16 h-4 bg-gray-200 rounded animate-pulse'></div>
            </div>
            
            {/* User Info and Actions Skeleton */}
            <div className='flex items-center gap-4'>
                {/* School Info Skeleton - Hidden on mobile */}
                <div className='sm:flex hidden gap-2 items-center text-right'>
                    <div className='space-y-1'>
                        <div className='w-32 h-3 bg-gray-200 rounded animate-pulse'></div>
                        <div className='w-20 h-2 bg-gray-200 rounded animate-pulse'></div>
                    </div>
                    <div className='w-[25px] h-[25px] bg-gray-200 rounded animate-pulse'></div>
                </div>
                
                {/* Logout Button Skeleton */}
                <div className='w-20 h-8 bg-gray-200 rounded-md animate-pulse'></div>
            </div>
        </header>
    )
}
