"use client"

import InvoiceTable from './components/InvoiceTable';
import MonthlyChart from './components/MonthlyChart';
import TransactionView from './components/TransactionView';
import { useEffect, useState } from 'react';
import { getTransactionData } from '@/lib/iirs/dataInteraction';
import MetricsCards from './components/MetricsCards';
import { redirect } from 'next/navigation';


export default function Dashboard() {
    useEffect(()=>{    
        if(localStorage.getItem('token') === null){
            redirect('/portal/iirs/login')
        }
    }, []);

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
                        {/* <TransactionView
                            totalAmount="$55,580"
                            growthPercentage="4.6%"
                        /> */}
                    </div>
                </div>
            </div>
        </div>
    );
}