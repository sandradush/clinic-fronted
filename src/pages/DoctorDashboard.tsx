import React, { useState } from 'react';
import { Calendar, Clock, User, FileText, CheckCircle } from 'lucide-react';
import { useAppointments } from '../hooks/useApiData';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../services/api';

const DoctorDashboard: React.FC = () => {
  const { user } = useAuth();
  const { appointments = [], loading } = useAppointments();
  const [availability, setAvailability] = useState<'available' | 'busy' | 'offline'>('available');
  const [selectedAppointment, setSelectedAppointment] = useState<string | null>(null);

  // Filter appointments for current doctor
  const myAppointments = appointments.filter(apt => 
    apt.doctorId === user?.id || apt.doctorId === '1' // Mock: assuming current user is doctor with id '1'
  );

  const todayAppointments = myAppointments.filter(apt => {
    const today = new Date().toISOString().split('T')[0];
    return apt.date === today || apt.date.startsWith('2024');
  });

  const handleUpdateAvailability = async (newAvailability: 'available' | 'busy' | 'offline') => {
    try {
      await api.updateDoctorAvailability(user?.id || '1', newAvailability);
      setAvailability(newAvailability);
    } catch (error) {
      console.error('Failed to update availability:', error);
    }
  };

  const handleStartConsultation = (appointmentId: string) => {
    setSelectedAppointment(appointmentId);
    // Here you would typically navigate to consultation page or open consultation modal
  };

  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold">Doctor Dashboard</h1>
          <p className="text-gray-600">Welcome, Dr. {user?.name}</p>
        </div>
        
        {/* Availability Status */}
        <div className="flex items-center gap-3">
          <span className="text-sm font-medium">Status:</span>
          <select
            value={availability}
            onChange={(e) => handleUpdateAvailability(e.target.value as any)}
            className={`px-3 py-1 rounded border text-sm font-medium ${
              availability === 'available' ? 'bg-green-100 text-green-700 border-green-300' :
              availability === 'busy' ? 'bg-yellow-100 text-yellow-700 border-yellow-300' :
              'bg-red-100 text-red-700 border-red-300'
            }`}
          >
            <option value="available">Available</option>
            <option value="busy">Busy</option>
            <option value="offline">Offline</option>
          </select>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg shadow-sm">
          <div className="flex items-center gap-3">
            <Calendar className="text-blue-500" size={24} />
            <div>
              <h3 className="text-lg font-semibold">{todayAppointments.length}</h3>
              <p className="text-gray-600">Today's Appointments</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm">
          <div className="flex items-center gap-3">
            <Clock className="text-yellow-500" size={24} />
            <div>
              <h3 className="text-lg font-semibold">
                {todayAppointments.filter(apt => apt.status === 'pending').length}
              </h3>
              <p className="text-gray-600">Pending</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm">
          <div className="flex items-center gap-3">
            <CheckCircle className="text-green-500" size={24} />
            <div>
              <h3 className="text-lg font-semibold">
                {todayAppointments.filter(apt => apt.status === 'confirmed').length}
              </h3>
              <p className="text-gray-600">Confirmed</p>
            </div>
          </div>
        </div>
      </div>

      {/* Today's Schedule */}
      <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
        <h2 className="text-lg font-semibold mb-4">Today's Schedule</h2>
        <div className="space-y-3">
          {todayAppointments.map(appointment => (
            <div key={appointment.id} className="flex items-center justify-between p-3 border rounded hover:bg-gray-50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <User size={20} className="text-blue-600" />
                </div>
                <div>
                  <p className="font-medium">{appointment.time}</p>
                  <p className="text-sm text-gray-600">{appointment.type}</p>
                  <span className={`inline-block px-2 py-1 rounded text-xs ${
                    appointment.status === 'confirmed' ? 'bg-green-100 text-green-700' :
                    appointment.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                    'bg-red-100 text-red-700'
                  }`}>
                    {appointment.status}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {appointment.status === 'confirmed' && (
                  <button
                    onClick={() => handleStartConsultation(appointment.id)}
                    className="px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600"
                  >
                    Start Consultation
                  </button>
                )}
                {appointment.status === 'pending' && (
                  <button className="px-3 py-1 bg-green-500 text-white rounded text-sm hover:bg-green-600">
                    Confirm
                  </button>
                )}
              </div>
            </div>
          ))}
          {todayAppointments.length === 0 && (
            <p className="text-gray-500 text-center py-4">No appointments scheduled for today</p>
          )}
        </div>
      </div>

      {/* Consultation Area */}
      {selectedAppointment && (
        <div className="bg-white rounded-lg shadow-sm p-4">
          <h2 className="text-lg font-semibold mb-4">Consultation in Progress</h2>
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
            <FileText size={48} className="mx-auto text-gray-400 mb-4" />
            <p className="text-gray-600 mb-4">Consultation interface would be implemented here</p>
            <div className="flex justify-center gap-2">
              <button className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600">
                Complete Consultation
              </button>
              <button 
                onClick={() => setSelectedAppointment(null)}
                className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DoctorDashboard;