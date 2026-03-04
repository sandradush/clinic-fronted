import React, { useState, useEffect } from 'react';
import { Calendar, Clock, User, FileText } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { makeApiRequest } from '../utils/api';
import toast from 'react-hot-toast';
import Card from '../components/common/Card';
import Button from '../components/common/Button';

interface Appointment {
  id: number;
  date: string;
  time: string;
  description: string;
  status: string;
  created_at: string;
  patient_id: number;
  patient_name: string;
  doctor_id: number;
  doctor_name: string;
}

const DoctorHistory: React.FC = () => {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Appointment | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchTodayAppointments = async () => {
      if (!user?.id) return;
      try {
        setLoading(true);
const data = await makeApiRequest(`/appointments/doctor/${user.id}`);
        setAppointments(data || []);
      } catch (error) {
        console.error('Failed to load today\'s appointments:', error);
        toast.error('Failed to load appointments');
        setAppointments([]);
      } finally {
        setLoading(false);
      }
    };

    fetchTodayAppointments();
  }, [user]);

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold">Today's Appointments</h1>
      </div>

      {loading ? (
        <div className="animate-pulse space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-32 bg-gray-200 rounded"></div>
          ))}
        </div>
      ) : appointments.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm p-12 text-center">
          <FileText size={48} className="mx-auto text-gray-300 mb-4" />
          <p className="text-gray-500">No appointments for today</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {appointments.map(appointment => {
            const isClickable = true;
            const initials = (appointment.patient_name || 'P')
              .split(' ')
              .map(s => s[0])
              .slice(0, 2)
              .join('')
              .toUpperCase();

            return (
              <Card
                key={appointment.id}
                className={`p-4 hover:shadow-md transition-shadow ${isClickable ? 'cursor-pointer' : ''}`}
                // make the whole card clickable to open detail modal
                onClick={() => setSelected(appointment) as any}
                onKeyDown={(e: React.KeyboardEvent) => { if (e.key === 'Enter' || e.key === ' ') setSelected(appointment); }}
                role="button"
                tabIndex={0}
              >
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-brand-100 flex items-center justify-center text-white font-semibold">{initials}</div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h3 className="font-bold text-lg">{appointment.patient_name}</h3>
                      <span className="inline-block px-2 py-1 rounded-full text-xs font-medium bg-brand-100 text-brand-700 capitalize">
                        {appointment.status}
                      </span>
                    </div>

                    <div className="mt-3 grid grid-cols-1 sm:grid-cols-3 gap-2 text-sm text-gray-600">
                      <div className="flex items-center gap-2"><Calendar size={16} /><span>{new Date(appointment.date).toLocaleDateString()}</span></div>
                      <div className="flex items-center gap-2"><Clock size={16} /><span>{appointment.time}</span></div>
                      <div className="flex items-center gap-2"><FileText size={16} /><span>Patient ID: {appointment.patient_id}</span></div>
                    </div>

                    {appointment.description && (
                      <p className="mt-3 text-sm text-gray-700 line-clamp-3">{appointment.description}</p>
                    )}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Detail modal */}
      {selected && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" role="dialog" aria-modal="true">
          <Card className="w-full max-w-2xl p-6">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-4">
                <div className="w-14 h-14 rounded-full bg-brand-100 flex items-center justify-center text-white font-semibold text-lg">{(selected.patient_name||'P').split(' ').map(s=>s[0]).slice(0,2).join('').toUpperCase()}</div>
                <div>
                  <h2 className="text-xl font-bold">{selected.patient_name}</h2>
                  <p className="text-sm text-gray-600">Patient ID: {selected.patient_id}</p>
                </div>
              </div>
              <div className="text-right">
                <span className="inline-block px-3 py-1 rounded-full text-xs font-medium bg-brand-100 text-brand-700 capitalize">{selected.status}</span>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm text-gray-700">
              <div className="flex items-center gap-2"><Calendar size={16} /><span>{new Date(selected.date).toLocaleDateString()}</span></div>
              <div className="flex items-center gap-2"><Clock size={16} /><span>{selected.time}</span></div>
              <div className="flex items-center gap-2"><FileText size={16} /><span>Created: {new Date(selected.created_at).toLocaleString()}</span></div>
            </div>

            {/* show consultation summary (if available) or fallback to description */}
            <div className="mt-4 p-3 bg-gray-50 rounded">
              <h3 className="font-medium mb-2">Summary</h3>
              <p className="text-sm text-gray-700 whitespace-pre-wrap">{(selected as any).summary || (selected as any).notes || selected.description || 'No summary available.'}</p>
            </div>

            <div className="mt-5 flex gap-2 justify-end">
              <Button variant="secondary" onClick={() => setSelected(null)}>Close</Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};

export default DoctorHistory;
