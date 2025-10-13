'use client'

import React from 'react'

interface PaymentStatusModalProps {
  status: 'success' | 'failed' | null
  onClose: () => void
}

export default function PaymentStatusModal({ status, onClose }: PaymentStatusModalProps) {
  if (!status) return null

  const isSuccess = status === 'success'

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 text-center">
        {/* Success State */}
        {isSuccess && (
          <>
            <div className="mb-6">
              <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Payment Successful</h2>
              <p className="text-gray-600">
                Your payment has been received.
                <br />
                Continue to validation result
              </p>
            </div>
            
            <button
              onClick={onClose}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-lg transition-all duration-200 cursor-pointer active:scale-95 active:rotate-1"
            >
              Continue to Onboarding
            </button>
          </>
        )}

        {/* Failed State */}
        {!isSuccess && (
          <>
            <div className="mb-6">
              <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
                <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Payment Failed</h2>
              <p className="text-gray-600">
                Your payment could not be processed.
                <br />
                Please try again or contact support.
              </p>
            </div>
            
            <div className="space-y-3">
              <button
                onClick={onClose}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-lg transition-all duration-200 cursor-pointer active:scale-95 active:rotate-1"
              >
                Try Again
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
