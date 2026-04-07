'use client'
import React, { useState, useCallback, useEffect, useMemo } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { SessionStore, useSecureSessionStorage } from '@/app/result-checking/utils/secureStorage'
import { IoPersonCircle, IoLockClosed, IoTrashOutline, IoChevronForward, IoClose, IoChevronDown, IoChevronUp, IoCalendarOutline, IoSwapHorizontal } from 'react-icons/io5'
import toast from 'react-hot-toast'
import Lottie from 'lottie-react'
import animationData from '../../assets/students.json'
import Image from 'next/image'
import { useDebounce } from '../../../portal/utils/hooks/useDebounce'
import Link from 'next/link'
import { useLazyGetBECEResultQuery, useFindBECEResultMutation, useCreateBECEPaymentMutation, type FindResultMatch } from '../../store/api/studentApi'
import { AnimatePresence, motion, Variants } from 'framer-motion'
import CustomDropdown from '@/app/portal/dashboard/components/CustomDropdown'
import { useGetSchoolNamesQuery } from '@/app/portal/store/api/authApi'
import { LgaEnum } from '@/app/portal/dashboard/[schoolCode]/types'

// ─── Constants ────────────────────────────────────────────────────────────────
// XX/000/000
const EXAM_NO_REGEX = /^[a-zA-Z]{2}\/\d{3,4}\/\d{3,4}(\(\d\))?$/
// XX/000/0000/000
const EXAM_NO_REGEX_02 = /^[a-zA-Z]{2}\/\d{3,4}\/\d{4}\/\d{1,4}$/
// XX/XX/000/000
const EXAM_NO_REGEX_03 = /^[a-zA-Z]{2}\/[a-zA-Z]{2}\/\d{3,4}\/\d{1,4}$/

const MAX_RECENT_ACCOUNTS = 5

const IMO_STATE_LGAS = Object.values(LgaEnum);

// ─── Types ────────────────────────────────────────────────────────────────────

interface RecentAccount {
    examNo: string
    studentName: string
    school: string
    lastAccessed: number // Unix ms timestamp
}

interface AlternativeFormData {
    fullName: string
    schoolName: { id: string; name: string }
    lga: string
    examYear: string
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function isValidExamNo(val: string) {
    return EXAM_NO_REGEX.test(val) || EXAM_NO_REGEX_02.test(val) || EXAM_NO_REGEX_03.test(val)
}

function getInitials(name: string) {
    return name
        .split(' ')
        .filter(Boolean)
        .slice(0, 2)
        .map(n => n[0].toUpperCase())
        .join('')
}

function timeAgo(ms: number) {
    const diff = Date.now() - ms
    const mins = Math.floor(diff / 60_000)
    const hours = Math.floor(diff / 3_600_000)
    const days = Math.floor(diff / 86_400_000)
    if (mins < 1) return 'Just now'
    if (mins < 60) return `${mins}m ago`
    if (hours < 24) return `${hours}h ago`
    return `${days}d ago`
}

// ─── Motion variants ──────────────────────────────────────────────────────────

const listVariants: Variants = {
    hidden: {},
    show: { transition: { staggerChildren: 0.055 } },
    exit: { transition: { staggerChildren: 0.03, staggerDirection: -1 } },
}

const itemVariants: Variants = {
    hidden: { opacity: 0, y: 8 },
    show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 380, damping: 28 } },
    exit: { opacity: 0, x: -16, transition: { duration: 0.15 } },
}

const sectionVariants: Variants = {
    hidden: { opacity: 0, height: 0 },
    show: { opacity: 1, height: 'auto', transition: { type: 'spring', stiffness: 300, damping: 30 } },
    exit: { opacity: 0, height: 0, transition: { duration: 0.2 } },
}

// ─── Recent Account Card ─────────────────────────────────────────────────────

