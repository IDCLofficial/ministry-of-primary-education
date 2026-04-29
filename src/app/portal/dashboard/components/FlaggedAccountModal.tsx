'use client'

import React from 'react'

interface FlaggedAccountModalProps {
  isOpen: boolean
  onClose: () => void
  remainingAmount: number
  flagReason?: string
  onReconcile: () => void
}

export default function FlaggedAccountModal({
  isOpen,
  onClose,
  remainingAmount,
  flagReason,
  onReconcile
}: FlaggedAccountModalProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/75 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden border border-red-100">
        {/* Header */}
        <div className="px-6 pt-5 pb-4 border-b border-red-100 bg-red-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
              <span className="text-xs font-semibold tracking-widest text-red-600 uppercase">
                Account Flagged
              </span>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors rounded-full p-1 hover:bg-white/50 cursor-pointer"
              aria-label="Close"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Icon */}
        <div className="flex flex-col items-center pt-8 pb-2 px-6">
          <div className="relative mb-6">
            {/* Outer pulse ring */}
            <div className="absolute inset-0 rounded-full bg-red-200 animate-ping opacity-75" style={{ margin: '-10px' }} />
            {/* Warning icon */}
            <div className="relative bg-red-100 rounded-full p-4">
              <svg className="w-12 h-12 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
          </div>

          {/* Title */}
          <h2 className="text-2xl font-bold text-gray-900 mb-1 tracking-tight">
            Payment Issue Detected
          </h2>
          <p className="text-sm text-gray-500 mb-5 text-center leading-relaxed max-w-xs">
            A glitch occurred with your last payment. Please complete the remaining balance to continue.
          </p>

          {/* Remaining Amount */}
          <div className="w-full mb-5 p-4 rounded-xl border-2 border-red-200 bg-red-50">
            <p className="text-xs text-center text-red-800 font-medium mb-2">Outstanding Balance</p>
            <div className="text-center">
              <span className="text-3xl font-black text-red-700">₦{remainingAmount.toLocaleString()}</span>
            </div>
          </div>

          {/* Reason */}
          {flagReason && (
            <div className="w-full mb-5 p-3 rounded-lg bg-gray-50 border border-gray-200">
              <p className="text-xs text-gray-600 font-medium mb-1">Reason:</p>
              <p className="text-sm text-gray-800">{flagReason}</p>
            </div>
          )}

          {/* Info message */}
          <div className="w-full mb-5 p-3 rounded-lg bg-yellow-50 border border-yellow-200">
            <div className="flex items-start gap-2">
              <svg className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <p className="text-xs font-medium text-yellow-800 mb-1">Actions Temporarily Disabled</p>
                <p className="text-xs text-yellow-700">
                  Adding students and purchasing points are disabled until this balance is settled.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 pb-6 flex flex-col gap-3">
          <button
            onClick={onReconcile}
            className="w-full px-4 py-3 rounded-lg text-sm font-semibold text-white bg-red-600 hover:bg-red-700 active:scale-95 transition-all duration-150 shadow-sm shadow-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 flex items-center justify-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Reconcile Payment
          </button>
          <button
            onClick={onClose}
            className="w-full px-4 py-2.5 rounded-lg text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 active:scale-95 transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-400"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}
