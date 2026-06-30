'use client'

import React, { useEffect, useMemo, useState } from 'react'
import { useGetMyPaidSchoolsTransactionsQuery } from '../../store/api/authApi'
import type { PaidSchool } from '../../store/api/authApi'
import type { ExamDataMain } from '../../store/api/authApi'
import Pagination from './Pagination'

interface TransactionLogsModalProps {
  isOpen: boolean
  onClose: () => void
}

interface FlatRow {
  schoolId: string
  schoolName: string
  schoolCode: string
  exam: ExamDataMain
}

const formatDate = (value?: string) => {
  if (!value) return '-'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return date.toLocaleString('en-NG', { year: 'numeric', month: 'short', day: 'numeric' })
}

const statusBadge = (status?: string) => {
  const normalized = (status || '').toLowerCase().replace(' ', '-')
  const styles =
    normalized === 'approved' || normalized === 'completed' || normalized === 'onboarded'
      ? 'bg-green-100 text-green-800'
      : normalized === 'rejected'
      ? 'bg-red-100 text-red-800'
      : normalized === 'pending'
      ? 'bg-yellow-100 text-yellow-800'
      : normalized === 'not-applied'
      ? 'bg-gray-100 text-gray-500'
      : 'bg-blue-100 text-blue-700'
  const label = status === 'not applied' ? 'Not Applied' : (status || 'Unknown')
  return (
    <span className={`px-2 py-1 text-xs font-semibold rounded whitespace-nowrap ${styles}`}>
      {label}
    </span>
  )
}

export default function TransactionLogsModal({ isOpen, onClose }: TransactionLogsModalProps) {
  const { data, isLoading, isError, refetch } = useGetMyPaidSchoolsTransactionsQuery(
    undefined,
    { skip: !isOpen }
  )

  // Flatten schools → one row per school-exam pair, excluding unapplied exams
  const rows: FlatRow[] = useMemo(() => {
    if (!data?.data) return []
    return data.data.flatMap((school: PaidSchool) =>
      (school.exams || [])
        .filter((exam) => exam.status !== 'not applied')
        .map((exam) => ({
          schoolId: school._id,
          schoolName: school.schoolName,
          schoolCode: school.schoolCode,
          exam,
        }))
    )
  }, [data])

  const totalSchools = data?.pagination?.totalItems ?? 0

  // Client-side pagination
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)

  const totalPages = Math.ceil(rows.length / itemsPerPage)
  const paginatedRows = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage
    return rows.slice(start, start + itemsPerPage)
  }, [rows, currentPage, itemsPerPage])

  // Reset to page 1 when modal reopens or data changes
  useEffect(() => {
    if (isOpen) setCurrentPage(1)
  }, [isOpen])

  // ESC key listener
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) onClose()
    }
    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-5xl w-full max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
              <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Transaction Logs</h2>
              {totalSchools > 0 && (
                <p className="text-xs text-gray-500 mt-0.5">{totalSchools} {totalSchools === 1 ? 'school' : 'schools'}</p>
              )}
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-auto p-6">
          {isLoading ? (
            <div className="flex items-center justify-center py-16">
              <div className="w-8 h-8 border-2 border-green-600 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : isError ? (
            <div className="text-center py-16">
              <p className="text-sm text-gray-600 mb-4">Failed to load transaction logs. Please try again.</p>
              <button
                onClick={() => refetch()}
                className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium cursor-pointer"
              >
                Retry
              </button>
            </div>
          ) : rows.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-sm text-gray-600">No records found.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-xs font-medium text-gray-500 border-b border-gray-200">
                    <th className="py-3 pr-4">School</th>
                    <th className="py-3 pr-4">Code</th>
                    <th className="py-3 pr-4">Exam</th>
                    <th className="py-3 pr-4">Status</th>
                    <th className="py-3 pr-4 text-right">Total Points</th>
                    <th className="py-3 pr-4 text-right">Used Points</th>
                    <th className="py-3 pr-4 text-right">Available</th>
                    <th className="py-3 pr-4 text-right">Students</th>
                    <th className="py-3 text-right">Last Payment</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedRows.map((row, index) => (
                    <tr
                      key={`${row.schoolId}-${row.exam.name}-${index}`}
                      className="border-b border-gray-100 last:border-0 hover:bg-gray-50 transition-colors"
                    >
                      <td className="py-3 pr-4 text-gray-900 font-medium">{row.schoolName}</td>
                      <td className="py-3 pr-4 text-gray-500 whitespace-nowrap">{row.schoolCode}</td>
                      <td className="py-3 pr-4">
                        <span className="px-2 py-1 text-xs font-medium bg-blue-50 text-blue-700 rounded">
                          {row.exam.name}
                        </span>
                      </td>
                      <td className="py-3 pr-4">{statusBadge(row.exam.status)}</td>
                      <td className="py-3 pr-4 text-right text-gray-700">{row.exam.totalPoints ?? '-'}</td>
                      <td className="py-3 pr-4 text-right text-gray-700">{row.exam.usedPoints ?? '-'}</td>
                      <td className="py-3 pr-4 text-right text-gray-700">{row.exam.availablePoints ?? '-'}</td>
                      <td className="py-3 pr-4 text-right text-gray-700">{row.exam.numberOfStudents ?? '-'}</td>
                      <td className="py-3 text-right text-gray-500 whitespace-nowrap">{formatDate(row.exam.lastPointsEarned)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {totalPages > 1 && (
            <div className="mt-4">
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                itemsPerPage={itemsPerPage}
                totalItems={rows.length}
                onPageChange={setCurrentPage}
                onItemsPerPageChange={(n) => { setItemsPerPage(n); setCurrentPage(1) }}
              />
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-4 border-t border-gray-200">
          <p className="text-xs text-gray-500">
            {rows.length} {rows.length === 1 ? 'entry' : 'entries'}
          </p>
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}
