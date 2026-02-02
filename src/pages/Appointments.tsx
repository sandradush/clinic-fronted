import React, { useMemo, useState } from 'react';
import { Clock, User, Search, Plus, CheckCircle, AlertCircle, Calendar as CalendarIcon, Phone, Mail, MoreHorizontal } from 'lucide-react';
import { useAppointments } from '../hooks/useApiData';

type Status = 'confirmed' | 'waiting' | 'in-progress' | 'pending' | string;

const statusStyles: Record<string, { bg: string; text: string }> = {
  confirmed: { bg: 'bg-green-100', text: 'text-green-700' },
  waiting: { bg: 'bg-yellow-100', text: 'text-yellow-700' },
  'in-progress': { bg: 'bg-blue-100', text: 'text-blue-700' },
  pending: { bg: 'bg-gray-100', text: 'text-gray-700' },
};

const Appointments: React.FC = () => {
  const { appointments = [], loading } = useAppointments();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | Status>('all');
  const [openMenu, setOpenMenu] = useState<string | null>(null);

  // Fallback mock if hook returns empty (keeps page useful in dev)
  const fallback = [
    { id: '1', time: '09:00 AM', patientName: 'Jean de Dieu', patientPhone: '078 123 4567', patientEmail: 'jean@example.com', type: 'Consultation', status: 'confirmed', doctor: 'Dr. Sandra', room: 'Room 101' },
    { id: '2', time: '10:30 AM', patientName: 'Marie Claire', patientPhone: '073 987 6543', patientEmail: 'marie@example.com', type: 'Follow-up', status: 'waiting', doctor: 'Dr. Sandra', room: 'Room 102' },
    { id: '3', time: '02:00 PM', patientName: 'Eric Ndayishimiye', patientPhone: '072 555 1234', patientEmail: 'eric@example.com', type: 'Check-up', status: 'in-progress', doctor: 'Dr. Sandra', room: 'Room 101' },
    { id: '4', time: '03:30 PM', patientName: 'Alice Mukamana', patientPhone: '071 444 5678', patientEmail: 'alice@example.com', type: 'Vaccination', status: 'pending', doctor: 'Dr. Sandra', room: 'Room 103' },
  ];

  const rows = (appointments.length ? appointments : fallback) as any[];

  const filtered = useMemo(() => {
    return rows.filter(r => {
      const matchesSearch = [r.patientName, r.patientPhone, r.type, r.doctor].join(' ').toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = filterStatus === 'all' || r.status === filterStatus;
      return matchesSearch && matchesStatus;
    });
  }, [rows, searchTerm, filterStatus]);

  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold">Appointments</h1>
          <p className="text-sm text-gray-600">Manage today's appointments and patient visits</p>
        </div>

        <div className="flex items-center gap-2">
          <button className="hidden sm:inline-flex items-center gap-2 px-3 py-2 bg-white border rounded shadow-sm text-sm">
            <CalendarIcon size={16} /> Calendar View
          </button>
          <button className="inline-flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded shadow-sm text-sm">
            <Plus size={16} /> New Appointment
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg p-4 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
          <div className="flex items-center gap-3 flex-1">
            <div className="relative flex items-center w-full max-w-md">
              <Search size={18} className="absolute left-3 text-gray-400" />
              <input
                className="pl-10 pr-3 py-2 w-full border rounded focus:outline-none focus:ring-2 focus:ring-blue-200"
                placeholder="Search patient, phone, type, or doctor"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <select
              className="ml-2 px-3 py-2 border rounded bg-white text-sm"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as any)}
            >
              <option value="all">All statuses</option>
              <option value="confirmed">Confirmed</option>
              <option value="waiting">Waiting</option>
              <option value="in-progress">In Progress</option>
              <option value="pending">Pending</option>
            </select>
          </div>

          <div className="flex items-center gap-3 text-sm text-gray-600">
            <div className="hidden sm:flex items-center gap-2">
              <div className="text-xs text-gray-500">Total</div>
              <div className="font-semibold">{rows.length}</div>
            </div>
            <div className="text-sm text-gray-500 flex items-center gap-1">{loading ? 'Loading...' : <><Clock size={14} /> Today</>}</div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full table-auto border-collapse">
            <thead>
              <tr className="text-left text-xs text-gray-500 border-b">
                <th className="py-3 px-3">Time</th>
                <th className="py-3 px-3">Patient</th>
                <th className="py-3 px-3">Contact</th>
                <th className="py-3 px-3">Type</th>
                <th className="py-3 px-3">Doctor</th>
                <th className="py-3 px-3">Room</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((a) => (
                <tr key={a.id} className="hover:bg-gray-50">
                  <td className="py-3 px-3 align-top w-28 text-sm text-gray-700">{a.time}</td>
                  <td className="py-3 px-3 align-top">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-blue-50 flex items-center justify-center text-blue-600"><User size={16} /></div>
                      <div>
                        <div className="font-medium text-sm">{a.patientName}</div>
                        <div className="text-xs text-gray-500">{a.notes || ''}</div>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-3 align-top text-sm text-gray-600">
                    <div className="flex flex-col">
                      <span className="truncate">{a.patientPhone}</span>
                      <span className="truncate text-xs text-gray-400">{a.patientEmail}</span>
                    </div>
                  </td>
                  <td className="py-3 px-3 align-top text-sm text-gray-700">{a.type}</td>
                  <td className="py-3 px-3 align-top text-sm text-gray-700">{a.doctor}</td>
                  <td className="py-3 px-3 align-top text-sm text-gray-700">{a.room}</td>
                  <td className="py-3 px-3 align-top">
                    <div className={`inline-flex items-center gap-2 px-2 py-1 rounded-full text-xs font-semibold ${statusStyles[a.status]?.bg || 'bg-gray-100'} ${statusStyles[a.status]?.text || 'text-gray-700'}`}>
                      {a.status === 'confirmed' && <CheckCircle size={14} />}
                      {a.status === 'in-progress' && <AlertCircle size={14} />}
                      {a.status === 'waiting' && <Clock size={14} />}
                      <span className="capitalize">{a.status.replace('-', ' ')}</span>
                    </div>
                  </td>
                  <td className="py-3 px-3 align-top text-sm relative">
                    <div className="flex items-center gap-2">
                      <div className="relative">
                        <button
                          onClick={() => setOpenMenu(openMenu === a.id ? null : a.id)}
                          className="p-2 text-gray-500 hover:bg-gray-100 rounded"
                          aria-haspopup="true"
                          aria-expanded={openMenu === a.id}
                        >
                          <MoreHorizontal size={16} />
                        </button>

                        {openMenu === a.id && (
                          <div className="absolute right-0 mt-2 w-40 bg-white border rounded shadow-md z-40">
                            <ul className="py-1">
                              {a.status === 'confirmed' && (
                                <li>
                                  <button onClick={() => { alert('Check In: ' + a.id); setOpenMenu(null); }} className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50">Check In</button>
                                </li>
                              )}
                              {a.status === 'waiting' && (
                                <li>
                                  <button onClick={() => { alert('Start Consultation: ' + a.id); setOpenMenu(null); }} className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50">Start Consultation</button>
                                </li>
                              )}
                              {a.status === 'in-progress' && (
                                <li>
                                  <button onClick={() => { alert('Complete: ' + a.id); setOpenMenu(null); }} className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50">Complete</button>
                                </li>
                              )}
                              <li>
                                <button onClick={() => { alert('Reschedule: ' + a.id); setOpenMenu(null); }} className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50">Reschedule</button>
                              </li>
                              <li>
                                <button onClick={() => { alert('Contact: ' + a.id); setOpenMenu(null); }} className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50">Contact</button>
                              </li>
                            </ul>
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filtered.length === 0 && (
            <div className="py-8 text-center text-gray-500">No appointments found for the selected filters.</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Appointments;