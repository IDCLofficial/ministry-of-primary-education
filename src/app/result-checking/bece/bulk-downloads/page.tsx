import { Suspense } from 'react'
import { studentPortalMetadata } from '@/lib/metadata'
import BulkPageContent from './components/BulkPageContent'
import { BULK_EXAM_CONFIGS } from './components/examConfig'


export const metadata = studentPortalMetadata.bulkDownloadsBECE

function BulkBECEFallback() {
    return (
        <div className="min-h-screen bg-[#F3F3F3] flex items-center justify-center">
            <div className="animate-spin rounded-full h-10 w-10 border-2 border-green-600 border-t-transparent" />
        </div>
    )
}

export default function BulkBECEDownloadsScreen() {
    return (
        <Suspense fallback={<BulkBECEFallback />}>
            <BulkPageContent config={BULK_EXAM_CONFIGS.bece} />
        </Suspense>
    )
}
