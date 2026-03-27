'use client'

import React, { useMemo, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import {
    generateVerifyPayloadFromQuery,
    verifyPayloadClient,
    type CertificateVerifyPayload,
} from '@/app/exam-portal/dashboard/schools/[schoolId]/bece/utils/certificateSecurity'
import { AnimatePresence, motion } from 'framer-motion'

export default function BECEVerifyPage() {
    const searchParams = useSearchParams()
    const dataParam = searchParams.get('data')
    const [verified, setVerified] = useState<boolean | null>(null)
    const [verifying, setVerifying] = useState(false)

    const payload = useMemo((): CertificateVerifyPayload | null => {
        if (!dataParam) return null
        return generateVerifyPayloadFromQuery(dataParam)
    }, [dataParam])

    const handleVerify = async () => {
        if (!payload || !payload.sig) {
            setVerified(false)
            return
        }
        setVerifying(true)
        const { sig, ...rest } = payload
        const valid = await verifyPayloadClient(rest, sig)
        setVerified(valid)
        setVerifying(false)
    }

    const loginUrl = useMemo(() => {
        if (!payload?.examNo) return '/result-checking/bece'
        return `/result-checking/bece?examNo=${encodeURIComponent(payload.examNo)}`
    }, [payload?.examNo])

    if (!dataParam) {
        return (
            <div className="min-h-screen bg-gradient-to-b from-white to-emerald-50/30 flex items-center justify-center p-4">
                <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8 max-w-md w-full text-center">
                    <h1 className="text-xl font-bold text-gray-900 mb-2">Invalid link</h1>
                    <p className="text-gray-600 mb-6">No certificate data was provided. Scan the QR code on an official BECE certificate to verify.</p>
                    <Link href="/result-checking/bece" className="text-green-600 font-medium hover:underline">
                        Go to BECE login
                    </Link>
                </div>
            </div>
        )
    }

    if (!payload) {
        return (
            <div className="min-h-screen bg-gradient-to-b from-white to-emerald-50/30 flex items-center justify-center p-4">
                <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8 max-w-md w-full text-center">
                    <h1 className="text-xl font-bold text-gray-900 mb-2">Certificate data could not be read</h1>
                    <p className="text-gray-600 mb-6">The link is broken, expired, or corrupted. Use the QR code on an official BECE certificate.</p>
                    <Link href="/result-checking/bece" className="text-green-600 font-medium hover:underline">
                        Go to BECE login
                    </Link>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gradient-to-b from-white to-emerald-50/30 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8 max-w-md w-full relative">
                <div className="flex justify-center mb-6">
                    <Image src="/images/ministry-logo.png" alt="Ministry" width={56} height={56} className="object-contain" />
                </div>
                <h1 className="text-xl font-bold text-gray-900 mb-1 text-center">Certificate verification</h1>
                <p className="text-sm text-gray-500 mb-6 text-center">BECE Junior School Certificate</p>

                <dl className="space-y-3 mb-6">
                    <div>
                        <dt className="text-xs font-medium text-gray-500 uppercase tracking-wide">Name</dt>
                        <dd className="text-gray-900 font-medium">{payload.name || '—'}</dd>
                    </div>
                    <div>
                        <dt className="text-xs font-medium text-gray-500 uppercase tracking-wide">Exam number</dt>
                        <dd className="font-mono text-gray-900">{payload.examNo || '—'}</dd>
                    </div>
                    <div>
                        <dt className="text-xs font-medium text-gray-500 uppercase tracking-wide">Certificate / serial</dt>
                        <dd className="text-gray-900">{payload.serial || '—'}</dd>
                    </div>
                    <div>
                        <dt className="text-xs font-medium text-gray-500 uppercase tracking-wide">Year</dt>
                        <dd className="text-gray-900">{String(payload.year ?? '—')}</dd>
                    </div>
                    {payload.issueDate != null && payload.issueDate !== '' && (
                        <div>
                            <dt className="text-xs font-medium text-gray-500 uppercase tracking-wide">Issue date</dt>
                            <dd className="text-gray-900">{payload.issueDate}</dd>
                        </div>
                    )}
                </dl>

                <div className={verified ? "mb-6" : ""}>
                    {payload.sig ? (
                        <>
                            {verified === null && !verifying && (
                                <button
                                    type="button"
                                    onClick={handleVerify}
                                    className="w-full py-2.5 px-4 rounded-xl border border-green-200 bg-green-50 text-green-800 font-medium hover:bg-green-100 transition-colors"
                                >
                                    Verify authenticity
                                </button>
                            )}
                            {verifying && (
                                <p className="text-sm text-gray-600 text-center font-medium">
                                    Authenticating certificate…
                                </p>
                            )}
                            {verified === true && (
                                <p className="text-sm text-green-700 font-medium text-center flex items-center justify-center gap-1.5">
                                    <span className="inline-block w-2 h-2 rounded-full bg-green-500" aria-hidden />
                                    Authentic &amp; unaltered — this certificate is genuine.
                                </p>
                            )}
                            {verified === false && (
                                <p className="text-sm text-red-700 font-medium text-center">
                                    Authenticity failed — this certificate may be counterfeit or tampered with.
                                </p>
                            )}
                        </>
                    ) : (
                        <p className="text-sm text-amber-700 font-medium text-center">
                            No digital signature — authenticity cannot be verified.
                        </p>
                    )}
                </div>

                {verified && <>
                    <Link
                        href={loginUrl}
                        className="block w-full py-3 px-4 rounded-lg font-medium text-white text-center transition-all duration-200 bg-green-600 hover:bg-green-700 active:scale-95 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
                    >
                        View result / Login with this exam number
                    </Link>
                    <p className="text-xs text-gray-500 text-center mt-4">
                        You will be taken to the BECE login page with your exam number prefilled.
                    </p>
                </>}
                
                <AnimatePresence mode="wait">
                        {!verified && (
                            <motion.div
                                initial={{ opacity: 1 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0, transition: { duration: 0.8 } }}
                                className='h-fit w-fit absolute -bottom-8 left-1/2 -translate-x-1/2 group'
                            >
                                <Image
                                    src="/images/hand.png"
                                    alt="Hand"
                                    width={80}
                                    height={80}
                                    onContextMenu={(e) => e.preventDefault()}
                                    className="object-contain select-none group-hover:-rotate-6 transition-transform duration-200 origin-bottom-left pointer-events-none"
                                />
                            </motion.div>
                        )}
                    </AnimatePresence>
            </div>
        </div>
    )
}
