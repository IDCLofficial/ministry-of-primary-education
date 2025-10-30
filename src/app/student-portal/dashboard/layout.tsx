'use client'

import React from 'react'

interface DashboardLayoutProps {
    children: React.ReactNode
}

export default function StudentDashboardLayout({ children }: DashboardLayoutProps) {
    return (
        <div className="satoshi-font">
            {children}
        </div>
    )
}
