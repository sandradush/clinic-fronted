import React, { useMemo, useState } from 'react';
import { Search, Clock, Phone, Mail, MapPin } from 'lucide-react';

interface Doctor {
  id: string;
  name: string;
  specialty: string;
  email?: string;
  phone?: string;
  location?: string;
  availability?: 'available' | 'busy' | 'offline' | string;
  nextAvailable?: string;
  experience?: string;
  rating?: number;
  todayAppointments?: number;
  totalAppointments?: number;
  notes?: string;
}

const availabilityStyles: Record<string, { bg: string; text: string }> = {
  available: { bg: 'bg-green-100', text: 'text-green-800' },
  busy: { bg: 'bg-yellow-100', text: 'text-yellow-800' },
  offline: { bg: 'bg-gray-100', text: 'text-gray-700' },
};

const ApprovedDoctors: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | string>('all');

  const filtered = useMemo(() => {
    const doctors: Doctor[] = [
      { id: '1', name: 'Dr. Sarah Johnson', specialty: 'Cardiology', email: 'sarah.johnson@clinic.com', phone: '+1 (555) 123-4567', location: 'Room 201', availability: 'available', nextAvailable: 'Now', experience: '12 years', rating: 4.9, todayAppointments: 8, totalAppointments: 1247 },
      { id: '2', name: 'Dr. Michael Chen', specialty: 'Pediatrics', email: 'michael.chen@clinic.com', phone: '+1 (555) 234-5678', location: 'Room 105', availability: 'busy', nextAvailable: '2:30 PM', experience: '8 years', rating: 4.8, todayAppointments: 12, totalAppointments: 892 },
      { id: '3', name: 'Dr. Emily Rodriguez', specialty: 'Dermatology', email: 'emily.rodriguez@clinic.com', phone: '+1 (555) 345-6789', location: 'Room 303', availability: 'available', nextAvailable: 'Now', experience: '15 years', rating: 4.7, todayAppointments: 6, totalAppointments: 1456 },
      { id: '4', name: 'Dr. James Wilson', specialty: 'Orthopedics', email: 'james.wilson@clinic.com', phone: '+1 (555) 456-7890', location: 'Room 208', availability: 'offline', nextAvailable: 'Tomorrow 9:00 AM', experience: '20 years', rating: 4.9, todayAppointments: 0, totalAppointments: 2134 },
      { id: '5', name: 'Dr. Lisa Thompson', specialty: 'Internal Medicine', email: 'lisa.thompson@clinic.com', phone: '+1 (555) 567-8901', location: 'Room 150', availability: 'available', nextAvailable: 'Now', experience: '10 years', rating: 4.6, todayAppointments: 9, totalAppointments: 1089 }
    ];
    return doctors.filter(d => {
      const hay = [d.name, d.specialty, d.location, d.email, d.phone].join(' ').toLowerCase();
      const matchesSearch = hay.includes(searchTerm.toLowerCase());
      const matchesStatus = filterStatus === 'all' || d.availability === filterStatus;
      return matchesSearch && matchesStatus;
    });
  }, [searchTerm, filterStatus]);

  return (
    <div className="p-4">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div className="flex items-center gap-3 flex-1">
          <div className="relative w-full max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              className="pl-10 pr-3 py-2 w-full border rounded focus:outline-none focus:ring-2 focus:ring-blue-200"
              placeholder="Search doctors by name, specialty or room"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <select
            className="ml-2 px-3 py-2 border rounded bg-white text-sm"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="all">All Status</option>
            <option value="available">Available</option>
            <option value="busy">Busy</option>
            <option value="offline">Offline</option>
          </select>
        </div>

        <div className="text-sm text-gray-600">{filtered.length} doctors found</div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4">
        {filtered.map((d) => (
          <div key={d.id} className="bg-white rounded-lg shadow-sm p-4 flex flex-col">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 font-semibold">{d.name.split(' ').map(n => n[0]).slice(0,2).join('')}</div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-medium">{d.name}</h3>
                    <p className="text-sm text-gray-500">{d.specialty}</p>
                  </div>
                  <div className={`px-2 py-1 rounded-full text-xs font-semibold ${availabilityStyles[d.availability || 'available']?.bg || 'bg-gray-100'} ${availabilityStyles[d.availability || 'available']?.text || 'text-gray-700'}`}>
                    {d.availability}
                  </div>
                </div>
                <div className="mt-2 text-sm text-gray-600 flex items-center gap-4">
                  <div className="flex items-center gap-1"><Phone size={14} /><span className="truncate">{d.phone}</span></div>
                  <div className="flex items-center gap-1"><Mail size={14} /><span className="truncate">{d.email}</span></div>
                </div>
                <div className="mt-2 text-sm text-gray-600 flex items-center gap-4">
                  <div className="flex items-center gap-1"><MapPin size={14} /><span>{d.location}</span></div>
                  <div className="flex items-center gap-1"><Clock size={14} /><span>Next: {d.nextAvailable}</span></div>
                </div>
              </div>
            </div>

            <div className="mt-4 flex items-center justify-between">
              <div className="flex items-center gap-6 text-sm text-gray-700">
                <div className="flex flex-col">
                  <span className="font-semibold">{d.todayAppointments ?? 0}</span>
                  <span className="text-xs text-gray-400">Today</span>
                </div>
                <div className="flex flex-col">
                  <span className="font-semibold">{d.totalAppointments ?? 0}</span>
                  <span className="text-xs text-gray-400">Total</span>
                </div>
                <div className="flex flex-col">
                  <span className="font-semibold">{d.rating ?? '-'}</span>
                  <span className="text-xs text-gray-400">Rating</span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button className="px-3 py-1 border rounded text-sm text-gray-700">View Schedule</button>
                <button className="px-3 py-1 bg-blue-600 text-white rounded text-sm">Edit Profile</button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ApprovedDoctors;