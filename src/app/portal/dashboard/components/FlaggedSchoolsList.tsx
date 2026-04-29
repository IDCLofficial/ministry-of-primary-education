'use client'

import React from 'react'
import Link from 'next/link'
import { FlaggedSchool } from '../../store/api/authApi'

interface FlaggedSchoolsListProps {
  schools: FlaggedSchool[]
  isLoading: boolean
}

export default function FlaggedSchoolsList({ schools, isLoading }: FlaggedSchoolsListProps) {
  if (isLoading) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="animate-pulse space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-16 bg-gray-100 rounded"></div>
          ))}
        </div>
      </div>
    )
  }

  if (schools.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="text-center py-8">
          <svg className="w-12 h-12 text-green-500 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-gray-600 font-medium">No flagged schools</p>
          <p className="text-sm text-gray-500 mt-1">All schools in your LGA have cleared their payments</p>
        </div>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {schools.map((school) => (
        <div
          key={school.id}
          className="bg-white rounded-lg border border-gray-200 p-4"
        >
          <div className="mb-3">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-semibold text-gray-900 truncate">
                {school.schoolName}
              </h3>
              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-orange-100 text-orange-800 border border-orange-200">
                Flagged
              </span>
            </div>
            
            <p className="text-sm text-gray-600">
              Code: <span className="font-mono font-medium">{school.schoolCode}</span>
            </p>
          </div>

          <div className="space-y-2">
            <p className="text-xs font-semibold text-gray-700 mb-2">Flagged Exams:</p>
            {school.flaggedExams.map((exam) => (
              <Link
                key={exam}
                href={`/portal/dashboard/${school.schoolCode.replace(/\//g, '-')}/${exam.toLowerCase()}`}
                className="flex items-center justify-between p-2 bg-red-50 hover:bg-red-100 border border-red-200 rounded transition-colors group"
              >
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  <span className="text-sm font-medium text-red-900">{exam}</span>
                </div>
                <svg className="w-4 h-4 text-red-600 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
