'use client'

import React, { useEffect, useMemo, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { verifyPayment } from '../utils/api'

export default function StudentPaymentCallbackPage() {
  const searchParams = useSearchParams()
  const router = useRouter()

  const [verificationStatus, setVerificationStatus] = useState<'processing' | 'success' | 'failed'>('processing')
  const [paymentDetails, setPaymentDetails] = useState<{
    reference: string
    trxref: string
    studentName?: string
    school?: string
  } | null>(null)
  const [countdown, setCountdown] = useState<number | null>(null)

  // Get reference from URL parameters
  const trxref = searchParams.get('trxref')
  const reference = searchParams.get('reference')

  const paymentReturnUrl = useMemo(() => 
    localStorage.getItem('student-payment-return-url') || '/student-portal/dashboard', 
    []
  )

  // Verify payment on mount
  useEffect(() => {
    const verifyStudentPayment = async () => {
      if (!reference) {
        setVerificationStatus('failed')
        return
      }

      try {
        const response = await verifyPayment(reference)
        
        if (response.paymentStatus === 'successful') {
          setVerificationStatus('success')
          setPaymentDetails({
            reference,
            trxref: trxref || '',
            studentName: response.studentName,
            school: response.school
          })
        } else {
          setVerificationStatus('failed')
        }
      } catch (error) {
        console.error('Payment verification error:', error)
        setVerificationStatus('failed')
      }
    }

    verifyStudentPayment()
  }, [reference, trxref])

  // Set initial payment details from URL
  useEffect(() => {
    if (trxref && reference) {
      setPaymentDetails(prev => ({
        reference,
        trxref,
        studentName: prev?.studentName,
        school: prev?.school
      }))
    }
  }, [trxref, reference])

  // Auto-redirect after 3 seconds when result is obtained
  useEffect(() => {
    if (verificationStatus === 'success' || verificationStatus === 'failed') {
      setCountdown(3)

      const timer = setInterval(() => {
        setCountdown(prev => {
          if (prev === null || prev <= 1) {
            clearInterval(timer)
            return 0
          }
          return prev - 1
        })
      }, 1000)

      return () => clearInterval(timer)
    }
  }, [verificationStatus])

  // Separate effect for handling redirect when countdown reaches 0
  useEffect(() => {
    if (countdown === 0) {
      if (verificationStatus === 'success') {
        router.replace(`${paymentReturnUrl}?payment=success`)
      } else {
        router.replace(`${paymentReturnUrl}?payment=failed`)
      }
    }
  }, [countdown, verificationStatus, router, paymentReturnUrl])

  const handleContinue = () => {
    router.replace(`${paymentReturnUrl}?payment=success`)
  }

  const handleRetry = () => {
    router.replace(paymentReturnUrl)
  }

  if (verificationStatus === 'processing') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-green-600 mx-auto mb-6"></div>
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

  if (verificationStatus === 'success') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>

          <h2 className="text-2xl font-bold text-gray-900 mb-2">Payment Successful!</h2>
          <p className="text-gray-600 mb-4">Your payment has been processed successfully. You can now access your BECE results.</p>

          {countdown !== null && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-6">
              <p className="text-sm text-green-800">
                Redirecting to your results in <span className="font-semibold">{countdown}</span> seconds...
              </p>
            </div>
          )}

          <div className="bg-green-50 rounded-lg p-4 mb-6 text-left">
            <h3 className="font-semibold text-green-800 mb-3">Payment Details</h3>
            <div className="space-y-2 text-sm">
              {paymentDetails?.studentName && (
                <div className="flex justify-between">
                  <span className="text-green-700">Student:</span>
                  <span className="font-medium text-green-900 capitalize">
                    {paymentDetails.studentName.toLowerCase()}
                  </span>
                </div>
              )}
              {paymentDetails?.school && (
                <div className="flex justify-between">
                  <span className="text-green-700">School:</span>
                  <span className="font-medium text-green-900 capitalize">
                    {paymentDetails.school.toLowerCase()}
                  </span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-green-700">Amount:</span>
                <span className="font-medium text-green-900">
                  ₦500
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
            className="w-full bg-green-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-green-700 transition-colors duration-200"
          >
            Continue to Results
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
          <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-4">
            <p className="text-sm text-green-800">
              Redirecting back in <span className="font-semibold">{countdown}</span> seconds...
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
            className="w-full bg-green-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-green-700 transition-colors duration-200"
          >
            Try Again
          </button>
          <button
            onClick={() => router.push('/student-portal')}
            className="w-full bg-gray-200 text-gray-800 py-3 px-4 rounded-lg font-medium hover:bg-gray-300 transition-colors duration-200"
          >
            Back to Login
          </button>
        </div>
      </div>
    </div>
  )
}
