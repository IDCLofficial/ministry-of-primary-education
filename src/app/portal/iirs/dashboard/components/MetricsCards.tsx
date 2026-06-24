"use client"

import { useAuth } from '@/app/portal/iirs/providers/AuthProvider';
import { getTransactionData } from "@/lib/iirs/dataInteraction";
import { useEffect, useState } from "react";
import { FiTrendingUp, FiDollarSign, FiChevronDown } from "react-icons/fi";
import { HiOutlineBuildingLibrary } from "react-icons/hi2";
import { BsReceipt, BsCreditCard, BsCalendar } from "react-icons/bs";
import { useDate } from '../../context/dateContext';
import { FaNairaSign } from 'react-icons/fa6';
import BreakDown from "./BreakDown";

interface Payment {
  id: string;
  schoolName: string;
  schoolId: string;
  amount: number;
  numberOfStudents: number;
  paidAt: string;
  reference: string;
  paystackCharge: number;
}

interface PaymentSummary {
  totalPayments: number;
  totalAmountProcessedByTsa: number;
  totalTsaEarnings: number;
  totalIdclEarnings: number;
  totalPaystackCharge: Number;
  recentPayments: any[];
  totalLatestPayout: number;
  totalLatestIdclPayout: number;
  totalLatestTsaPayout: number;
}

