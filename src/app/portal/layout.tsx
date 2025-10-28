import React from 'react';
import '@/app/portal/portal.css';
import ReduxProvider from './providers/ReduxProvider';
import { AuthProvider } from './providers/AuthProvider';
import { Toaster } from 'react-hot-toast';
import NextTopLoader from 'nextjs-toploader';

export default function layout({ children }: { children: React.ReactNode }) {
    return (
        <ReduxProvider>
            <NextTopLoader 
                color='oklch(72.3% 0.219 149.579)'
            />
            <AuthProvider>
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
            </AuthProvider>
        </ReduxProvider>
    );
}
