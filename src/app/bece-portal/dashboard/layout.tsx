'use client'

import React from 'react'
import BeceProtectedRoute from '../components/ProtectedRoute'
import Header from './components/Header'
import SideBar from './components/SideBar'

interface DashboardLayoutProps {
    children: React.ReactNode
}

export default function BeceDashboardLayout({ children }: DashboardLayoutProps) {
    return (
        <BeceProtectedRoute>
            <div className="min-h-screen bg-[#f3f3f3] h-screen flex">
                {/* Sidebar */}
                <SideBar />

                {/* Main Content */}
                <main className="flex-1">
                    {/* Header */}
                    <Header />
                    <div className="px-4 py-6 sm:px-0">
                        {children}
                    </div>
                </main>
            </div>
        </BeceProtectedRoute>
    )
}