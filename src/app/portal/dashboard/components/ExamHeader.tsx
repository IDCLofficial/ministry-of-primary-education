'use client'

import { useRef, useState } from 'react'
import { useSelector } from 'react-redux'
import { useParams } from 'next/navigation'
import type { RootState } from '@/app/portal/store'
import Image from 'next/image'
import Link from 'next/link'
import { EXAM_TYPES, ExamType } from '../[schoolCode]/types'
import { useClickAway } from 'react-use'

interface ExamHeaderProps {
  currentExam?: ExamType
  isFirst?: boolean
}

export default function ExamHeader({ currentExam, isFirst }: ExamHeaderProps) {
  const params = useParams()
  const rawSchoolCode = params?.schoolCode as string
  const { selectedSchool } = useSelector((state: RootState) => state.school)
  const [showExamDropdown, setShowExamDropdown] = useState(false);

  const dropDownRef = useRef<HTMLDivElement>(null);

  useClickAway(dropDownRef, () => {
    setShowExamDropdown(false);
  });

  return (
    <header className='sm:p-4 sticky sm:top-4 top-2 z-50 p-2 bg-white/50 backdrop-blur-lg rounded-xl shadow-lg shadow-black/5 border border-black/10'>
      <div className='flex justify-between items-center'>
        {/* Left Section - Back Button & Exam Selector */}
        <div className='flex items-center gap-3'>
          {!isFirst && <Link
            href={rawSchoolCode ? `/portal/dashboard/${rawSchoolCode}` : "/portal/dashboard"}
            className="text-green-600 hover:text-green-700 font-medium flex items-center gap-2 cursor-pointer transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            <span className="hidden sm:inline">Back to Exams</span>
          </Link>}
          {isFirst && <Link
            href={`/portal/dashboard`}
            className="text-green-600 hover:text-green-700 font-medium flex items-center gap-2 cursor-pointer transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            <span className="hidden sm:inline">Back to Dashboard</span>
          </Link>}

          {currentExam && (
            <>
              <div className="h-6 w-px bg-gray-300 hidden sm:block" />
              
              {/* Exam Selector with Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setShowExamDropdown(!showExamDropdown)}
                  className="flex items-center gap-2 px-3 py-2 rounded-3xl hover:bg-gray-100 transition-colors cursor-pointer border border-green-900/25"
                >
                  <div className="bg-gray-50 border border-gray-200 shadow-[inset_0px_0px_10px_2px_#E5E7EB] p-2 rounded-full">
                    <Image
                      src={currentExam.iconPath}
                      alt={currentExam.shortName}
                      width={24}
                      height={24}
                      className="object-contain"
                    />
                  </div>
                  <div className="text-left hidden md:block">
                    <p className="text-sm font-bold text-gray-900">{currentExam.shortName} Dashboard</p>
                    <p className="text-xs text-gray-500">{currentExam.name}</p>
                  </div>
                  <svg
                    className={`w-4 h-4 text-gray-600 transition-transform ${showExamDropdown ? 'rotate-180' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {/* Dropdown Menu */}
                {showExamDropdown && (
                  <>
                    <div
                      ref={dropDownRef}
                      className="fixed inset-0 z-10"
                      onClick={() => setShowExamDropdown(false)}
                    />
                    <div className="absolute left-0 mt-2 w-80 bg-white rounded-lg shadow-xl border border-gray-200 z-20 max-h-96 overflow-y-auto">
                      <div className="p-2">
                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide px-3 py-2">
                          Switch Examination
                        </p>
                        {EXAM_TYPES.map((exam) => (
                          <Link
                            href={`./${exam.id}`}
                            key={exam.id}
                            onClick={() => setShowExamDropdown(false)}
                            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                              exam.id === currentExam.id
                                ? 'bg-green-50 border border-green-200'
                                : 'hover:bg-gray-50'
                            }`}
                          >
                            <div className="bg-gray-50 border border-gray-200 p-2 rounded-full flex-shrink-0">
                              <Image
                                src={exam.iconPath}
                                alt={exam.shortName}
                                width={24}
                                height={24}
                                className="object-contain"
                              />
                            </div>
                            <div className="text-left flex-1">
                              <p className="text-sm font-semibold text-gray-900">{exam.shortName}</p>
                              <p className="text-xs text-gray-500 line-clamp-1">{exam.name}</p>
                            </div>
                            {exam.id === currentExam.id && (
                              <svg className="w-5 h-5 text-green-600 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                              </svg>
                            )}
                          </Link>
                        ))}
                      </div>
                    </div>
                  </>
                )}
              </div>
            </>
          )}
        </div>

        {/* Right Section - School Info & Back to Dashboard */}
        <div className='flex items-center gap-4'>
          {selectedSchool && (
            <div className='sm:flex hidden gap-2 items-center text-right bg-gray-50 rounded-lg px-3 py-2 border border-gray-200'>
              <div className='flex items-center justify-center w-8 h-8 bg-blue-100 rounded-full'>
                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <div>
                <p className='sm:text-sm text-xs font-semibold capitalize'>{selectedSchool.schoolName.toLowerCase()}</p>
                <p className="text-xs text-gray-500 capitalize">{selectedSchool.lga}</p>
              </div>
            </div>
          )}
          
          <Link
            href="/portal/dashboard"
            title='Back to Dashboard'
            className="inline-flex items-center cursor-pointer active:scale-90 text-green-600 px-3 py-2 border border-green-600 shadow-sm text-sm leading-4 font-medium rounded-md bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-600 transition-all duration-200"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            <span className="hidden sm:inline">Dashboard</span>
          </Link>
        </div>
      </div>
    </header>
  )
}
