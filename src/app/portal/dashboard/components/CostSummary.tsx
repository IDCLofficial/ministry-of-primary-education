'use client'

import React from 'react'
import { useAuth } from '../../providers/AuthProvider'
import CostSummarySkeleton from './CostSummarySkeleton'
import { useGetProfileQuery } from '../../store/api/authApi'

interface CostSummaryProps {
  onPurchaseMorePoints: () => void
  examPoints: number
  examTotalPoints: number
  examNumberOfStudents: number
}

export default function CostSummary({ 
  onPurchaseMorePoints,
  examPoints,
  examTotalPoints,
  examNumberOfStudents
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
  
  // Only allow purchase if available points is less than number of students for this exam
  const canPurchaseMorePoints = examAvailablePoints < examNumberOfStudents

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
      <h3 className="text-lg font-semibold text-gray-800 mb-6">Points Summary</h3>
      
      <div className="space-y-4">
        {/* Points Information */}
        {school && (
          <div className="space-y-4">
            {/* Available Points */}
            <div className="bg-green-50 rounded-lg p-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-green-800">Available Points</span>
                <span className="text-2xl font-bold text-green-900">{examAvailablePoints}</span>
              </div>
              <div className="flex justify-between items-center opacity-75">
                <span className="text-sm font-medium text-gray-600">Used Points</span>
                <span className="text-sm text-gray-700">{examUsedPoints}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-600">Total Students</span>
                <span className="text-sm text-gray-700">{examNumberOfStudents}</span>
              </div>
            </div>

            {/* Point Information */}
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="text-center">
                <div className="text-lg font-semibold text-gray-800 mb-1">1 Point = 1 Student</div>
                <div className="text-sm text-gray-600">Use points to add students to your school</div>
              </div>
            </div>

            {/* Status Message */}
            {examAvailablePoints >= examNumberOfStudents ? (
              <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                <div className="flex items-center">
                  <svg className="w-5 h-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-sm text-green-700">You have sufficient points for all students</span>
                </div>
              </div>
            ) : (
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
                <div className="flex items-center">
                  <svg className="w-5 h-5 text-orange-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                  <span className="text-sm text-orange-700">
                    You need {examNumberOfStudents - examTotalPoints} more points
                  </span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Purchase More Points Button */}
        <button
          onClick={()=> {
            if (!canPurchaseMorePoints || isAdminProfileFetching) return;
            onPurchaseMorePoints()
          }}
          disabled={!canPurchaseMorePoints || isAdminProfileFetching}
          className="w-full inline-flex active:scale-95 disabled:opacity-50 active:rotate-1 cursor-pointer items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-lg text-white bg-green-600 hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-all duration-200"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
          {canPurchaseMorePoints ? 'Purchase More Points' : 'Points Sufficient'}
        </button>
      </div>
    </div>
  )
}