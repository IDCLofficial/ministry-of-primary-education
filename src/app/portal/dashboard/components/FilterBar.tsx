'use client'

import React, { useState } from 'react'
import CustomDropdown from './CustomDropdown'

interface FilterBarProps {
  onFilterChange: (filters: FilterState) => void
  isMobile?: boolean
}

interface FilterState {
  class: string
  year: string
  gender: string
}

export default function FilterBar({ onFilterChange, isMobile = false }: FilterBarProps) {
  // Local state for filter inputs (not applied yet)
  const [filters, setFilters] = useState<FilterState>({
    class: 'All',
    year: 'All',
    gender: 'All'
  })

  // Applied filters state (what's actually being used for filtering)
  const [appliedFilters, setAppliedFilters] = useState<FilterState>({
    class: 'All',
    year: 'All',
    gender: 'All'
  })

  // Dropdown options
  const classOptions = [
    { value: 'All', label: 'All' },
    // { value: 'SS1', label: 'SS1' },
    // { value: 'SS2', label: 'SS2' },
    { value: 'SS3', label: 'SS3' },
    // { value: 'JSS1', label: 'JSS1' },
    // { value: 'JSS2', label: 'JSS2' },
    // { value: 'JSS3', label: 'JSS3' }
  ]

  const yearOptions = [
    { value: 'All', label: 'All' },
    { value: '2024', label: '2024' },
    { value: '2025', label: '2025' },
    { value: '2026', label: '2026' }
  ]

  const genderOptions = [
    { value: 'All', label: 'All' },
    { value: 'Male', label: 'Male' },
    { value: 'Female', label: 'Female' }
  ]

  const handleFilterChange = (filterType: keyof FilterState, value: string) => {
    // Only update local state, don't apply filters yet
    const newFilters = { ...filters, [filterType]: value }
    setFilters(newFilters)
  }

  const resetFilters = () => {
    const resetState = { class: 'All', year: 'All', gender: 'All' }
    setFilters(resetState)
    setAppliedFilters(resetState)
    onFilterChange(resetState)
  }

  const applyFilters = () => {
    setAppliedFilters(filters)
    onFilterChange(filters)
  }

  // Check if there are pending changes (filters different from applied filters)
  const hasPendingChanges = JSON.stringify(filters) !== JSON.stringify(appliedFilters)
  
  // Check if any filters are currently active (not all "All")
  const hasActiveFilters = appliedFilters.class !== 'All' || appliedFilters.year !== 'All' || appliedFilters.gender !== 'All'

  if (isMobile) {
    return (
      <div className="space-y-6">
        {/* Filter Header */}
        <div className="text-center">
          <span className="text-base font-medium text-gray-700">Filter Students</span>
          <p className="text-sm text-gray-500 mt-1">Select your filter criteria below</p>
        </div>

        {/* Filter Options - Vertical Layout */}
        <div className="space-y-4">
          {/* Class Filter */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Class</label>
            <CustomDropdown
              options={classOptions}
              value={filters.class}
              onChange={(value) => handleFilterChange('class', value)}
              className="w-full"
            />
          </div>

          {/* Year Filter */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Exam Year</label>
            <CustomDropdown
              options={yearOptions}
              value={filters.year}
              onChange={(value) => handleFilterChange('year', value)}
              className="w-full"
            />
          </div>

          {/* Gender Filter */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Gender</label>
            <CustomDropdown
              options={genderOptions}
              value={filters.gender}
              onChange={(value) => handleFilterChange('gender', value)}
              className="w-full"
            />
          </div>
        </div>

        {/* Action Buttons - Full Width */}
        <div className="flex flex-col gap-3 pt-4">
          <button
            onClick={applyFilters}
            disabled={!hasPendingChanges}
            className={`w-full py-3 text-base font-medium rounded-lg transition-colors duration-200 ${
              hasPendingChanges
                ? 'text-white bg-green-600 hover:bg-green-700'
                : 'text-gray-400 bg-gray-200 cursor-not-allowed'
            }`}
          >
            Apply Filters
          </button>
          <button
            onClick={resetFilters}
            disabled={!hasActiveFilters && !hasPendingChanges}
            className={`w-full py-3 text-base font-medium rounded-lg transition-colors duration-200 ${
              hasActiveFilters || hasPendingChanges
                ? 'text-red-600 bg-transparent border border-red-600 hover:bg-red-600 hover:text-white'
                : 'text-gray-400 bg-transparent border border-gray-300 cursor-not-allowed'
            }`}
          >
            Reset Filters
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl shadow-lg shadow-black/2 border border-black/10 p-4 mb-4">
      <div className="flex flex-wrap items-center gap-4">
        <span className="text-sm font-medium text-gray-700">Filter by</span>
        <div
          className='h-full min-h-5 w-[1px] bg-gray-300'
        />
        {/* Class Filter */}
        <div className="flex flex-1 items-center gap-2">
          <label className="text-sm font-medium text-gray-600">Class</label>
          <CustomDropdown
            options={classOptions}
            value={filters.class}
            onChange={(value) => handleFilterChange('class', value)}
            className="flex-1"
          />
        </div>

        {/* <div
          className='h-full min-h-5 w-[1px] bg-gray-300'
        /> */}

        {/* Year Filter */}
        {/* <div className="flex flex-1 items-center gap-2">
          <label className="text-sm font-medium text-gray-600">Year</label>
          <CustomDropdown
            options={yearOptions}
            value={filters.year}
            onChange={(value) => handleFilterChange('year', value)}
            className="flex-1"
          />
        </div> */}

        <div
          className='h-full min-h-5 w-[1px] bg-gray-300'
        />

        {/* Gender Filter */}
        <div className="flex flex-1 items-center gap-2">
          <label className="text-sm font-medium text-gray-600">Gender</label>
          <CustomDropdown
            options={genderOptions}
            value={filters.gender}
            onChange={(value) => handleFilterChange('gender', value)}
            className="flex-1"
          />
        </div>

        <div
          className='h-full min-h-5 w-[1px] bg-gray-300'
        />

        {/* Action Buttons */}
        <div className="flex gap-2 ml-auto">
          <button
            onClick={resetFilters}
            disabled={!hasActiveFilters && !hasPendingChanges}
            className={`px-4 py-2 text-sm font-medium cursor-pointer rounded-lg transition-colors duration-200 ${
              hasActiveFilters || hasPendingChanges
                ? 'text-red-600 bg-transparent border border-red-600 hover:bg-red-600 hover:text-white'
                : 'text-gray-400 bg-transparent border border-gray-300 cursor-not-allowed'
            }`}
          >
            Reset Filter
          </button>
          <button
            onClick={applyFilters}
            disabled={!hasPendingChanges}
            className={`px-4 py-2 text-sm cursor-pointer font-medium rounded-lg transition-colors duration-200 ${
              hasPendingChanges
                ? 'text-white bg-green-600 hover:bg-green-700'
                : 'text-gray-400 bg-gray-200 cursor-not-allowed'
            }`}
          >
            Apply Filter
          </button>
        </div>
      </div>
    </div>
  )
}
