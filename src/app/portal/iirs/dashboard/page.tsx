"use client"

import InvoiceTable from './components/InvoiceTable';
import MetricsCards from './components/MetricsCards';
import DownloadReportButton from './components/DownloadReportButton';
import { useAuth } from '../providers/AuthProvider';

export default function Dashboard() {
    const { isLoading, role } = useAuth();
    
    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading dashboard...</p>
                </div>
            </div>
        );
    }
    
    return (
        <div className="h-full w-full overflow-y-auto px-4 sm:px-6 lg:px-8">
            <div className="w-full mt-6 sm:mt-8 lg:mt-10 pb-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6 sm:mb-8">
                    <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                        IIRS Dashboard 
                        <span className="text-gray-500 text-sm sm:text-base block sm:inline mt-1 sm:mt-0">
                            {role === "iirs" ? "" : "(View Only)"}
                        </span>
                    </h1>
                    <DownloadReportButton />
                </div>

                {/* Metrics Cards */}
                <MetricsCards role={role} />

                {/* Main Content Grid */}
                <div className="grid grid-cols-1 gap-6">
                    {/* Left Column - Invoice Table */}
                    <div className="lg:col-span-2">
                        <InvoiceTable />
                    </div>

                    {/* Right Column - Charts
                    <div className="space-y-6">
                        <MonthlyChart />
                        Transaction Overview Skeleton
                    </div> */}
                </div>

                <p className="text-center text-gray-500 text-sm mt-4">Powered by Imo Digital City Limited</p>
            </div>
        </div>
    );
}