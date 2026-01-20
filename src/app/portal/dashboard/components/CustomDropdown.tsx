'use client'

import React, { useState, useRef, useEffect } from 'react'

interface DropdownOption {
  value: string
  label: string
}

interface CustomDropdownProps {
  options: DropdownOption[]
  value: string
  onChange: (value: string) => void
  placeholder?: string
  className?: string
  defaultValue?: string
  searchable?: boolean
  searchPlaceholder?: string
}

export default function CustomDropdown({
  options,
  value,
  onChange,
  placeholder = "Select option",
  className = "",
  defaultValue,
  searchable = false,
  searchPlaceholder = "Search..."
}: CustomDropdownProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const dropdownRef = useRef<HTMLDivElement>(null)
  const menuRef = useRef<HTMLDivElement>(null)
  const searchInputRef = useRef<HTMLInputElement>(null)

  const selectedOption = options.find(option => option.value === value)

  // Filter options based on search term
  const filteredOptions = searchable && searchTerm
    ? options.filter(option => 
        option.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
        option.value.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : options

  // Set default value on mount if provided and current value is empty
  useEffect(() => {
    if (defaultValue && !value && options.some(option => option.value === defaultValue)) {
      onChange(defaultValue)
    }
  }, [defaultValue, value, onChange, options])

  // Scroll to selected item when dropdown opens
  useEffect(() => {
    if (isOpen && selectedOption && menuRef.current) {
      const selectedIndex = filteredOptions.findIndex(option => option.value === value)
      if (selectedIndex >= 0) {
        const selectedElement = menuRef.current.children[searchable ? selectedIndex + 1 : selectedIndex] as HTMLElement
        if (selectedElement) {
          selectedElement.scrollIntoView({
            behavior: 'smooth',
            block: 'center'
          })
        }
      }
    }
  }, [isOpen, selectedOption, value, filteredOptions, searchable])

  // Focus search input when dropdown opens
  useEffect(() => {
    if (isOpen && searchable && searchInputRef.current) {
      setTimeout(() => {
        searchInputRef.current?.focus()
      }, 100)
    }
  }, [isOpen, searchable])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
        setSearchTerm('')
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleOptionClick = (optionValue: string) => {
    onChange(optionValue)
    setIsOpen(false)
    setSearchTerm('')
  }

  const handleDropdownToggle = () => {
    setIsOpen(!isOpen)
    if (!isOpen) {
      setSearchTerm('')
    }
  }

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      {/* Dropdown Button */}
      <button
        type="button"
        onClick={handleDropdownToggle}
        className="w-full bg-gray-100 border cursor-pointer border-gray-300 rounded-lg px-3 py-2 text-sm text-left focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent hover:bg-gray-50 transition-colors duration-200"
      >
        <div className="flex items-center justify-between capitalize">
          <span className={selectedOption ? 'text-gray-900' : 'text-gray-500'}>
            {selectedOption ? (selectedOption.label).toLowerCase() : placeholder}
          </span>
          <svg
            className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${
              isOpen ? 'transform rotate-180' : ''
            }`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div ref={menuRef} className="absolute z-50 w-full mt-1 cursor-pointer bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
          {/* Search Input */}
          {searchable && (
            <div className="p-2 border-b border-gray-100 sticky top-0 bg-white/75 backdrop-blur-sm">
              <input
                ref={searchInputRef}
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder={searchPlaceholder}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                onClick={(e) => e.stopPropagation()}
              />
            </div>
          )}
          
          {/* Options List */}
          {filteredOptions.length === 0 ? (
            <div className="px-3 py-2 text-sm text-gray-500 text-center">
              No options found
            </div>
          ) : (
            filteredOptions.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => handleOptionClick(option.value)}
              className={`w-full px-3 py-2 text-sm text-left cursor-pointer hover:bg-gray-50 focus:outline-none focus:bg-gray-50 transition-colors duration-150 ${
                option.value === value
                  ? 'bg-green-50 text-green-700 font-medium'
                  : 'text-gray-900'
              } ${
                option === filteredOptions[filteredOptions.length - 1] ? '' : 'border-b border-gray-100'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className='capitalize'>{(option.label).toLowerCase()}</span>
                {option.value === value && (
                  <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </div>
            </button>
            ))
          )}
        </div>
      )}
    </div>
  )
}
