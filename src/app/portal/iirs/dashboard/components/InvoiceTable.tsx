"use client"

import { FaMagnifyingGlass } from "react-icons/fa6";
import { useState, useMemo, useEffect } from "react";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa6";
import { FiChevronDown } from "react-icons/fi";
import InvoiceDetails from "./InvoiceDetails";
import { getPaymentsData, Payment } from "@/lib/iirs/dataInteraction";
import { useAuth } from '@/app/portal/iirs/providers/AuthProvider';

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
};

const formatAmount = (amount: number) => {
  return `₦${amount.toLocaleString()}`;
};


export default function InvoiceTable() {
  const {token} = useAuth();
  const [transactions, setTransactions] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [invoiceData, setInvoiceData] = useState<Payment | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPeriod, setSelectedPeriod] = useState<'1day' | '1week' | '1month' | '1year' | 'all'>('all');
  const [showPeriodDropdown, setShowPeriodDropdown] = useState(false);
  const itemsPerPage = 10;

  useEffect(() => {
    if(!token) return;
    async function fetchData(tokenKey: string, period: '1day' | '1week' | '1month' | '1year' | 'all') {
      try {
        setLoading(true);
        const result = await getPaymentsData(tokenKey, 1, undefined, period);
        console.log(result.payments.length);
        setTransactions(result.payments);
        setLoading(false);
      } catch (e) {
        console.error(e)
        setLoading(false);
      }
    }
    fetchData(token, selectedPeriod);

  }, [token, selectedPeriod]);
  
  // const router = useRouter();
  // const id = useSearchParams().get('transactionId');

  // Filter transactions based on search term
  const filteredTransactions = useMemo(() => {
    if (!searchTerm.trim()) {
      return transactions;
    }

    const searchLower = searchTerm.toLowerCase();
    return transactions.filter((transaction: Payment) => {
      return (
        transaction.schoolName?.toLowerCase().includes(searchLower) ||
        transaction.reference?.toLowerCase().includes(searchLower) ||
        transaction.numberOfStudents?.toString().includes(searchLower) ||
        transaction.amount?.toString().includes(searchLower) ||
        formatDate(transaction.paidAt)?.toLowerCase().includes(searchLower)
      );
    });
  }, [transactions, searchTerm]); 

  // Calculate pagination based on filtered results
  const totalPages = Math.ceil((filteredTransactions || []).length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentTransactions = filteredTransactions?.slice(startIndex, endIndex);

  // Generate page numbers for pagination
  const getPageNumbers = () => {
    const pageNumbers = [];
    const maxVisiblePages = 5;

    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(i);
      }
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) {
          pageNumbers.push(i);
        }
        pageNumbers.push('...');
        pageNumbers.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        pageNumbers.push(1);
        pageNumbers.push('...');
        for (let i = totalPages - 3; i <= totalPages; i++) {
          pageNumbers.push(i);
        }
      } else {
        pageNumbers.push(1);
        pageNumbers.push('...');
        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
          pageNumbers.push(i);
        }
        pageNumbers.push('...');
        pageNumbers.push(totalPages);
      }
    }
    return pageNumbers;
  };

  const closeInvoiceDetails = () => {
    setInvoiceData(null);
  }

  if (loading) {
    return (
      <div className="bg-white rounded-lg p-6 shadow-sm border h-full overflow-y-auto border-gray-100">
        {/* Header Skeleton */}
        <div className="flex justify-between items-center mb-6">
          <div className="h-7 bg-gray-200 rounded w-40 animate-pulse"></div>
          <div className="flex items-center space-x-3">
            <div className="h-10 bg-gray-200 rounded-lg w-48 animate-pulse"></div>
            <div className="h-10 bg-gray-200 rounded-lg w-20 animate-pulse"></div>
          </div>
        </div>

        {/* Table Skeleton */}
        <div className="">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4">
                  <div className="h-4 bg-gray-200 rounded w-24 animate-pulse"></div>
                </th>
                <th className="text-left py-3 px-4">
                  <div className="h-4 bg-gray-200 rounded w-16 animate-pulse"></div>
                </th>
                <th className="text-left py-3 px-4">
                  <div className="h-4 bg-gray-200 rounded w-12 animate-pulse"></div>
                </th>
                <th className="text-left py-3 px-4">
                  <div className="h-4 bg-gray-200 rounded w-20 animate-pulse"></div>
                </th>
                <th className="text-right py-3 px-4">
                  <div className="h-4 bg-gray-200 rounded w-16 animate-pulse ml-auto"></div>
                </th>
              </tr>
            </thead>
            <tbody>
              {[...Array(8)].map((_, index) => (
                <tr key={index} className="border-b border-gray-100">
                  <td className="py-4 px-4">
                    <div className="h-5 bg-gray-200 rounded w-32 animate-pulse"></div>
                  </td>
                  <td className="py-4 px-4">
                    <div className="h-4 bg-gray-200 rounded w-20 animate-pulse"></div>
                  </td>
                  <td className="py-4 px-4">
                    <div className="h-4 bg-gray-200 rounded w-16 animate-pulse"></div>
                  </td>
                  <td className="py-4 px-4">
                    <div className="h-4 bg-gray-200 rounded w-24 animate-pulse"></div>
                  </td>
                  <td className="py-4 px-4 text-right">
                    <div className="h-5 bg-gray-200 rounded w-20 animate-pulse ml-auto"></div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination Skeleton */}
        <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-200">
          <div className="h-4 bg-gray-200 rounded w-32 animate-pulse"></div>
          <div className="flex items-center space-x-2">
            <div className="h-8 w-8 bg-gray-200 rounded animate-pulse"></div>
            <div className="h-8 w-8 bg-gray-200 rounded animate-pulse"></div>
            <div className="h-8 w-8 bg-gray-200 rounded animate-pulse"></div>
            <div className="h-8 w-8 bg-gray-200 rounded animate-pulse"></div>
            <div className="h-8 w-8 bg-gray-200 rounded animate-pulse"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg p-6 shadow-sm border h-full overflow-y-auto border-gray-100 ">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-900">All Transactions</h2>
        <div className="flex items-center space-x-3">
          <div className="relative">
            <FaMagnifyingGlass className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm" />
            <input
              type="text"
              placeholder="Search transactions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>
          
          {/* Period Filter Dropdown */}
          <div className="relative">
            <button 
              onClick={() => setShowPeriodDropdown(!showPeriodDropdown)}
              className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50 transition-colors min-w-[120px]"
            >
              <span className="text-gray-700 font-medium">
                {selectedPeriod === '1day' && '1 Day'}
                {selectedPeriod === '1week' && '1 Week'}
                {selectedPeriod === '1month' && '1 Month'}
                {selectedPeriod === '1year' && '1 Year'}
                {selectedPeriod === 'all' && 'All Time'}
              </span>
              <FiChevronDown className={`text-gray-400 transition-transform ${showPeriodDropdown ? 'rotate-180' : ''}`} />
            </button>
            
            {showPeriodDropdown && (
              <div className="absolute right-0 mt-2 w-40 bg-white rounded-lg border border-gray-200 shadow-lg z-10">
                <div className="p-2">
                  {[
                    { value: '1day' as const, label: '1 Day' },
                    { value: '1week' as const, label: '1 Week' },
                    { value: '1month' as const, label: '1 Month' },
                    { value: '1year' as const, label: '1 Year' },
                    { value: 'all' as const, label: 'All Time' }
                  ].map((period) => (
                    <button
                      key={period.value}
                      onClick={() => {
                        setSelectedPeriod(period.value);
                        setShowPeriodDropdown(false);
                        setCurrentPage(1);
                      }}
                      className={`w-full text-left px-3 py-2 text-sm rounded-lg transition-colors ${
                        selectedPeriod === period.value
                          ? 'bg-green-600 text-white font-medium'
                          : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      {period.label}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
          {/* <button className="bg-red-500 text-white px-4 py-2 rounded-lg text-sm hover:bg-red-600 transition-colors">
            + Request Payment
          </button> */}
        </div>
      </div>

      {invoiceData && (
        <InvoiceDetails transaction={invoiceData} onClose={() => closeInvoiceDetails()} />
      )}

      <div className="">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-left py-3 px-4 font-medium text-gray-600 text-sm">School Name</th>
              <th className="text-left py-3 px-4 font-medium text-gray-600 text-sm">Students</th>
              <th className="text-left py-3 px-4 font-medium text-gray-600 text-sm">Date</th>
              <th className="text-left py-3 px-4 font-medium text-gray-600 text-sm">Reference</th>
              <th className="text-right py-3 px-4 font-medium text-gray-600 text-sm">Amount</th>
            </tr>
          </thead>
          <tbody>
            {(currentTransactions || []).length > 0 ? (
              currentTransactions.map((transaction: Payment) => (
                <tr key={transaction.id} className="border-b border-gray-100 hover:bg-gray-50 cursor-pointer" onClick={() => setInvoiceData(transaction)}>
                  <td className="py-4 px-4">
                    <div className="flex items-center space-x-3">
                      <span className="font-medium text-gray-900">{transaction.schoolName.toLowerCase()}</span>
                    </div>
                  </td>
                  <td className="py-4 px-4 text-gray-600 text-sm">{transaction.numberOfStudents} students</td>
                  <td className="py-4 px-4 text-gray-600 text-xs">{formatDate(transaction.paidAt)}</td>
                  <td className="py-4 px-4 text-gray-600 font-mono text-xs max-w-10 overflow-hidden text-ellipsis">{transaction.reference}</td>
                  <td className="py-4 px-4 text-right font-medium text-gray-900">{formatAmount(transaction.amount)}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="py-12 text-center">
                  <div className="flex flex-col items-center space-y-3">
                    <FaMagnifyingGlass className="w-12 h-12 text-gray-300" />
                    <div>
                      <p className="text-gray-500 font-medium">No transactions found</p>
                      <p className="text-gray-400 text-sm mt-1">
                        {searchTerm ? `No results match "${searchTerm}"` : 'No transactions available'}
                      </p>
                    </div>
                    {searchTerm && (
                      <button
                        onClick={() => setSearchTerm('')}
                        className="text-green-600 hover:text-green-700 text-sm font-medium"
                      >
                        Clear search
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      {totalPages >= 1 && (
        <div className="flex items-center justify-between mt-6 px-4">
          <div className="text-sm text-gray-600">
            Showing {startIndex + 1} to {Math.min(endIndex, filteredTransactions.length)} of {filteredTransactions.length} results
            {searchTerm && (
              <span className="text-green-600 ml-1">
                (filtered from {transactions.length} total)
              </span>
            )}
          </div>

          <div className="flex items-center space-x-2">
            {/* Previous Button */}
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className={`flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${currentPage === 1
                  ? 'text-gray-400 cursor-not-allowed'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
            >
              <FaChevronLeft className="w-4 h-4 mr-1" />
              Previous
            </button>

            {/* Page Numbers */}
            <div className="flex items-center space-x-1">
              {getPageNumbers().map((pageNum, index) => {
                if (pageNum === '...') {
                  return (
                    <span key={`ellipsis-${index}`} className="px-3 py-2 text-gray-400">
                      ...
                    </span>
                  );
                }

                return (
                  <button
                    key={pageNum}
                    onClick={() => setCurrentPage(pageNum as number)}
                    className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors ${currentPage === pageNum
                        ? 'bg-green-600 text-white'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                      }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
            </div>

            {/* Next Button */}
            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className={`flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${currentPage === totalPages
                  ? 'text-gray-400 cursor-not-allowed'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
            >
              Next
              <FaChevronRight className="w-4 h-4 ml-1" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
