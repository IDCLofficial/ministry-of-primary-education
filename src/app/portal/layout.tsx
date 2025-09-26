import React from 'react';
import '@/app/portal/portal.css';
import ReduxProvider from './providers/ReduxProvider';
import { AuthProvider } from './providers/AuthProvider';
import { Toaster } from 'react-hot-toast';

export default function layout({ children }: { children: React.ReactNode }) {
    return (
        <ReduxProvider>
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
                            success: {
                                duration: 3000,
                                style: {
                                    background: '#10B981',
                                },
                            },
                            error: {
                                duration: 5000,
                                style: {
                                    background: '#EF4444',
                                },
                            },
                        }}
                    />
                    {children}
                </div>
            </AuthProvider>
        </ReduxProvider>
    );
}
