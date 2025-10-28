"use client"

import InvoiceTable from './components/InvoiceTable';
import MonthlyChart from './components/MonthlyChart';
import TransactionView from './components/TransactionView';
import { useEffect, useState } from 'react';
import { getTransactionData } from '@/lib/iirs/dataInteraction';
import MetricsCards from './components/MetricsCards';
import { redirect } from 'next/navigation';
import { useAuth } from '../context/authContext';

export default function Dashboard() {
    const { isAuthenticated, user } = useAuth();
    const [isLoading, setIsLoading] = useState(true);
    
    useEffect(() => {
        // Wait for auth context to complete validation
        const timer = setTimeout(() => {
            setIsLoading(false);
        }, 1000);

        return () => clearTimeout(timer);
    }, []);

    useEffect(() => {
        if (!isLoading && !isAuthenticated) {
            redirect('/portal/iirs/login');
        }
    }, [isAuthenticated, isLoading]);

    if (isLoading || !isAuthenticated) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading dashboard...</p>
                </div>
            </div>
        );
    }
    
    return (
        <div className="h-full w-full overflow-y-auto">
            <div className="w-full mt-10">
                {/* Header */}
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">IIRS Dashboard</h1>
                </div>

                {/* Metrics Cards */}
                <MetricsCards />

                {/* Main Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left Column - Invoice Table */}
                    <div className="lg:col-span-2">
                        <InvoiceTable />
                    </div>

                    {/* Right Column - Charts */}
                    <div className="space-y-6">
                        <MonthlyChart
                            totalTransaction="$55,580"
                            growthPercentage="4.6%"
                            description="This month daily sale volume is 4.6% large than last month"
                        />
                        {/* Transaction Overview Skeleton */}
                    </div>
                </div>
            </div>
        </div>
    );
}