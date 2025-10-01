'use client';

import { useEffect, useState, useMemo } from 'react';
import { FiChevronDown } from 'react-icons/fi';

interface MonthlyChartProps {
  totalTransaction: string;
  growthPercentage: string;
  description: string;
}

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
  x: number;
  y: number;
  date: string;
  value: number;
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
    '1Month': new Date(now.getFullYear(), now.getMonth() - 1, now.getDate()),
    '3Months': new Date(now.getFullYear(), now.getMonth() - 3, now.getDate()),
    '1year': new Date(now.getFullYear() - 1, now.getMonth(), now.getDate()),
    '2Years': new Date(now.getFullYear() - 2, now.getMonth(), now.getDate()),
  };
  return ranges[period as keyof typeof ranges] || ranges['1Month'];
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
  
  // Convert to chart data points
  const sortedDates = Object.keys(groupedData).sort();
  const maxPoints = 10;
  const step = Math.max(1, Math.floor(sortedDates.length / maxPoints));
  
  const chartPoints = sortedDates
    .filter((_, index) => index % step === 0)
    .slice(0, maxPoints)
    .map((date, index) => {
      const data = groupedData[date];
      let value = 0;
      
      switch (activeTab) {
        case 'Total payments':
          value = data.count;
          break;
        case 'Amount Processed':
          value = data.totalAmount;
          break;
        case 'IIRS earnings':
          value = data.totalEarnings;
          break;
      }
      
      return {
        x: 10 + (index * 360 / (maxPoints - 1)),
        y: 20 + (80 - (value / Math.max(...Object.values(groupedData).map(d => {
          switch (activeTab) {
            case 'Total payments': return d.count;
            case 'Amount Processed': return d.totalAmount;
            case 'IIRS earnings': return d.totalEarnings;
            default: return d.count;
          }
        }))) * 60),
        date,
        value
      };
    });
  
  return chartPoints;
};

export default function MonthlyChart({ totalTransaction, growthPercentage, description }: MonthlyChartProps) {
  const tabs = ['Total payments', 'Amount Processed', 'IIRS earnings'];
  const periods = ['1Month', '3Months', '1year', '2Years']
  const [selectedPeriod, setSelectedPeriod] = useState(periods[0]);
  const [activeTab, setActiveTab] = useState(tabs[0]);
  const [selectPeriod, setSelectPeriod] = useState(false);
  const [data, setData] = useState<dataProps>();
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
          throw new Error('Failed to fetch data');
        }
        
        const responseData = await response.json();
        console.log(responseData);
        setData(responseData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
        console.error('Error fetching data:', err);
      } finally {
        setIsLoading(false);
      }
    }
    fetchData();
  }, []);

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
      case 'Total payments':
        return {
          displayValue: filteredPayments.length.toLocaleString(),
          displayLabel: `Total payments in the last ${selectedPeriod.toLowerCase()}`
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

  // Generate SVG path
  const pathData = useMemo(() => {
    if (chartData.length === 0) return '';
    return chartData.map((point, index) => 
      `${index === 0 ? 'M' : 'L'} ${point.x} ${point.y}`
    ).join(' ');
  }, [chartData]);

  // Get date range for labels
  const { startLabel, endLabel } = useMemo(() => {
    if (chartData.length === 0) {
      const now = new Date();
      const start = getDateRange(selectedPeriod);
      return {
        startLabel: start.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' }),
        endLabel: now.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })
      };
    }
    
    const firstDate = new Date(chartData[0].date);
    const lastDate = new Date(chartData[chartData.length - 1].date);
    
    return {
      startLabel: firstDate.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' }),
      endLabel: lastDate.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })
    };
  }, [chartData, selectedPeriod]);

  return (
    <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-900">
          {activeTab} - {selectedPeriod}
        </h2>
        <div className="relative">
          <button 
            className="flex items-center px-3 py-2 space-x-2 border border-gray-300 rounded-lg text-sm min-w-[100px] hover:bg-gray-50 transition-colors" 
            onClick={() => setSelectPeriod(prev => !prev)}
          >
            <span className="truncate">{selectedPeriod}</span>
            <FiChevronDown className={`text-gray-400 transition-transform ${selectPeriod ? 'rotate-180' : ''}`} />
          </button>
          <div className={`absolute top-full left-0 mt-1 p-2 bg-white rounded-lg border border-gray-200 w-full shadow-lg z-10 transition-all duration-200 ${
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
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
              activeTab === tab
                ? 'bg-gray-900 text-white'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

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

      <div className="relative h-32 bg-gradient-to-b from-red-50 to-transparent rounded-lg overflow-hidden">
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
          <>
            <svg className="w-full h-full" viewBox="0 0 400 100">
              {/* Grid lines */}
              <defs>
                <pattern id="grid" width="40" height="20" patternUnits="userSpaceOnUse">
                  <path d="M 40 0 L 0 0 0 20" fill="none" stroke="#f3f4f6" strokeWidth="1"/>
                </pattern>
                <linearGradient id="gradient" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#ef4444" stopOpacity="0.3"/>
                  <stop offset="100%" stopColor="#ef4444" stopOpacity="0"/>
                </linearGradient>
              </defs>
              <rect width="100%" height="100%" fill="url(#grid)" />
              
              {pathData && (
                <>
                  {/* Area under curve */}
                  <path
                    d={`${pathData} L ${chartData[chartData.length - 1]?.x || 370} 100 L ${chartData[0]?.x || 10} 100 Z`}
                    fill="url(#gradient)"
                    opacity="0.3"
                  />
                  
                  {/* Line */}
                  <path
                    d={pathData}
                    fill="none"
                    stroke="#ef4444"
                    strokeWidth="2"
                  />
                </>
              )}
              
              {/* Data points */}
              {chartData.map((point, index) => (
                <g key={index}>
                  <circle
                    cx={point.x}
                    cy={point.y}
                    r="4"
                    fill="#ef4444"
                    stroke="white"
                    strokeWidth="2"
                    className="hover:r-6 transition-all cursor-pointer"
                  />
                  {/* Tooltip on hover */}
                  <title>
                    {new Date(point.date).toLocaleDateString('en-GB')}: {point.value.toLocaleString()}
                  </title>
                </g>
              ))}
            </svg>
            
            {/* Date labels */}
            <div className="absolute bottom-2 left-4 text-xs text-gray-500">{startLabel}</div>
            <div className="absolute bottom-2 right-4 text-xs text-gray-500">{endLabel}</div>
          </>
        )}
      </div>
    </div>
  );
}
