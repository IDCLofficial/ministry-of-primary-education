import React, { Suspense } from 'react'
import UBEATLogin from './components/PageContent'
import { studentPortalMetadata } from '@/lib/metadata'

export const metadata = studentPortalMetadata.ubeatLogin

function LoginFallback() {
    return (
        <div className="min-h-screen bg-[#F3F3F3] flex items-center justify-center">
            <div className="animate-spin rounded-full h-10 w-10 border-2 border-green-600 border-t-transparent" />
        </div>
    )
}

export default function UBEATLoginPage() {
    return (
        <Suspense fallback={<LoginFallback />}>
            <UBEATLogin />
        </Suspense>
    )
}
