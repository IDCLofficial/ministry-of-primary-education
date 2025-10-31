import { IoClose, IoSchoolOutline, IoCalendarOutline, IoCardOutline, IoCheckmarkCircle, IoTimeOutline } from 'react-icons/io5';
import { FaReceipt, FaUsers, FaMoneyBillWave } from 'react-icons/fa6';

interface InvoiceDetailsProps {
  transaction: any;
  onClose: () => void;
}

export default function InvoiceDetails({ transaction, onClose }: InvoiceDetailsProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatAmount = (amount: number) => {
    return `₦${amount.toLocaleString()}`;
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'completed':
      case 'success':
      case 'paid':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'failed':
      case 'cancelled':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <FaReceipt className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Transaction Details</h2>
              <p className="text-sm text-gray-500">Complete payment information</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <IoClose className="w-6 h-6 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* School Information */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-100">
            <div className="flex items-center space-x-3 mb-3">
              <IoSchoolOutline className="w-5 h-5 text-blue-600" />
              <h3 className="text-lg font-semibold text-gray-900">School Information</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600 mb-1">School Name</p>
                <p className="font-medium text-gray-900 capitalize">{transaction.schoolName}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Number of Students</p>
                <div className="flex items-center space-x-2">
                  <FaUsers className="w-4 h-4 text-blue-600" />
                  <p className="font-medium text-gray-900">{transaction.numberOfStudents} students</p>
                </div>
              </div>
            </div>
          </div>

          {/* Payment Information */}
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-4 border border-green-100">
            <div className="flex items-center space-x-3 mb-3">
              <FaMoneyBillWave className="w-5 h-5 text-green-600" />
              <h3 className="text-lg font-semibold text-gray-900">Payment Information</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600 mb-1">Amount Paid</p>
                <p className="text-2xl font-bold text-green-600">{formatAmount(transaction.amount)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Payment Status</p>
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${
                  getStatusColor(transaction.paymentStatus)
                }`}>
                  <IoCheckmarkCircle className="w-4 h-4 mr-1" />
                  {transaction.paymentStatus || 'Completed'}
                </span>
              </div>
            </div>
          </div>

          {/* Transaction Details */}
          <div className="bg-gray-50 rounded-xl p-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Transaction Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="col-span-2">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Reference Number</p>
                  <p className="font-mono text-sm bg-white px-3 py-2 rounded-lg border">{transaction.reference}</p>
                </div>
              </div>
              <div className="col-span-2 space-y-4">
                <div>
                  <p className="text-sm text-gray-600 mb-1 flex items-center">
                    <IoCalendarOutline className="w-4 h-4 mr-1" />
                    Payment Date
                  </p>
                  <p className="font-medium text-gray-900">{formatDate(transaction.paidAt)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1 flex items-center">
                    <IoCardOutline className="w-4 h-4 mr-1" />
                    Payment Method
                  </p>
                  <p className="font-medium text-gray-900 capitalize">{transaction.paymentMethod || 'Online Payment'}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Additional Information */}
          {(transaction.description || transaction.notes) && (
            <div className="bg-amber-50 rounded-xl p-4 border border-amber-100">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Additional Information</h3>
              <p className="text-gray-700">{transaction.description || transaction.notes}</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-gray-200 bg-gray-50 rounded-b-2xl">
          <div className="flex items-center text-sm text-gray-500">
            <IoTimeOutline className="w-4 h-4 mr-1" />
            Last updated: {new Date().toLocaleDateString()}
          </div>
          <div className="flex space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              Close
            </button>
            <button className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
              Print Receipt
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}