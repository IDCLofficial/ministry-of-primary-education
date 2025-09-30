'use client'

import React, { useEffect, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { useAuth } from '../../providers/AuthProvider'
import { useVerifyPaymentQuery } from '../../store/api/authApi'

export default function PaymentCallbackPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const { school } = useAuth()
  
  const [paymentDetails, setPaymentDetails] = useState<{
    reference: string
    trxref: string
    amount?: number
    numberOfStudents?: number
  } | null>(null)
  const [countdown, setCountdown] = useState<number | null>(null)

  // Get reference from URL parameters
  const trxref = searchParams.get('trxref')
  const reference = searchParams.get('reference')

  // Use query hook to verify payment
  const { 
    data: verificationResponse, 
    isLoading, 
    error 
  } = useVerifyPaymentQuery(reference || '', {
    skip: !reference // Skip query if no reference
  })

  useEffect(() => {
    if (!trxref || !reference) {
      return
    }

    setPaymentDetails({
      reference,
      trxref
    })
  }, [trxref, reference])

  // Update payment details when verification response is received
  useEffect(() => {
    if (verificationResponse?.success && verificationResponse.data.paymentStatus === 'successful') {
      setPaymentDetails(prev => prev ? {
        ...prev,
        amount: verificationResponse.data.totalAmount,
        numberOfStudents: verificationResponse.data.numberOfStudents
      } : null)
    }
  }, [verificationResponse])

  // Determine current status
  const getStatus = () => {
    if (!reference || !trxref) return 'failed'
    if (isLoading) return 'processing'
    if (error) return 'failed'
    if (verificationResponse?.success && verificationResponse.data.paymentStatus === 'successful') {
      return 'success'
    }
    return 'failed'
  }

  const status = getStatus()

  // Auto-redirect after 5 seconds when result is obtained
  useEffect(() => {
    if (status === 'success' || status === 'failed') {
      setCountdown(5)
      
      const timer = setInterval(() => {
        setCountdown(prev => {
          if (prev === null || prev <= 1) {
            clearInterval(timer)
            return null
          }
          return prev - 1
        })
      }, 1000)

      return () => clearInterval(timer)
    }
  }, [status])

  // Separate effect for handling redirect when countdown reaches 0
  useEffect(() => {
    if (countdown === 0) {
      // Use setTimeout to ensure redirect happens after render
      const redirectTimer = setTimeout(() => {
        if (status === 'success') {
          router.push('/portal/dashboard?payment=success')
        } else {
          router.push('/portal/dashboard')
        }
      }, 0)

      return () => clearTimeout(redirectTimer)
    }
  }, [countdown, status, router])

  const handleContinue = () => {
    // Redirect to dashboard with success status
    router.push('/portal/dashboard?payment=success')
  }

  const handleRetry = () => {
    // Redirect back to dashboard
    router.push('/portal/dashboard')
  }

  if (status === 'processing') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-6"></div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Processing Payment</h2>
          <p className="text-gray-600 mb-4">Please wait while we verify your payment...</p>
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-sm text-gray-600 mb-1">Transaction Reference</p>
            <p className="font-mono text-sm text-gray-900">{paymentDetails?.reference}</p>
          </div>
        </div>
      </div>
    )
  }

  if (status === 'success') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Payment Successful!</h2>
          <p className="text-gray-600 mb-4">Your student payment has been processed successfully.</p>
          
          {countdown !== null && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-6">
              <p className="text-sm text-blue-800">
                Redirecting to dashboard in <span className="font-semibold">{countdown}</span> seconds...
              </p>
            </div>
          )}
          
          <div className="bg-green-50 rounded-lg p-4 mb-6 text-left">
            <h3 className="font-semibold text-green-800 mb-3">Payment Details</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-green-700">School:</span>
                <span className="font-medium text-green-900 capitalize">
                  {school?.schoolName?.toLowerCase()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-green-700">Students:</span>
                <span className="font-medium text-green-900">
                  {paymentDetails?.numberOfStudents?.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-green-700">Amount:</span>
                <span className="font-medium text-green-900">
                  ₦{paymentDetails?.amount?.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-green-700">Reference:</span>
                <span className="font-mono text-xs text-green-900">
                  {paymentDetails?.reference}
                </span>
              </div>
            </div>
          </div>
          
          <button
            onClick={handleContinue}
            className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors duration-200"
          >
            Continue to Dashboard
          </button>
        </div>
      </div>
    )
  }

  // Failed state
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full text-center">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </div>
        
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Payment Failed</h2>
        <p className="text-gray-600 mb-4">
          We couldn&apos;t process your payment. This could be due to insufficient funds, network issues, or other payment gateway problems.
        </p>
        
        {countdown !== null && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
            <p className="text-sm text-blue-800">
              Redirecting to dashboard in <span className="font-semibold">{countdown}</span> seconds...
            </p>
          </div>
        )}
        
        <div className="bg-red-50 rounded-lg p-4 mb-6">
          <p className="text-sm text-red-800">
            If you were charged, don&apos;t worry. The amount will be refunded within 3-5 business days.
          </p>
        </div>
        
        <div className="space-y-3">
          <button
            onClick={handleRetry}
            className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors duration-200"
          >
            Try Again
          </button>
          <button
            onClick={() => router.push('/portal/dashboard')}
            className="w-full bg-gray-200 text-gray-800 py-3 px-4 rounded-lg font-medium hover:bg-gray-300 transition-colors duration-200"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    </div>
  )
}
