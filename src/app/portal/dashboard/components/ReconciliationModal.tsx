'use client'

import React, { useState } from 'react'
import { useReconcileBalancePaymentMutation } from '../../store/api/authApi'
import toast from 'react-hot-toast'
import useShortcuts from '@useverse/useshortcuts'
import { setSecureItem } from '@/app/result-checking/utils/secureStorage'

interface ReconciliationModalProps {
  isOpen: boolean
  onClose: () => void
  remainingAmount: number
  flagReason?: string
  examType: string
  numberOfStudents: number
  schoolId: string
}

export default function ReconciliationModal({ 
  isOpen, 
  onClose, 
  remainingAmount,
  flagReason,
  examType,
  numberOfStudents,
  schoolId
}: ReconciliationModalProps) {
  const [reconcilePayment, { isLoading }] = useReconcileBalancePaymentMutation()
  const [amountPaid, setAmountPaid] = useState(remainingAmount)

  // Handle ESC key to close modal
  useShortcuts({
    shortcuts: [
      { key: 'Escape', enabled: isOpen && !isLoading }
    ],
    onTrigger: () => {
      if (isOpen && !isLoading) {
        onClose()
      }
    }
  })

  if (!isOpen) return null

  const handleReconcile = async () => {
    try {
      const result = await reconcilePayment({
        examType,
        numberOfStudents,
        amountPaid,
        flagReason: flagReason || 'Payment reconciliation',
        schoolId
      }).unwrap()

      // Redirect to Paystack payment page
      if (result.authorizationUrl) {
        await setSecureItem('payment-return-url', window.location.href)
        window.location.href = result.authorizationUrl
      } else {
        toast.error('Payment authorization URL not received')
      }
    } catch (error: any) {
      toast.error(error?.data?.message || 'Failed to reconcile payment. Please try again.')
      console.error('Reconciliation error:', error)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/75 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto relative">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 sticky top-0 z-50 bg-white/50 backdrop-blur-lg shadow-lg shadow-black/5">
          <h2 className="text-xl font-semibold text-gray-900">Payment Reconciliation Required</h2>
          <button 
            onClick={onClose} 
            className="text-gray-400 active:scale-95 cursor-pointer hover:text-gray-600 transition-all duration-200"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-">
          {/* Alert Icon */}
          <div className="flex p-6 flex-col items-center mb-6">
            <div className="relative mb-4">
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center">
                <svg className="w-8 h-8 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
            </div>
            
            <h3 className="text-lg font-bold text-gray-900 mb-2 text-center">Payment Discrepancy Detected</h3>
            <p className="text-sm text-gray-600 text-center leading-relaxed">
              A glitch occurred during your last payment transaction. We need you to pay the remaining balance to continue using the portal.
            </p>
          </div>

          {/* Reason Section */}
          {flagReason && (
            <div className="mb-6 mx-4 p-4 bg-orange-50 border border-orange-200 rounded-lg">
              <div className="flex items-start gap-3">
                <svg className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div className="flex-1">
                  <h4 className="text-sm font-semibold text-orange-900 mb-1">Reason</h4>
                  <p className="text-sm text-orange-800 leading-relaxed">
                    {flagReason}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Amount Due */}
          <div className="mb-6 mx-4 p-4 bg-red-50 border-2 border-red-200 rounded-lg">
            <div className="text-center">
              <p className="text-sm text-red-600 font-medium mb-2">Outstanding Balance</p>
              <p className="text-3xl font-bold text-red-700">₦{remainingAmount.toLocaleString()}</p>
            </div>
          </div>

          {/* Information Box */}
          <div className="mb-6 mx-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-start gap-3">
              <svg className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
              <div>
                <p className="text-sm font-medium text-blue-900 mb-1">What this means</p>
                <p className="text-sm text-blue-800 leading-relaxed">
                  Until this balance is reconciled, you won&apos;t be able to add new students or purchase additional points. Your existing students and data remain safe.
                </p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 p-4 sticky bottom-0 bg-white shadow-[0_-4px_12px_rgba(0,0,0,0.08)]">
            <button 
              onClick={onClose}
              className="flex-1 px-4 py-2 active:scale-95 cursor-pointer border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 transition-all duration-200"
            >
              Close
            </button>
            <button 
              onClick={handleReconcile}
              disabled={isLoading}
              className="flex-1 px-4 py-2 active:scale-95 cursor-pointer border border-transparent rounded-md text-sm font-medium text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 transition-all duration-200 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Processing...
                </>
              ) : (
                <>
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Reconcile Payment
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
