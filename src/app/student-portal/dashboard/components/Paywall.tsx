'use client'
import React, { useState } from 'react'
import { IoLockClosedOutline, IoShieldCheckmarkOutline } from 'react-icons/io5'
import toast from 'react-hot-toast'
import { createPayment } from '../../utils/api'
import { ExamTypeEnum } from '@/app/portal/store/api/authApi'

interface PaywallProps {
    examNo: string
    studentName: string
    school: string
}

export default function Paywall({ examNo, studentName, school }: PaywallProps) {
    const [isProcessing, setIsProcessing] = useState(false);

    const handlePayment = async () => {
        setIsProcessing(true)
        
        try {
            // Store return URL for redirect after payment
            localStorage.setItem('student-payment-return-url', '/student-portal/dashboard')
            
            const response = await createPayment(examNo, ExamTypeEnum.BECE);

            console.log({ response, authorizationUrl: response.authorizationUrl });
            
            if (response.authorizationUrl) {
                toast.success('Redirecting to payment gateway...')
                // Redirect to Paystack payment page
                window.location.href = response.authorizationUrl
            } else {
                throw new Error('Invalid payment response')
            }
        } catch (error) {
            console.error('Payment error:', error)
            toast.error('Failed to initiate payment. Please try again.')
            setIsProcessing(false)
        }
    }

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
            <div className="max-w-lg w-full">
                {/* Main Card */}
                <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                    
                    {/* Header - Minimal */}
                    <div className="px-8 pt-8 pb-6 text-center border-b border-gray-100">
                        <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-gray-100 mb-4">
                            <IoLockClosedOutline className="w-7 h-7 text-gray-600" />
                        </div>
                        <h1 className="text-xl font-semibold text-gray-900 mb-1">
                            Results Access Required
                        </h1>
                        <p className="text-sm text-gray-500">
                            Complete payment to view your BECE results
                        </p>
                    </div>

                    {/* Content */}
                    <div className="px-8 py-6">
                        
                        {/* Student Info - Cleaner */}
                        <div className="mb-6 space-y-2.5">
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-500">Name</span>
                                <span className="font-medium text-gray-900 capitalize">
                                    {studentName.toLowerCase()}
                                </span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-500">School</span>
                                <span className="font-medium text-gray-900 capitalize text-right max-w-[60%]">
                                    {school.toLowerCase()}
                                </span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-500">Exam Number</span>
                                <span className="font-mono text-xs font-medium text-gray-900 uppercase">
                                    {examNo}
                                </span>
                            </div>
                        </div>

                        {/* Divider */}
                        <div className="border-t border-gray-100 my-6"></div>

                        {/* Pricing - Clean */}
                        <div className="mb-6 text-center py-4">
                            <div className="flex items-baseline justify-center gap-1 mb-1">
                                <span className="text-4xl font-semibold text-green-800">₦3,000</span>
                            </div>
                            <p className="text-xs text-gray-500">
                                One-time payment · Lifetime access
                            </p>
                        </div>

                        {/* Divider */}
                        <div className="border-t border-gray-100 my-6"></div>
                        {/* Features - Minimal */}
                        <div className="mb-6">
                            <p className="text-xs uppercase tracking-wide font-medium text-gray-400 mb-3">
                                What&apos;s Included
                            </p>
                            <div className="space-y-2.5">
                                {[
                                    'Complete BECE results',
                                    'Official certificate download',
                                    'Print-ready format',
                                    'Unlimited access'
                                ].map((feature, index) => (
                                    <div key={index} className="flex items-center gap-2.5">
                                        <div className="w-1 h-1 rounded-full bg-gray-400"></div>
                                        <span className="text-sm text-gray-600">{feature}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Payment Button - Simple */}
                        <button
                            onClick={handlePayment}
                            disabled={isProcessing}
                            className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-3 px-4 rounded-lg transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed text-sm cursor-pointer"
                        >
                            {isProcessing ? (
                                <span className="flex items-center justify-center gap-2">
                                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                                    Processing...
                                </span>
                            ) : (
                                'Continue to Payment'
                            )}
                        </button>

                        {/* Security Note - Subtle */}
                        <div className="mt-4 flex items-center justify-center gap-1.5 text-xs text-gray-400">
                            <IoShieldCheckmarkOutline className="w-3.5 h-3.5" />
                            <span>Secure payment via Paystack</span>
                        </div>
                    </div>
                </div>

                {/* Footer Note - Minimal */}
                <div className="text-center mt-6">
                    <p className="text-xs text-gray-400">
                        Imo State Ministry of Primary Education - Nigeria
                    </p>
                </div>
            </div>
        </div>
    )
}
