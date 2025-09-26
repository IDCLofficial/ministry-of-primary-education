import React from 'react';
import '@/app/portal/portal.css';
import ReduxProvider from './providers/ReduxProvider';

export default function layout({ children }: { children: React.ReactNode }) {
    return (
        <ReduxProvider>
            <div className="satoshi-font">
                {children}
            </div>
        </ReduxProvider>
    )
}
