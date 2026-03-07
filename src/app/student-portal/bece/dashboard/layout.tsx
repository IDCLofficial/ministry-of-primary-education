import NextTopLoader from 'nextjs-toploader'
import React from 'react'

interface DashboardLayoutProps {
    children: React.ReactNode
}

export default function StudentDashboardLayout({ children }: DashboardLayoutProps) {
    return (
        <div className="min-h-screen bg-[#f3f3f3] h-screen flex flex-col">
            <NextTopLoader
                color='lab(59.0978% -58.6621 41.2579)'
            />
            {children}
        </div>
    )
}