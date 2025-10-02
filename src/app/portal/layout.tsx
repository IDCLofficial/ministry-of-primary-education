import React from 'react';
import '@/app/portal/portal.css';

export default function layout({ children }: { children: React.ReactNode }) {
    return (
        <div className="satoshi-font">
            {children}
        </div>
    )
}
