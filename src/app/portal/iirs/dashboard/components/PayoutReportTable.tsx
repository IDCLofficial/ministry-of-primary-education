import { statsData } from "@/lib/iirs/dataInteraction";

const PayoutReportTable = ({ payouts, date }: { payouts: statsData, date: string }) => {
    return (
        <div className="w-full h-full flex flex-col">
            {/* Header Section */}
            <div>
                <div className="bg-gradient-to-r from-green-50 to-green-100 px-6 py-4 border-b border-green-200">
                    <h2 className="text-xl font-semibold text-gray-800">MOE Payout Report for {date}</h2>
                    <p className="text-sm text-gray-600 mt-1">
                        Generated: {new Date().toLocaleString('en-NG', { dateStyle: 'long', timeStyle: 'short' })}
                    </p>
                </div>

                <div className="px-6 py-4">
                    <h2 className="text-lg font-semibold text-gray-800 mb-3">Summary</h2>
                    <div className="space-y-2">
                        <p className="text-sm text-gray-700">Total Payout: ₦{(payouts.totalIdclEarnings + payouts.totalTsaEarnings)?.toLocaleString('en-NG')}</p>
                        <p className="text-sm text-gray-700">Total Idcl Earnings: ₦{payouts.totalIdclEarnings?.toLocaleString('en-NG')}</p>
                        <p className="text-sm text-gray-700">Total TSA Earnings: ₦{payouts.totalTsaEarnings?.toLocaleString('en-NG')}</p>
                    </div>
                </div>
            </div>

            {/* Table */}
            <div className="flex-1 overflow-hidden">
                <div className="h-full overflow-x-hidden overflow-y-auto">
                    <table className="w-full">
                        <thead className="bg-green-600 text-white z-10">
                            <tr>
                                <th className="px-4 py-3 text-left text-sm font-semibold">School Name</th>
                                <th className="px-4 py-3 text-right text-sm font-semibold">Amount</th>
                                <th className="px-4 py-3 text-right text-sm font-semibold">Reference</th>
                                <th className="px-4 py-3 text-right text-sm font-semibold">Students</th>
                                <th className="px-4 py-3 text-right text-sm font-semibold">TSA Payout</th>
                                <th className="px-4 py-3 text-right text-sm font-semibold">IDCL Payout</th>
                                {/* <th className="px-4 py-3 text-right text-sm font-semibold">Paystack charge</th> */}
                                {/* <th className="px-4 py-3 text-right text-sm font-semibold">Date</th>
                                <th className="px-4 py-3 text-right text-sm font-semibold">Time</th> */}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {payouts.recentPayments?.map((payout, index) => (
                                <tr
                                    key={payout?.reference}
                                    className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}
                                >
                                    <td className="px-4 py-3 text-sm font-medium text-gray-900">
                                        {payout?.schoolName}
                                    </td>
                                    <td className="px-4 py-3 text-sm font-medium text-gray-900">
                                        {payout.amount?.toLocaleString('en-NG')}
                                    </td>
                                    <td className="px-4 py-3 text-sm text-gray-700 text-right">
                                        {payout.reference?.substring(0, 8)}...
                                    </td>
                                    <td className="px-4 py-3 text-sm font-semibold text-gray-900 text-right">
                                        {payout?.numberOfStudents}
                                    </td>
                                    <td className="px-4 py-3 text-sm text-green-700 text-right font-medium">
                                        ₦{payout?.tsaEarnings?.toLocaleString('en-NG')}
                                    </td>
                                    <td className="px-4 py-3 text-sm text-purple-700 text-right font-medium">
                                        ₦{payout?.idclEarnings?.toLocaleString('en-NG')}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Footer */}
            <div className="bg-gray-50 px-6 py-3 border-t border-gray-200">
                <p className="text-xs text-gray-500 text-center">
                    Powered by Imo Digital City Limited
                </p>
            </div>
        </div>
    );
};

export default PayoutReportTable