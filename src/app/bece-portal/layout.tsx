import React from 'react'
import { Toaster } from 'react-hot-toast'
import './portal.css'
import BeceReduxProvider from './providers/ReduxProvider'
import { BeceAuthProvider } from './providers/AuthProvider'

export default function BecePortalLayout({ children }: { children: React.ReactNode }) {
    return (
        <BeceReduxProvider>
            <BeceAuthProvider>
                <div className="satoshi-font">
                    <Toaster
                        position="top-right"
                        toastOptions={{
                            duration: 4000,
                            style: {
                                background: '#363636',
                                color: '#fff',
                            },
                        }}
                    />
                    {children}
                </div>
            </BeceAuthProvider>
        </BeceReduxProvider>
    )
}