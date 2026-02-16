'use client'
import React, { use } from 'react'
import { useRouter } from 'next/navigation'
import { IoArrowBack } from 'react-icons/io5'
import Image from 'next/image'
import Link from 'next/link'

interface ExamType {
  key: string;
  name: string;
  shortName: string;
  description: string;
  iconPath: string;
  color: string;
  isAvailable: boolean;
}

const EXAM_TYPES: ExamType[] = [
  {
    key: 'bece',
    name: 'Basic Education Certificate Examination',
    shortName: 'BECE',
    description: 'Certificate examination for basic education completion',
    iconPath: '/images/ministry-logo.png',
    color: 'indigo',
    isAvailable: true
  },
  {
    key: 'ubeat',
    name: 'Universal Basic Education Assessment Test',
    shortName: 'UBEAT',
    description: 'Assessment test for basic education standards',
    iconPath: '/images/ministry-logo.png',
    color: 'orange',
    isAvailable: true
  },
  {
    key: 'ubegpt',
    name: 'Universal Basic Education General Placement Test',
    shortName: 'UBEGPT',
    description: 'General placement test for basic education students',
    iconPath: '/images/ministry-logo.png',
    color: 'blue',
    isAvailable: false
  },
  {
    key: 'ubetms',
    name: 'Universal Basic Education Test into Model Schools',
    shortName: 'UBETMS',
    description: 'Entrance test for admission into model schools',
    iconPath: '/images/ministry-logo.png',
    color: 'purple',
    isAvailable: false
  },
  {
    key: 'cess',
    name: 'Common Entrance into Science Schools',
    shortName: 'CESS',
    description: 'Entrance examination for science schools',
    iconPath: '/images/ministry-logo.png',
    color: 'green',
    isAvailable: false
  },
  {
    key: 'jscbe',
    name: 'Junior School Certificate Basic Education',
    shortName: 'JSCBE',
    description: 'Certificate examination for junior school students',
    iconPath: '/images/ministry-logo.png',
    color: 'teal',
    isAvailable: false
  },
  {
    key: 'waec',
    name: 'West African Examinations Council',
    shortName: 'WAEC',
    description: 'West African Senior School Certificate Examination',
    iconPath: '/images/waec-logo.png',
    color: 'red',
    isAvailable: false
  }
]

export default function ExamSelectionPage({ params }: { params: Promise<{ schoolId: string }> }) {
  const router = useRouter()
  const { schoolId } = use(params)

  return (
    <div className='sm:p-4 p-2 bg-[#F3F3F3] min-h-screen relative w-full flex flex-col'>
      {/* Back Button */}
      <button
        onClick={() => router.push('/bece-portal/dashboard/schools')}
        className="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-all duration-300 active:scale-95 cursor-pointer mb-4 w-fit ml-6"
      >
        <IoArrowBack className="w-4 h-4 mr-2" />
        Back to Schools
      </button>


      <div className="flex-1">
        <div className="max-w-7xl px-6 mx-auto">
          {/* Page Title */}
          <div className="mb-4 sm:mb-6">
            <h1 className="text-lg sm:text-xl font-bold text-gray-900">Select Examination Type</h1>
            <p className="text-sm text-gray-600 mt-1">Choose an exam to view student results</p>
          </div>

          {/* Exam Type Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {EXAM_TYPES.map((exam) => {
              const isAvailable = exam.isAvailable
              
              if (isAvailable) {
                return (
                  <Link
                    href={`/bece-portal/dashboard/schools/${schoolId}/${exam.key}`}
                    key={exam.key}
                    className="bg-white border border-gray-200 rounded-lg p-4 transition-all cursor-pointer hover:border-green-500 hover:shadow-md"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <Image
                        src={exam.iconPath}
                        alt={exam.shortName}
                        width={32}
                        height={32}
                        className="object-contain"
                      />
                      <span className="px-2 py-1 text-xs font-semibold rounded bg-green-100 text-green-800">
                        Available
                      </span>
                    </div>

                    <h3 className="text-base font-bold text-gray-900 mb-1">
                      {exam.shortName}
                    </h3>
                    
                    <p className="text-xs text-gray-500 mb-3 line-clamp-2">
                      {exam.description}
                    </p>
                  </Link>
                )
              }
              
              return (
                <div
                  key={exam.key}
                  className="bg-white border border-gray-200 rounded-lg p-4 transition-all cursor-not-allowed opacity-60"
                >
                  <div className="flex items-start justify-between mb-3">
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

                  <h3 className="text-base font-bold text-gray-900 mb-1">
                    {exam.shortName}
                  </h3>
                  
                  <p className="text-xs text-gray-500 mb-3 line-clamp-2">
                    {exam.description}
                  </p>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