export default function MetricsCards({ role }: { role: "moe" | "iirs" | "idcl" | null }) {
  const { token } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [data, setData] = useState<PaymentSummary | null>(null);
  const [selectedPeriod, setSelectedPeriod] = useState<'today' | '1week' | '1month' | '1year' | 'all'>('all');
  const [showBreakDown, setShowBreakDown] = useState(false);
  const { selectedDate } = useDate()

  // Helper function to get period label
  const getPeriodLabel = () => {
    switch (selectedPeriod) {
      case 'today': return 'Today';
      case '1week': return '1 Week';
      case '1month': return '1 Month';
      case '1year': return '1 Year';
      case 'all': return 'All Time';
      default: return 'All Time';
    }
  };

  useEffect(() => {
    // if(!token || token === null) return;
    async function getData(tokenKey: string) {
      try {
        setIsLoading(true);
        const result = await getTransactionData(
          tokenKey!,
          'all',
          selectedDate?.toDateString(),
          'dashboard'
        );
        console.log(result)
        setData(result)
        setIsLoading(false);
      } catch (e) {
        console.error('Error fetching data:', e);
        setIsLoading(false);
        throw e;
      }
    }
    getData(token || "");
  }, [token, selectedPeriod, selectedDate])

  if (isLoading) {
    return (
      <div className="w-full mb-8">
        <div className="flex justify-between items-center mb-4">
          <div className="h-6 bg-gray-200 rounded w-32 animate-pulse"></div>
          <div className="h-10 bg-gray-200 rounded w-32 animate-pulse"></div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
          {[...Array(5)].map((_, index) => (
            <div key={index} className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-6 shadow-md border border-gray-200 animate-pulse">
              <div className="flex flex-col space-y-3">
                <div className="flex items-center justify-between">
                  <div className="h-10 w-10 bg-gray-300 rounded-lg"></div>
                </div>
                <div className="h-4 bg-gray-300 rounded w-28"></div>
                <div className="h-8 bg-gray-300 rounded w-32"></div>
                <div className="h-3 bg-gray-300 rounded w-20"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="w-full mb-8">
      {/* Header with Period Filter */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-gray-900">Overview</h2>
        <button
          onClick={() => setShowBreakDown(true)}
          className='text-base py-2 px-3 bg-green-500 rounded-xl text-white font-normal
          cursor-pointer shadow-lg shadow-green-200 hover:shadow-green-300
          flex items-center gap-2 transition-all'
        >
          See Breakdown
        </button>
      </div>

      {/* Metrics Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-4 sm:gap-6">
        {/* Total Payments Card */}
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 shadow-lg border border-blue-200 hover:shadow-xl transition-all duration-300 group">
          <div className="flex flex-col space-y-3">
            <div className="flex items-center justify-between">
              <div className="p-3 bg-blue-500 rounded-lg shadow-md group-hover:scale-110 transition-transform duration-300">
                <BsReceipt className="text-white text-xl" />
              </div>
            </div>
            <h3 className="text-xs font-semibold text-blue-700 uppercase tracking-wide">Total Payments</h3>
            <p className="text-2xl lg:text-3xl font-bold text-blue-900 break-words">{data?.totalPayments?.toLocaleString() || 0}</p>
            <div className="flex items-center space-x-2 pt-1">
              <span className="text-xs font-medium text-blue-600 bg-blue-200 px-2 py-1 rounded-full">{getPeriodLabel()}</span>
            </div>
          </div>
        </div>

        {/* Total Amount Processed Card */}
        {role !== 'iirs' && <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-6 shadow-lg border border-green-200 hover:shadow-xl transition-all duration-300 group">
          <div className="flex flex-col space-y-3">
            <div className="flex items-center justify-between">
              <div className="p-3 bg-green-500 rounded-lg shadow-md group-hover:scale-110 transition-transform duration-300">
                <FiTrendingUp className="text-white text-xl" />
              </div>
            </div>
            <h3 className="text-xs font-semibold text-green-700 uppercase tracking-wide">Total Processed</h3>
            <p className="text-2xl lg:text-3xl font-bold text-green-900 break-words">₦{data?.totalAmountProcessedByTsa?.toLocaleString() || 0}</p>
            <div className="flex items-center justify-between space-x-2 pt-1">
              <span className="text-xs font-medium text-green-600 bg-green-200 px-2 py-1 rounded-full">{getPeriodLabel()}</span>
              <p className="text-sm text-blue-600 flex items-center">Total Payout Today: <FaNairaSign className='text-sm' />{data?.totalLatestPayout?.toLocaleString() || 0}</p>
            </div>
          </div>
        </div>}

        {/* TSA Earnings Card */}
        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-6 shadow-lg border border-purple-200 hover:shadow-xl transition-all duration-300 group">
          <div className="flex flex-col space-y-3">
            <div className="flex items-center justify-between">
              <div className="p-3 bg-purple-500 rounded-lg shadow-md group-hover:scale-110 transition-transform duration-300">
                <BsReceipt className="text-white text-xl" />
              </div>
            </div>
            <h3 className="text-xs font-semibold text-purple-700 uppercase tracking-wide">TSA Earnings</h3>
            <p className="text-2xl lg:text-3xl font-bold text-purple-900 break-words">₦{data?.totalTsaEarnings?.toLocaleString() || 0}</p>
            <div className="flex items-center justify-between space-x-2 pt-1">
              <span className="text-xs font-medium text-purple-600 bg-purple-200 px-2 py-1 rounded-full">{getPeriodLabel()}</span>
              <p className="text-sm text-blue-600 flex items-center">TSA Payout Today: <FaNairaSign className='text-sm' />{data?.totalLatestTsaPayout?.toLocaleString() || 0}</p>
            </div>
          </div>
        </div>

        {/* IDCL Earnings Card */}
        {role !== 'iirs' && <div className="bg-gradient-to-br from-amber-50 to-amber-100 rounded-xl p-6 shadow-lg border border-amber-200 hover:shadow-xl transition-all duration-300 group">
          <div className="flex flex-col space-y-3">
            <div className="flex items-center justify-between">
              <div className="p-3 bg-amber-500 rounded-lg shadow-md group-hover:scale-110 transition-transform duration-300">
                <HiOutlineBuildingLibrary className="text-white text-xl" />
              </div>
            </div>
            <h3 className="text-xs font-semibold text-amber-700 uppercase tracking-wide">IDCL Earnings</h3>
            <p className="text-2xl lg:text-3xl font-bold text-amber-900 break-words">₦{data?.totalIdclEarnings?.toLocaleString() || 0}</p>
            <div className="flex items-center justify-between space-x-2 pt-1">
              <span className="text-xs font-medium text-amber-600 bg-amber-200 px-2 py-1 rounded-full">{getPeriodLabel()}</span>
              <p className="text-sm text-blue-600 flex items-center">IDCL Payout Today: <FaNairaSign className='text-sm' />{data?.totalLatestIdclPayout?.toLocaleString() || 0}</p>
            </div>
          </div>
        </div>}

        {/* Paystack Charges Card */}
        {role !== 'iirs' && <div className="bg-gradient-to-br from-rose-50 to-rose-100 rounded-xl p-6 shadow-lg border border-rose-200 hover:shadow-xl transition-all duration-300 group">
          <div className="flex flex-col space-y-3">
            <div className="flex items-center justify-between">
              <div className="p-3 bg-rose-500 rounded-lg shadow-md group-hover:scale-110 transition-transform duration-300">
                <BsCreditCard className="text-white text-xl" />
              </div>
            </div>
            <h3 className="text-xs font-semibold text-rose-700 uppercase tracking-wide">Paystack Charges</h3>
            <p className="text-2xl lg:text-3xl font-bold text-rose-900 break-words">₦{data?.totalPaystackCharge?.toLocaleString() || 0}</p>
            <div className="flex items-center space-x-2 pt-1">
              <span className="text-xs font-medium text-rose-600 bg-rose-200 px-2 py-1 rounded-full">{getPeriodLabel()}</span>
            </div>
          </div>
        </div>}

      </div>

      <BreakDown isOpen={showBreakDown} onClose={() => setShowBreakDown(false)} />
    </div>
  );
}
