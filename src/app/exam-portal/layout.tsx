import React from 'react'
import { Toaster } from 'react-hot-toast'
import './portal.css'
import BeceReduxProvider from './providers/ReduxProvider'
import { BeceAuthProvider } from './providers/AuthProvider'
import { examPortalMetadata } from '@/lib/metadata'
import { blockInProduction } from '@/utils/restricted-routes'

export const metadata = examPortalMetadata.login

export default function BecePortalLayout({ children }: { children: React.ReactNode }) {
    blockInProduction();
    return (
        <BeceReduxProvider>
            <BeceAuthProvider>
                <div className="satoshi-font">
                    <Toaster
                        position="top-right"
                        toastOptions={{
                            duration: 3000,
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