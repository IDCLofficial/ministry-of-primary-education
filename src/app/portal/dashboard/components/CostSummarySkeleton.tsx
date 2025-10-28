'use client'

import React from 'react'

export default function CostSummarySkeleton() {
  return (
    <div className="bg-white rounded-xl shadow-lg shadow-black/2 border border-black/10 p-6">
      {/* Title Skeleton */}
      <div className="w-32 h-6 bg-gray-200 rounded animate-pulse mb-6"></div>
      
      <div className="space-y-4">
        {/* Points Information Card Skeleton */}
        <div className="bg-blue-50 rounded-lg p-4">
          {/* Available Points Row */}
          <div className="flex justify-between items-center mb-2">
            <div className="w-28 h-4 bg-gray-200 rounded animate-pulse"></div>
            <div className="w-8 h-8 bg-gray-200 rounded animate-pulse"></div>
          </div>
          {/* Used Points Row */}
          <div className="flex justify-between items-center opacity-75 mb-2">
            <div className="w-20 h-3 bg-gray-200 rounded animate-pulse"></div>
            <div className="w-6 h-3 bg-gray-200 rounded animate-pulse"></div>
          </div>
          {/* Total Students Row */}
          <div className="flex justify-between items-center">
            <div className="w-24 h-3 bg-gray-200 rounded animate-pulse"></div>
            <div className="w-6 h-3 bg-gray-200 rounded animate-pulse"></div>
          </div>
        </div>

        {/* Point Information Card Skeleton */}
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="text-center space-y-2">
            <div className="w-36 h-5 bg-gray-200 rounded animate-pulse mx-auto"></div>
            <div className="w-48 h-3 bg-gray-200 rounded animate-pulse mx-auto"></div>
          </div>
        </div>

        {/* Status Message Skeleton */}
        <div className="bg-green-50 border border-green-200 rounded-lg p-3">
          <div className="flex items-center">
            <div className="w-5 h-5 bg-gray-200 rounded animate-pulse mr-2"></div>
            <div className="w-56 h-3 bg-gray-200 rounded animate-pulse"></div>
          </div>
        </div>

        {/* Purchase Button Skeleton */}
        <div className="w-full h-12 bg-gray-200 rounded-lg animate-pulse"></div>
      </div>
    </div>
  )
}
