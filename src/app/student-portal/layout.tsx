import React from 'react'
import './portal.css'
import { Toaster } from 'react-hot-toast'
import { ReduxProvider } from './store/provider'
import NextTopLoader from 'nextjs-toploader'

interface StudentPortalLayoutProps {
    children: React.ReactNode
}

export default function StudentPortalLayout({ children }: StudentPortalLayoutProps) {
    return (
        <ReduxProvider>
            <div className="min-h-screen satoshi-font">
                <NextTopLoader
                    color='oklch(72.3% 0.219 149.579)'
                    showSpinner={false}
                />
                <Toaster 
                    position="top-right"
                    toastOptions={{
                        duration: 3000,
                        style: {
                            background: '#363636',
                            color: '#fff',
                        },
                        success: {
                            duration: 3000,
                            iconTheme: {
                                primary: '#10b981',
                                secondary: '#fff',
                            },
                        },
                        error: {
                            duration: 4000,
                            iconTheme: {
                                primary: '#ef4444',
                                secondary: '#fff',
                            },
                        },
                    }}
                />
                {children}
            </div>
        </ReduxProvider>
    )
}
