'use client'
import React, { useState, useMemo } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { IoPersonCircle, IoLockClosed, IoCalendarOutline, IoSwapHorizontal } from 'react-icons/io5'
import toast from 'react-hot-toast'
import Lottie from 'lottie-react'
import animationData from '../assets/students.json'
import Image from 'next/image'
import { useDebounce } from '../../portal/utils/hooks/useDebounce'
import Link from 'next/link'
import CustomDropdown from '@/app/portal/dashboard/components/CustomDropdown'
import { useGetSchoolNamesQuery } from '@/app/portal/store/api/authApi'
import { useLazyGetUBEATResultQuery, useFindUBEATResultMutation } from '../store/api/studentApi'

// Regex pattern for exam number validation (e.g., XX/000/000)
const EXAM_NO_REGEX = /^[a-zA-Z]{2}\/\d{3,4}\/\d{3,4}(\(\d\))?$/
// Regex pattern for exam number validation (e.g., XX/000/0000/000)
const EXAM_NO_REGEX_02 = /^[a-zA-Z]{2}\/\d{3,4}\/\d{4}\/\d{3,4}$/
// Regex pattern for exam number validation (e.g., XX/XX/000/0000)
const EXAM_NO_REGEX_03 = /^[a-zA-Z]{2}\/[a-zA-Z]{2}\/\d{3,4}\/\d{3,4}$/

// Imo State LGAs
const IMO_STATE_LGAS = [
    'Aboh Mbaise',
    'Ahiazu Mbaise',
    'Ehime Mbano',
    'Ezinihitte',
    'Ideato North',
    'Ideato South',
    'Ihitte/Uboma',
    'Ikeduru',
    'Isiala Mbano',
    'Isu',
    'Mbaitoli',
    'Ngor Okpala',
    'Njaba',
    'Nkwerre',
    'Nwangele',
    'Obowo',
    'Oguta',
    'Ohaji/Egbema',
    'Okigwe',
    'Onuimo',
    'Orlu',
    'Orsu',
    'Oru East',
    'Oru West',
    'Owerri Municipal',
    'Owerri North',
    'Owerri West'
]

// Alternative form data
interface AlternativeFormData {
    fullName: string
    schoolName: string
    lga: string
    examYear: string
}

