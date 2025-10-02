'use client'

import React, { useState, useRef, useEffect } from 'react'
import { IoChevronDown, IoCloudUpload, IoDocument } from 'react-icons/io5'

interface UploadOption {
  value: string
  label: string
  icon: React.ReactNode
  description: string
}

interface UploadDropdownProps {
  onSelect: (value: string) => void
  className?: string
}

export default function UploadDropdown({ onSelect, className = "" }: UploadDropdownProps) {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const uploadOptions: UploadOption[] = [
    {
      value: 'upload-ca',
      label: 'Upload CA',
      icon: <IoDocument className="w-4 h-4" />,
      description: 'Upload Continuous Assessment files'
    },
    {
      value: 'upload-exams',
      label: 'Upload Exams',
      icon: <IoCloudUpload className="w-4 h-4" />,
      description: 'Upload examination files and results'
    }
  ]

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleOptionClick = (optionValue: string) => {
    onSelect(optionValue)
    setIsOpen(false)
  }

  const handleDropdownToggle = () => {
    setIsOpen(!isOpen)
  }

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      {/* Upload Button */}
      <button 
        onClick={handleDropdownToggle}
        className="cursor-pointer active:scale-90 active:rotate-1 flex items-stretch border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200"
      >
        <div className="py-2 px-5">Upload</div>
        <div className='w-[1px] bg-white' />
        <div className="px-2 flex items-center">
          <IoChevronDown className={`transition-transform duration-200 ${
            isOpen ? 'transform rotate-180' : ''
          }`} />
        </div>
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 z-50 mt-2 w-64 bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden">
          <div className="py-1">
            {uploadOptions.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => handleOptionClick(option.value)}
                className="w-full cursor-pointer active:scale-95 px-4 py-3 text-left hover:bg-gray-50 focus:outline-none focus:bg-gray-50 transition-all duration-150 border-b border-gray-100 last:border-b-0"
              >
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 mt-0.5 text-blue-600">
                    {option.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900">
                      {option.label}
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {option.description}
                    </p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
