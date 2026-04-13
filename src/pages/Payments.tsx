import React, { useEffect, useState } from 'react';
import { CreditCard, CheckCircle, XCircle, Eye, RefreshCw, Search, AlertTriangle } from 'lucide-react';
import toast from 'react-hot-toast';
import BackendTest from '../components/BackendTest';

interface Payment {
  id: string;
  amount: number;
  currency: string;
  status: string;
  patient_id: string;
  appointment_id: string;
  created_at: string;
  patient_name?: string;
  appointment_details?: any;
}

const Payments: React.FC = () => {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    fetchPayments();
  }, []);

  const fetchPayments = async () => {
    try {
      setLoading(true);
      console.log('🔄 Fetching payments from:', 'http://localhost:3001/api/payments');
      
      const response = await fetch('http://localhost:3001/api/payments', {
        headers: {
          'accept': 'application/json'
        }
      });
      
      console.log('📡 Response status:', response.status);
      console.log('📡 Response ok:', response.ok);
      
      if (response.ok) {
        const data = await response.json();
        console.log('✅ Raw payment data:', data);
        console.log('📊 Number of payments:', data.length);
        
        // Check if data is an array
        if (!Array.isArray(data)) {
          console.error('❌ Expected array but got:', typeof data, data);
          toast.error('Invalid data format received from server');
          return;
        }
        
        // Fetch additional details for each payment
        const paymentsWithDetails = await Promise.all(
          data.map(async (payment, index) => {
            try {
              // Try to get patient name
              const patientResponse = await fetch(`http://localhost:3001/api/users/${payment.patient_id}`);
              let patient_name = `Patient ${payment.patient_id}`;
              
              if (patientResponse.ok) {
                const patientData = await patientResponse.json();
                patient_name = patientData.name || 
                             (patientData.first_name && patientData.last_name ? 
                              `${patientData.first_name} ${patientData.last_name}` : 
                              patient_name);
              }
              
              return {
                ...payment,
                patient_name
              };
            } catch (error) {
              console.error(`❌ Error processing payment ${index + 1}:`, error);
              return {
                ...payment,
                patient_name: `Patient ${payment.patient_id}`
              };
            }
          })
        );
        
        console.log('✅ Final processed payments:', paymentsWithDetails);
        setPayments(paymentsWithDetails);
        toast.success(`Loaded ${paymentsWithDetails.length} payments`);
        
      } else {
        const errorText = await response.text();
        console.error('❌ API Error Response:', {
          status: response.status,
          statusText: response.statusText,
          body: errorText
        });
        
        toast.error(`Failed to fetch payments: ${response.status} ${response.statusText}`);
      }
    } catch (error) {
      console.error('❌ Network/Fetch Error:', error);
      
      // Check if it's a network error
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        toast.error('Cannot connect to server. Is your backend running on http://localhost:3001?');
      } else {
        toast.error(`Network error: ${error.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'succeeded':
      case 'paid':
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'requires_payment_method':
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'failed':
      case 'canceled':
        return 'bg-red-100 text-red-800';
      case 'processing':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'succeeded':
      case 'paid':
      case 'completed':
        return <CheckCircle size={16} className="text-green-600" />;
      case 'failed':
      case 'canceled':
        return <XCircle size={16} className="text-red-600" />;
      default:
        return <CreditCard size={16} className="text-gray-600" />;
    }
  };

  const formatAmount = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency.toUpperCase(),
      minimumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const filteredPayments = payments.filter(payment => {
    const matchesSearch = 
      payment.patient_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.appointment_id.includes(searchTerm);
    
    const matchesStatus = statusFilter === 'all' || payment.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const getStatusCounts = () => {
    const total = payments.length;
    const succeeded = payments.filter(p => ['succeeded', 'paid', 'completed'].includes(p.status.toLowerCase())).length;
    const pending = payments.filter(p => ['requires_payment_method', 'pending'].includes(p.status.toLowerCase())).length;
    const failed = payments.filter(p => ['failed', 'canceled'].includes(p.status.toLowerCase())).length;
    return { total, succeeded, pending, failed };
  };

  const counts = getStatusCounts();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Payment Management</h1>
            <p className="text-gray-600">View and manage all payment transactions</p>
          </div>
          <button
            onClick={fetchPayments}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <RefreshCw size={20} />
            Refresh
          </button>
        </div>
      </div>

      {/* Debug Section - Remove this after fixing the issue */}
      {payments.length === 0 && !loading && (
        <div className="mb-6">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
            <div className="flex items-center gap-2 text-yellow-800 mb-2">
              <AlertTriangle size={20} />
              <span className="font-medium">No payments found - Debug Information</span>
            </div>
            <p className="text-yellow-700 text-sm mb-3">
              If you're seeing this, check the browser console for detailed error logs.
            </p>
          </div>
          <BackendTest />
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg shadow border">
          <div className="text-2xl font-bold text-blue-600">{counts.total}</div>
          <div className="text-sm text-gray-600">Total Payments</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow border">
          <div className="text-2xl font-bold text-green-600">{counts.succeeded}</div>
          <div className="text-sm text-gray-600">Successful</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow border">
          <div className="text-2xl font-bold text-yellow-600">{counts.pending}</div>
          <div className="text-sm text-gray-600">Pending</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow border">
          <div className="text-2xl font-bold text-red-600">{counts.failed}</div>
          <div className="text-sm text-gray-600">Failed</div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow border mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Search className="inline w-4 h-4 mr-1" />
              Search
            </label>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Search by patient, payment ID, or appointment ID"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Status Filter
            </label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Status</option>
              <option value="succeeded">Succeeded</option>
              <option value="requires_payment_method">Requires Payment Method</option>
              <option value="pending">Pending</option>
              <option value="failed">Failed</option>
              <option value="canceled">Canceled</option>
            </select>
          </div>
        </div>
      </div>

      {/* Payments Table */}
      <div className="bg-white rounded-lg shadow border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Payment ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Patient
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Appointment
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredPayments.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-4 text-center text-gray-500">
                    No payments found
                  </td>
                </tr>
              ) : (
                filteredPayments.map((payment) => (
                  <tr key={payment.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-900">
                      {payment.id.substring(0, 20)}...
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {payment.patient_name}
                      </div>
                      <div className="text-sm text-gray-500">
                        ID: {payment.patient_id}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      #{payment.appointment_id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {formatAmount(payment.amount, payment.currency)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(payment.status)}
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(payment.status)}`}>
                          {payment.status.replace('_', ' ').toUpperCase()}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(payment.created_at)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => {
                          setSelectedPayment(payment);
                          setShowModal(true);
                        }}
                        className="flex items-center gap-1 text-blue-600 hover:text-blue-900"
                      >
                        <Eye size={16} />
                        View
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Payment Details Modal */}
      {showModal && selectedPayment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900">Payment Details</h2>
                <button
                  onClick={() => setShowModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <XCircle size={20} />
                </button>
              </div>
            </div>
            
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-2">Payment Information</h3>
                  <div className="space-y-2">
                    <div>
                      <span className="text-sm text-gray-500">Payment ID:</span>
                      <p className="font-mono text-sm break-all">{selectedPayment.id}</p>
                    </div>
                    <div>
                      <span className="text-sm text-gray-500">Amount:</span>
                      <p className="text-lg font-semibold">
                        {formatAmount(selectedPayment.amount, selectedPayment.currency)}
                      </p>
                    </div>
                    <div>
                      <span className="text-sm text-gray-500">Status:</span>
                      <div className="flex items-center gap-2 mt-1">
                        {getStatusIcon(selectedPayment.status)}
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(selectedPayment.status)}`}>
                          {selectedPayment.status.replace('_', ' ').toUpperCase()}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-2">Patient & Appointment</h3>
                  <div className="space-y-2">
                    <div>
                      <span className="text-sm text-gray-500">Patient:</span>
                      <p className="font-medium">{selectedPayment.patient_name}</p>
                      <p className="text-sm text-gray-500">ID: {selectedPayment.patient_id}</p>
                    </div>
                    <div>
                      <span className="text-sm text-gray-500">Appointment ID:</span>
                      <p className="font-medium">#{selectedPayment.appointment_id}</p>
                    </div>
                    <div>
                      <span className="text-sm text-gray-500">Created:</span>
                      <p className="text-sm">{formatDate(selectedPayment.created_at)}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-2">Raw Payment Data</h3>
                <pre className="bg-gray-50 p-4 rounded-lg text-xs overflow-x-auto">
                  {JSON.stringify(selectedPayment, null, 2)}
                </pre>
              </div>
            </div>

            <div className="p-6 border-t border-gray-200 flex justify-end">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Payments;
