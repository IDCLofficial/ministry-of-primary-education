'use client'

import React from 'react'

interface CostSummaryProps {
  studentsSelected: number
  feePerStudent: number
  totalFee: number
  onProceedToPayment: () => void
}

export default function CostSummary({ 
  studentsSelected, 
  feePerStudent, 
  totalFee, 
  onProceedToPayment 
}: CostSummaryProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0
    }).format(amount)
  }

  return (
    <div className="bg-white rounded-xl shadow-lg shadow-black/2 border border-black/10 p-6">
      <h3 className="text-lg font-semibold text-gray-800 mb-6">Cost Summary</h3>
      
      <div className="space-y-4">
        {/* Students Selected */}
        <div className="flex flex-col">
          <div className="text-2xl font-bold text-gray-900">{studentsSelected}</div>
          <div className="text-sm text-gray-600">Students Selected</div>
        </div>

        {/* Fee Per Student */}
        <div className="flex flex-col">
          <div className="text-lg font-semibold text-gray-800">
            {formatCurrency(feePerStudent)}
          </div>
          <div className="text-sm text-gray-600">Fee Per Student</div>
        </div>

        {/* Divider */}
        <div className="border-t border-gray-200 my-4"></div>

        {/* Total Fee */}
        <div className="flex flex-col">
          <div className="text-xl font-bold text-gray-900">
            {formatCurrency(totalFee)}
          </div>
          <div className="text-sm text-gray-600">Total Fee</div>
        </div>

        {/* Proceed Button */}
        <button
          onClick={onProceedToPayment}
          disabled={studentsSelected === 0}
          className="w-full mt-6 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200"
        >
          Proceed to Payment
        </button>
      </div>
    </div>
  )
}
