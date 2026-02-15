'use client'
import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { IoPersonCircle, IoLockClosed, IoArrowBack } from 'react-icons/io5'
import toast from 'react-hot-toast'
import Lottie from 'lottie-react'
import animationData from '../assets/students.json'
import Image from 'next/image'
import { useDebounce } from '../../portal/utils/hooks/useDebounce'
import Link from 'next/link'
import { useLazyGetBECEResultQuery } from '../store/api/studentApi'

// Regex pattern for exam number validation (e.g., XX/000/000)
const EXAM_NO_REGEX = /^[a-zA-Z]{2}\/\d{3,4}\/\d{3,4}(\(\d\))?$/
// Regex pattern for exam number validation (e.g., XX/000/0000/000)
const EXAM_NO_REGEX_02 = /^[a-zA-Z]{2}\/\d{3,4}\/\d{4}\/\d{3,4}$/
// Regex pattern for exam number validation (e.g., XX/XX/000/0000)
const EXAM_NO_REGEX_03 = /^[a-zA-Z]{2}\/[a-zA-Z]{2}\/\d{3,4}\/\d{3,4}$/

// Import the interface from the API
import { BECEStudentResult } from '../store/api/studentApi'

export default function StudentLoginPage() {
    const router = useRouter();
    const [examNo, setExamNo] = useState('');
    const [error, setError] = useState('');

    // RTK Query hooks
    const [getBECEResult, { isLoading }] = useLazyGetBECEResultQuery()

    const debouncedExamNo = useDebounce(examNo, 500);

    const canProceed = debouncedExamNo.length >= 10 && (EXAM_NO_REGEX.test(debouncedExamNo) || EXAM_NO_REGEX_02.test(debouncedExamNo) || EXAM_NO_REGEX_03.test(debouncedExamNo));
    const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
    const isMaintenanceMode = !API_BASE_URL;

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('')

        if (!examNo.trim()) {
            setError('Oops! Please enter your exam number to continue')
            return
        }

        // Validate exam number format
        if (!EXAM_NO_REGEX.test(examNo) && !EXAM_NO_REGEX_02.test(examNo) && !EXAM_NO_REGEX_03.test(examNo)) {
            setError('Hmm, that doesn\'t look right. Please use format: xx/000/0000/000 or xx/XX/000/0000 (e.g., ok/977/2025/001 or ok/XX/977/2025/001)')
            return
        }

        try {
            const result = await getBECEResult(examNo).unwrap()

            // Validate data structure
            if (!result || !result.examNo || !result.name || !result.school) {
                console.error('Invalid data structure:', result)
                setError('We couldn\'t load your results. Please try again or contact support.')
                return
            }

            // Validate subjects array exists
            if (!result.subjects || !Array.isArray(result.subjects) || result.subjects.length === 0) {
                console.error('Invalid subjects data:', result.subjects)
                setError('Your results data is incomplete. Please contact support.')
                return
            }

            // Store only exam number and exam type (data will be fetched via RTK Query in dashboard)
            localStorage.setItem('student_exam_no', examNo)
            localStorage.setItem('selected_exam_type', 'bece')

            toast.success(`Welcome ${result.name}! Loading your results... 🎉`)
            router.push('/student-portal/bece/dashboard')
        } catch (error: any) {
            console.error('Login error:', error)

            // Handle RTK Query errors
            if (error.status === 404) {
                setError('We couldn\'t find your results. Please check your exam number and try again.')
            } else if (error.status === 400) {
                setError('This exam number doesn\'t seem valid. Please double-check and try again.')
            } else if (error.status === 500) {
                setError('Our system is having a moment. Please try again in a few minutes.')
            } else if (error.status === 'FETCH_ERROR') {
                setError('Network error: Unable to connect to server. Please check your internet connection.')
            } else if (error.status === 'PARSING_ERROR') {
                setError('Server returned invalid data. Please try again.')
            } else {
                setError('We\'re having trouble connecting. Please check your internet and try again.')
            }
        }
    }

    return (
        <div className="min-h-screen bg-[#F3F3F3] flex flex-col relative overflow-hidden">
            <div className='absolute h-full w-full inset-0 z-[0]'>
                <Image
                    src="/images/asset.png"
                    alt="pattern background"
                    fill
                    className='object-cover hue-rotate-[0deg] saturate-200 brightness-[0.75] scale-x-[-1]'
                    title='pattern background'
                />
            </div>
            {/* Lottie Animation - Bottom Right */}
            <div className="fixed inset-0 h-screen w-screen flex animate-fadeIn-y sm:justify-end justify-center items-end pointer-events-none">
                <Lottie
                    animationData={animationData}
                    loop={true}
                    autoPlay={true}
                    className='max-sm:hidden mb-5'
                    style={{
                        height: '40vmin',
                    }}
                />
            </div>

            {/* Ministry Header */}
            {isMaintenanceMode ? null : <header className="w-full pt-8 pb-6 px-4 relative z-20">
                <div className="flex flex-col justify-center gap-3 items-center">
                    <Link href="/student-portal">
                        <Image
                            src="/images/ministry-logo.png"
                            alt="logo"
                            width={60}
                            height={60}
                            className='object-contain'
                            title='Imo State Ministry of Primary and Secondary Education logo'
                        />
                    </Link>
                    <div className="text-center">
                        <div className="flex items-center justify-center gap-2 mb-1">
                            <span className='text-2xl md:text-3xl font-bold'>
                                <abbr title="Basic Education Certificate Examination" className="no-underline">BECE</abbr>
                            </span>
                        </div>
                        <p className='text-sm md:text-base text-gray-600 max-w-md'>
                            Basic Education Certificate Examination
                        </p>
                    </div>
                </div>
            </header>}

            <div className="flex-1 flex items-center justify-center p-4">
                <div className="w-full max-w-md relative z-10">
                    {isMaintenanceMode ? (
                        /* Maintenance Mode Card */
                        <div className="bg-white rounded-2xl shadow-xl border border-orange-200 p-8 animate-fadeIn-y">
                            <div className="text-center">
                                <Image
                                    src="/images/ministry-logo.png"
                                    alt="logo"
                                    width={50}
                                    height={50}
                                    className='object-contain mx-auto mb-6'
                                    title='Imo State Ministry of Primary and Secondary Education logo'
                                />
                                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                                    System Maintenance
                                </h2>
                                <p className="text-sm text-gray-600 mb-6">
                                    We&apos;re currently performing scheduled maintenance to improve your experience. The student portal will be back online shortly.
                                </p>
                                <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                                    <p className="text-sm text-orange-800 animate-pulse">
                                        Please check back in a few hours.
                                    </p>
                                </div>
                            </div>

                            {/* Footer */}
                            <div className="mt-6 pt-6 border-t border-gray-200">
                                <p className="text-xs text-center text-gray-500">
                                    Thank you for your patience and understanding.
                                </p>
                            </div>
                        </div>
                    ) : (
                        /* Login Card */
                        <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-8 animate-fadeIn-y hover:shadow-2xl transition-all duration-300">
                            <div className="mb-6">
                                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                                    Welcome, Student! 👋
                                </h2>
                                <p className="text-sm text-gray-600">
                                    We&apos;re excited to share your BECE (Basic Education Certificate Examination) results with you. Simply enter your exam number below to get started.
                                </p>
                            </div>

                            <form onSubmit={handleLogin} className="space-y-6">
                                {/* Exam Number Input */}
                                <div className="group">
                                    <label htmlFor="examNo" className="block text-sm font-medium text-gray-700 mb-2 group-hover:text-green-600 transition-colors duration-200">
                                        Your Exam Number
                                    </label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <IoPersonCircle className="h-5 w-5 text-gray-400 group-hover:text-green-500 group-hover:scale-110 transition-all duration-200" />
                                        </div>
                                        <input
                                            type="text"
                                            id="examNo"
                                            value={examNo}
                                            onChange={(e) => {
                                                setExamNo(e.target.value.toLowerCase())
                                                setError('')
                                            }}
                                            placeholder="e.g., ok/977/2025/001"
                                            className={`block w-full pl-10 pr-3 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent hover:border-green-400 transition-all duration-200 uppercase ${error
                                                ? 'border-red-300 bg-red-50'
                                                : debouncedExamNo && !canProceed && debouncedExamNo.length > 0
                                                    ? 'border-yellow-300 bg-yellow-50'
                                                    : canProceed
                                                        ? 'border-green-300 bg-green-50'
                                                        : 'border-gray-300'
                                                }`}
                                            disabled={isLoading}
                                        />
                                        {canProceed && !error && (
                                            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                                                <svg className="h-5 w-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                                </svg>
                                            </div>
                                        )}
                                    </div>
                                    {error ? (
                                        <p className="mt-2 text-sm text-red-600 flex items-center gap-1 animate-fadeIn-y">
                                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                            </svg>
                                            {error}
                                        </p>
                                    ) : debouncedExamNo && !canProceed && debouncedExamNo.length > 0 ? (
                                        <p className="mt-2 text-sm text-yellow-600 flex items-center gap-1 animate-fadeIn-y">
                                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                            </svg>
                                            Invalid format (e.g., ok/977/2025/001)
                                        </p>
                                    ) : canProceed ? (
                                        <p className="mt-2 text-sm text-green-600 flex items-center gap-1 animate-fadeIn-y">
                                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                            </svg>
                                            Ready to view your results!
                                        </p>
                                    ) : (
                                        <p className="mt-2 text-xs text-gray-500">
                                            Format: xx/xxx/xxxx/xxx (e.g., ok/977/2025/001)
                                        </p>
                                    )}
                                </div>

                                {/* Login Button */}
                                <button
                                    type="submit"
                                    disabled={isLoading || !canProceed}
                                    className={
                                        `w-full flex items-center justify-center px-4 py-3 border border-transparent text-base font-medium rounded-lg text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 cursor-pointer group
                                         ${isLoading || !canProceed ? 'opacity-50 cursor-not-allowed' : 'shadow-[0_4px_rgba(0,0,0,0.25)] active:shadow-[0_0px_rgba(0,0,0,1)] active:translate-y-2'}
                                         `
                                    }
                                >
                                    {isLoading ? (
                                        <>
                                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                                            Loading your results...
                                        </>
                                    ) : (
                                        <>
                                            <IoLockClosed className={`w-5 h-5 mr-2 ${isLoading || !canProceed ? '' : 'group-hover:animate-bounce'}`} />
                                            View My Results
                                        </>
                                    )}
                                </button>
                            </form>

                            {/* Footer */}
                            {!isMaintenanceMode && (
                                <div className="mt-6 pt-6 border-t border-gray-200">
                                    <p className="text-xs text-center text-gray-500">
                                        Go back to the <Link href="/student-portal" className="text-green-600 hover:text-green-700 font-medium transition-all duration-150 cursor-pointer active:scale-95 active:opacity-80">exam selection</Link> page.
                                    </p>
                                </div>
                            )}
                        </div>
                    )}

                    {!isMaintenanceMode && (
                        /* Info Box */
                        <div className="mt-6 bg-linear-to-b from-white to-green-100 border border-green-200 rounded-2xl p-4 hover:bg-green-100 hover:border-green-300 transition-all duration-300 group">
                            <p className="text-sm text-green-800">
                                <strong>📝 Note:</strong> Use your official BECE exam number from your school.
                            </p>
                        </div>
                    )}

                    {/* Copyright Footer */}
                    <div className="mt-6 text-center">
                        <p className="text-xs text-gray-600">
                            © {new Date().getFullYear()} <Link href="/" target="_blank" className="text-gray-500 hover:text-gray-700 hover:underline">Imo State Ministry of Primary and Secondary Education</Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}
