import React, { useMemo, useState } from 'react';
import { Video, Phone, User, MessageCircle, MapPin, MoreHorizontal } from 'lucide-react';

type Method = 'video' | 'phone' | 'in-person' | string;

const methodStyles: Record<string, { bg: string; text: string; icon?: JSX.Element }> = {
  video: { bg: 'bg-blue-50', text: 'text-blue-700' },
  phone: { bg: 'bg-green-50', text: 'text-green-700' },
  'in-person': { bg: 'bg-yellow-50', text: 'text-yellow-700' },
};

const Consultation: React.FC = () => {
  const [selectedAppointment, setSelectedAppointment] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [filterMethod, setFilterMethod] = useState<'all' | Method>('all');

  const filtered = useMemo(() => {
    const appointments = [
      { id: '1', patientName: 'Jean de Dieu', time: '09:00 AM', type: 'Consultation', method: 'video', phone: '078 123 4567', email: 'jean@example.com', notes: 'Patient prefers video call due to mobility issues', status: 'confirmed' },
      { id: '2', patientName: 'Marie Claire', time: '10:30 AM', type: 'Follow-up', method: 'phone', phone: '073 987 6543', email: 'marie@example.com', notes: 'Phone consultation requested - diabetes follow-up', status: 'waiting' },
      { id: '3', patientName: 'Eric Ndayishimiye', time: '02:00 PM', type: 'Check-up', method: 'in-person', phone: '072 555 1234', email: 'eric@example.com', notes: 'Physical examination required', status: 'confirmed' },
    ];
    return appointments.filter(a => {
      const hay = [a.patientName, a.phone, a.type, a.notes].join(' ').toLowerCase();
      const matchesSearch = hay.includes(search.toLowerCase());
      const matchesMethod = filterMethod === 'all' || a.method === filterMethod;
      return matchesSearch && matchesMethod;
    });
  }, [search, filterMethod]);

  const getMethodIcon = (m: Method) => {
    if (m === 'video') return <Video size={16} />;
    if (m === 'phone') return <Phone size={16} />;
    if (m === 'in-person') return <User size={16} />;
    return <MessageCircle size={16} />;
  };

  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold">Consultation Management</h1>
          <p className="text-sm text-gray-600">Start consultations and manage patient preferences</p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm p-4">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Left: list */}
          <div className="md:w-1/2 lg:w-1/3">
            <div className="flex items-center gap-2 mb-3">
              <input
                className="flex-1 px-3 py-2 border rounded focus:outline-none"
                placeholder="Search patient, phone, or notes"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <select className="px-2 py-2 border rounded" value={filterMethod} onChange={(e) => setFilterMethod(e.target.value as any)}>
                <option value="all">All</option>
                <option value="video">Video</option>
                <option value="phone">Phone</option>
                <option value="in-person">In-person</option>
              </select>
            </div>

            <div className="divide-y border rounded overflow-hidden max-h-[60vh] overflow-auto">
              {filtered.map(a => (
                <button
                  key={a.id}
                  onClick={() => setSelectedAppointment(a.id)}
                  className={`w-full text-left px-4 py-3 hover:bg-gray-50 flex items-start gap-3 ${selectedAppointment === a.id ? 'bg-gray-100' : ''}`}
                >
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${methodStyles[a.method]?.bg || 'bg-gray-100'} ${methodStyles[a.method]?.text || 'text-gray-700'}`}>
                    {getMethodIcon(a.method)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium">{a.patientName}</div>
                        <div className="text-xs text-gray-500">{a.type} • {a.time}</div>
                      </div>
                      <div className="text-xs text-gray-400">{a.status}</div>
                    </div>
                    <div className="mt-2 text-sm text-gray-600 truncate">{a.notes}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Right: detail panel */}
          <div className="flex-1 bg-gray-50 rounded p-4">
            {!selectedAppointment && (
              <div className="h-full flex flex-col items-center justify-center text-gray-500">
                <div className="text-xl font-medium mb-2">Select an appointment</div>
                <div className="text-sm">Choose an appointment to view details and start the consultation.</div>
              </div>
            )}

            {selectedAppointment && (
              (() => {
                const a = appointments.find(x => x.id === selectedAppointment)!;
                return (
                  <div className="h-full flex flex-col">
                    <div className="flex items-start justify-between">
                      <div>
                        <h2 className="text-xl font-semibold">{a.patientName}</h2>
                        <div className="text-sm text-gray-500">{a.type} • {a.time}</div>
                      </div>
                      <div className="text-sm text-gray-500">{a.status}</div>
                    </div>

                    <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="bg-white p-3 rounded shadow-sm">
                        <div className="text-xs text-gray-500">Contact</div>
                        <div className="mt-2 text-sm text-gray-700 flex flex-col gap-1">
                          <div className="flex items-center gap-2"><Phone size={14} /> <span>{a.phone}</span></div>
                          <div className="flex items-center gap-2"><MessageCircle size={14} /> <span>{a.email}</span></div>
                        </div>
                      </div>

                      <div className="bg-white p-3 rounded shadow-sm">
                        <div className="text-xs text-gray-500">Location & Notes</div>
                        <div className="mt-2 text-sm text-gray-700">
                          <div className="flex items-center gap-2"><MapPin size={14} /><span>{a.method === 'in-person' ? 'Clinic' : 'Remote'}</span></div>
                          <div className="mt-2 text-sm text-gray-600">{a.notes}</div>
                        </div>
                      </div>
                    </div>

                    <div className="mt-6 flex items-center gap-3">
                      {a.method === 'video' && (
                        <button className="px-4 py-2 bg-blue-600 text-white rounded">Start Video Call</button>
                      )}
                      {a.method === 'phone' && (
                        <button className="px-4 py-2 bg-green-600 text-white rounded">Call Patient</button>
                      )}
                      {a.method === 'in-person' && (
                        <button className="px-4 py-2 bg-yellow-600 text-white rounded">Mark Arrived</button>
                      )}

                      <button className="ml-auto p-2 text-gray-600 bg-white rounded shadow-sm"><MoreHorizontal /></button>
                    </div>
                  </div>
                );
              })()
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Consultation;