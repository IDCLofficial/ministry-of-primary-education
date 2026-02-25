'use client'

import React from 'react'
import { useAuth } from '../../providers/AuthProvider'
import CostSummarySkeleton from './CostSummarySkeleton'
import { useGetProfileQuery } from '../../store/api/authApi'

interface CostSummaryProps {
  examPoints: number
  examTotalPoints: number
  pointCost: number
  examNumberOfStudents: number
  onPurchaseMorePoints: () => void
  isFetchingProfile?: boolean
}

export default function CostSummary({
  examPoints,
  examTotalPoints,
  pointCost,
  examNumberOfStudents,
  onPurchaseMorePoints,
  isFetchingProfile = false
}: CostSummaryProps) {
  const { school, isLoading } = useAuth()
  const { isFetching: isAdminProfileFetching } = useGetProfileQuery()
  const isUpdating = (isAdminProfileFetching && !isLoading) || isFetchingProfile

  // Show skeleton while loading
  if (isLoading || !school) {
    return <CostSummarySkeleton />
  }

  // Calculate exam-specific values
  const examAvailablePoints = examPoints
  const examUsedPoints = examTotalPoints - examPoints
  const amountPaid = examTotalPoints * pointCost

  const needsMorePoints = examTotalPoints < examNumberOfStudents

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

        {/* Accumulated Fee */}
        {examTotalPoints > 0 && <div className="grid grid-cols-1 gap-2">
          <div className="text-center bg-gray-50 rounded-lg p-3 border border-gray-200">
            <div className="text-xs text-gray-600 mb-1">Amount Paid</div>
            <div className="text-lg font-bold text-gray-900">₦{amountPaid.toLocaleString()}</div> 
          </div>
        </div>}

        {/* Purchase More Points Button */}
        {needsMorePoints && <div className="grid grid-cols-1 gap-2">
          <button
            onClick={() => {
              if (isAdminProfileFetching) return;
              onPurchaseMorePoints()
            }}
            disabled={isAdminProfileFetching}
            className="w-full inline-flex active:scale-95 disabled:opacity-50 active:rotate-1 cursor-pointer items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-lg text-white bg-green-600 hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-all duration-200"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            Purchase More Points
          </button>
        </div>}
      </div>
    </div >
  )
}