'use client'

import React, { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'

interface TeacherRecord {
    name?: string
    staffId?: string
    school?: string
    status?: string
    photoUrl?: string
    [key: string]: unknown
}

type VerifyState =
    | { status: 'idle' }
    | { status: 'loading' }
    | { status: 'verified'; teacher: TeacherRecord }
    | { status: 'not-found' }
    | { status: 'error'; message: string }

export default function VerifyTeacherPage() {
    const searchParams = useSearchParams()
    const id = searchParams.get('id')?.trim()
    const [state, setState] = useState<VerifyState>({ status: 'idle' })

    useEffect(() => {
        if (!id) {
            setState({ status: 'idle' })
            return
        }

        let cancelled = false
        setState({ status: 'loading' })

        fetch(`/api/teacher/verify?id=${encodeURIComponent(id)}`)
            .then(async (res) => {
                if (cancelled) return
                const json = await res.json().catch(() => null)

                if (res.status === 404) {
                    setState({ status: 'not-found' })
                } else if (res.ok && json?.verified) {
                    setState({ status: 'verified', teacher: json.teacher as TeacherRecord })
                } else {
                    setState({ status: 'error', message: json?.error || 'Verification failed' })
                }
            })
            .catch(() => {
                if (!cancelled) setState({ status: 'error', message: 'Verification service unavailable. Please try again.' })
            })

        return () => {
            cancelled = true
        }
    }, [id])

    return (
        <div className="min-h-screen bg-gradient-to-b from-white to-emerald-50/30 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8 max-w-md w-full text-center">
                <div className="flex justify-center mb-6">
                    <Image src="/images/ministry-logo.png" alt="Ministry" width={56} height={56} className="object-contain" />
                </div>
                <h1 className="text-xl font-bold text-gray-900 mb-1">Teacher verification</h1>
                <p className="text-sm text-gray-500 mb-6">Imo State Ministry of Primary &amp; Secondary Education</p>

                {state.status === 'idle' && (
                    <p className="text-gray-600">
                        No teacher ID was provided. Scan the QR code on an official teacher ID card to verify.
                    </p>
                )}

                {state.status === 'loading' && (
                    <div className="flex flex-col items-center gap-3 py-2">
                        <div className="animate-spin rounded-full h-10 w-10 border-2 border-green-600 border-t-transparent" />
                        <p className="text-sm text-gray-600 font-medium">Verifying teacher…</p>
                    </div>
                )}

                {state.status === 'not-found' && (
                    <p className="text-sm text-red-700 font-medium">
                        No record found for this ID — this teacher could not be verified.
                    </p>
                )}

                {state.status === 'error' && (
                    <p className="text-sm text-amber-700 font-medium">{state.message}</p>
                )}

                {state.status === 'verified' && (
                    <>
                        {state.teacher.photoUrl && (
                            <div className="flex justify-center mb-4">
                                {/* eslint-disable-next-line @next/next/no-img-element -- external, unconfigured host */}
                                <img
                                    src={state.teacher.photoUrl}
                                    alt={state.teacher.name || 'Teacher photo'}
                                    width={80}
                                    height={80}
                                    className="w-20 h-20 rounded-full object-cover border border-gray-200"
                                    onError={(e) => {
                                        e.currentTarget.style.display = 'none'
                                    }}
                                />
                            </div>
                        )}
                        <dl className="space-y-3 mb-6 text-left">
                            <div>
                                <dt className="text-xs font-medium text-gray-500 uppercase tracking-wide">Name</dt>
                                <dd className="text-gray-900 font-medium">{state.teacher.name || '—'}</dd>
                            </div>
                            <div>
                                <dt className="text-xs font-medium text-gray-500 uppercase tracking-wide">Staff ID</dt>
                                <dd className="font-mono text-gray-900">{state.teacher.staffId || id}</dd>
                            </div>
                            {state.teacher.school != null && state.teacher.school !== '' && (
                                <div>
                                    <dt className="text-xs font-medium text-gray-500 uppercase tracking-wide">School</dt>
                                    <dd className="text-gray-900">{String(state.teacher.school)}</dd>
                                </div>
                            )}
                            {state.teacher.status != null && state.teacher.status !== '' && (
                                <div>
                                    <dt className="text-xs font-medium text-gray-500 uppercase tracking-wide">Status</dt>
                                    <dd className="text-gray-900">{String(state.teacher.status)}</dd>
                                </div>
                            )}
                        </dl>
                        <p className="text-sm text-green-700 font-medium flex items-center justify-center gap-1.5">
                            <span className="inline-block w-2 h-2 rounded-full bg-green-500" aria-hidden />
                            Verified — this teacher is registered with the Ministry.
                        </p>
                    </>
                )}

                <p className="text-xs text-gray-400 mt-8">
                    <Link href="/" className="hover:text-green-600 hover:underline">
                        Imo State Ministry of Primary &amp; Secondary Education
                    </Link>
                </p>
            </div>
        </div>
    )
}
