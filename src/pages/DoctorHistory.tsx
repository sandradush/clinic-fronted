import React, { useState, useEffect } from 'react';
import { Calendar, Clock, User, FileText } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { makeApiRequest } from '../utils/api';
import toast from 'react-hot-toast';

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

  useEffect(() => {
    const fetchTodayAppointments = async () => {
      if (!user?.id) return;
      try {
        setLoading(true);
        const data = await makeApiRequest(`/symptoms/doctor/${user.id}/appointments/today`);
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
        <div className="space-y-4">
          {appointments.map(appointment => (
            <div key={appointment.id} className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                      <User size={24} className="text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg">{appointment.patient_name}</h3>
                      <span className="inline-block px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700 capitalize">
                        {appointment.status}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 ml-15">
                    <div className="flex items-center gap-2 text-gray-600">
                      <Calendar size={16} />
                      <span className="text-sm">{new Date(appointment.date).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600">
                      <Clock size={16} />
                      <span className="text-sm">{appointment.time}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600">
                      <FileText size={16} />
                      <span className="text-sm">Patient ID: {appointment.patient_id}</span>
                    </div>
                  </div>

                  {appointment.description && (
                    <div className="mt-4 ml-15 p-3 bg-gray-50 rounded">
                      <p className="text-sm text-gray-700"><strong>Description:</strong> {appointment.description}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default DoctorHistory;
