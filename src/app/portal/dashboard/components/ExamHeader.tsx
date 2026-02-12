'use client'

import { useState } from 'react'
import { useAuth } from '../../providers/AuthProvider'
import Image from 'next/image'
import Link from 'next/link'
import { EXAM_TYPES, ExamType } from '../exams/types'

interface ExamHeaderProps {
  currentExam?: ExamType
}

export default function ExamHeader({ currentExam }: ExamHeaderProps) {
  const { school, logout } = useAuth()
  const [showExamDropdown, setShowExamDropdown] = useState(false);

  return (
    <header className='sm:p-4 sticky sm:top-4 top-2 z-50 p-2 bg-white/50 backdrop-blur-lg rounded-xl shadow-lg shadow-black/5 border border-black/10'>
      <div className='flex justify-between items-center'>
        {/* Left Section - Back Button & Exam Selector */}
        <div className='flex items-center gap-3'>
          <Link
            href="/portal/dashboard"
            className="text-green-600 hover:text-green-700 font-medium flex items-center gap-2 cursor-pointer transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            <span className="hidden sm:inline">Back to Exams</span>
          </Link>

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
                            href={`/portal/dashboard/${exam.id}`}
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

        {/* Right Section - School Info & Logout */}
        <div className='flex items-center gap-4'>
          {school && (
            <div className='sm:flex hidden gap-2 items-center text-right'>
              <div>
                <p className='sm:text-sm text-xs font-semibold capitalize'>{(school.schoolName).toLowerCase()}</p>
                <p className="text-xs text-gray-500">{school.email}</p>
              </div>
              <svg
                height="25px"
                width="25px"
                version="1.1"
                id="_x32_"
                xmlns="http://www.w3.org/2000/svg"
                xmlnsXlink="http://www.w3.org/1999/xlink"
                viewBox="0 0 512 512"
                xmlSpace="preserve"
                fill="#000000"
              >
                <g id="SVGRepo_bgCarrier" strokeWidth="0"></g>
                <g id="SVGRepo_tracerCarrier" strokeLinecap="round" strokeLinejoin="round"></g>
                <g id="SVGRepo_iconCarrier">
                  <g>
                    <path className="st0" d="M320.707,0L37.037,69.971v417.625L320.447,512l154.516-26.258V62.568L320.707,0z M290.346,471.742 l-92.584-7.974v-79.426l-55.086-0.677v75.36l-68.109-5.866V99.367l215.779-53.224V471.742z"></path>
                    <polygon className="st0" points="271.25,76.933 226.537,86.32 226.537,138.956 271.25,131.246 "></polygon>
                    <polygon className="st0" points="118.574,112.033 87.416,118.622 87.416,164.818 118.574,159.469 "></polygon>
                    <polygon className="st0" points="190.012,95.942 150.426,104.23 150.426,153.027 190.012,146.202 "></polygon>
                    <polygon className="st0" points="118.576,203.184 87.416,207.448 87.416,253.722 118.576,250.622 "></polygon>
                    <polygon className="st0" points="190.012,192.792 150.426,198.154 150.426,246.952 190.012,243.052 "></polygon>
                    <polygon className="st0" points="271.25,181.04 226.537,187.097 226.537,238.911 271.25,234.506 "></polygon>
                    <polygon className="st0" points="271.25,286.135 226.537,288.889 226.537,340.702 271.25,339.6 "></polygon>
                    <polygon className="st0" points="190.012,291.476 150.426,293.914 150.426,342.712 190.012,341.737 "></polygon>
                    <polygon className="st0" points="118.574,296.198 87.416,298.136 87.416,344.409 118.574,343.634 "></polygon>
                  </g>
                </g>
              </svg>
            </div>
          )}
          
          <button
            onClick={logout}
            title='Press to logout your school account'
            className="inline-flex items-center cursor-pointer active:scale-90 active:rotate-2 text-red-600 px-3 py-2 border border-red-600 shadow-sm text-sm leading-4 font-medium rounded-md bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-600 transition-all duration-200"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </div>
    </header>
  )
}