export default function UBEATLoginPage() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const [examNo, setExamNo] = useState('')
    const [error, setError] = useState('')
    
    // Read form type from URL search params
    const showAlternativeForm = searchParams.get('form') === 'alternative'
    
    // Alternative form states
    const [altFormData, setAltFormData] = useState<AlternativeFormData>({
        fullName: '',
        schoolName: '',
        lga: '',
        examYear: new Date().getFullYear().toString()
    })
    // RTK Query hooks
    const [getUBEATResult, { isLoading }] = useLazyGetUBEATResultQuery()
    const [findUBEATResult, { isLoading: isFindingResult }] = useFindUBEATResultMutation()
    
    // Combined loading state for alternative form
    const isProcessingPayment = isFindingResult

    // Fetch school names based on selected LGA
    const { data: schoolNames, isLoading: isLoadingSchoolNames, isFetching } = useGetSchoolNamesQuery(
        { lga: altFormData.lga },
        { skip: !altFormData.lga }
    )

    // Memoized school names list
    const schoolNamesList = useMemo(() => {
        if (!schoolNames) return []
        return schoolNames
    }, [schoolNames])

    // LGA options for dropdown
    const lgaOptions = useMemo(() => {
        return IMO_STATE_LGAS.map(lga => ({ value: lga, label: lga }))
    }, [])

    const debouncedExamNo = useDebounce(examNo, 500)

    const canProceed = debouncedExamNo.length >= 10 && (EXAM_NO_REGEX.test(debouncedExamNo) || EXAM_NO_REGEX_02.test(debouncedExamNo) || EXAM_NO_REGEX_03.test(debouncedExamNo))
    const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL
    const isMaintenanceMode = !API_BASE_URL

    // Check if alternative form is valid
    const isAltFormValid = altFormData.fullName.trim().length >= 3 &&
        altFormData.schoolName.trim().length >= 3 &&
        altFormData.lga.trim().length >= 2 &&
        altFormData.examYear.trim().length === 4 &&
        !isLoadingSchoolNames &&
        !isFetching

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault()
        setError('')

        if (!examNo.trim()) {
            setError('Oops! Please enter your exam number to continue')
            return
        }

        // Validate exam number format
        if (!EXAM_NO_REGEX.test(examNo) && !EXAM_NO_REGEX_02.test(examNo) && !EXAM_NO_REGEX_03.test(examNo)) {
            setError('Hmm, that doesn\'t look right. Please use format: xx/000/000 or xx/000/000(0) (e.g., ok/977/2025 or ok/977/2025(1))')
            return
        }

        try {
            const result = await getUBEATResult(examNo).unwrap()

            // Validate data structure
            if (!result || !result.examNumber || !result.studentName) {
                console.error('Invalid data structure:', result)
                setError('We couldn\'t load your results. Please try again or contact support.')
                return
            }

            // Store only exam number and exam type (data will be fetched via RTK Query in dashboard)
            localStorage.setItem('student_exam_no', examNo)
            localStorage.setItem('selected_exam_type', 'ubeat')

            toast.success(`Welcome ${result.studentName}! Loading your results... 🎉`)
            router.push('/student-portal/ubeat/dashboard')
        } catch (error: unknown) {
            const errorObject = error as { status: string | number }
            console.error('Login error:', error)

            // Handle RTK Query errors
            if (errorObject.status === 404) {
                setError('We couldn\'t find your results. Please check your exam number and try again.')
            } else if (errorObject.status === 400) {
                setError('This exam number doesn\'t seem valid. Please double-check and try again.')
            } else if (errorObject.status === 500) {
                setError('Our system is having a moment. Please try again in a few minutes.')
            } else if (errorObject.status === 'FETCH_ERROR') {
                setError('Network error: Unable to connect to server. Please check your internet connection.')
            } else if (errorObject.status === 'PARSING_ERROR') {
                setError('Server returned invalid data. Please try again.')
            } else {
                setError('We\'re having trouble connecting. Please check your internet and try again.')
            }
        }
    }

    const handleAlternativeFormSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!isAltFormValid) {
            toast.error('Please fill in all fields correctly')
            return
        }

        try {
            const result = await findUBEATResult({
                schoolId: altFormData.schoolName,
                examYear: parseInt(altFormData.examYear),
                studentName: altFormData.fullName,
                lga: altFormData.lga
            }).unwrap()

            // Validate data structure
            if (!result || !result.examNumber || !result.studentName) {
                console.error('Invalid data structure:', result)
                setError('We couldn\'t load your results. Please try again or contact support.')
                return
            }

            // Store only exam number and exam type (data will be fetched via RTK Query in dashboard)
            localStorage.setItem('student_exam_no', result.examNumber)
            localStorage.setItem('selected_exam_type', 'ubeat')

            toast.success(`Welcome ${result.studentName}! Loading your results... 🎉`)
            router.push('/student-portal/ubeat/dashboard')
        } catch (error: unknown) {
            const errorObject = error as { status: string | number }
            console.error('Find result error:', error)

            // Handle RTK Query errors
            if (errorObject.status === 404) {
                setError('We couldn\'t find your results with the provided information. Please check your details and try again.')
            } else if (errorObject.status === 400) {
                setError('Invalid information provided. Please double-check your details.')
            } else if (errorObject.status === 500) {
                setError('Our system is having a moment. Please try again in a few minutes.')
            } else if (errorObject.status === 'FETCH_ERROR') {
                setError('Network error: Unable to connect to server. Please check your internet connection.')
            } else if (errorObject.status === 'PARSING_ERROR') {
                setError('Server returned invalid data. Please try again.')
            } else {
                setError('We\'re having trouble finding your results. Please check your information and try again.')
            }
        }
    }

    const toggleForm = () => {
        const params = new URLSearchParams(searchParams.toString())

        if (showAlternativeForm) {
            // Going back to exam number form - remove the param
            params.delete('form')
        } else {
            // Going to alternative form - add the param
            params.set('form', 'alternative')
        }

        // Update URL with new params
        router.push(`?${params.toString()}`)

        // Reset form states
        setError('')
        setExamNo('')
        setAltFormData({
            fullName: '',
            schoolName: '',
            lga: '',
            examYear: new Date().getFullYear().toString()
        })
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
                                <abbr title="Universal Basic Education Achievement Test" className="no-underline">UBEAT</abbr>
                            </span>
                        </div>
                        <p className='text-sm md:text-base text-gray-600 max-w-md'>
                            Universal Basic Education Achievement Test
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
                                    {showAlternativeForm
                                        ? "Don't worry! You can still access your UBEAT results by providing your basic information below."
                                        : "We're excited to share your UBEAT (Universal Basic Education Achievement Test) results with you. Simply enter your exam number below to get started."
                                    }
                                </p>
                            </div>

                            {!showAlternativeForm ? (
                                /* Standard Exam Number Form */
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

                                    {/* Toggle to Alternative Form */}
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
                            ) : (
                                /* Alternative Form (Name, School, LGA, Year) */
                                <form onSubmit={handleAlternativeFormSubmit} className="space-y-4">
                                    {/* Full Name */}
                                    <div className="group">
                                        <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-2">
                                            Full Name
                                        </label>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                <IoPersonCircle className="h-5 w-5 text-gray-400" />
                                            </div>
                                            <input
                                                type="text"
                                                id="fullName"
                                                value={altFormData.fullName}
                                                onChange={(e) => setAltFormData({ ...altFormData, fullName: e.target.value })}
                                                placeholder="Enter your full name"
                                                className="block w-full pl-10 pr-3 py-2 text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent hover:border-green-400 transition-all duration-200"
                                                disabled={isProcessingPayment}
                                            />
                                        </div>
                                    </div>

                                    {/* LGA */}
                                    <div className="group relative">
                                        <label htmlFor="lga" className="block text-sm font-medium text-gray-700 mb-2">
                                            Local Government Area (LGA) <span className="text-red-500">*</span>
                                        </label>
                                        <CustomDropdown
                                            options={lgaOptions}
                                            value={altFormData.lga}
                                            onChange={(value) => setAltFormData({ ...altFormData, lga: value, schoolName: '' })}
                                            placeholder="Select LGA"
                                        />
                                    </div>

                                    {/* School Name */}
                                    <div className="group relative">
                                        <label htmlFor="schoolName" className="block text-sm font-medium text-gray-700 mb-2">
                                            School Name <span className="text-red-500">*</span>
                                        </label>
                                        {(isLoadingSchoolNames || isFetching) ? (
                                            <div className="w-full bg-gray-100 border border-gray-300 rounded-lg px-3 py-2 text-sm">
                                                <div className="flex items-center gap-2">
                                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-green-600"></div>
                                                    {altFormData.lga ? <span className="text-gray-500">Loading {altFormData.lga} schools...</span> : <span className="text-gray-500">Loading schools...</span>}
                                                </div>
                                            </div>
                                        ) : !altFormData.lga ? (
                                            <div className="w-full bg-gray-50 border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-500">
                                                Please select an LGA first
                                            </div>
                                        ) : schoolNamesList.length === 0 ? (
                                            <div className="w-full bg-gray-50 border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-500">
                                                No schools available for the selected LGA
                                            </div>
                                        ) : (
                                            <CustomDropdown
                                                options={schoolNamesList.map(school => ({
                                                    value: school._id,
                                                    label: String(school.schoolName).startsWith('"') ? String(school.schoolName).slice(1) : school.schoolName
                                                }))}
                                                value={altFormData.schoolName}
                                                onChange={(value) => setAltFormData({ ...altFormData, schoolName: value })}
                                                placeholder="Select a school"
                                                searchable
                                                searchPlaceholder="Search school name..."
                                            />
                                        )}
                                    </div>

                                    {/* Exam Year */}
                                    <div className="group">
                                        <label htmlFor="examYear" className="block text-sm font-medium text-gray-700 mb-2">
                                            Exam Year
                                        </label>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                <IoCalendarOutline className="h-5 w-5 text-gray-400" />
                                            </div>
                                            <input
                                                type="text"
                                                id="examYear"
                                                value={altFormData.examYear}
                                                onChange={(e) => setAltFormData({ ...altFormData, examYear: e.target.value })}
                                                placeholder="e.g., 2025"
                                                maxLength={4}
                                                className="block w-full pl-10 pr-3 py-2 text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent hover:border-green-400 transition-all duration-200"
                                                disabled={isProcessingPayment}
                                            />
                                        </div>
                                    </div>

                                    {/* Payment Info Banner */}
                                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                        <div className="flex gap-3">
                                            <div className="flex-shrink-0">
                                                <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                                                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                                                </svg>
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium text-blue-900 mb-1">Payment Required</p>
                                                <p className="text-xs text-blue-700">
                                                    A small fee of ₦500 is required to access your results using this method. You&apos;ll be redirected to our secure payment gateway.
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Submit Button */}
                                    <button
                                        type="submit"
                                        disabled={isProcessingPayment || !isAltFormValid}
                                        className={
                                            `w-full flex items-center justify-center px-4 py-3 border border-transparent text-base font-medium rounded-lg text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 cursor-pointer active:opacity-90
                                             ${isProcessingPayment || !isAltFormValid ? 'opacity-50 cursor-not-allowed' : 'shadow-[0_4px_rgba(0,0,0,0.25)] active:shadow-[0_0px_rgba(0,0,0,1)] active:translate-y-2'}
                                             `
                                        }
                                    >
                                        {isProcessingPayment ? (
                                            <>
                                                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                                                Finding your results...
                                            </>
                                        ) : (
                                            <>
                                                Find My Results
                                            </>
                                        )}
                                    </button>

                                    {/* Toggle back to Exam Number Form */}
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
                                        Go back to the <Link href="/student-portal" className="text-green-600 hover:text-green-700 font-medium transition-all duration-150 cursor-pointer active:scale-95 active:opacity-80">exam selection</Link> page.
                                    </p>
                                </div>
                            )}
                        </div>
                    )}

                    {!isMaintenanceMode && !showAlternativeForm && (
                        /* Info Box */
                        <div className="mt-6 bg-linear-to-b from-white to-green-100 border border-green-200 rounded-2xl p-4 hover:bg-green-100 hover:border-green-300 transition-all duration-300 group">
                            <p className="text-sm text-green-800">
                                <strong>📝 Note:</strong> Use your official UBEAT exam number from your school.
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
