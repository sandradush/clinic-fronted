import React, { useEffect, useState } from 'react';
import { ClipboardList, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { api } from '../services/api';

interface PaymentRecord {
  id: number | string;
  appointment_id?: number;
  patient_name: string;
  doctor_name?: string;
  amount: number;
  currency?: string;
  status: string; // pending | paid | approved
  created_at: string;
  provider_ref?: string;
  internal_id?: number | string;
  raw?: any;
}

const Payments: React.FC = () => {
  const [payments, setPayments] = useState<PaymentRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPayments();
  }, []);

  const fetchPayments = async () => {
    try {
      // Prefer the backend payments endpoint which returns { count, payments: [...] }
      let resp: any;
      try {
        resp = await api.getPayments();
      } catch (e) {
        // fallback to local payments endpoint if API base isn't configured for local testing
        const fallback = await fetch('http://localhost:3001/api/payments?limit=100&offset=0', {
          headers: { accept: 'application/json' },
        });
        if (!fallback.ok) throw new Error('Failed to fetch payments');
        resp = await fallback.json();
      }

      // Handle response shapes: { payments: [...] } or direct array
      const rawPayments: any[] = Array.isArray(resp) ? resp : resp?.payments ?? [];

      const mapped = rawPayments.map((p: any) => {
        return {
          id: p.id ?? p.ref ?? Math.random().toString(36).slice(2),
          internal_id: p.id,
          provider_ref: p.provider_ref ?? p.ref,
          raw: p,
          appointment_id: p.appointment_id ?? undefined,
          patient_name: (p.patient && (p.patient.name || p.patient.full_name)) || p.patient_id || p.number || 'Unknown',
          doctor_name: p.doctor_name || undefined,
          amount: Number(p.amount ?? 0),
          currency: p.currency ?? 'USD',
          status: p.status ?? 'pending',
          created_at: p.created_at || p.createdAt || new Date().toISOString(),
        } as PaymentRecord;
      });

      setPayments(mapped);
    } catch (err) {
      console.error('Failed to load payments', err);
      toast.error('Failed to load payments');
    } finally {
      setLoading(false);
    }
  };

  // Modal / confirm flow
  const [selected, setSelected] = useState<PaymentRecord | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalInternalId, setModalInternalId] = useState<string>('');
  const [confirmProcessing, setConfirmProcessing] = useState(false);

  const openModal = (rec: PaymentRecord) => {
    setSelected(rec);
    setModalInternalId(rec.internal_id ? String(rec.internal_id) : '');
    setModalOpen(true);
  };

  const closeModal = () => {
    setSelected(null);
    setModalInternalId('');
    setModalOpen(false);
  };

  const confirmApprove = async () => {
    if (!selected) return;
    setConfirmProcessing(true);
    try {
      const providedId = modalInternalId || selected.internal_id || selected.id;
      if (!providedId || !String(providedId).match(/^\d+$/)) {
        toast.error('Please provide a numeric internal payment id to approve.');
        setConfirmProcessing(false);
        return;
      }

      // 1) Update external provider state to completed
      const extResp = await api.updateExternalPaymentStatusById(Number(providedId), 'completed', selected.provider_ref);

      // 2) If external service returns an internal payment id, try to mark it approved in our system
      try {
        if (extResp && extResp.id && String(extResp.id).match(/^\d+$/)) {
          await api.approvePayment(Number(extResp.id));
        }

        // 3) If external response includes appointment linkage, try to approve appointment as well
        if (extResp && extResp.appointment_id && String(extResp.appointment_id).match(/^\d+$/)) {
          await api.approveAppointment(Number(extResp.appointment_id));
        }
      } catch (e) {
        console.warn('internal approve/appointment update failed', e);
      }

      toast.success('Payment completed and recorded');
      fetchPayments();
      closeModal();
    } catch (err) {
      console.error('approve error', err);
      toast.error('Failed to approve payment');
    } finally {
      setConfirmProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="w-8 h-8 border-4 border-brand-100 border-t-brand-700 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <>
      <div className="p-6">
      <h1 className="text-2xl font-semibold mb-6 flex items-center gap-3">
        <ClipboardList />
        Payments
      </h1>

      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="space-y-4">
          {payments.length === 0 && (
            <div className="text-center text-gray-500 py-8">No payments found</div>
          )}

          {payments.map((p) => (
            <div key={p.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
              <div>
                <div className="font-medium">{p.patient_name} {p.doctor_name ? `→ Dr. ${p.doctor_name}` : ''}</div>
                <div className="text-sm text-gray-500 mt-1">Appointment: {p.appointment_id ?? '—'}</div>
                <div className="text-sm text-gray-600 mt-2">{new Date(p.created_at).toLocaleString()}</div>
              </div>

              <div className="flex items-center gap-4">
                <div className="text-right">
                  <div className="font-semibold">{p.currency ?? 'USD'} {p.amount.toFixed(2)}</div>
                  <div className={`text-xs inline-block mt-1 px-2 py-1 rounded-full ${p.status === 'approved' || p.status === 'paid' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>{p.status}</div>
                </div>

                <button
                  onClick={() => openModal(p)}
                  className="px-3 py-1 bg-gray-100 text-gray-800 rounded hover:bg-gray-200"
                >
                  View
                </button>

                {p.status !== 'approved' && (
                  <button
                    onClick={() => openModal(p)}
                    disabled={confirmProcessing}
                    className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
                  >
                    <CheckCircle size={16} className="inline mr-2" /> Approve
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
    {modalOpen && selected && (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
        <div className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-2xl p-6 shadow-lg">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h2 className="text-lg font-semibold">Payment Details</h2>
              <div className="text-sm text-gray-500">Provider Ref: {selected.provider_ref}</div>
            </div>
            <button onClick={closeModal} className="text-gray-500 hover:text-gray-700">Close</button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <div className="text-xs text-gray-500">Patient</div>
              <div className="font-medium">{selected.patient_name}</div>
              <div className="text-xs text-gray-400 mt-1">Appointment: {selected.appointment_id ?? '—'}</div>
            </div>
            <div className="text-right">
              <div className="text-xs text-gray-500">Amount</div>
              <div className="font-semibold">{selected.currency ?? 'USD'} {Number(selected.amount).toFixed(2)}</div>
              <div className="text-xs text-gray-400 mt-1">Created: {new Date(selected.created_at).toLocaleString()}</div>
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-sm text-gray-600 mb-2">Internal payment id (optional)</label>
            <input
              value={modalInternalId}
              onChange={(e) => setModalInternalId(e.target.value)}
              placeholder="Enter internal payment id to link (numeric)"
              className="w-full px-3 py-2 border rounded-md"
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm text-gray-600 mb-2">Raw event</label>
            <pre className="max-h-48 overflow-auto text-xs bg-gray-50 p-3 rounded">{JSON.stringify(selected.raw || selected, null, 2)}</pre>
          </div>

          <div className="flex items-center justify-end gap-3">
            <button onClick={closeModal} className="px-4 py-2 bg-gray-100 rounded">Cancel</button>
            <button
              onClick={confirmApprove}
              disabled={confirmProcessing}
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
            >
              {confirmProcessing ? 'Approving...' : 'Confirm & Approve'}
            </button>
          </div>
        </div>
      </div>
    )}
    </>
  );
};

export default Payments;
