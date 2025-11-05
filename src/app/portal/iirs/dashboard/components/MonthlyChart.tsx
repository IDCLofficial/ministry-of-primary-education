'use client';

import { useAuth } from '@/app/portal/iirs/providers/AuthProvider';
import { getPaymentsData } from '@/lib/iirs/dataInteraction';
import { useEffect, useState, useMemo } from 'react';
import { FiChevronDown } from 'react-icons/fi';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from 'recharts';

interface dataProps{
  payments: paymentProps[]
}

interface paymentProps{
  id: string,
  schoolName: string,
  schoolCode: string,
  state: string,
  amount: number,
  numberOfStudents: number,
  pointsAwarded: number,
  paidAt: string,
  reference: string,
  iirsEarning: number
}

interface ChartDataPoint {
  date: string;
  value: number;
  formattedDate: string;
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

const getDateRange = (period: string) => {
  const now = new Date();
  const ranges = {
    '1 Month': new Date(now.getFullYear(), now.getMonth() - 1, now.getDate()),
    '3 Months': new Date(now.getFullYear(), now.getMonth() - 3, now.getDate()),
    '1 Year': new Date(now.getFullYear() - 1, now.getMonth(), now.getDate()),
    '2 Years': new Date(now.getFullYear() - 2, now.getMonth(), now.getDate()),
  };
  return ranges[period as keyof typeof ranges] || ranges['1 Month'];
};

const generateChartData = (payments: paymentProps[], activeTab: string, period: string): ChartDataPoint[] => {
  if (!payments || payments.length === 0) return [];
  
  const startDate = getDateRange(period);
  const filteredPayments = payments.filter(payment => 
    new Date(payment.paidAt) >= startDate
  );
  
  if (filteredPayments.length === 0) return [];
  
  // Group payments by date
  const groupedData = filteredPayments.reduce((acc, payment) => {
    const date = new Date(payment.paidAt).toISOString().split('T')[0];
    if (!acc[date]) {
      acc[date] = { totalAmount: 0, totalEarnings: 0, count: 0 };
    }
    acc[date].totalAmount += payment.amount;
    acc[date].totalEarnings += payment.iirsEarning;
    acc[date].count += 1;
    return acc;
  }, {} as Record<string, { totalAmount: number; totalEarnings: number; count: number }>);
  
  // Convert to Recharts format
  const sortedDates = Object.keys(groupedData).sort();
  const maxPoints = 12;
  const step = Math.max(1, Math.floor(sortedDates.length / maxPoints));
  
  const selectedDates = sortedDates
    .filter((_, index) => index % step === 0)
    .slice(0, maxPoints);
  
  return selectedDates.map(date => {
    const data = groupedData[date];
    const dateObj = new Date(date);
    const formattedDate = dateObj.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' });
    
    let value: number;
    switch (activeTab) {
      case 'Payments':
        value = data.count;
        break;
      case 'Amount Processed':
        value = Math.round(data.totalAmount / 1000); // Convert to thousands for better readability
        break;
      case 'IIRS earnings':
        value = Math.round(data.totalEarnings / 1000); // Convert to thousands for better readability
        break;
      default:
        value = data.count;
    }
    
    return {
      date,
      value,
      formattedDate
    };
  });
};

export default function MonthlyChart() {
  const {token} = useAuth();
  const tabs = ['Payments', 'Amount Processed', 'IIRS earnings'];
  const periods = ['1 Month', '3 Months', '1 Year', '2 Years']
  const [selectedPeriod, setSelectedPeriod] = useState(periods[0]);
  const [activeTab, setActiveTab] = useState(tabs[0]);
  const [selectPeriod, setSelectPeriod] = useState(false);
  const [data, setData] = useState<dataProps>();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);


  useEffect(() => {
    if(!token) return;

    async function fetchData(tokenKey: string) {
      try {
        setIsLoading(true);
        setError(null);
        const response = await getPaymentsData(tokenKey);
        
        if (!response) {
          throw new Error('Failed to fetch data');
        }
        
        setData(response);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
        console.error('Error fetching data:', err);
      } finally {
        setIsLoading(false);
      }
    }

    fetchData(token);
  }, [token]);

  // Calculate filtered data based on selected period
  const filteredPayments = useMemo(() => {
    if (!data?.payments) return [];
    const startDate = getDateRange(selectedPeriod);
    return data.payments.filter(payment => 
      new Date(payment.paidAt) >= startDate
    );
  }, [data?.payments, selectedPeriod]);

