'use client'

import React from 'react'
import { useSearchParams } from 'next/navigation'
import Image from 'next/image'
import LoginForm from '@/components/LoginForm'
import CreatePasswordForm from '@/components/CreatePasswordForm'
import Link from 'next/link'

export default function PortalPage() {
    const searchParams = useSearchParams()
    
    // Check for password creation parameters
    const isPasswordCreation = searchParams.get('action') === 'create-password'
    const uniqueCode = searchParams.get('code')
    const token = searchParams.get('token')
    
    // Determine if we should show password creation form
    const showPasswordCreation = isPasswordCreation && uniqueCode && token

    const handlePasswordCreation = async (data: { uniqueCode: string; password: string; confirmPassword: string }) => {
        console.log('Password creation:', data)
        // Handle password creation logic here
        // You can make API calls to set the password, etc.
        alert(`Password created for: ${data.uniqueCode}`)
    }

    return (
        <div className="min-h-screen grid place-items-center pt-16 bg-[#F3F3F3]">
            <div className="flex justify-center gap-2 items-center absolute top-10 left-1/2 -translate-x-1/2">
                <Image
                    src="/images/ministry-logo.png"
                    alt="logo"
                    width={40}
                    height={40}
                    className='object-contain'
                />
                <span className='sm:text-2xl text-xl font-bold'>IMMoE</span>
            </div>
            <main className="py-8 gap-4 flex flex-col w-full">
                {/* Header */}
                
                {/* Form Container */}
                <div className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8">
                    {showPasswordCreation ? (
                        <CreatePasswordForm 
                            uniqueCode={uniqueCode}
                            onSubmit={handlePasswordCreation}
                        />
                    ) : (
                        <LoginForm />
                    )}
                </div>
                {(!showPasswordCreation) && <div className="w-full text-center px-4 text-sm text-black/80">
                    Haven&apos;t registered your school? <Link href="/portal/application" className="text-blue-600 hover:text-blue-800 transition-colors duration-200 underline underline-offset-2">Apply here</Link>
                </div>}
            </main>
        </div>
    )
}
