'use client'

import React from 'react'
import { useSearchParams } from 'next/navigation'
import Image from 'next/image'
import LoginForm from '@/components/LoginForm'
import CreatePasswordForm from '@/components/CreatePasswordForm'

export default function PortalPage() {
    const searchParams = useSearchParams()
    
    // Check for password creation parameters
    const isPasswordCreation = searchParams.get('action') === 'create-password'
    const uniqueCode = searchParams.get('code')
    const token = searchParams.get('token')
    
    // Determine if we should show password creation form
    const showPasswordCreation = isPasswordCreation && uniqueCode && token

    const handleLogin = async (data: { uniqueCode: string; password: string }) => {
        console.log('Login attempt:', data)
        // Handle login logic here
        // You can make API calls, validate credentials, etc.
        alert(`Login attempt for: ${data.uniqueCode}`)
    }

    const handlePasswordCreation = async (data: { uniqueCode: string; password: string; confirmPassword: string }) => {
        console.log('Password creation:', data)
        // Handle password creation logic here
        // You can make API calls to set the password, etc.
        alert(`Password created for: ${data.uniqueCode}`)
    }

    return (
        <div className="min-h-screen bg-[#F3F3F3]">
            <main className="py-8 gap-4 flex flex-col">
                {/* Header */}
                <div className="flex justify-center gap-2 items-center">
                    <Image
                        src="/images/ministry-logo.png"
                        alt="logo"
                        width={40}
                        height={40}
                        className='object-contain'
                    />
                    <span className='sm:text-2xl text-xl font-bold'>IMMoE</span>
                </div>
                
                {/* Form Container */}
                <div className="max-w-7xl w-full mx-auto mt-10 px-4 sm:px-6 lg:px-8">
                    {showPasswordCreation ? (
                        <CreatePasswordForm 
                            uniqueCode={uniqueCode}
                            onSubmit={handlePasswordCreation}
                        />
                    ) : (
                        <LoginForm 
                            onSubmit={handleLogin}
                        />
                    )}
                </div>
            </main>
        </div>
    )
}
