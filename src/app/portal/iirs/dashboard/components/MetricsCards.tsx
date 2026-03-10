"use client"

import { useAuth } from '@/app/portal/iirs/providers/AuthProvider';
import { getTransactionData } from "@/lib/iirs/dataInteraction";
import { useEffect, useState } from "react";
import { FiTrendingUp, FiDollarSign, FiChevronDown } from "react-icons/fi";
import { HiOutlineBuildingLibrary } from "react-icons/hi2";
import { BsReceipt, BsCreditCard } from "react-icons/bs";

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
  totalPaystackCharge: number;
  recentPayments: Payment[];
}

export default function MetricsCards() {
  const { token } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [data, setData] = useState<PaymentSummary | null>(null);
  const [selectedPeriod, setSelectedPeriod] = useState<'1day' | '1week' | '1month' | '1year' | 'all'>('all');
  const [showPeriodDropdown, setShowPeriodDropdown] = useState(false);
  
  useEffect(() => {
    // if(!token || token === null) return;
    async function getData(tokenKey: string, period: '1day' | '1week' | '1month' | '1year' | 'all'){
      try{
        setIsLoading(true);
        const result = await getTransactionData(tokenKey, period);
        setData(result)
        setIsLoading(false);
      }catch(e){
        console.error('Error fetching data:', e);
        setIsLoading(false);
        throw e;
      }
    }
    getData(token || "", selectedPeriod);
  }, [token, selectedPeriod])

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
        <h2 className="text-lg font-semibold text-gray-900">Overview</h2>
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
      </div>

      {/* Metrics Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
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
            <span className="text-xs font-medium text-blue-600 bg-blue-200 px-2 py-1 rounded-full">All Time</span>
          </div>
        </div>
      </div>

      {/* Total Amount Processed Card */}
      <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-6 shadow-lg border border-green-200 hover:shadow-xl transition-all duration-300 group">
        <div className="flex flex-col space-y-3">
          <div className="flex items-center justify-between">
            <div className="p-3 bg-green-500 rounded-lg shadow-md group-hover:scale-110 transition-transform duration-300">
              <FiTrendingUp className="text-white text-xl" />
            </div>
          </div>
          <h3 className="text-xs font-semibold text-green-700 uppercase tracking-wide">TSA Processed</h3>
          <p className="text-2xl lg:text-3xl font-bold text-green-900 break-words">₦{data?.totalAmountProcessedByTsa?.toLocaleString() || 0}</p>
          <div className="flex items-center space-x-2 pt-1">
            <span className="text-xs font-medium text-green-600 bg-green-200 px-2 py-1 rounded-full">All Time</span>
          </div>
        </div>
      </div>

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
          <div className="flex items-center space-x-2 pt-1">
            <span className="text-xs font-medium text-purple-600 bg-purple-200 px-2 py-1 rounded-full">All Time</span>
          </div>
        </div>
      </div>

      {/* IDCL Earnings Card */}
      <div className="bg-gradient-to-br from-amber-50 to-amber-100 rounded-xl p-6 shadow-lg border border-amber-200 hover:shadow-xl transition-all duration-300 group">
        <div className="flex flex-col space-y-3">
          <div className="flex items-center justify-between">
            <div className="p-3 bg-amber-500 rounded-lg shadow-md group-hover:scale-110 transition-transform duration-300">
              <HiOutlineBuildingLibrary className="text-white text-xl" />
            </div>
          </div>
          <h3 className="text-xs font-semibold text-amber-700 uppercase tracking-wide">IDCL Earnings</h3>
          <p className="text-2xl lg:text-3xl font-bold text-amber-900 break-words">₦{data?.totalIdclEarnings?.toLocaleString() || 0}</p>
          <div className="flex items-center space-x-2 pt-1">
            <span className="text-xs font-medium text-amber-600 bg-amber-200 px-2 py-1 rounded-full">All Time</span>
          </div>
        </div>
      </div>

      {/* Paystack Charges Card */}
      <div className="bg-gradient-to-br from-rose-50 to-rose-100 rounded-xl p-6 shadow-lg border border-rose-200 hover:shadow-xl transition-all duration-300 group">
        <div className="flex flex-col space-y-3">
          <div className="flex items-center justify-between">
            <div className="p-3 bg-rose-500 rounded-lg shadow-md group-hover:scale-110 transition-transform duration-300">
              <BsCreditCard className="text-white text-xl" />
            </div>
          </div>
          <h3 className="text-xs font-semibold text-rose-700 uppercase tracking-wide">Paystack Charges</h3>
          <p className="text-2xl lg:text-3xl font-bold text-rose-900 break-words">₦{data?.totalPaystackCharge?.toLocaleString() || 0}</p>
          <div className="flex items-center space-x-2 pt-1">
            <span className="text-xs font-medium text-rose-600 bg-rose-200 px-2 py-1 rounded-full">All Time</span>
          </div>
        </div>
      </div>

      </div>
    </div>
  );
}
