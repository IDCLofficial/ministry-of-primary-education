'use client'
import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { IoPersonCircle, IoLockClosed } from 'react-icons/io5'
import toast from 'react-hot-toast'
import Lottie from 'lottie-react'
import animationData from './assets/students.json'
import Image from 'next/image'

// Regex pattern for exam number validation (e.g., ok/977/2025/001)
const EXAM_NO_REGEX = /^[a-zA-Z]{2}\/\d{3}\/\d{4}\/\d{3}$/

export default function StudentLoginPage() {
    const router = useRouter()
    const [examNo, setExamNo] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState('')

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault()
        setError('')
        
        if (!examNo.trim()) {
            setError('Please enter your exam number')
            return
        }

        // Validate exam number format
        if (!EXAM_NO_REGEX.test(examNo)) {
            setError('Invalid format. Use format: xx/xxx/xxxx/xxx (e.g., ok/977/2025/001)')
            return
        }

        setIsLoading(true)

        try {
            const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://moe-backend-production-3842.up.railway.app'
            const response = await fetch(`${API_BASE_URL}/bece-student/check-result/${encodeURIComponent(examNo)}`, {
                method: 'GET',
                headers: {
                    'Accept': 'application/json',
                },
            })

            if (response.status !== 200) {
                if (response.status === 404) {
                    setError('404: Student not found')
                } else if (response.status === 400) {
                    setError('400: Invalid exam number')
                } else if (response.status === 500) {
                    setError('500: Server error')
                } else {
                    setError('Something went wrong')
                }
                
                console.error('Login failed:', { status: response.status })
                setIsLoading(false)
                return
            }

            const data = await response.json()
            if (!data || !data.examNo) {
                setError('Something went wrong')
                setIsLoading(false)
                return
            }

            localStorage.setItem('student_exam_no', examNo)
            toast.success('Login successful!')
            router.push('/student-portal/dashboard')
        } catch (error) {
            console.error('Login error:', error)
            setError('Something went wrong')
            setIsLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-[#F3F3F3] flex items-center justify-center p-4 relative overflow-hidden">
            <div className='absolute h-full w-full inset-0 z-[0]'>
                <Image
                    src="/images/asset.png"
                    alt="logo"
                    fill
                    className='object-cover hue-rotate-[0deg] saturate-200 brightness-[0.75] scale-x-[-1]'
                    title='Imo State Ministry of Primary and Secondary Education logo'
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

            <div className="w-full max-w-md relative z-10">

                {/* Login Card */}
                <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-8 animate-fadeIn-y hover:shadow-2xl transition-all duration-300">
                    <div className="mb-6">
                        <h2 className="text-xl font-semibold text-gray-900 mb-2">
                            Student Login
                        </h2>
                        <p className="text-sm text-gray-600">
                            Enter your exam number to access your results
                        </p>
                    </div>

                    <form onSubmit={handleLogin} className="space-y-6">
                        {/* Exam Number Input */}
                        <div className="group">
                            <label htmlFor="examNo" className="block text-sm font-medium text-gray-700 mb-2 group-hover:text-green-600 transition-colors duration-200">
                                Exam Number
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
                                    className={`block w-full pl-10 pr-3 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent hover:border-green-400 transition-all duration-200 ${
                                        error ? 'border-red-300 bg-red-50' : 'border-gray-300'
                                    }`}
                                    disabled={isLoading}
                                />
                            </div>
                            {error ? (
                                <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                    </svg>
                                    {error}
                                </p>
                            ) : (
                                <p className="mt-2 text-xs text-gray-500">
                                    Enter your examination number (e.g., ok/977/2025/001)
                                </p>
                            )}
                        </div>

                        {/* Login Button */}
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full flex items-center justify-center px-4 py-3 border border-transparent text-base font-medium rounded-lg text-white bg-green-600 hover:bg-green-700 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 cursor-pointer active:scale-95 active:opacity-90 group"
                        >
                            {isLoading ? (
                                <>
                                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                                    Logging in...
                                </>
                            ) : (
                                <>
                                    <IoLockClosed className="w-5 h-5 mr-2 group-hover:animate-bounce" />
                                    Access Results
                                </>
                            )}
                        </button>
                    </form>

                    {/* Footer */}
                    <div className="mt-6 pt-6 border-t border-gray-200">
                        <p className="text-xs text-center text-gray-500">
                            Having trouble accessing your results?{' '}
                            <a 
                                href="#" 
                                onClick={(e) => {
                                    e.preventDefault()
                                    toast('Support feature coming soon!', {
                                        icon: 'ℹ️',
                                    })
                                }}
                                className="text-green-600 hover:text-green-700 font-medium transition-all duration-150 cursor-pointer active:scale-95 active:opacity-80"
                            >
                                Contact Support
                            </a>
                        </p>
                    </div>
                </div>

                {/* Info Box */}
                <div className="mt-6 bg-green-50 border border-green-200 rounded-lg p-4 hover:bg-green-100 hover:border-green-300 transition-all duration-300 group">
                    <p className="text-sm text-green-800">
                        <strong>Note:</strong> Enter your official BECE examination number provided by your school to view your results.
                    </p>
                </div>
            </div>
        </div>
    )
}
