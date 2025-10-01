'use client';

import { number } from 'framer-motion';
import { useEffect, useState, useMemo } from 'react';

interface TransactionViewProps {
  totalAmount?: string;
  growthPercentage?: string;
}

interface PaymentData {
  id: string;
  schoolName: string;
  schoolCode: string;
  state: string;
  amount: number;
  numberOfStudents: number;
  pointsAwarded: number;
  paidAt: string;
  reference: string;
  iirsEarning: number;
}

interface ApiResponse {
  payments: PaymentData[];
}

// Helper functions
const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

const getDateRange = (monthsBack: number) => {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth() - monthsBack, now.getDate());
};

export default function TransactionView({ totalAmount, growthPercentage }: TransactionViewProps) {
  const [apiData, setApiData] = useState<ApiResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        setIsLoading(true);
        setError(null);
        const response = await fetch('https://moe-backend-nwp2.onrender.com/iirs-admin/payments', {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${localStorage.getItem('token')}`
          }
        });
        
        if (!response.ok) {
          throw new Error('Failed to fetch transaction data');
        }
        
        const data = await response.json();
        setApiData(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
        console.error('Error fetching transaction data:', err);
      } finally {
        setIsLoading(false);
      }
    }
    fetchData();
  }, []);

  const totalTransactions = apiData?.payments.reduce((acc:number, payment:PaymentData) => acc + payment.amount, 0 )

  // Process data for chart

  return (
    <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-900">Transaction Overview</h2>
        {isLoading ? (
          <div className="animate-pulse h-6 bg-gray-200 rounded w-24"></div>
        ) : (
          <p className="text-2xl font-bold text-gray-900">{formatCurrency(totalTransactions as number)}</p>
        )}
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center mb-6">
          <div className="animate-pulse">
            <div className="w-48 h-48 bg-gray-200 rounded-full"></div>
          </div>
        </div>
      ) : error ? (
        <div className="flex items-center justify-center mb-6 text-red-600">
          <div className="text-center">
            <p className="text-lg font-semibold mb-2">Error loading data</p>
            <p className="text-sm">{error}</p>
          </div>
        </div>
      ) : apiData?.payments.length === 0 ? (
        <div className="flex items-center justify-center mb-6 text-gray-400">
          <div className="text-center">
            <p className="text-lg font-semibold mb-2">No transaction data</p>
            <p className="text-sm">No payments found for the current period</p>
          </div>
        </div>
      ) : (
        <div className="flex items-center justify-center mb-6">
          <div className="relative">
            <svg width="200" height="200" viewBox="0 0 100 100" className="transform -rotate-90">
              {apiData?.payments.map((item, index) => {
                const percentage = totalTransactions&& totalTransactions > 0 ? (item.amount / totalTransactions) * 100 : 0;
                return (
                  <></>
                )
              })}
            </svg>
          </div>
        </div>
      )}

      {/* Legend */}
      {!isLoading && !error && apiData?.payments?.length && (
        <div className="space-y-3">
          <h3 className="text-sm font-medium text-gray-700 text-center mb-3">Top States by Payments</h3>
          <div className="grid grid-cols-1 gap-2">
            {apiData?.payments.map((item) => (
              <div key={item.id} className="flex items-center justify-between p-2 rounded-lg bg-gray-50">
                <div className="flex items-center space-x-3">
                  <div 
                    className="w-3 h-3 rounded-full flex-shrink-0"
                  ></div>
                  <span className="text-sm font-medium text-gray-700">{item.id}</span>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-gray-900">{item.id} payments</p>
                  <p className="text-xs text-gray-500">{formatCurrency(item.amount)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
