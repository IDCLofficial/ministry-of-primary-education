'use client'

import React from 'react'

interface DashboardLayoutProps {
    children: React.ReactNode
}

export default function StudentDashboardLayout({ children }: DashboardLayoutProps) {
    return (
        <div className="min-h-screen bg-[#f3f3f3] h-screen flex flex-col">
            {children}
        </div>
    )
}
