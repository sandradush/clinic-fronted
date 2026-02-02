import React, { useMemo, useState } from 'react';
import { FileText, Search, Plus, Printer, Edit, Trash2 } from 'lucide-react';
import { format } from 'date-fns';

type Prescription = {
  id: string;
  patientName: string;
  date: string;
  medications: { name: string; dosage: string; frequency: string }[];
  status: 'active' | 'completed' | 'cancelled' | string;
  doctor?: string;
};

const statusStyles: Record<string, { bg: string; text: string }> = {
  active: { bg: 'bg-green-100', text: 'text-green-800' },
  completed: { bg: 'bg-gray-100', text: 'text-gray-700' },
  cancelled: { bg: 'bg-red-100', text: 'text-red-700' },
};

const Prescriptions: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | string>('all');

  const prescriptions: Prescription[] = [
    { id: 'RX-001', patientName: 'Jean de Dieu', date: '2024-01-15', medications: [{ name: 'Amoxicillin', dosage: '500mg', frequency: '3 times daily' }, { name: 'Paracetamol', dosage: '500mg', frequency: 'As needed' }], status: 'active', doctor: 'Dr. Sandra' },
    { id: 'RX-002', patientName: 'Marie Claire', date: '2024-01-10', medications: [{ name: 'Metformin', dosage: '850mg', frequency: '2 times daily' }], status: 'completed', doctor: 'Dr. Sandra' },
  ];

  const filtered = useMemo(() => {
    return prescriptions.filter(p => {
      const hay = [p.id, p.patientName, p.doctor, p.medications.map(m => m.name).join(' ')].join(' ').toLowerCase();
      const matchesSearch = hay.includes(searchTerm.toLowerCase());
      const matchesStatus = filterStatus === 'all' || p.status === filterStatus;
      return matchesSearch && matchesStatus;
    });
  }, [prescriptions, searchTerm, filterStatus]);

  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold">Prescriptions</h1>
          <p className="text-sm text-gray-600">Write and manage patient prescriptions</p>
        </div>

        <div className="flex items-center gap-2">
          <button className="inline-flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded text-sm">
            <Plus size={16} /> New Prescription
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg p-4 shadow-sm mb-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div className="flex items-center gap-3 flex-1">
            <div className="relative w-full max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                className="pl-10 pr-3 py-2 w-full border rounded focus:outline-none focus:ring-2 focus:ring-blue-200"
                placeholder="Search by patient, id, medication, or doctor"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <select className="ml-2 px-3 py-2 border rounded text-sm" value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
              <option value="all">All statuses</option>
              <option value="active">Active</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>

          <div className="text-sm text-gray-600">{filtered.length} prescriptions</div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {filtered.map(p => (
          <div key={p.id} className="bg-white rounded-lg shadow-sm p-4 flex flex-col md:flex-row md:items-center md:justify-between">
            <div className="flex items-start gap-4 flex-1">
              <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 font-semibold">
                <FileText size={18} />
              </div>
              <div>
                <div className="flex items-center gap-3">
                  <div className="font-medium">{p.patientName}</div>
                  <div className="text-xs text-gray-400">{format(new Date(p.date), 'MMM dd, yyyy')}</div>
                  <div className={`ml-2 px-2 py-1 rounded-full text-xs font-semibold ${statusStyles[p.status]?.bg || 'bg-gray-100'} ${statusStyles[p.status]?.text || 'text-gray-700'}`}>
                    {p.status}
                  </div>
                </div>

                <div className="mt-2 text-sm text-gray-600">
                  <div className="text-xs text-gray-500">Medications</div>
                  <div className="mt-1 flex flex-wrap gap-2">
                    {p.medications.map((m, i) => (
                      <div key={i} className="bg-gray-50 border rounded px-2 py-1 text-xs text-gray-700">
                        <span className="font-medium">{m.name}</span> • {m.dosage}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-4 md:mt-0 flex items-center gap-2">
              <div className="text-sm text-gray-600 mr-4">{p.doctor}</div>
              <button className="px-3 py-2 bg-white border rounded text-sm flex items-center gap-2"><Printer size={14} /> Print</button>
              <button className="px-3 py-2 bg-white border rounded text-sm flex items-center gap-2"><Edit size={14} /> Edit</button>
              <button className="px-3 py-2 bg-red-600 text-white rounded text-sm flex items-center gap-2"><Trash2 size={14} /> Cancel</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Prescriptions;