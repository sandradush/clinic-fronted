import React from 'react';
import { Calendar, Clock, User, Phone, Mail, MapPin } from 'lucide-react';
import { useAppointments } from '../hooks/useApiData';
import { useAuth } from '../contexts/AuthContext';

const DoctorRequests: React.FC = () => {
  const { appointments = [], loading } = useAppointments();
  const { user } = useAuth();

  const myAppointments = appointments.filter(apt => apt.doctorId === user?.id && apt.status !== 'cancelled' && apt.status !== 'completed');

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-32 bg-gray-200 rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold">Scheduled Appointments</h1>
      </div>

      {myAppointments.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm p-12 text-center">
          <Calendar size={48} className="mx-auto text-gray-300 mb-4" />
          <p className="text-gray-500">No scheduled appointments</p>
        </div>
      ) : (
        <div className="space-y-4">
          {myAppointments.map(appointment => (
            <div key={appointment.id} className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                    <User size={24} className="text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">Patient ID: {appointment.patientId}</h3>
                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                      appointment.status === 'confirmed' ? 'bg-green-100 text-green-700' :
                      appointment.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-gray-100 text-gray-700'
                    }`}>
                      {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-2 text-gray-600">
                  <Calendar size={16} />
                  <span className="text-sm"><strong>Date:</strong> {new Date(appointment.date).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <Clock size={16} />
                  <span className="text-sm"><strong>Time:</strong> {appointment.time} ({appointment.duration} min)</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <User size={16} />
                  <span className="text-sm"><strong>Type:</strong> {appointment.type}</span>
                </div>
              </div>

              {appointment.notes && (
                <div className="mt-4 p-3 bg-gray-50 rounded">
                  <p className="text-sm text-gray-700"><strong>Notes:</strong> {appointment.notes}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default DoctorRequests;
