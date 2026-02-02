'use client'

import React, { useState } from 'react'
import FilterBar from './FilterBar'

interface ResponsiveFilterBarProps {
  onFilterChange: (filters: FilterState) => void
  currentFilters?: FilterState
}

interface FilterState {
  class?: string
  year?: string
  gender?: string
  sort?: string
}

export default function ResponsiveFilterBar({ onFilterChange, currentFilters }: ResponsiveFilterBarProps) {
  const [isBottomSheetOpen, setIsBottomSheetOpen] = useState(false)

  const openBottomSheet = () => setIsBottomSheetOpen(true)
  const closeBottomSheet = () => setIsBottomSheetOpen(false)

  return (
    <>
      {/* Desktop Version - Always visible on xl+ screens */}
      <div className="hidden xl:block">
        <FilterBar onFilterChange={onFilterChange} currentFilters={currentFilters} />
      </div>

      {/* Mobile/Tablet Version - Filter Button */}
      <div className="xl:hidden">
        <div className="bg-white rounded-xl shadow-lg shadow-black/2 border border-black/10 p-4 mb-4">
          <button
            onClick={openBottomSheet}
            className="w-full flex items-center justify-between text-left"
          >
            <div className="flex items-center gap-3">
              <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
              </svg>
              <span className="text-sm font-medium text-gray-700">Filters</span>
            </div>
            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        </div>
      </div>

      {/* Bottom Sheet Overlay */}
      {isBottomSheetOpen && (
        <div className="xl:hidden fixed inset-0 z-50 flex items-end">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black/10 backdrop-blur-md transition-opacity"
            onClick={closeBottomSheet}
          />
          
          {/* Bottom Sheet */}
          <div className="relative w-full bg-white rounded-t-2xl shadow-2xl transform transition-transform duration-300 ease-out translate-y-0">
            {/* Handle */}
            <div className="flex justify-center pt-4 pb-2">
              <div className="w-12 h-1 bg-gray-300 rounded-full"></div>
            </div>
            
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Filter Students</h3>
              <button
                onClick={closeBottomSheet}
                className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            {/* Filter Content */}
            <div className="px-6 py-4 max-h-[70vh] overflow-y-auto">
              <FilterBar 
                onFilterChange={(filters) => {
                  onFilterChange(filters)
                  closeBottomSheet()
                }} 
                isMobile={true}
                currentFilters={currentFilters}
              />
            </div>
          </div>
        </div>
      )}
    </>
  )
}
