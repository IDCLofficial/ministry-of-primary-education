'use client'

import { useState } from 'react'
import Header from '../components/Header'
import DashboardShell from '../components/DashboardShell'
import Pagination from '../components/Pagination'
import { useGetAeeTransactionsQuery, useVerifyTransactionMutation, ExamTypeEnum } from '../../store/api/authApi'
import { generateTransactionsPDF } from '../../utils/pdfGenerator'

const formatNaira = (n: number) =>
  new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', maximumFractionDigits: 0 }).format(n || 0)

const formatDate = (value?: string) => {
  if (!value) return '-'
  const d = new Date(value)
  return Number.isNaN(d.getTime()) ? value : d.toLocaleString('en-NG', { year: 'numeric', month: 'short', day: 'numeric' })
}

const statusBadge = (status: string) => {
  const styles =
    status === 'successful' ? 'bg-green-100 text-green-800'
    : status === 'failed' ? 'bg-red-100 text-red-800'
    : status === 'cancelled' ? 'bg-gray-100 text-gray-600'
    : 'bg-yellow-100 text-yellow-800'
  return <span className={`px-2 py-1 text-xs font-semibold rounded capitalize ${styles}`}>{status}</span>
}

export default function TransactionHistoryPage() {
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(20)
  const [status, setStatus] = useState<'successful' | 'failed' | 'pending' | 'cancelled' | ''>('')
  const [examType, setExamType] = useState<string>('')
  const [from, setFrom] = useState('')
  const [to, setTo] = useState('')

  const { data, isLoading, isError, isFetching, refetch } = useGetAeeTransactionsQuery(
    {
      page,
      limit,
      status: status || undefined,
      examType: examType || undefined,
      from: from || undefined,
      to: to || undefined,
    },
    { refetchOnMountOrArgChange: true },
  )

  const [verifyTransaction, { isLoading: isVerifying }] = useVerifyTransactionMutation()
  const [resolvingRef, setResolvingRef] = useState<string | null>(null)

  const handleResolve = async (reference: string) => {
    setResolvingRef(reference)
    try {
      await verifyTransaction(reference).unwrap()
    } catch {
      // error handled by RTK Query state
    } finally {
      setResolvingRef(null)
    }
  }

  const transactions = data?.data ?? []
  const summary = data?.summary
  const pagination = data?.pagination

  const resetToFirstPage = () => setPage(1)

  return (
    <div className="sm:p-4 p-2 bg-[#F3F3F3] min-h-screen relative w-full flex flex-col">
      <Header schoolCount={0} />

      <div className="flex-1 mt-4 sm:mt-6">
        <div className="max-w-7xl mx-auto">
          <DashboardShell active="transactions">
            <div className="mb-6 flex items-start justify-between gap-4">
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">Transaction History</h1>
                <p className="text-sm text-gray-600">All payments made by schools in your LGA</p>
              </div>
              <button
                onClick={() => generateTransactionsPDF(transactions, summary, { status: status || undefined, examType: examType || undefined, from: from || undefined, to: to || undefined })}
                disabled={transactions.length === 0}
                className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium cursor-pointer hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
              >
                Export PDF
              </button>
            </div>

            {/* Summary cards */}
            {summary && (
              <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3 mb-6">
                <div className="bg-white border border-gray-200 rounded-lg p-4">
                  <p className="text-xs text-gray-500">Total Amount Paid</p>
                  <p className="text-lg font-bold text-gray-900">{formatNaira(summary.totalRevenue)}</p>
                </div>
                <div className="bg-white border border-gray-200 rounded-lg p-4">
                  <p className="text-xs text-gray-500">Total Transactions</p>
                  <p className="text-lg font-bold text-gray-900">{summary.totalTransactions}</p>
                </div>
                <div className="bg-white border border-gray-200 rounded-lg p-4">
                  <p className="text-xs text-gray-500">Successful</p>
                  <p className="text-lg font-bold text-green-700">{summary.successful}</p>
                </div>
                <div className="bg-white border border-gray-200 rounded-lg p-4">
                  <p className="text-xs text-gray-500">Pending</p>
                  <p className="text-lg font-bold text-yellow-700">{summary.pending}</p>
                </div>
                <div className="bg-white border border-gray-200 rounded-lg p-4">
                  <p className="text-xs text-gray-500">Failed</p>
                  <p className="text-lg font-bold text-red-700">{summary.failed}</p>
                </div>
                <div className="bg-white border border-gray-200 rounded-lg p-4">
                  <p className="text-xs text-gray-500">Cancelled</p>
                  <p className="text-lg font-bold text-gray-500">{summary.cancelled}</p>
                </div>
              </div>
            )}

            {/* Filters */}
            <div className="bg-white border border-gray-200 rounded-lg p-4 mb-4 flex flex-wrap gap-3 items-end">
              <div>
                <label className="block text-xs text-gray-500 mb-1">Status</label>
                <select
                  value={status}
                  onChange={e => { setStatus(e.target.value as typeof status); resetToFirstPage() }}
                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
                >
                  <option value="">All</option>
                  <option value="successful">Successful</option>
                  <option value="pending">Pending</option>
                  <option value="failed">Failed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Exam Type</label>
                <select
                  value={examType}
                  onChange={e => { setExamType(e.target.value); resetToFirstPage() }}
                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
                >
                  <option value="">All</option>
                  {Object.values(ExamTypeEnum).map(v => (
                    <option key={v} value={v}>{v}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">From</label>
                <input type="date" value={from} onChange={e => { setFrom(e.target.value); resetToFirstPage() }}
                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm" />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">To</label>
                <input type="date" value={to} onChange={e => { setTo(e.target.value); resetToFirstPage() }}
                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm" />
              </div>
            </div>

            {/* Table */}
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              {isLoading ? (
                <div className="flex items-center justify-center py-16">
                  <div className="w-8 h-8 border-2 border-green-600 border-t-transparent rounded-full animate-spin" />
                </div>
              ) : isError ? (
                <div className="text-center py-16">
                  <p className="text-sm text-gray-600 mb-4">Failed to load transactions.</p>
                  <button onClick={() => refetch()} className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium cursor-pointer">Retry</button>
                </div>
              ) : transactions.length === 0 ? (
                <div className="text-center py-16 text-sm text-gray-600">No transactions found.</div>
              ) : (
                <div className={`overflow-x-auto ${isFetching ? 'opacity-60' : ''}`}>
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-left text-xs font-medium text-gray-500 border-b border-gray-200">
                        <th className="py-3 pr-4">School</th>
                        <th className="py-3 pr-4">Date</th>
                        <th className="py-3 pr-4">Exam</th>
                        <th className="py-3 pr-4 text-right">Students</th>
                        <th className="py-3 pr-4 text-right">Amount</th>
                        <th className="py-3 pr-4">Status</th>
                        <th className="py-3 pr-4">Reference</th>
                      </tr>
                    </thead>
                    <tbody>
                      {transactions.map(tx => (
                        <tr key={tx._id} className="border-b border-gray-100 last:border-0 hover:bg-gray-50">
                          <td className="py-3 pr-4 text-gray-900 font-medium">{tx.school?.schoolName ?? '-'}</td>
                          <td className="py-3 pr-4 text-gray-500 whitespace-nowrap">{formatDate(tx.paidAt ?? tx.createdAt)}</td>
                          <td className="py-3 pr-4">
                            <span className="px-2 py-1 text-xs font-medium bg-blue-50 text-blue-700 rounded">{tx.examType}</span>
                          </td>
                          <td className="py-3 pr-4 text-right text-gray-700">{tx.numberOfStudents}</td>
                          <td className="py-3 pr-4 text-right text-gray-700">{formatNaira(tx.totalAmount)}</td>
                          <td className="py-3 pr-4">
                            {statusBadge(tx.paymentStatus)}
                            {tx.paymentStatus === 'pending' && (
                              <button
                                onClick={() => handleResolve(tx.reference)}
                                disabled={isVerifying && resolvingRef === tx.reference}
                                className="block mt-1.5 px-3 py-1 bg-green-600 text-white rounded-lg text-xs font-medium cursor-pointer hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                              >
                                {isVerifying && resolvingRef === tx.reference ? 'Verifying...' : 'Resolve'}
                              </button>
                            )}
                          </td>
                          <td className="py-3 pr-4 text-gray-500 whitespace-nowrap">{tx.reference}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  {pagination && pagination.totalPages > 0 && (
                    <Pagination
                      currentPage={pagination.page}
                      totalPages={pagination.totalPages}
                      itemsPerPage={pagination.limit || limit}
                      totalItems={pagination.total}
                      onPageChange={setPage}
                      onItemsPerPageChange={(n) => { setLimit(n); resetToFirstPage() }}
                    />
                  )}
                </div>
              )}
            </div>
          </DashboardShell>
        </div>
      </div>
    </div>
  )
}
