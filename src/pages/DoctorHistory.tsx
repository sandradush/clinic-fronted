import React from 'react';
import { Calendar, Clock, User, FileText } from 'lucide-react';
import { useAppointments } from '../hooks/useApiData';
import { useAuth } from '../contexts/AuthContext';

const DoctorHistory: React.FC = () => {
  const { appointments = [], loading } = useAppointments();
  const { user } = useAuth();

  const completedAppointments = appointments.filter(
    apt => apt.doctorId === user?.id && apt.status === 'completed'
  ).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

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
        <h1 className="text-2xl font-semibold">Consultation History</h1>
      </div>

      {completedAppointments.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm p-12 text-center">
          <FileText size={48} className="mx-auto text-gray-300 mb-4" />
          <p className="text-gray-500">No consultation history yet</p>
        </div>
      ) : (
        <div className="space-y-4">
          {completedAppointments.map(appointment => (
            <div key={appointment.id} className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                      <User size={24} className="text-green-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg">Patient ID: {appointment.patientId}</h3>
                      <span className="inline-block px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                        Completed
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
                      <span className="text-sm">{appointment.type}</span>
                    </div>
                  </div>

                  {appointment.notes && (
                    <div className="mt-4 ml-15 p-3 bg-gray-50 rounded">
                      <p className="text-sm text-gray-700"><strong>Notes:</strong> {appointment.notes}</p>
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
