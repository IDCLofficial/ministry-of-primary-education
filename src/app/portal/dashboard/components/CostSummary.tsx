'use client'

import React from 'react'
import { useAuth } from '../../providers/AuthProvider'
import CostSummarySkeleton from './CostSummarySkeleton'
import { useGetProfileQuery } from '../../store/api/authApi'

interface CostSummaryProps {
  examPoints: number
  examTotalPoints: number
  pointCost: number
}

export default function CostSummary({
  examPoints,
  examTotalPoints,
  pointCost
}: CostSummaryProps) {
  const { school, isLoading } = useAuth()
  const { isFetching: isAdminProfileFetching } = useGetProfileQuery()
  const isUpdating = isAdminProfileFetching && !isLoading

  // Show skeleton while loading
  if (isLoading || !school) {
    return <CostSummarySkeleton />
  }

  // Calculate exam-specific values
  const examAvailablePoints = examPoints
  const examUsedPoints = examTotalPoints - examPoints
  const accumulatedFee = examUsedPoints * pointCost + (2000)

  return (
    <div className="bg-white rounded-xl shadow-lg shadow-black/2 border border-black/10 p-6 relative">
      {/* Loading Overlay */}
      {isUpdating && (
        <div className="absolute inset-0 bg-white/80 backdrop-blur-sm z-10 flex items-center justify-center rounded-xl">
          <div className="flex flex-col items-center gap-3">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
            <p className="text-xs font-medium text-gray-600">Updating...</p>
          </div>
        </div>
      )}
      <div className="space-y-3">
        {/* Top Row - 3 columns */}
        <div className="grid grid-cols-3 gap-2">
          {/* Used Points */}
          <div className="text-center bg-purple-50 rounded-lg p-3 border border-purple-100">
            <div className="text-xs text-purple-600 mb-1">Used</div>
            <div className="text-lg font-bold text-purple-900">{examUsedPoints.toLocaleString()}</div>
          </div>

          {/* Remaining Points */}
          <div className="text-center bg-green-50 rounded-lg p-3 border border-green-100">
            <div className="text-xs text-green-600 mb-1">Remaining</div>
            <div className="text-lg font-bold text-green-900">{examAvailablePoints.toLocaleString()}</div>
          </div>

          {/* Total Points */}
          <div className="text-center bg-blue-50 rounded-lg p-3 border border-blue-100">
            <div className="text-xs text-blue-600 mb-1">Total</div>
            <div className="text-lg font-bold text-blue-900">{examTotalPoints.toLocaleString()}</div>
          </div>
        </div>

        {/* Bottom Row - 2 columns */}
        <div className="grid grid-cols-1 gap-2">
          {/* Accumulated Fee */}
          <div className="text-center bg-gray-50 rounded-lg p-3 border border-gray-200">
            <div className="text-xs text-gray-600 mb-1">Fee</div>
            <div className="text-lg font-bold text-gray-900">₦{accumulatedFee.toLocaleString()}</div>
          </div>
        </div>
      </div>
    </div>
  )
}