function RecentAccountCard({
    account,
    onSelect,
    onRemove,
    isLoading,
}: {
    account: RecentAccount
    onSelect: (examNo: string) => void
    onRemove: (examNo: string) => void
    isLoading: boolean
}) {
    return (
        <motion.div
            variants={itemVariants}
            layout
            className={`group relative flex items-center gap-3 px-3 py-2.5 rounded-xl border border-gray-100 bg-gray-50 hover:bg-green-50 hover:border-green-200 transition-all duration-150 cursor-pointer ${isLoading ? 'opacity-50 cursor-not-allowed grayscale-50' : ''}`}
            onClick={!isLoading ? () => onSelect(account.examNo) : () => { }}
        >
            {/* Avatar */}
            <div className="flex-shrink-0 w-9 h-9 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center text-white text-xs font-bold shadow-sm">
                {getInitials(account.studentName)}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900 truncate capitalize">
                    {account.studentName.toLowerCase()}
                </p>
                <p className="text-xs text-gray-400 truncate font-mono uppercase">
                    {account.examNo}
                </p>
            </div>

            {/* Time + arrow */}
            <div className="flex items-center gap-1.5 flex-shrink-0">
                <span className="text-[10px] text-gray-400">{timeAgo(account.lastAccessed)}</span>
                <IoChevronForward className="w-3.5 h-3.5 text-gray-300 group-hover:text-green-500 transition-colors" />
            </div>

            {/* Remove button */}
            <button
                onClick={e => { e.stopPropagation(); onRemove(account.examNo) }}
                aria-label="Remove account"
                className="absolute top-1.5 group-hover:-top-1.5 -right-1.5 w-5 h-5 rounded-full bg-white border border-gray-200 text-gray-400 hover:text-red-500 hover:border-red-300 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-150 shadow-sm cursor-pointer"
            >
                <IoClose className="w-3 h-3" />
            </button>
        </motion.div>
    )
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function StudentLoginPage() {
    const router = useRouter()
    const searchParams = useSearchParams()

    const [examNo, setExamNo] = useState('')
    const [error, setError] = useState('')
    const [showAllAccounts, setShowAllAccounts] = useState(false)

    // Autofill exam number from verify URL or direct link (e.g. /result-checking/bece?examNo=...)
    useEffect(() => {
        const fromUrl = searchParams.get('examNo')
        if (fromUrl && typeof fromUrl === 'string' && fromUrl.trim()) {
            setExamNo(fromUrl.trim())
        }
    }, [searchParams])

    const showAlternativeForm = searchParams.get('form') === 'alternative'

    const [altFormData, setAltFormData] = useState<AlternativeFormData>({
        fullName: '',
        schoolName: { id: '', name: '' },
        lga: '',
        examYear: new Date().getFullYear().toString(),
    })

    const [matchedStudents, setMatchedStudents] = useState<{ studentName: string; id: string }[] | null>(null)
    const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null)

    // ── Recent accounts (persisted, encrypted) ───────────────────────────────
    const [recentAccounts, setRecentAccounts] = useSecureSessionStorage<RecentAccount[]>(
        'bece_recent_accounts',
        [],
    )

    const syncRecentAccount = useCallback((account: RecentAccount) => {
        setRecentAccounts(prev => {
            const existing = (prev ?? []).filter(a => a.examNo !== account.examNo)
            return [account, ...existing].slice(0, MAX_RECENT_ACCOUNTS)
        })
    }, [setRecentAccounts])

    const removeRecentAccount = useCallback((examNo: string) => {
        setRecentAccounts(prev => (prev ?? []).filter(a => a.examNo !== examNo))
    }, [setRecentAccounts])

    const clearAllRecentAccounts = useCallback(() => {
        setRecentAccounts([])
    }, [setRecentAccounts])

    const allAccounts = recentAccounts ?? []
    const hasRecentAccounts = allAccounts.length > 0
    const hasMore = allAccounts.length > 1
    const visibleAccounts = showAllAccounts ? allAccounts : allAccounts.slice(0, 1)

    // ── RTK Query ─────────────────────────────────────────────────────────────
    const [getBECEResult, { isLoading, isFetching, isSuccess }] = useLazyGetBECEResultQuery()
    const [findBECEResult, { isLoading: isFindingResult }] = useFindBECEResultMutation()
    const [createBECEPayment, { isLoading: isCreatingPayment }] = useCreateBECEPaymentMutation()
    const isProcessingPayment = isFindingResult || isCreatingPayment

    const { data: schoolNames, isLoading: isLoadingSchoolNames, isFetching: isFetchingSchools } = useGetSchoolNamesQuery(
        { lga: altFormData.lga },
        { skip: !altFormData.lga },
    )

    const schoolNamesList = useMemo(() => schoolNames ?? [], [schoolNames])
    const lgaOptions = useMemo(() => IMO_STATE_LGAS.map(lga => ({ value: lga, label: lga })), [])

    const debouncedExamNo = useDebounce(examNo, 500)
    const canProceed = debouncedExamNo.length >= 6 && isValidExamNo(debouncedExamNo)

    const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL
    const isMaintenanceMode = !API_BASE_URL

    const isAltFormValid =
        altFormData.fullName.trim().length >= 3 &&
        altFormData.schoolName.id.trim().length >= 3 &&
        altFormData.lga.trim().length >= 2 &&
        altFormData.examYear.trim().length === 4 &&
        !isLoadingSchoolNames &&
        !isFetchingSchools

    // ── Handlers ──────────────────────────────────────────────────────────────

    const handleLogin = async (e: React.FormEvent) => {
        if (isFetching || isLoading || !canProceed) return
        e.preventDefault()
        setError('')

        if (!examNo.trim()) { setError('Please enter your exam number to continue'); return }
        if (!isValidExamNo(examNo)) {
            setError("Invalid format. Try: ok/977/2025/001")
            return
        }

        try {
            toast.loading("Loading your results...", {
                id: "loading-results",
                duration: Infinity
            })
            const result = await getBECEResult(examNo).unwrap()

            if (!result?.examNo || !result?.name) {
                setError("Couldn't load your results. Please try again.")
                return
            }

            syncRecentAccount({
                examNo: examNo,
                studentName: result.name,
                school: result.school ?? '',
                lastAccessed: Date.now(),
            })

            await Promise.all([
                SessionStore.set('student_exam_no', examNo),
                SessionStore.set('selected_exam_type', 'bece'),
            ])

            toast.dismiss("loading-results")
            toast.success(`Welcome ${result.name}! Loading your results... 🎉`)
            setTimeout(() => router.push('/result-checking/bece/dashboard'), 0)
        } catch (error: unknown) {
            toast.dismiss("loading-results")
            const err = error as { status: string | number }
            if (err.status === 404) {
                setError("We couldn't find your results. Check your exam number.")
                toast.error("We couldn't find your results. Check your exam number.")
            }
            else if (err.status === 400) {
                setError("This exam number doesn't look valid.")
                toast.error("This exam number doesn't look valid.")
            }
            else if (err.status === 500) {
                setError("Our system is having a moment. Try again shortly.")
                toast.error("Our system is having a moment. Try again shortly.")
            }
            else if (err.status === 'FETCH_ERROR') {
                setError("No internet connection. Please check and retry.")
                toast.error("No internet connection. Please check and retry.")
            }
            else {
                setError("Something went wrong. Please try again.")
                toast.error("Something went wrong. Please try again.")
            }
        }
    }

    const handleSelectRecent = async (selectedExamNo: string) => {
        setExamNo(selectedExamNo)
        setError('')

        try {
            toast.loading("Loading your results...", {
                id: "loading-results",
                duration: Infinity
            })
            const result = await getBECEResult(selectedExamNo).unwrap()
            if (!result?.examNo || !result?.name) {
                setError("Couldn't load results for this account.")
                return
            }

            syncRecentAccount({
                examNo: selectedExamNo,
                studentName: result.name,
                school: result.school ?? '',
                lastAccessed: Date.now(),
            })
            toast.dismiss("loading-results")

            await Promise.all([
                SessionStore.set('student_exam_no', selectedExamNo),
                SessionStore.set('selected_exam_type', 'bece'),
            ])
            toast.success(`Welcome back, ${result.name}! 🎉`)
            setTimeout(() => router.push('/result-checking/bece/dashboard'), 0)
        } catch {
            toast.dismiss("loading-results")
            toast.error("Couldn't load this account. Try entering the exam number manually.")
            setError("Couldn't load this account. Try entering the exam number manually.")
        }
    }

    const handleAlternativeFormSubmit = async (e: React.FormEvent) => {
        if (isFindingResult) return
        e.preventDefault()
        setError('')

        if (!isAltFormValid) {
            const msg = 'Please fill in all fields correctly'
            setError(msg); toast.error(msg); return
        }

        try {
            const result = await findBECEResult({
                schoolId: altFormData.schoolName.id,
                examYear: parseInt(altFormData.examYear),
                studentName: altFormData.fullName,
                lga: altFormData.lga,
            }).unwrap()

            console.log(result);

            if (result.statusCode !== 200) {
                console.log("HERE up", result);
                const msg = 'message' in result ? result.message : "No matching records found. Double-check your details."
                setError(msg); toast.error(msg);
                return;
            }


            if (!result.data || result.data.length === 0) {
                console.log("HERE");
                const msg = "No matching records found. Double-check your details."
                setError(msg); toast.error(msg);
                return;
            }

            setMatchedStudents(result.data)
        } catch (error: unknown) {
            const err = error as { status: string | number; data?: { message?: string } }
            let msg = ''
            if (err.status === 404) msg = "Couldn't find results with that info. Check your details."
            else if (err.status === 400) msg = err.data?.message ?? 'Invalid information provided.'
            else if (err.status === 500) msg = 'Our system is having a moment. Try again shortly.'
            else if (err.status === 'FETCH_ERROR') msg = 'No internet connection.'
            else msg = "Couldn't find your results. Check your information."
            setError(msg); toast.error(msg)
        }
    }

    const handleStudentSelected = async (student: { name: string; _id: string }) => {
        setSelectedStudentId(student._id)
        setError('')
        try {
            const fullResult = await createBECEPayment({ id: student._id }).unwrap()

            if (!fullResult.paymentUrl || !fullResult.paymentReference) {
                const msg = 'Payment information unavailable. Please try again.'
                setError(msg); toast.error(msg); return
            }

            await Promise.all([
                SessionStore.set('bece_alt_form_data', JSON.stringify({
                    fullName: student.name,
                    school: altFormData.schoolName,
                    lga: altFormData.lga,
                    examYear: altFormData.examYear,
                })),
                SessionStore.set('selected_exam_type', 'bece'),
                SessionStore.set('bece_payment_url', fullResult.paymentUrl),
                SessionStore.set('bece_payment_reference', fullResult.paymentReference),
            ])

            toast.success('Data retrieved successfully!')

            if (fullResult.paymentUrl.toLowerCase().includes('bece')) {
                setTimeout(() => router.push(`${fullResult.paymentUrl}?trxref=${fullResult.paymentReference}&reference=${fullResult.paymentReference}`), 0)
                return
            }
            setTimeout(() => router.push('/result-checking/bece/payment'), 0)
        } catch (error: unknown) {
            const err = error as { status: string | number; data?: { message?: string } }
            let msg = ''
            if (err.status === 400) msg = err.data?.message ?? 'Invalid request.'
            else if (err.status === 500) msg = 'Our system is having a moment. Try again shortly.'
            else if (err.status === 'FETCH_ERROR') msg = 'No internet connection.'
            else msg = 'Something went wrong. Please try again.'
            setSelectedStudentId(null)
            setError(msg); toast.error(msg)
        }
    }

    const toggleForm = () => {
        const params = new URLSearchParams(searchParams.toString())
        if (showAlternativeForm) params.delete('form')
        else params.set('form', 'alternative')
        setTimeout(() => router.push(`?${params.toString()}`), 0)
        setError(''); setExamNo(''); setMatchedStudents(null)
        setAltFormData({ fullName: '', schoolName: { id: '', name: '' }, lga: '', examYear: new Date().getFullYear().toString() })
    }

    // ── Render ────────────────────────────────────────────────────────────────
    return (
        <div className="min-h-screen bg-[#F3F3F3] flex flex-col relative overflow-hidden">
            <div className="absolute h-full w-full inset-0 z-[0]">
                <Image
                    src="/images/asset.png"
                    alt="pattern background"
                    fill
                    className="object-cover hue-rotate-[0deg] saturate-200 brightness-[0.75] scale-x-[-1]"
                    title="pattern background"
                />
            </div>

            {/* Lottie */}
            <div className="fixed inset-0 h-screen w-screen flex animate-fadeIn-y sm:justify-end justify-center items-end pointer-events-none">
                <Lottie
                    animationData={animationData}
                    loop autoPlay
                    className="max-sm:hidden mb-5"
                    style={{ height: '40vmin' }}
                />
            </div>

            {/* Ministry Header */}
            {!isMaintenanceMode && (
                <header className="w-full pt-8 pb-6 px-4 relative z-20">
                    <div className="flex flex-col justify-center gap-3 items-center">
                        <Link href="/result-checking">
                            <Image
                                src="/images/ministry-logo.png"
                                alt="logo"
                                width={60}
                                height={60}
                                className="object-contain"
                                title="Imo State Ministry of Primary and Secondary Education logo"
                            />
                        </Link>
                        <div className="text-center">
                            <div className="flex items-center justify-center gap-2 mb-1">
                                <span className="text-2xl md:text-3xl font-bold">
                                    <abbr title="Basic Education Certificate Examination" className="no-underline">BECE</abbr>
                                </span>
                            </div>
                            <p className="text-sm md:text-base text-gray-600 max-w-md">
                                Basic Education Certificate Examination
                            </p>
                        </div>
                    </div>
                </header>
            )}

            <div className="flex-1 flex items-center justify-center p-4">
                <div className="w-full max-w-md relative z-10">
                    {isMaintenanceMode ? (
                        /* ── Maintenance Card ── */
                        <div className="bg-white rounded-2xl shadow-xl border border-orange-200 p-8 animate-fadeIn-y">
                            <div className="text-center">
                                <Image src="/images/ministry-logo.png" alt="logo" width={50} height={50} className="object-contain mx-auto mb-6" />
                                <h2 className="text-2xl font-bold text-gray-900 mb-2">System Maintenance</h2>
                                <p className="text-sm text-gray-600 mb-6">
                                    We&apos;re performing scheduled maintenance. The student portal will be back online shortly.
                                </p>
                                <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                                    <p className="text-sm text-orange-800 animate-pulse">Please check back in a few hours.</p>
                                </div>
                            </div>
                            <div className="mt-6 pt-6 border-t border-gray-200">
                                <p className="text-xs text-center text-gray-500">Thank you for your patience.</p>
                            </div>
                        </div>
                    ) : (
                        /* ── Login Card ── */
                        <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-8 animate-fadeIn-y hover:shadow-2xl transition-all duration-300">
                            <div className="mb-6">
                                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                                    {isCreatingPayment ? 'Setting up payment…' : matchedStudents ? 'Is this you? 🔍' : 'Welcome, Student! 👋'}
                                </h2>
                                <p className="text-sm text-gray-600">
                                    {!showAlternativeForm
                                        ? 'Enter your exam number below to view your BECE results.'
                                        : isCreatingPayment
                                            ? 'Please wait while we prepare your payment link.'
                                            : matchedStudents
                                                ? `We found ${matchedStudents.length} record${matchedStudents.length !== 1 ? 's' : ''} matching your details — select the one that\'s yours.`
                                                : "Don't worry! Access your BECE results by providing your basic information below."
                                    }
                                </p>
                            </div>

                            {!showAlternativeForm ? (
                                <form onSubmit={handleLogin} className="space-y-5">

                                    {/* ── Recent Accounts ── */}
                                    <AnimatePresence>
                                        {hasRecentAccounts && (
                                            <motion.div
                                                key="recent"
                                                variants={sectionVariants}
                                                initial="hidden"
                                                animate="show"
                                                exit="exit"
                                                className="overflow-hidden px-1.5"
                                            >
                                                <div className="mb-2 flex items-center justify-between">
                                                    <span className="flex items-center gap-1.5 text-xs font-medium text-gray-500 tracking-wider">
                                                        Recent accounts
                                                    </span>
                                                    <button
                                                        type="button"
                                                        onClick={clearAllRecentAccounts}
                                                        className="flex items-center gap-1 text-[11px] text-gray-400 hover:text-red-500 transition-colors cursor-pointer"
                                                    >
                                                        <IoTrashOutline className="w-3 h-3" />
                                                        Clear all
                                                    </button>
                                                </div>

                                                {/* Visible accounts (1 by default, all when expanded) */}
                                                <motion.div
                                                    className="space-y-2"
                                                    variants={listVariants}
                                                    initial="hidden"
                                                    animate="show"
                                                >
                                                    {visibleAccounts.map(account => (
                                                        <RecentAccountCard
                                                            key={account.examNo}
                                                            account={account}
                                                            isLoading={isLoading || isFetching}
                                                            onSelect={handleSelectRecent}
                                                            onRemove={removeRecentAccount}
                                                        />
                                                    ))}
                                                </motion.div>

                                                {/* See more / See less toggle */}
                                                {hasMore && (
                                                    <motion.button
                                                        type="button"
                                                        onClick={() => setShowAllAccounts(v => !v)}
                                                        className="mt-2 w-full flex items-center justify-center gap-1.5 py-1.5 text-xs font-medium text-gray-400 hover:text-green-600 transition-colors cursor-pointer rounded-lg hover:bg-green-50"
                                                        initial={{ opacity: 0 }}
                                                        animate={{ opacity: 1 }}
                                                        transition={{ delay: 0.15 }}
                                                    >
                                                        {showAllAccounts ? (
                                                            <><IoChevronUp className="w-3.5 h-3.5" />See less</>
                                                        ) : (
                                                            <><IoChevronDown className="w-3.5 h-3.5" />{allAccounts.length - 1} more account{allAccounts.length - 1 !== 1 ? 's' : ''}</>
                                                        )}
                                                    </motion.button>
                                                )}

                                                {/* Divider */}
                                                <div className="flex items-center gap-3 my-4">
                                                    <div className="flex-1 h-px bg-gray-100" />
                                                    <span className="text-xs text-gray-400">or enter manually</span>
                                                    <div className="flex-1 h-px bg-gray-100" />
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>

                                    {/* ── Exam Number Input ── */}
                                    <div className="group">
                                        <label htmlFor="examNo" className="block text-sm font-medium text-gray-700 mb-2 group-hover:text-green-600 transition-colors duration-200">
                                            Your Exam Number
                                        </label>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                <IoPersonCircle className="h-5 w-5 text-gray-400 group-hover:text-green-500 transition-all duration-200" />
                                            </div>
                                            <input
                                                type="text"
                                                id="examNo"
                                                value={examNo}
                                                onChange={e => { setExamNo(e.target.value.toLowerCase()); setError('') }}
                                                placeholder="e.g., ok/977/2025/001"
                                                className={`block w-full pl-10 pr-3 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent hover:border-green-400 transition-all duration-200 uppercase ${error
                                                    ? 'border-red-300 bg-red-50'
                                                    : debouncedExamNo && !canProceed && debouncedExamNo.length > 0
                                                        ? 'border-yellow-300 bg-yellow-50'
                                                        : canProceed
                                                            ? 'border-green-300 bg-green-50'
                                                            : 'border-gray-300'
                                                    }`}
                                                disabled={isLoading || isFetching}
                                            />
                                            {canProceed && !error && (
                                                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                                                    <svg className="h-5 w-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                                    </svg>
                                                </div>
                                            )}
                                        </div>

                                        {/* Inline validation feedback */}
                                        {error ? (
                                            <p className="mt-2 text-sm text-red-600 flex items-baseline gap-1 animate-fadeIn-y">
                                                <svg className="w-4 h-4 flex-shrink-0 translate-y-0.5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" /></svg>
                                                <span>{error}, <Link className='inline text-blue-500' href={"?contacting-support=true"}>Get Help</Link></span>
                                            </p>
                                        ) : debouncedExamNo && !canProceed && debouncedExamNo.length > 0 ? (
                                            <p className="mt-2 text-sm text-yellow-600 flex items-center gap-1 animate-fadeIn-y">
                                                <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
                                                Invalid format (e.g., ok/977/2025/001)
                                            </p>
                                        ) : canProceed ? (
                                            <p className="mt-2 text-sm text-green-600 flex items-center gap-1 animate-fadeIn-y">
                                                <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                                                Ready to view your results!
                                            </p>
                                        ) : (
                                            <p className="mt-2 text-xs text-gray-500">Format: xx/xxx/xxxx/xxx (e.g., ok/977/2025/001)</p>
                                        )}
                                    </div>

                                    {/* Submit */}
                                    <button
                                        type="submit"
                                        disabled={isLoading || !canProceed || isFetching}
                                        className={`w-full flex items-center justify-center px-4 py-3 border border-transparent text-base font-medium rounded-lg text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 cursor-pointer group ${isLoading || !canProceed ? 'opacity-50 cursor-not-allowed' : 'shadow-[0_4px_rgba(0,0,0,0.25)] active:shadow-[0_0px_rgba(0,0,0,1)] active:translate-y-2'
                                            }`}
                                    >
                                        {(isLoading || isFetching) ? (
                                            <><div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2" />Loading your results...</>
                                        ) : (
                                            <><IoLockClosed className="w-5 h-5 mr-2 group-hover:animate-pulse" />View My Results</>
                                        )}
                                    </button>

                                    <div className="text-center">
                                        <button
                                            type="button"
                                            onClick={toggleForm}
                                            className="text-sm text-green-600 hover:text-green-700 font-medium transition-all duration-150 cursor-pointer underline"
                                        >
                                            Don&apos;t know your exam number? Click here
                                        </button>
                                    </div>
                                </form>
                            ) : matchedStudents ? (
                                /* ── Student Selection ── */
                                <div className="space-y-3">
                                    {error && (
                                        <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-start gap-2">
                                            <svg className="w-4 h-4 text-red-600 shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" /></svg>
                                            <p className="text-sm text-red-800 flex-1">{error}</p>
                                            <button type="button" onClick={() => setError('')} className="text-red-400 hover:text-red-600 ml-1"><IoClose className="w-4 h-4" /></button>
                                        </div>
                                    )}
                                    <motion.div
                                        className="space-y-2"
                                        variants={listVariants}
                                        initial="hidden"
                                        animate="show"
                                    >
                                        {matchedStudents.map((student) => {
                                            const isSelected = selectedStudentId === student.id
                                            const isOther = isCreatingPayment && !isSelected
                                            return (
                                                <motion.button
                                                    key={student.id}
                                                    variants={itemVariants}
                                                    type="button"
                                                    disabled={isCreatingPayment}
                                                    onClick={() => handleStudentSelected({ name: student.studentName, _id: student.id })}
                                                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border transition-all duration-150 text-left disabled:cursor-not-allowed ${
                                                        isSelected
                                                            ? 'border-green-400 bg-green-50 ring-2 ring-green-200'
                                                            : isOther
                                                                ? 'border-gray-200 bg-gray-50 opacity-40 cursor-not-allowed'
                                                                : 'border-gray-200 bg-gray-50 hover:bg-green-50 hover:border-green-300 cursor-pointer'
                                                    }`}
                                                >
                                                    <div className="flex-shrink-0 w-9 h-9 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center text-white text-xs font-bold shadow-sm">
                                                        {isSelected
                                                            ? <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin block" />
                                                            : getInitials(student.studentName)
                                                        }
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <p className={`text-sm font-semibold truncate capitalize ${isSelected ? 'text-green-700' : 'text-gray-900'}`}>
                                                            {student.studentName.toLowerCase()}
                                                        </p>
                                                        {isSelected && (
                                                            <p className="text-xs text-green-600 mt-0.5">Setting up payment…</p>
                                                        )}
                                                    </div>
                                                    {isSelected
                                                        ? <span className="w-4 h-4 border-2 border-green-400/40 border-t-green-500 rounded-full animate-spin flex-shrink-0 block" />
                                                        : <IoChevronForward className={`w-4 h-4 flex-shrink-0 ${isOther ? 'text-gray-300' : 'text-gray-400'}`} />
                                                    }
                                                </motion.button>
                                            )
                                        })}
                                    </motion.div>

                                    <div className="flex items-center gap-3 pt-1">
                                        <div className="flex-1 h-px bg-gray-100" />
                                        <span className="text-xs text-gray-400">not you?</span>
                                        <div className="flex-1 h-px bg-gray-100" />
                                    </div>

                                    <button
                                        type="button"
                                        disabled={isCreatingPayment}
                                        onClick={() => { setMatchedStudents(null); setSelectedStudentId(null); setError('') }}
                                        className="w-full flex items-center justify-center gap-2 py-2.5 text-sm text-gray-500 hover:text-green-600 border border-gray-200 rounded-lg hover:border-green-300 transition-all duration-150 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                                    >
                                        <IoSwapHorizontal className="w-4 h-4" />
                                        None of these — search again
                                    </button>
                                </div>
                            ) : (
                                /* ── Alternative Form ── */
                                <form onSubmit={handleAlternativeFormSubmit} className="space-y-4">
                                    {error && (
                                        <div className="bg-red-50 border border-red-200 rounded-lg p-4 animate-shake">
                                            <div className="flex gap-3">
                                                <svg className="w-5 h-5 text-red-600 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" /></svg>
                                                <p className="text-sm font-medium text-red-800 flex-1">{error}</p>
                                                <button type="button" onClick={() => setError('')} className="text-red-400 hover:text-red-600">
                                                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
                                                </button>
                                            </div>
                                        </div>
                                    )}

                                    {/* Full Name */}
                                    <div className="group">
                                        <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                <IoPersonCircle className="h-5 w-5 text-gray-400" />
                                            </div>
                                            <input
                                                type="text"
                                                id="fullName"
                                                value={altFormData.fullName}
                                                onChange={e => { setAltFormData({ ...altFormData, fullName: e.target.value }); if (error) setError('') }}
                                                placeholder="Enter your full name"
                                                className="block w-full pl-10 pr-3 py-2 text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent hover:border-green-400 transition-all duration-200 capitalize"
                                                disabled={isProcessingPayment}
                                            />
                                        </div>
                                    </div>

                                    {/* LGA */}
                                    <div className="group relative">
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Local Government Area (LGA) <span className="text-red-500">*</span>
                                        </label>
                                        <CustomDropdown
                                            options={lgaOptions}
                                            value={altFormData.lga}
                                            onChange={value => { setAltFormData({ ...altFormData, lga: value, schoolName: { id: '', name: '' } }); if (error) setError('') }}
                                            placeholder="Select LGA"
                                        />
                                    </div>

                                    {/* School Name */}
                                    <div className="group relative">
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            School Name <span className="text-red-500">*</span>
                                        </label>
                                        {(isLoadingSchoolNames || isFetchingSchools) ? (
                                            <div className="w-full bg-gray-100 border border-gray-300 rounded-lg px-3 py-2 text-sm">
                                                <div className="flex items-center gap-2">
                                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-green-600" />
                                                    <span className="text-gray-500">{altFormData.lga ? `Loading ${altFormData.lga} schools...` : 'Loading schools...'}</span>
                                                </div>
                                            </div>
                                        ) : !altFormData.lga ? (
                                            <div className="w-full bg-gray-50 border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-500">Please select an LGA first</div>
                                        ) : schoolNamesList.length === 0 ? (
                                            <div className="w-full bg-gray-50 border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-500">No schools available for this LGA</div>
                                        ) : (
                                            <CustomDropdown
                                                options={schoolNamesList.map(school => ({
                                                    value: school._id,
                                                    label: String(school.schoolName).startsWith('"') ? String(school.schoolName).slice(1) : school.schoolName,
                                                }))}
                                                value={altFormData.schoolName.id}
                                                onChange={value => {
                                                    setAltFormData({ ...altFormData, schoolName: { id: value, name: schoolNamesList.find(s => s._id === value)?.schoolName! } })
                                                    if (error) setError('')
                                                }}
                                                placeholder="Select a school"
                                                searchable
                                                searchPlaceholder="Search school name..."
                                            />
                                        )}
                                    </div>

                                    {/* Exam Year */}
                                    <div className="group">
                                        <label htmlFor="examYear" className="block text-sm font-medium text-gray-700 mb-2">Exam Year</label>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                <IoCalendarOutline className="h-5 w-5 text-gray-400" />
                                            </div>
                                            <input
                                                type="text"
                                                id="examYear"
                                                value={altFormData.examYear}
                                                onChange={e => { setAltFormData({ ...altFormData, examYear: e.target.value }); if (error) setError('') }}
                                                placeholder="e.g., 2025"
                                                maxLength={4}
                                                className="block w-full pl-10 pr-3 py-2 text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent hover:border-green-400 transition-all duration-200"
                                                disabled={isProcessingPayment}
                                            />
                                        </div>
                                    </div>

                                    {/* Payment Info */}
                                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                        <div className="flex gap-3">
                                            <svg className="w-5 h-5 text-blue-600 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" /></svg>
                                            <div>
                                                <p className="text-sm font-medium text-blue-900 mb-1">Payment Required</p>
                                                <p className="text-xs text-blue-700">A fee of ₦500 is required for this method. You&apos;ll be redirected to our secure payment gateway.</p>
                                            </div>
                                        </div>
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={isProcessingPayment || !isAltFormValid}
                                        className={`w-full flex items-center justify-center px-4 py-3 border border-transparent text-base font-medium rounded-lg text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 cursor-pointer ${isProcessingPayment || !isAltFormValid ? 'opacity-50 cursor-not-allowed' : 'shadow-[0_4px_rgba(0,0,0,0.25)] active:shadow-[0_0px_rgba(0,0,0,1)] active:translate-y-2'
                                            }`}
                                    >
                                        {isProcessingPayment ? (
                                            <><div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2" />Finding your results...</>
                                        ) : 'Find My Results'}
                                    </button>

                                    <div className="text-center">
                                        <button
                                            type="button"
                                            onClick={toggleForm}
                                            className="inline-flex items-center gap-1 text-sm text-green-600 hover:text-green-700 font-medium transition-all duration-150 cursor-pointer"
                                        >
                                            <IoSwapHorizontal className="w-4 h-4" />
                                            Back to exam number login
                                        </button>
                                    </div>
                                </form>
                            )}

                            {/* Footer */}
                            {!isMaintenanceMode && (
                                <div className="mt-6 pt-6 border-t border-gray-200">
                                    <p className="text-xs text-center text-gray-500">
                                        Go back to the{' '}
                                        <Link href="/result-checking" className="text-green-600 hover:text-green-700 font-medium transition-all duration-150 cursor-pointer">
                                            exam selection
                                        </Link>{' '}
                                        page.
                                    </p>
                                </div>
                            )}
                        </div>
                    )}

                    {!isMaintenanceMode && !showAlternativeForm && (
                        <div className="mt-6 bg-linear-to-b from-white to-green-100 border border-green-200 rounded-2xl p-4 hover:bg-green-100 hover:border-green-300 transition-all duration-300">
                            <p className="text-sm text-green-800">
                                <strong>📝 Note:</strong> Use your official BECE exam number from your school.
                            </p>
                        </div>
                    )}

                    <div className="mt-6 text-center">
                        <p className="text-xs text-gray-600">
                            © {new Date().getFullYear()}{' '}
                            <Link href="/" target="_blank" className="text-gray-500 hover:text-gray-700 hover:underline">
                                Imo State Ministry of Primary and Secondary Education
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}