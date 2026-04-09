"use client"

import { useState, useEffect, useCallback } from 'react';
import { FaChevronLeft, FaChevronRight, FaCalendarAlt, FaDownload, FaFilter, FaTimes } from 'react-icons/fa';
import { IoEyeOutline, IoClose } from 'react-icons/io5';
import { useAuth } from '../../providers/AuthProvider';
import toast from 'react-hot-toast';
import { getPaymentsData, Payment } from '@/lib/iirs/dataInteraction';
import { Filter } from 'lucide-react';
import { FiFilter } from 'react-icons/fi';

// Interfaces based on actual API response
interface Subaccount {
    id: number;
    subaccount_code: string | null;
    business_name: string | null;
    description: string | null;
    primary_contact_name: string | null;
    primary_contact_email: string | null;
    primary_contact_phone: string | null;
    metadata: any;
    percentage_charge: number;
    settlement_bank: string | null;
    bank_id: number | null;
    account_number: string | null;
    currency: string;
    active: boolean;
    is_verified: boolean;
}

interface Payout {
    id: number;
    domain: string;
    status: string;
    currency: string;
    integration: number;
    total_amount: number;
    effective_amount: number;
    total_fees: number;
    total_processed: number;
    deductions: number | null;
    settlement_date: string;
    settled_by: string | null;
    createdAt: string;
    updatedAt: string;
    subaccount: Subaccount | null;
}

interface PayoutsResponse {
    data: Payout[];
    meta: {
        page: number;
        perPage: number;
        total: number;
        totalPages: number;
    };
}

