'use client'
import React from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { IoCloudUpload } from 'react-icons/io5'

interface ExamType {
  key: string
  name: string
  shortName: string
  description: string
  iconPath: string
  color: string
}

const EXAM_TYPES: ExamType[] = [
  {
    key: 'ubegpt',
    name: 'Universal Basic Education General Placement Test',
    shortName: 'UBEGPT',
    description: 'Upload student results for UBEGPT examination',
    iconPath: '/images/ministry-logo.png',
    color: 'blue'
  },
  {
    key: 'ubetms',
    name: 'Universal Basic Education Test into Model Schools',
    shortName: 'UBETMS',
    description: 'Upload student results for UBETMS examination',
    iconPath: '/images/ministry-logo.png',
    color: 'purple'
  },
  {
    key: 'cess',
    name: 'Common Entrance into Science Schools',
    shortName: 'CESS',
    description: 'Upload student results for Common Entrance examination',
    iconPath: '/images/ministry-logo.png',
    color: 'green'
  },
  {
    key: 'bece',
    name: 'Basic Education Certificate Examination',
    shortName: 'BECE',
    description: 'Upload student results for BECE examination',
    iconPath: '/images/ministry-logo.png',
    color: 'indigo'
  },
  {
    key: 'ubeat',
    name: 'Universal Basic Education Assessment Test',
    shortName: 'UBEAT',
    description: 'Upload student results for UBEAT examination',
    iconPath: '/images/ministry-logo.png',
    color: 'orange'
  },
  {
    key: 'jscbe',
    name: 'Junior School Certificate Basic Education',
    shortName: 'JSCBE',
    description: 'Upload student results for JSCBE examination',
    iconPath: '/images/ministry-logo.png',
    color: 'teal'
  },
  {
    key: 'waec',
    name: 'West African Examinations Council',
    shortName: 'WAEC',
    description: 'Upload student results for WAEC examination',
    iconPath: '/images/waec-logo.png',
    color: 'red'
  }
]

export default function UploadsPage() {
  const router = useRouter()

  return (
    <div className='sm:p-4 p-2 bg-[#F3F3F3] min-h-screen relative w-full flex flex-col'>
      <div className="flex-1">
        <div className="max-w-7xl mx-auto">
          {/* Page Header */}
          <div className="mb-6">
            <div className="flex items-center gap-3 mb-2">
              <IoCloudUpload className="w-8 h-8 text-green-600" />
              <h1 className="text-2xl font-bold text-gray-900">Upload Results</h1>
            </div>
            <p className="text-gray-600">Select an examination type to upload student results</p>
          </div>

          {/* Info Banner */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <div className="flex items-start gap-3">
              <svg className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
              <div>
                <p className="text-sm font-medium text-blue-900 mb-1">Supported File Formats</p>
                <p className="text-sm text-blue-800">
                  You can upload CSV or XLSX files. For XLSX files, multiple sheets are supported - each sheet will be processed separately.
                </p>
              </div>
            </div>
          </div>

          {/* Exam Type Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {EXAM_TYPES.map((exam) => {
              const isAvailable = exam.key === 'bece' || exam.key === 'ubeat'
              
              if (isAvailable) {
                return (
                  <Link
                    href={`/bece-portal/dashboard/uploads/${exam.key}`}
                    key={exam.key}
                    className="bg-white border border-gray-200 rounded-lg p-4 transition-all group cursor-pointer hover:border-green-500 hover:shadow-md"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <Image
                        src={exam.iconPath}
                        alt={exam.shortName}
                        width={32}
                        height={32}
                        className="object-contain"
                      />
                      <IoCloudUpload className="w-5 h-5 text-gray-400 group-hover:text-green-600 transition-colors" />
                    </div>

                    <h3 className="text-base font-bold text-gray-900 mb-1">
                      {exam.shortName}
                    </h3>
                    
                    <p className="text-xs text-gray-500 line-clamp-2">
                      {exam.description}
                    </p>
                  </Link>
                )
              }
              
              return (
                <div
                  key={exam.key}
                  className="bg-white border border-gray-200 rounded-lg p-4 transition-all group cursor-not-allowed opacity-60"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Image
                        src={exam.iconPath}
                        alt={exam.shortName}
                        width={32}
                        height={32}
                        className="object-contain"
                      />
                      <span className="px-2 py-1 text-xs font-semibold rounded bg-gray-100 text-gray-600">
                        Coming Soon
                      </span>
                    </div>
                    <IoCloudUpload className="w-5 h-5 text-gray-300 transition-colors" />
                  </div>

                  <h3 className="text-base font-bold text-gray-900 mb-1">
                    {exam.shortName}
                  </h3>
                  
                  <p className="text-xs text-gray-500 line-clamp-2">
                    {exam.description}
                  </p>
                </div>
              )
            })}
          </div>

          {/* Help Section */}
          <div className="mt-8 bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Upload Guidelines</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-2 flex items-center gap-2">
                  <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  CSV Format
                </h3>
                <ul className="space-y-1 text-sm text-gray-600">
                  <li>• Each file should contain student data for one school</li>
                  <li>• First row must be headers</li>
                  <li>• File name format: "LGA 2025 EXAM - SCHOOL NAME.csv"</li>
                </ul>
              </div>

              <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-2 flex items-center gap-2">
                  <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  XLSX Format
                </h3>
                <ul className="space-y-1 text-sm text-gray-600">
                  <li>• Each sheet represents one school</li>
                  <li>• Sheet name will be used as school name</li>
                  <li>• File name format: "LGA 2025 EXAM.xlsx"</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
