"use client"

import { useState } from 'react';
import { FiDownload } from 'react-icons/fi';
import { useAuth } from '../../providers/AuthProvider';
import { getPaymentsData, getTransactionData } from '@/lib/iirs/dataInteraction';
import { generatePaymentReportPDF } from '@/lib/iirs/pdfGenerator';

export default function DownloadReportButton() {
  const { token } = useAuth();
  const [isDownloading, setIsDownloading] = useState(false);
  const [showPeriodMenu, setShowPeriodMenu] = useState(false);

  const periods = [
    { value: '1day' as const, label: '1 Day' },
    { value: '1week' as const, label: '1 Week' },
    { value: '1month' as const, label: '1 Month' },
    { value: '1year' as const, label: '1 Year' },
    { value: 'all' as const, label: 'All Time' }
  ];

  const handleDownload = async (period: '1day' | '1week' | '1month' | '1year' | 'all') => {
    if (!token) {
      alert('Authentication required. Please log in.');
      return;
    }

    try {
      setIsDownloading(true);
      setShowPeriodMenu(false);

      const [paymentsResponse, statsResponse] = await Promise.all([
        getPaymentsData(token, 1, 1000, period),
        getTransactionData(token, period)
      ]);

      const periodLabel = periods.find(p => p.value === period)?.label || 'All Time';

      await generatePaymentReportPDF(
        paymentsResponse.payments,
        statsResponse,
        periodLabel
      );

    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Failed to generate report. Please try again.');
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setShowPeriodMenu(!showPeriodMenu)}
        disabled={isDownloading}
        className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-md cursor-pointer"
      >
        {isDownloading ? (
          <>
            <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
            <span className="text-sm font-medium">Generating...</span>
          </>
        ) : (
          <>
            <FiDownload className="text-lg" />
            <span className="text-sm font-medium">Download Report</span>
          </>
        )}
      </button>

      {showPeriodMenu && !isDownloading && (
        <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg border border-gray-200 shadow-lg z-20">
          <div className="p-2">
            <div className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase">
              Select Period
            </div>
            {periods.map((period) => (
              <button
                key={period.value}
                onClick={() => handleDownload(period.value)}
                className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-green-50 hover:text-green-700 rounded-lg transition-colors"
              >
                {period.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
