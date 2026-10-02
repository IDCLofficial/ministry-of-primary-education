import { Suspense } from 'react'
import { studentPortalMetadata } from '@/lib/metadata'
import JSCBELogin from './components/PageContent'

export const metadata = studentPortalMetadata.jscbeLogin

function LoginFallback() {
    return (
        <div className="min-h-screen bg-[#F3F3F3] flex items-center justify-center">
            <div className="animate-spin rounded-full h-10 w-10 border-2 border-green-600 border-t-transparent" />
        </div>
    )
}

export default function JSCBELoginScreen() {
    return (
        <Suspense fallback={<LoginFallback />}>
            <JSCBELogin />
        </Suspense>
    )
}