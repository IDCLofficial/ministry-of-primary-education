'use client'
 
import React, { Suspense } from 'react'
import Image from 'next/image'
import ResetPasswordForm from '@/components/ResetPasswordForm'
import HangingTree from '../components/HangingTree'
import { useSearchParams } from 'next/navigation'
import { useVerifyResetTokenMutation } from '../store/api/authApi'
 
function ResetPasswordContent() {
    const searchParams = useSearchParams()
    const token = searchParams.get('token') || ''
    const [verifyResetToken, { isLoading: isVerifying }] = useVerifyResetTokenMutation()
    const [isTokenValid, setIsTokenValid] = React.useState<boolean | null>(null)
    const [errorMessage, setErrorMessage] = React.useState<string>('')

    // Verify token on mount
    React.useEffect(() => {
        if (token) {
            verifyResetToken({ token })
                .unwrap()
                .then((response) => {
                    setIsTokenValid(response.valid)
                    if (!response.valid) {
                        setErrorMessage(response.message || 'This reset link is invalid or has expired.')
                    }
                })
                .catch((error) => {
                    setIsTokenValid(false)
                    setErrorMessage(error?.data?.message || 'Failed to verify reset link. Please try again.')
                })
        } else {
            setIsTokenValid(false)
            setErrorMessage('No reset token provided.')
        }
    }, [token, verifyResetToken])

    // Loading state while verifying token
    if (isVerifying || isTokenValid === null) {
        return (
            <div className="max-w-md mx-auto bg-white rounded-lg shadow-lg shadow-black/5 border border-black/5 p-6">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Verifying reset link...</p>
                </div>
            </div>
        )
    }

    // Error state for invalid token
    if (!isTokenValid) {
        return (
            <div className="max-w-md mx-auto bg-white rounded-lg shadow-lg shadow-black/5 border border-black/5 p-6">
                <div className="text-center">
                    <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                    </div>

                    <h2 className="sm:text-2xl text-lg font-semibold text-gray-800 mb-2">
                        Invalid Reset Link
                    </h2>

                    <p className="text-gray-600 mb-6">
                        {errorMessage}
                    </p>

                    <a
                        href="/portal/forgot-password"
                        className="block w-full bg-green-600 cursor-pointer text-white py-3 px-4 rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition duration-200 font-medium text-center"
                    >
                        Request New Link
                    </a>
                </div>
            </div>
        )
    }

    // Valid token - show reset password form
    return <ResetPasswordForm token={token} />
}
 
export default function ResetPasswordPage() {
    return (
        <div className="min-h-screen flex flex-col bg-[#F3F3F3] relative">
            <HangingTree type='left' />
 
            <header className="w-full pt-8 pb-6 px-4 relative z-20">
                <div className="flex max-md:flex-row flex-col justify-center gap-2 items-center">
                    <Image
                        src="/images/ministry-logo.png"
                        alt="logo"
                        width={60}
                        height={60}
                        className='object-contain'
                        title='Imo State Ministry of Primary and Secondary Education logo'
                    />
                    <span className='sm:text-2xl text-xl text-center font-bold max-md:block hidden'>
                        <abbr title="Imo State Ministry of Primary and Secondary Education">MOPSE</abbr>
                    </span>
                    <span className='sm:text-2xl text-xl text-center font-bold max-md:hidden block'>Imo State Ministry of Primary and Secondary Education</span>
                </div>
            </header>
 
            <main className="flex-1 flex flex-col justify-center gap-6 w-full px-4 sm:px-6 lg:px-8 pb-8 relative z-10">
                <div className="max-w-md w-full mx-auto">
                    <Suspense fallback={
                        <div className="max-w-md mx-auto bg-white rounded-lg shadow-lg shadow-black/5 border border-black/5 p-6">
                            <div className="text-center">
                                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
                                <p className="text-gray-600">Loading...</p>
                            </div>
                        </div>
                    }>
                        <ResetPasswordContent />
                    </Suspense>
                </div>
            </main>
        </div>
    )
}