  // Calculate totals based on active tab and filtered data
  const { displayValue, displayLabel } = useMemo(() => {
    if (!filteredPayments.length) {
      return { displayValue: '0', displayLabel: 'No data available' };
    }

    switch (activeTab) {
      case 'Payments':
        return {
          displayValue: filteredPayments.length.toLocaleString(),
          displayLabel: `Payments made in the last ${selectedPeriod.toLowerCase()}`
        };
      case 'Amount Processed':
        const totalAmount = filteredPayments.reduce((sum, payment) => sum + payment.amount, 0);
        return {
          displayValue: formatCurrency(totalAmount),
          displayLabel: `Total amount processed in the last ${selectedPeriod.toLowerCase()}`
        };
      case 'IIRS earnings':
        const totalEarnings = filteredPayments.reduce((sum, payment) => sum + payment.iirsEarning, 0);
        return {
          displayValue: formatCurrency(totalEarnings),
          displayLabel: `Total IIRS earnings in the last ${selectedPeriod.toLowerCase()}`
        };
      default:
        return { displayValue: '0', displayLabel: 'No data available' };
    }
  }, [filteredPayments, activeTab, selectedPeriod]);

  // Generate chart data
  const chartData = useMemo(() => {
    return generateChartData(data?.payments || [], activeTab, selectedPeriod);
  }, [data?.payments, activeTab, selectedPeriod]);

  return (
    <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100">
      {
        isLoading ? ( 
          <>
            {/* Header Skeleton */}
            <div className="flex justify-between items-center mb-6">
              <div className="h-7 bg-gray-200 rounded w-32 animate-pulse"></div>
              <div className="h-10 bg-gray-200 rounded-lg w-24 animate-pulse"></div>
            </div>

            {/* Tabs Skeleton */}
            <div className="flex space-x-1 mb-6">
              {[...Array(3)].map((_, index) => (
                <div key={index} className="h-10 bg-gray-200 rounded-lg w-20 animate-pulse"></div>
              ))}
            </div>
          </>
        ) : (
          <>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-gray-900">
                {activeTab}
              </h2>
              <div className="relative">
                <button 
                  className="flex items-center px-3 py-2 space-x-2 border border-gray-300 rounded-lg text-sm min-w-[120px] hover:bg-gray-50 transition-colors" 
                  onClick={() => setSelectPeriod(prev => !prev)}
                >
                  <span className="truncate">{selectedPeriod}</span>
                  <FiChevronDown className={`text-gray-400 transition-transform ${selectPeriod ? 'rotate-180' : ''}`} />
                </button>
                <div className={`absolute top-full right-0 mt-1 p-2 bg-white rounded-lg border border-gray-200 w-full shadow-lg z-10 transition-all duration-200 ${
                selectPeriod ? 'opacity-100 visible' : 'opacity-0 invisible'
                }`}>
                {periods.map((period) => (
                  <button
                    key={period}
                    onClick={() => {
                      setSelectedPeriod(period);
                      setSelectPeriod(false);
                    }}
                    className={`w-full py-2 px-3 text-sm font-medium rounded-lg transition-colors text-left ${
                      selectedPeriod === period
                        ? 'bg-gray-900 text-white'
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    {period}
                  </button>
                ))}
              </div>
            </div>
            
          </div>
          <div className="flex space-x-1 mb-6">
            {tabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-2 py-1 text-sm font-medium rounded-lg transition-colors ${
                  activeTab === tab
                    ? 'bg-gray-900 text-white'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </>
      )}
      

      <div className="mb-6">
        {isLoading ? (
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-48 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-64"></div>
          </div>
        ) : error ? (
          <div className="text-red-600">
            <p className="text-lg font-semibold mb-2">Error loading data</p>
            <p className="text-sm">{error}</p>
          </div>
        ) : (
          <>
            <p className="text-3xl font-bold text-gray-900 mb-2">{displayValue}</p>
            <p className="text-sm text-gray-600">{displayLabel}</p>
          </>
        )}
      </div>

      <div className="relative h-64 bg-gradient-to-b from-red-50 to-transparent rounded-lg overflow-hidden p-4">
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <div className="animate-pulse text-gray-400">Loading chart...</div>
          </div>
        ) : error || chartData.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-gray-400 text-sm">
              {error ? 'Error loading chart data' : 'No data available for selected period'}
            </div>
          </div>
        ) : (
          <div className="w-full h-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                <XAxis 
                  dataKey="formattedDate" 
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: '#6b7280' }}
                />
                <YAxis 
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: '#6b7280' }}
                />
                <Line 
                  type="monotone" 
                  dataKey="value" 
                  stroke="#ef4444" 
                  strokeWidth={2}
                  dot={{ fill: '#ef4444', strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6, fill: '#ef4444' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  );
}
