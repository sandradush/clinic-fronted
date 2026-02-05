import React, { useState } from 'react';
import { Users, Calendar, UserCheck, ArrowRight } from 'lucide-react';
import { useAppointments, useDoctors } from '../hooks/useApiData';
import { api } from '../services/api';

const AdminDashboard: React.FC = () => {
  const { appointments = [] } = useAppointments();
  const { doctors = [] } = useDoctors();
  const [transferring, setTransferring] = useState<string | null>(null);

  const handleTransferAppointment = async (appointmentId: string, newDoctorId: string) => {
    setTransferring(appointmentId);
    try {
      await api.transferAppointment(appointmentId, newDoctorId);
      // Refresh data would happen here
    } catch (error) {
      console.error('Transfer failed:', error);
    } finally {
      setTransferring(null);
    }
  };

  const pendingAppointments = appointments.filter(apt => apt.status === 'pending');
  const confirmedAppointments = appointments.filter(apt => apt.status === 'confirmed');

  return (
    <div className="p-4">
      <h1 className="text-2xl font-semibold mb-6">Admin Dashboard</h1>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg shadow-sm">
          <div className="flex items-center gap-3">
            <Users className="text-blue-500" size={24} />
            <div>
              <h3 className="text-lg font-semibold">{doctors.length}</h3>
              <p className="text-gray-600">Total Doctors</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm">
          <div className="flex items-center gap-3">
            <Calendar className="text-yellow-500" size={24} />
            <div>
              <h3 className="text-lg font-semibold">{pendingAppointments.length}</h3>
              <p className="text-gray-600">Pending Appointments</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm">
          <div className="flex items-center gap-3">
            <UserCheck className="text-green-500" size={24} />
            <div>
              <h3 className="text-lg font-semibold">{confirmedAppointments.length}</h3>
              <p className="text-gray-600">Confirmed Appointments</p>
            </div>
          </div>
        </div>
      </div>

      {/* Doctors Status */}
      <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
        <h2 className="text-lg font-semibold mb-4">Doctors Status</h2>
        <div className="space-y-3">
          {doctors.map(doctor => (
            <div key={doctor.id} className="flex items-center justify-between p-3 border rounded">
              <div>
                <h3 className="font-medium">{doctor.name}</h3>
                <p className="text-sm text-gray-600">{doctor.specialty}</p>
              </div>
              <div className="flex items-center gap-2">
                <span className={`px-2 py-1 rounded text-xs ${
                  doctor.availability === 'available' ? 'bg-green-100 text-green-700' :
                  doctor.availability === 'busy' ? 'bg-yellow-100 text-yellow-700' :
                  'bg-red-100 text-red-700'
                }`}>
                  {doctor.availability}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Appointment Management */}
      <div className="bg-white rounded-lg shadow-sm p-4">
        <h2 className="text-lg font-semibold mb-4">Appointment Management</h2>
        <div className="space-y-3">
          {appointments.map(appointment => (
            <div key={appointment.id} className="flex items-center justify-between p-3 border rounded">
              <div>
                <p className="font-medium">{appointment.time} - {appointment.type}</p>
                <p className="text-sm text-gray-600">
                  Doctor: {doctors.find(d => d.id === appointment.doctorId)?.name}
                </p>
                <span className={`inline-block px-2 py-1 rounded text-xs ${
                  appointment.status === 'confirmed' ? 'bg-green-100 text-green-700' :
                  appointment.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                  'bg-red-100 text-red-700'
                }`}>
                  {appointment.status}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <select
                  onChange={(e) => handleTransferAppointment(appointment.id, e.target.value)}
                  className="text-sm border rounded px-2 py-1"
                  disabled={transferring === appointment.id}
                >
                  <option value="">Transfer to...</option>
                  {doctors.filter(d => d.id !== appointment.doctorId && d.availability === 'available').map(doctor => (
                    <option key={doctor.id} value={doctor.id}>{doctor.name}</option>
                  ))}
                </select>
                {transferring === appointment.id && (
                  <ArrowRight className="animate-pulse text-blue-500" size={16} />
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;