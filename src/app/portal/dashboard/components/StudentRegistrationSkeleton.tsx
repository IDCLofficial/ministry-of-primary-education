'use client'

import React from 'react'

export default function StudentRegistrationSkeleton() {
  return (
    <div className="bg-white rounded-xl shadow-lg shadow-black/2 border border-black/10 sm:p-6 p-3">
      {/* Header Skeleton */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <div className="w-48 h-6 bg-gray-200 rounded animate-pulse mb-2"></div>
          <div className="w-72 h-4 bg-gray-200 rounded animate-pulse"></div>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          {/* Onboard Student Button Skeleton */}
          <div className="w-36 h-10 bg-gray-200 rounded-lg animate-pulse"></div>
          
          {/* Search Input Skeleton */}
          <div className="relative w-full sm:w-auto">
            <div className="w-full sm:w-64 h-10 bg-gray-200 rounded-lg animate-pulse"></div>
          </div>
        </div>
      </div>

      {/* Desktop Table Skeleton - Hidden on mobile */}
      <div className="hidden lg:block overflow-x-auto mb-6">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-left py-3 px-4">
                <div className="w-8 h-4 bg-gray-200 rounded animate-pulse"></div>
              </th>
              <th className="text-left py-3 px-4">
                <div className="w-4 h-4 bg-gray-200 rounded animate-pulse"></div>
              </th>
              <th className="text-left py-3 px-4">
                <div className="w-20 h-4 bg-gray-200 rounded animate-pulse"></div>
              </th>
              <th className="text-left py-3 px-4">
                <div className="w-16 h-4 bg-gray-200 rounded animate-pulse"></div>
              </th>
              <th className="text-left py-3 px-4">
                <div className="w-12 h-4 bg-gray-200 rounded animate-pulse"></div>
              </th>
              <th className="text-left py-3 px-4">
                <div className="w-10 h-4 bg-gray-200 rounded animate-pulse"></div>
              </th>
              <th className="text-left py-3 px-4">
                <div className="w-16 h-4 bg-gray-200 rounded animate-pulse"></div>
              </th>
              <th className="text-left py-3 px-4">
                <div className="w-24 h-4 bg-gray-200 rounded animate-pulse"></div>
              </th>
              <th className="text-left py-3 px-4">
                <div className="w-28 h-4 bg-gray-200 rounded animate-pulse"></div>
              </th>
              <th className="text-left py-3 px-4">
                <div className="w-12 h-4 bg-gray-200 rounded animate-pulse"></div>
              </th>
            </tr>
          </thead>
          <tbody>
            {/* Generate 5 skeleton rows */}
            {Array.from({ length: 5 }).map((_, index) => (
              <tr key={index} className="border-b border-gray-100">
                <td className="py-3 px-4">
                  <div className="w-4 h-4 bg-gray-200 rounded animate-pulse"></div>
                </td>
                <td className="py-3 px-4">
                  <div className="w-4 h-4 bg-gray-200 rounded animate-pulse"></div>
                </td>
                <td className="py-3 px-4">
                  <div className="w-16 h-4 bg-gray-200 rounded animate-pulse"></div>
                </td>
                <td className="py-3 px-4">
                  <div className="w-24 h-4 bg-gray-200 rounded animate-pulse"></div>
                </td>
                <td className="py-3 px-4">
                  <div className="w-12 h-4 bg-gray-200 rounded animate-pulse"></div>
                </td>
                <td className="py-3 px-4">
                  <div className="w-8 h-4 bg-gray-200 rounded animate-pulse"></div>
                </td>
                <td className="py-3 px-4">
                  <div className="w-12 h-4 bg-gray-200 rounded animate-pulse"></div>
                </td>
                <td className="py-3 px-4">
                  <div className="w-16 h-6 bg-gray-200 rounded-full animate-pulse"></div>
                </td>
                <td className="py-3 px-4">
                  <div className="w-20 h-6 bg-gray-200 rounded-full animate-pulse"></div>
                </td>
                <td className="py-3 px-4">
                  <div className="w-12 h-4 bg-gray-200 rounded animate-pulse"></div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Card Layout Skeleton - Visible on mobile/tablet */}
      <div className="lg:hidden space-y-3 mb-6">
        {/* Mobile Header Skeleton */}
        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center gap-3">
            <div className="w-4 h-4 bg-gray-200 rounded animate-pulse"></div>
            <div className="w-20 h-4 bg-gray-200 rounded animate-pulse"></div>
          </div>
          <div className="w-24 h-8 bg-gray-200 rounded animate-pulse"></div>
        </div>

        {/* Mobile Student Cards Skeleton */}
        {Array.from({ length: 3 }).map((_, index) => (
          <div key={index} className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
            <div className="flex items-start gap-3">
              {/* S/N */}
              <div className="w-6 h-4 bg-gray-200 rounded animate-pulse"></div>
              
              {/* Checkbox */}
              <div className="w-4 h-4 bg-gray-200 rounded animate-pulse"></div>
              
              {/* Student Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="w-32 h-5 bg-gray-200 rounded animate-pulse mb-2"></div>
                    <div className="w-24 h-4 bg-gray-200 rounded animate-pulse"></div>
                  </div>
                  
                  {/* More Options */}
                  <div className="w-5 h-5 bg-gray-200 rounded animate-pulse"></div>
                </div>
                
                {/* Student Details Grid */}
                <div className="mt-3 grid grid-cols-2 gap-3">
                  <div className="w-16 h-4 bg-gray-200 rounded animate-pulse"></div>
                  <div className="w-12 h-4 bg-gray-200 rounded animate-pulse"></div>
                  <div className="w-20 h-4 bg-gray-200 rounded animate-pulse"></div>
                  <div className="w-16 h-6 bg-gray-200 rounded-full animate-pulse"></div>
                  <div className="w-24 h-6 bg-gray-200 rounded-full animate-pulse"></div>
                </div>
                
                {/* Update Action */}
                <div className="mt-3 pt-3 border-t border-gray-100">
                  <div className="w-24 h-4 bg-gray-200 rounded animate-pulse"></div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination Skeleton */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mt-6">
        <div className="w-32 h-4 bg-gray-200 rounded animate-pulse"></div>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gray-200 rounded animate-pulse"></div>
          <div className="w-8 h-8 bg-gray-200 rounded animate-pulse"></div>
          <div className="w-8 h-8 bg-gray-200 rounded animate-pulse"></div>
          <div className="w-8 h-8 bg-gray-200 rounded animate-pulse"></div>
          <div className="w-8 h-8 bg-gray-200 rounded animate-pulse"></div>
        </div>
        <div className="w-24 h-8 bg-gray-200 rounded animate-pulse"></div>
      </div>
    </div>
  )
}
