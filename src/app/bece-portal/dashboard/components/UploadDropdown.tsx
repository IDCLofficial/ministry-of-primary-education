'use client'

import Link from 'next/link'
import React, { useState, useRef, useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { IoCloudUpload, IoChevronDown } from 'react-icons/io5'
import Image from 'next/image'

interface UploadDropdownProps {
  className?: string
}

interface ExamType {
  key: string
  name: string
  shortName: string
  iconPath: string
}

const EXAM_TYPES: ExamType[] = [
  {
    key: 'ubegpt',
    name: 'Universal Basic Education General Placement Test',
    shortName: 'UBEGPT',
    iconPath: '/images/ministry-logo.png'
  },
  {
    key: 'ubetms',
    name: 'Universal Basic Education Test into Model Schools',
    shortName: 'UBETMS',
    iconPath: '/images/ministry-logo.png'
  },
  {
    key: 'cess',
    name: 'Common Entrance into Science Schools',
    shortName: 'CESS',
    iconPath: '/images/ministry-logo.png'
  },
  {
    key: 'bece',
    name: 'Basic Education Certificate Examination',
    shortName: 'BECE',
    iconPath: '/images/ministry-logo.png'
  },
  {
    key: 'ubeat',
    name: 'Universal Basic Education Assessment Test',
    shortName: 'UBEAT',
    iconPath: '/images/ministry-logo.png'
  },
  {
    key: 'jscbe',
    name: 'Junior School Certificate Basic Education',
    shortName: 'JSCBE',
    iconPath: '/images/ministry-logo.png'
  },
  {
    key: 'waec',
    name: 'West African Examinations Council',
    shortName: 'WAEC',
    iconPath: '/images/waec-logo.png'
  }
]

export default function UploadDropdown({ className = "" }: UploadDropdownProps) {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const pathname = usePathname()

  // Get current exam type from pathname
  const currentExamKey = pathname?.match(/\/uploads\/([^/]+)/)?.[1]

  // Filter out current exam from dropdown
  const availableExams = EXAM_TYPES.filter(exam => exam.key !== currentExamKey)

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <div ref={dropdownRef} className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`cursor-pointer active:scale-95 inline-flex items-center px-5 py-2 border text-sm font-medium rounded-md text-green-600 hover:text-white border-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-all duration-200 ${className}`}
      >
        <IoCloudUpload className="w-4 h-4 mr-2" />
        Upload Results
        <IoChevronDown className={`w-4 h-4 ml-2 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-72 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50 max-h-96 overflow-y-auto">
          <div className="px-3 py-2 border-b border-gray-100">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
              Select Exam to Upload
            </p>
          </div>
          
          {availableExams.length > 0 ? (
            availableExams.map((exam) => (
              <Link
                key={exam.key}
                href={`/bece-portal/dashboard/uploads/${exam.key}`}
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-3 px-3 py-2.5 hover:bg-gray-50 transition-colors cursor-pointer border-l-2 border-transparent hover:border-green-500"
              >
                <Image
                  src={exam.iconPath}
                  alt={exam.shortName}
                  width={24}
                  height={24}
                  className="object-contain flex-shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {exam.shortName}
                  </p>
                  <p className="text-xs text-gray-500 truncate">
                    {exam.name}
                  </p>
                </div>
              </Link>
            ))
          ) : (
            <div className="px-3 py-4 text-center">
              <p className="text-sm text-gray-500">No other exams available</p>
            </div>
          )}

          {/* View All Link */}
          <div className="border-t border-gray-100 mt-2">
            <Link
              href="/bece-portal/dashboard/uploads"
              onClick={() => setIsOpen(false)}
              className="flex items-center justify-center gap-2 px-3 py-2.5 text-sm font-medium text-green-600 hover:bg-green-50 transition-colors"
            >
              <IoCloudUpload className="w-4 h-4" />
              View All Exams
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}