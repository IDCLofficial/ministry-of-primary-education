"use client"

import React, { useState } from 'react';
import { FiDownload } from 'react-icons/fi';
import { FiLoader } from 'react-icons/fi';
import { useAuth } from '../../providers/AuthProvider';
import { getTransactionData, statsData } from '@/lib/iirs/dataInteraction';
import { FaX } from 'react-icons/fa6';
import { BsDownload } from 'react-icons/bs';
import Calendar from 'react-calendar';
import PayoutReportTable from './PayoutReportTable';
import { generatePaymentReportPDF } from '@/lib/iirs/pdfGenerator';

export default function DownloadReportButton() {
  const { token } = useAuth();
  const [isDownloading, setIsDownloading] = useState(false);
  const [showReportTable, setShowReportTable] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date())
  const [openCalendar, setOpenCalendar] = useState(false);
  const [transactionData, setTransactionData] = useState<statsData>({} as statsData)
  const [isLoadingData, setIsLoadingData] = useState(false)

  React.useEffect(() => {
    async function fetchReportData() {
      setIsLoadingData(true)
      console.log(selectedDate)
      try {
        const data = await getTransactionData(
          token!,
          'all',
          selectedDate?.toISOString().split('T')[0],
          'report'
        );
        setTransactionData(data)
      } catch (error) {
        console.error('Error fetching report data:', error)
      } finally {
        setIsLoadingData(false)
      }
    }
    fetchReportData();
  }, [selectedDate])

  React.useEffect(() => {
    if (showReportTable) {
      document.body.style.overflow = 'hidden';
      setSelectedDate(new Date())
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [showReportTable]);

  return (
    <>
      {/* Report Table Button */}

      <div className={`fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50 
        ${showReportTable ? 'opacity-100 transition-all ease-in pointer-events-auto' : 'opacity-0 transition-all ease-out pointer-events-none'}`}
      >
        <div className='absolute w-full h-full' onClick={() => setShowReportTable(false)}></div>
        {/* Report Table Content */}
        <div className="absolute bg-white rounded-lg max-w-5xl h-5/6 overflow-y-auto w-full mx-4 z-20 ">
          <div className="flex justify-between items-center border-b border-b-gray-200  p-4 top-0 bg-white ">
            <h2 className='text-lg font-semibold'>Report Table</h2>
            <div className='relative'>
              <div className='flex items-center gap-2 relative'>
                <button className='border border-gray-100 p-1 rounded-md cursor-pointer' onClick={() => setOpenCalendar(s => !s)}>
                  <span>{selectedDate?.toLocaleDateString().split(',')[0] || ''}</span>
                </button>
                <button className='px-2 py-1 flex items-center gap-2 border border-green-500 rounded-md cursor-pointer'
                  onClick={() => generatePaymentReportPDF(transactionData, selectedDate?.toLocaleDateString().split(',')[0] || '')}
                >
                  <BsDownload />
                  Download
                </button>
              </div>
              <div className={`bg-white absolute right-0 mt-4 z-20 ${openCalendar ? 'opacity-100 transition-all ease-in pointer-events-auto' : 'opacity-0 transition-all ease-out pointer-events-none'}`}>
                <Calendar onChange={(value) => {
                  setSelectedDate(value as Date);
                  setOpenCalendar(false);
                }} value={selectedDate} maxDate={new Date()} className='w-full rounded-md bg-white/20' />
              </div>
            </div>
            {/* <button
              onClick={() => {
                setShowReportTable(false);
                setOpenCalendar(false);
              }}
              className="text-gray-200 hover:text-gray-100 cursor-pointer absolute z-30 -right-[20px] -top-[20px] bg-red-500/90
                hover:bg-red-600 p-1.5 rounded-full scale-100 active:scale-90 active:transition-all active:ease-out transition-all ease-linear"
            > 
              <FaX className="text-xl " />
            </button> */}
          </div>
          <div className="overflow-hidden">
            {isLoadingData ? (
              <div className="flex flex-col items-center justify-center h-64 space-y-4">
                <FiLoader className="animate-spin text-4xl text-green-600" />
                <p className="text-gray-600 text-sm font-medium">Loading report data...</p>
              </div>
            ) : (
              <PayoutReportTable payouts={transactionData} date={selectedDate?.toLocaleDateString() || ''} />
            )}
          </div>

        </div>
      </div>

      <div className="relative">
        <button
          onClick={() => setShowReportTable(!showReportTable)}
          disabled={isDownloading}
          className="flex items-center justify-center space-x-2 px-3 sm:px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-md cursor-pointer w-full sm:w-auto"
        >
          {isDownloading ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
              <span className="text-xs sm:text-sm font-medium">Generating...</span>
            </>
          ) : (
            <>
              <FiDownload className="text-base sm:text-lg" />
              <span className="text-xs sm:text-sm font-medium">Get Payout Report</span>
            </>
          )}
        </button>

        {/* {showPeriodMenu && !isDownloading && (
        <div className="absolute left-0 sm:right-0 sm:left-auto mt-2 w-full sm:w-48 bg-white rounded-lg border border-gray-200 shadow-lg z-20">
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
      )} */}
      </div>
    </>
  );
}