export default function PayoutsPage() {
    const { token, user } = useAuth();

    // State management
    const [payouts, setPayouts] = useState<Payout[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [perPage, setPerPage] = useState(20);
    const [totalRecords, setTotalRecords] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [showFilter, setShowFilter] = useState(false);

    // Filter states
    const [fromDate, setFromDate] = useState('');
    const [toDate, setToDate] = useState('');
    const [appliedFilters, setAppliedFilters] = useState({
        from: '',
        to: '',
        perPage: 20
    });

    // Modal states
    const [selectedPayout, setSelectedPayout] = useState<Payout | null>(null);
    const [modalPayments, setModalPayments] = useState<Payment[]>([]);
    const [loadingPayments, setLoadingPayments] = useState(false);

    // Fetch payouts function
    const fetchPayouts = useCallback(async () => {
        if (!token) {
            setError('Authentication required');
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            setError(null);

            // Build query parameters
            const params = new URLSearchParams({
                page: currentPage.toString(),
                perPage: appliedFilters.perPage.toString(),
            });

            if (user?.adminType) {
                params.append('role', user.adminType);
            }
            if (appliedFilters.from) {
                params.append('from', appliedFilters.from);
            }
            if (appliedFilters.to) {
                params.append('to', appliedFilters.to);
            }

            const response = await fetch(
                `${process.env.NEXT_PUBLIC_API_BASE_URL}/iirs-admin/payouts?${params.toString()}`,
                {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    },
                }
            );

            if (!response.ok) {
                if (response.status === 401) {
                    throw new Error('Unauthorized access. Please log in again.');
                }
                throw new Error(`Failed to fetch payouts: ${response.statusText}`);
            }

            const data: PayoutsResponse = await response.json();

            setPayouts(data.data || []);
            setTotalRecords(data.meta?.total || 0);
            setTotalPages(data.meta?.totalPages || 0);
            setCurrentPage(data.meta?.page || 1);

        } catch (err) {
            console.error('Error fetching payouts:', err);
            const errorMessage = err instanceof Error ? err.message : 'Failed to load payouts';
            setError(errorMessage);
            toast.error(errorMessage);
        } finally {
            setLoading(false);
        }
    }, [token, currentPage, appliedFilters]);

    // Fetch payouts on mount and when dependencies change
    useEffect(() => {
        fetchPayouts();
    }, [fetchPayouts]);

    // Apply filters
    const handleApplyFilters = () => {
        setAppliedFilters({
            from: fromDate,
            to: toDate,
            perPage: perPage
        });
        setCurrentPage(1); // Reset to first page when filters change
    };

    // Clear filters
    const handleClearFilters = () => {
        setFromDate('');
        setToDate('');
        setPerPage(20);
        setAppliedFilters({
            from: '',
            to: '',
            perPage: 20
        });
        setCurrentPage(1);
    };

    // Pagination handlers
    const handlePreviousPage = () => {
        if (currentPage > 1) {
            setCurrentPage(currentPage - 1);
        }
    };

    const handleNextPage = () => {
        if (currentPage < totalPages) {
            setCurrentPage(currentPage + 1);
        }
    };

    const handlePageClick = (page: number) => {
        setCurrentPage(page);
    };

    // Get page numbers for pagination
    const getPageNumbers = () => {
        const pageNumbers: (number | string)[] = [];
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

    // Format currency (amounts are already in kobo)
    const formatCurrency = (amount: number, currency: string = 'NGN') => {
        const symbol = currency === 'NGN' ? '₦' : currency;
        return `${symbol}${(amount / 100).toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    };

    // Format date
    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    // Get status color
    const getStatusColor = (status: string) => {
        const statusLower = status.toLowerCase();
        if (statusLower === 'success' || statusLower === 'paid' || statusLower === 'completed') {
            return 'bg-green-100 text-green-800';
        }
        if (statusLower === 'pending' || statusLower === 'processing') {
            return 'bg-yellow-100 text-yellow-800';
        }
        if (statusLower === 'failed' || statusLower === 'rejected') {
            return 'bg-red-100 text-red-800';
        }
        return 'bg-gray-100 text-gray-800';
    };

    // Handle view payout details
    const handleViewPayout = async (payout: Payout) => {
        setSelectedPayout(payout);
        setLoadingPayments(true);

        try {
            // Calculate date range: previous day 12:00 AM to payout day 11:59 PM
            const payoutDate = new Date(payout.settlement_date);

            // Start date: previous day at 12:00 AM
            const startDate = new Date(payoutDate);
            startDate.setDate(startDate.getDate() - 1);
            startDate.setHours(0, 0, 0, 0);

            // End date: payout day at 11:59 PM
            const endDate = new Date(payoutDate);
            endDate.setDate(endDate.getDate() - 1);
            endDate.setHours(23, 59, 59, 999);

            // Fetch payments for this date range
            const result = await getPaymentsData(
                token!,
                1,
                1000, // Get a large number to capture all payments
                payoutDate.toDateString(), // from date
                'all'
            );

            // Filter payments that fall within our date range
            const filteredPayments = result.payments.filter(payment => {
                const paymentDate = new Date(payment.paidAt);
                return paymentDate >= startDate && paymentDate <= endDate;
            });

            setModalPayments(filteredPayments);
        } catch (error) {
            console.error('Error fetching payment details:', error);
            toast.error('Failed to load payment details');
        } finally {
            setLoadingPayments(false);
        }
    };

    // Close modal
    const handleCloseModal = () => {
        setSelectedPayout(null);
        setModalPayments([]);
    };

    // Export to CSV (optional feature)
    const handleExportCSV = () => {
        if (payouts.length === 0) {
            toast.error('No data to export');
            return;
        }

        const headers = ['ID', 'Subaccount Code', 'Business Name', 'Total Amount', 'Effective Amount', 'Total Processed', 'Status', 'Settlement Date', 'Settlement Bank', 'Account Number'];
        const rows = payouts.map(payout => [
            payout.id.toString(),
            payout.subaccount?.subaccount_code || 'N/A',
            payout.subaccount?.business_name || 'IDCL Revenue Account',
            (payout.total_amount / 100).toString(),
            (payout.effective_amount / 100).toString(),
            (payout.total_processed / 100).toString(),
            payout.status,
            payout.settlement_date,
            payout.subaccount?.settlement_bank || 'Fidelity Bank',
            payout.subaccount?.account_number || 'N/A'
        ]);

        const csvContent = [
            headers.join(','),
            ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `payouts_${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
        toast.success('CSV exported successfully');
    };

    return (
        <div className="h-full w-full overflow-y-auto px-4 sm:px-6 lg:px-8">
            <div className="w-full mt-6 sm:mt-8 lg:mt-10 pb-6">
                {/* Header */}
                <div className="mb-6 flex items-center justify-between">
                    <div>

                        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
                            Payouts History
                        </h1>
                        {(appliedFilters.from || appliedFilters.to) && (
                            <p className="text-sm text-gray-600">
                                {appliedFilters.from && appliedFilters.to
                                    ? `Showing payouts from ${appliedFilters.from} to ${appliedFilters.to}`
                                    : appliedFilters.from
                                        ? `Showing payouts from ${appliedFilters.from}`
                                        : `Showing payouts up to ${appliedFilters.to}`
                                }
                            </p>
                        )}
                    </div>
                    <button
                        className={`flex items-center gap-2 border border-gray-300 hover:bg-gray-50 text-gray-700 px-4 py-2 rounded-lg font-medium transition-colors p-2 cursor-pointer ${showFilter ? 'border-green-500 ' : 'bg-white'}`}
                        onClick={() => setShowFilter(!showFilter)}
                    >
                        <FiFilter /> Filter
                    </button>
                </div>

                {/* Filter Section */}
                {showFilter && <div className="bg-white rounded-lg p-4 sm:p-6 shadow-sm border border-gray-100 mb-6">
                    {/* <div className="flex items-center gap-2 mb-4">
                        <FaFilter className="text-gray-600" />
                        <h2 className="text-lg font-semibold text-gray-900">Filters</h2>
                    </div> */}

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        {/* From Date */}
                        <div>
                            <label htmlFor="fromDate" className="block text-sm font-medium text-gray-700 mb-1">
                                From Date
                            </label>
                            <div className="relative">
                                <FaCalendarAlt className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
                                <input
                                    type="date"
                                    id="fromDate"
                                    value={fromDate}
                                    onChange={(e) => setFromDate(e.target.value)}
                                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                />
                            </div>
                        </div>

                        {/* To Date */}
                        <div>
                            <label htmlFor="toDate" className="block text-sm font-medium text-gray-700 mb-1">
                                To Date
                            </label>
                            <div className="relative">
                                <FaCalendarAlt className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
                                <input
                                    type="date"
                                    id="toDate"
                                    value={toDate}
                                    onChange={(e) => setToDate(e.target.value)}
                                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                />
                            </div>
                        </div>

                        {/* Items per page */}
                        <div>
                            <label htmlFor="perPage" className="block text-sm font-medium text-gray-700 mb-1">
                                Items per page
                            </label>
                            <select
                                id="perPage"
                                value={perPage}
                                onChange={(e) => setPerPage(Number(e.target.value))}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                            >
                                <option value={10}>10</option>
                                <option value={20}>20</option>
                                <option value={50}>50</option>
                                <option value={100}>100</option>
                            </select>
                        </div>

                        {/* Filter Buttons */}
                        <div className="flex items-end gap-2">
                            <button
                                onClick={handleApplyFilters}
                                className="flex-1 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                            >
                                Apply
                            </button>
                            <button
                                onClick={handleClearFilters}
                                className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-2 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                            >
                                <FaTimes className="text-sm" />
                                Clear
                            </button>
                        </div>
                    </div>
                </div>}
                {/* Main Content */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-100">
                    {/* Table Header with Export */}
                    <div className="px-4 sm:px-6 py-4 border-b border-gray-200">
                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
                            <div>
                                <h2 className="text-lg font-semibold text-gray-900">Payout Records</h2>
                                <p className="text-sm text-gray-600 mt-1">
                                    {totalRecords} total record{totalRecords !== 1 ? 's' : ''}
                                </p>
                            </div>
                            <button
                                onClick={handleExportCSV}
                                disabled={payouts.length === 0}
                                className="flex items-center gap-2 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <FaDownload className="text-sm" />
                                Export CSV
                            </button>
                        </div>
                    </div>

                    {/* Loading State */}
                    {loading && (
                        <div className="p-8">
                            <div className="animate-pulse space-y-4">
                                {[...Array(5)].map((_, index) => (
                                    <div key={index} className="flex gap-4">
                                        <div className="h-12 bg-gray-200 rounded flex-1"></div>
                                        <div className="h-12 bg-gray-200 rounded w-32"></div>
                                        <div className="h-12 bg-gray-200 rounded w-24"></div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Error State */}
                    {error && !loading && (
                        <div className="p-8 text-center">
                            <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mb-4">
                                <FaTimes className="text-red-600 text-2xl" />
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">Error Loading Payouts</h3>
                            <p className="text-gray-600 mb-4">{error}</p>
                            <button
                                onClick={fetchPayouts}
                                className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
                            >
                                Retry
                            </button>
                        </div>
                    )}

                    {/* Empty State */}
                    {!loading && !error && payouts.length === 0 && (
                        <div className="p-8 text-center">
                            <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
                                <FaCalendarAlt className="text-gray-400 text-2xl" />
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Payouts Found</h3>
                            <p className="text-gray-600">
                                {appliedFilters.from || appliedFilters.to
                                    ? 'Try adjusting your filters to see more results.'
                                    : 'There are no payout records to display.'}
                            </p>
                        </div>
                    )}

                    {/* Table */}
                    {!loading && !error && payouts.length > 0 && (
                        <>
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-green-600 text-white">
                                        <tr>
                                            <th className="px-4 py-3 text-left text-sm font-semibold">Payout ID</th>
                                            <th className="px-4 py-3 text-left text-sm font-semibold">Subaccount</th>
                                            <th className="px-4 py-3 text-left text-sm font-semibold">Total Amount</th>
                                            <th className="px-4 py-3 text-left text-sm font-semibold">Effective Amount</th>
                                            <th className="px-4 py-3 text-left text-sm font-semibold">Status</th>
                                            <th className="px-4 py-3 text-left text-sm font-semibold">Settlement Date</th>
                                            <th className="px-4 py-3 text-left text-sm font-semibold">Bank Details</th>
                                            <th className="px-4 py-3 text-center text-sm font-semibold">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200">
                                        {payouts.map((payout, index) => (
                                            <tr
                                                key={payout.id}
                                                className={`${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'} hover:bg-green-50 transition-colors`}
                                            >
                                                <td className="px-4 py-3 text-sm text-gray-900 font-mono">
                                                    #{payout.id}
                                                </td>
                                                <td className="px-4 py-3 text-sm text-gray-900">
                                                    <div>
                                                        <div className="font-medium">
                                                            {payout.subaccount?.business_name || 'IDCL Revenue Account'}
                                                        </div>
                                                        {payout.subaccount?.subaccount_code && (
                                                            <div className="text-xs text-gray-500 font-mono" title={payout.subaccount.subaccount_code}>
                                                                {payout.subaccount.subaccount_code}
                                                            </div>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3 text-sm font-semibold text-gray-900">
                                                    {formatCurrency(payout.total_amount, payout.currency)}
                                                </td>
                                                <td className="px-4 py-3 text-sm font-semibold text-green-700">
                                                    {formatCurrency(payout.effective_amount, payout.currency)}
                                                </td>
                                                <td className="px-4 py-3 text-sm">
                                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(payout.status)}`}>
                                                        {payout.status}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3 text-sm text-gray-600">
                                                    {formatDate(payout.settlement_date)}
                                                </td>
                                                <td className="px-4 py-3 text-sm text-gray-900">
                                                    <div>
                                                        <div className="font-medium">
                                                            {payout.subaccount?.settlement_bank || 'Fidelity Bank'}
                                                        </div>
                                                        {payout.subaccount?.account_number && (
                                                            <div className="text-xs text-gray-500 font-mono">
                                                                {payout.subaccount.account_number}
                                                            </div>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3 text-center">
                                                    <button
                                                        onClick={() => handleViewPayout(payout)}
                                                        className="inline-flex items-center justify-center p-2 rounded-lg hover:bg-green-50 text-green-600 hover:text-green-700 transition-colors"
                                                        title="View payout details"
                                                    >
                                                        <IoEyeOutline className="text-xl" />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {/* Pagination */}
                            <div className="px-4 sm:px-6 py-4 border-t border-gray-200">
                                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                                    <div className="text-sm text-gray-600">
                                        Showing {((currentPage - 1) * appliedFilters.perPage) + 1} to{' '}
                                        {Math.min(currentPage * appliedFilters.perPage, totalRecords)} of{' '}
                                        {totalRecords} results
                                    </div>

                                    <div className="flex items-center gap-2">
                                        {/* Previous Button */}
                                        <button
                                            onClick={handlePreviousPage}
                                            disabled={currentPage === 1}
                                            className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                            aria-label="Previous page"
                                        >
                                            <FaChevronLeft className="text-sm text-gray-600" />
                                        </button>

                                        {/* Page Numbers */}
                                        {getPageNumbers().map((pageNum, index) => (
                                            pageNum === '...' ? (
                                                <span key={`ellipsis-${index}`} className="px-2 text-gray-500">...</span>
                                            ) : (
                                                <button
                                                    key={pageNum}
                                                    onClick={() => handlePageClick(pageNum as number)}
                                                    className={`px-3 py-1 rounded-lg font-medium text-sm transition-colors ${currentPage === pageNum
                                                        ? 'bg-green-600 text-white'
                                                        : 'border border-gray-300 hover:bg-gray-50 text-gray-700'
                                                        }`}
                                                >
                                                    {pageNum}
                                                </button>
                                            )
                                        ))}

                                        {/* Next Button */}
                                        <button
                                            onClick={handleNextPage}
                                            disabled={currentPage === totalPages}
                                            className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                            aria-label="Next page"
                                        >
                                            <FaChevronRight className="text-sm text-gray-600" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </>
                    )}
                </div>
                {/* Payout Details Modal */}
                {selectedPayout && (
                    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                        <div className="bg-white rounded-2xl shadow-2xl max-w-6xl w-full max-h-[90vh] relative overflow-hidden flex flex-col">
                            {/* Modal Header */}
                            <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-green-50 to-green-100">
                                <div>
                                    <h2 className="text-2xl font-bold text-gray-900">Payout Details</h2>
                                    <p className="text-sm text-gray-600 mt-1">
                                        Payout ID: #{selectedPayout.id}
                                    </p>
                                </div>
                                <button
                                    onClick={handleCloseModal}
                                    className="p-2 hover:bg-white rounded-lg transition-colors"
                                >
                                    <IoClose className="w-6 h-6 text-gray-500" />
                                </button>
                            </div>

                            {/* Payout Summary */}
                            <div className="p-6 border-b border-gray-200 bg-gray-50">
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                    <div>
                                        <p className="text-sm text-gray-600 mb-1">Subaccount</p>
                                        <p className="font-semibold text-gray-900">
                                            {selectedPayout.subaccount?.business_name || 'Revenue Account (No Subaccount)'}
                                        </p>
                                        {selectedPayout.subaccount?.subaccount_code && (
                                            <p className="text-xs text-gray-500 font-mono">{selectedPayout.subaccount.subaccount_code}</p>
                                        )}
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-600 mb-1">Total Amount</p>
                                        <p className="font-semibold text-gray-900">{formatCurrency(selectedPayout.total_amount, selectedPayout.currency)}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-600 mb-1">Effective Amount</p>
                                        <p className="font-semibold text-green-700">{formatCurrency(selectedPayout.effective_amount, selectedPayout.currency)}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-600 mb-1">Settlement Date</p>
                                        <p className="font-semibold text-gray-900">{formatDate(selectedPayout.settlement_date)}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-600 mb-1">Bank</p>
                                        <p className="font-semibold text-gray-900">
                                            {selectedPayout.subaccount?.settlement_bank || 'N/A'}
                                        </p>
                                        {selectedPayout.subaccount?.account_number && (
                                            <p className="text-xs text-gray-500 font-mono">{selectedPayout.subaccount.account_number}</p>
                                        )}
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-600 mb-1">Total Processed</p>
                                        <p className="font-semibold text-gray-900">{formatCurrency(selectedPayout.total_processed, selectedPayout.currency)}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-600 mb-1">Total Fees</p>
                                        <p className="font-semibold text-gray-900">{formatCurrency(selectedPayout.total_fees, selectedPayout.currency)}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-600 mb-1">Status</p>
                                        <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedPayout.status)}`}>
                                            {selectedPayout.status}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Payments Table */}
                            <div className="flex-1 overflow-y-auto p-6">
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                                    Payments ({modalPayments.length})
                                </h3>
                                <p className="text-sm text-gray-600 mb-4">
                                    Showing payments from {new Date(new Date(selectedPayout.settlement_date).getTime() - 24 * 60 * 60 * 1000).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} 12:00 AM to {new Date(selectedPayout.settlement_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} 11:59 PM
                                </p>

                                {loadingPayments ? (
                                    <div className="flex items-center justify-center py-12">
                                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
                                    </div>
                                ) : modalPayments.length === 0 ? (
                                    <div className="text-center py-12">
                                        <p className="text-gray-500">No payments found for this payout period</p>
                                    </div>
                                ) : (
                                    <div className="overflow-x-auto">
                                        <table className="w-full">
                                            <thead className="bg-gray-100 border-b border-gray-200">
                                                <tr>
                                                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">School</th>
                                                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">Reference</th>
                                                    <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700">Amount</th>
                                                    <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700">Students</th>
                                                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">Date</th>
                                                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">Status</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-200">
                                                {modalPayments.map((payment, index) => (
                                                    <tr key={payment.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                                                        <td className="px-4 py-3 text-sm text-gray-900">
                                                            <div className="font-medium">{payment.schoolName}</div>
                                                            <div className="text-xs text-gray-500">{payment.schoolCode}</div>
                                                        </td>
                                                        <td className="px-4 py-3 text-xs font-mono text-gray-600">
                                                            {payment.reference.substring(0, 20)}...
                                                        </td>
                                                        <td className="px-4 py-3 text-sm font-semibold text-gray-900 text-right">
                                                            ₦{payment.amount.toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                                        </td>
                                                        <td className="px-4 py-3 text-sm text-gray-900 text-right">
                                                            {payment.numberOfStudents}
                                                        </td>
                                                        <td className="px-4 py-3 text-sm text-gray-600">
                                                            {new Date(payment.paidAt).toLocaleDateString('en-US', {
                                                                month: 'short',
                                                                day: 'numeric',
                                                                hour: '2-digit',
                                                                minute: '2-digit'
                                                            })}
                                                        </td>
                                                        <td className="px-4 py-3 text-sm">
                                                            <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                                                {payment.paymentStatus}
                                                            </span>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                            {/* <tfoot className="bg-gray-50 border-t-2 border-gray-300">
                                                <tr>
                                                    <td colSpan={2} className="px-4 py-3 text-sm font-semibold text-gray-900">Total</td>
                                                    <td className="px-4 py-3 text-sm font-bold text-gray-900 text-right">
                                                        ₦{modalPayments.reduce((sum, p) => sum + p.amount, 0).toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                                    </td>
                                                    <td className="px-4 py-3 text-sm font-semibold text-gray-900 text-right">
                                                        {modalPayments.reduce((sum, p) => sum + p.numberOfStudents, 0)}
                                                    </td>
                                                    <td colSpan={2}></td>
                                                </tr>
                                            </tfoot> */}
                                        </table>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}            </div>
        </div>
    );
}
