'use client'

import React from 'react'

interface FlaggedAccountAlertProps {
  remainingAmount: number
  flagReason?: string
  onReconcile: () => void
}

export default function FlaggedAccountAlert({ 
  remainingAmount, 
  flagReason,
  onReconcile 
}: FlaggedAccountAlertProps) {
  return (
    <div className="mb-4 bg-orange-50 border border-orange-200 rounded-xl">
      <div className="p-4">
        <div className="flex items-start gap-3">
          {/* Icon */}
          <div className="flex-shrink-0">
            <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-semibold text-orange-900 mb-1">
              School's Account Restricted - Payment Required
            </h3>
            
            <p className="text-sm text-orange-800 mb-2">
              Outstanding balance: <span className="font-semibold">₦{remainingAmount.toLocaleString()}</span>
            </p>

            {flagReason && (
              <p className="text-xs text-orange-700 mb-2">
                {flagReason}
              </p>
            )}

            <p className="text-xs text-orange-700">
              Adding students, editing records, and purchasing points are temporarily disabled.
            </p>
          </div>

          {/* Action Button */}
          <div className="flex-shrink-0">
            <button
              onClick={onReconcile}
              className="px-4 py-2 bg-orange-600 text-white text-sm font-medium rounded-lg hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 transition-colors active:scale-95 cursor-pointer"
            >
              Reconcile
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
