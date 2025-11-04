"use client"

import InvoiceTable from './components/InvoiceTable';
import MonthlyChart from './components/MonthlyChart';
import MetricsCards from './components/MetricsCards';
import { useAuth } from '../providers/AuthProvider';

export default function Dashboard() {
    const { isLoading, role } = useAuth();
    
    if (isLoading) {
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
        <div className="h-full w-full overflow-y-auto px-6">
            <div className="w-full mt-10">
                {/* Header */}
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">TSA Dashboard <span className="text-gray-500 text-base">{role === "admin" ? "" : "(View Only)"}</span></h1>
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
                        <MonthlyChart />
                        {/* Transaction Overview Skeleton */}
                    </div>
                </div>
            </div>
        </div>
    );
}