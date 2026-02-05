'use client'
import { useBeceAuth } from '@/app/bece-portal/providers/AuthProvider'
import React from 'react'

export default function WelcomeText() {
    const { admin } = useBeceAuth();

    return (
        <div>
            <h2 className='text-2xl font-medium'>Welcome back</h2>
            <p className='text-gray-400 text-sm'>{admin?.email}</p>
        </div>
    )
}
