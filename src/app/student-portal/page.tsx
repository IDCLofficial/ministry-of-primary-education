'use client'
import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { IoPersonCircle, IoLockClosed } from 'react-icons/io5'
import toast from 'react-hot-toast'
import Lottie from 'lottie-react'
import animationData from './assets/students.json'
import Image from 'next/image'

export default function StudentLoginPage() {
    const router = useRouter()
    const [examNo, setExamNo] = useState('')
    const [isLoading, setIsLoading] = useState(false)

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault()
        
        if (!examNo.trim()) {
            toast.error('Please enter your exam number')
            return
        }

        setIsLoading(true)

        // Simulate API call with demo data
        setTimeout(() => {
            // Store exam number in localStorage for demo
            localStorage.setItem('student_exam_no', examNo)
            toast.success('Login successful!')
            router.push('/student-portal/dashboard')
            setIsLoading(false)
        }, 1000)
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
                            <label htmlFor="examNo" className="block text-sm font-medium text-gray-700 mb-2 group-hover:text-blue-600 transition-colors duration-200">
                                Exam Number
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <IoPersonCircle className="h-5 w-5 text-gray-400 group-hover:text-blue-500 group-hover:scale-110 transition-all duration-200" />
                                </div>
                                <input
                                    type="text"
                                    id="examNo"
                                    value={examNo}
                                    onChange={(e) => setExamNo(e.target.value.toUpperCase())}
                                    placeholder="Enter your exam number"
                                    className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent hover:border-blue-400 transition-all duration-200"
                                    disabled={isLoading}
                                />
                            </div>
                            <p className="mt-2 text-xs text-gray-500">
                                Demo: Use any exam number (e.g., BECE2024001)
                            </p>
                        </div>

                        {/* Login Button */}
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full flex items-center justify-center px-4 py-3 border border-transparent text-base font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 cursor-pointer active:scale-95 active:opacity-90 group"
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
                                className="text-blue-600 hover:text-blue-700 font-medium transition-all duration-150 cursor-pointer active:scale-95 active:opacity-80"
                            >
                                Contact Support
                            </a>
                        </p>
                    </div>
                </div>

                {/* Info Box */}
                <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4 hover:bg-blue-100 hover:border-blue-300 transition-all duration-300 cursor-pointer group">
                    <p className="text-sm text-blue-800">
                        <strong>Note:</strong> This is a demo portal. In production, you would need your official exam number provided by your school.
                    </p>
                </div>
            </div>
        </div>
    )
}
