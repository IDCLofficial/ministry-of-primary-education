"use client"

import { getTransactionData } from "@/lib/iirs/dataInteraction";
import { useEffect, useState } from "react";
import { CgArrowLongUp, CgArrowLongDown } from "react-icons/cg";

interface Payment {
  id: string;
  schoolName: string;
  amount: number;
  numberOfStudents: number;
  paidAt: string;
  reference: string;
}

interface PaymentSummary {
  totalPayments: number;
  totalAmountProcessed: number;
  totalAmountProcessedByIirs: number;
  iirsEarnings: number;
  percentage: number;
  recentPayments: Payment[];
}

export default function MetricsCards() {

  const [isLoading, setIsLoading] = useState(true);
  const [data, setData] = useState<PaymentSummary | null>(null);
  
  useEffect(() => {
    async function getData(){
      try{
        setIsLoading(true);
        const result = await getTransactionData();
        setData(result)
        console.log(result)
        setIsLoading(false);
      }catch(e){
        console.error('Error fetching data:', e);
        setIsLoading(false);
      }
    }
    getData();
  }, [])

  if (isLoading) {
    return (
      <div className="w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
        {/* Skeleton Cards */}
        {[...Array(5)].map((_, index) => (
          <div key={index} className="bg-white rounded-lg p-6 shadow-sm border border-gray-100 flex-1 animate-pulse">
            <div className="flex flex-col space-y-2">
              <div className="h-4 bg-gray-200 rounded w-24"></div>
              <div className="h-8 bg-gray-200 rounded w-16"></div>
              <div className="flex items-center space-x-1">
                <div className="h-4 w-4 bg-gray-200 rounded"></div>
                <div className="h-4 bg-gray-200 rounded w-12"></div>
                <div className="h-4 bg-gray-200 rounded w-20"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
      {/* Total Payments Card */}
      <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100 flex-1">
        <div className="flex flex-col space-y-2">
          <h3 className="text-sm font-medium text-gray-600">Total Payments</h3>
          <p className="text-2xl font-bold text-gray-900">{data?.totalPayments || 0}</p>
          <div className="flex items-center space-x-1">
            {(data?.percentage || 0) > 0 ? (
              <CgArrowLongUp className="text-green-500 text-sm" />
            ) : (
              <CgArrowLongDown className="text-red-500 text-sm" />
            )}
            <span className={`text-sm font-medium ${(data?.percentage || 0) > 0 ? 'text-green-500' : 'text-red-500'}`}>
              {data?.percentage || 0}%
            </span>
            <span className="text-sm text-gray-500">This Month</span>
          </div>
        </div>
      </div>

      {/* Total Amount Processed Card */}
      <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100 flex-1">
        <div className="flex flex-col space-y-2">
          <h3 className="text-sm font-medium text-gray-600">Total Amount Processed</h3>
          <p className="text-2xl font-bold text-gray-900">₦{data?.totalAmountProcessed?.toLocaleString()}</p>
          <div className="flex items-center space-x-1">
            {(data?.percentage || 0) > 0 ? (
              <CgArrowLongUp className="text-green-500 text-sm" />
            ) : (
              <CgArrowLongDown className="text-red-500 text-sm" />
            )}
            <span className={`text-sm font-medium ${(data?.percentage || 0) > 0 ? 'text-green-500' : 'text-red-500'}`}>
              {data?.percentage || 0}%
            </span>
            <span className="text-sm text-gray-500">This Month</span>
          </div>
        </div>
      </div>

      {/* Total Amount Processed by IIRS Card */}
      <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100 flex-1">
        <div className="flex flex-col space-y-2">
          <h3 className="text-sm font-medium text-gray-600">IIRS Processed Amount</h3>
          <p className="text-2xl font-bold text-gray-900">₦{data?.totalAmountProcessedByIirs?.toLocaleString()}</p>
          <div className="flex items-center space-x-1">
            {(data?.percentage || 0) > 0 ? (
              <CgArrowLongUp className="text-green-500 text-sm" />
            ) : (
              <CgArrowLongDown className="text-red-500 text-sm" />
            )}
            <span className={`text-sm font-medium ${(data?.percentage || 0) > 0 ? 'text-green-500' : 'text-red-500'}`}>
              {data?.percentage || 0}%
            </span>
            <span className="text-sm text-gray-500">This Month</span>
          </div>
        </div>
      </div>

      {/* IIRS Earnings Card */}
      <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100 flex-1">
        <div className="flex flex-col space-y-2">
          <h3 className="text-sm font-medium text-gray-600">IIRS Earnings</h3>
          <p className="text-2xl font-bold text-gray-900">₦{data?.iirsEarnings?.toLocaleString()}</p>
          <div className="flex items-center space-x-1">
            {(data?.percentage || 0) > 0 ? (
              <CgArrowLongUp className="text-green-500 text-sm" />
            ) : (
              <CgArrowLongDown className="text-red-500 text-sm" />
            )}
            <span className={`text-sm font-medium ${(data?.percentage || 0) > 0 ? 'text-green-500' : 'text-red-500'}`}>
              {data?.percentage || 0}%
            </span>
            <span className="text-sm text-gray-500">This Month</span>
          </div>
        </div>
      </div>

      {/* Percentage Growth Card */}
      <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100 flex-1">
        <div className="flex flex-col space-y-2">
          <h3 className="text-sm font-medium text-gray-600">Percentage</h3>
          <p className="text-2xl font-bold text-gray-900">{data?.percentage}%</p>
          <div className="flex items-center space-x-1">
            {data?.percentage || 0 > 0 ? (
              <CgArrowLongUp className="text-green-500 text-sm" />
            ) : (
              <CgArrowLongDown className="text-red-500 text-sm" />
            )}
            <span className={`text-sm font-medium ${data?.percentage || 0 > 0 ? 'text-green-500' : 'text-red-500'}`}>
              {data?.percentage || 0}%
            </span>
            <span className="text-sm text-gray-500">This Month</span>
          </div>
        </div>
      </div>
    </div>
  );
}
