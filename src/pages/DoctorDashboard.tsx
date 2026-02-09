import React, { useState } from 'react';
import { Calendar, Clock, CheckCircle } from 'lucide-react';
import { useAppointments } from '../hooks/useApiData';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../services/api';

const DoctorDashboard: React.FC = () => {
  const { user } = useAuth();
  const { appointments = [] } = useAppointments();
  const [availability, setAvailability] = useState<'available' | 'busy' | 'offline'>('available');

  const myAppointments = appointments.filter(apt => apt.doctorId === user?.id);
  const todayAppointments = myAppointments.filter(apt => {
    const today = new Date().toISOString().split('T')[0];
    return apt.date === today;
  });

  const handleUpdateAvailability = async (newAvailability: 'available' | 'busy' | 'offline') => {
    try {
      await api.updateDoctorAvailability(user?.id || '', newAvailability);
      setAvailability(newAvailability);
    } catch (error) {
      console.error('Failed to update availability:', error);
    }
  };

  return (
    <div className="p-4 dark:bg-gray-900">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold dark:text-white">Overview</h1>
        </div>
        
        <div className="flex items-center gap-3">
          <span className="text-sm font-medium dark:text-gray-300">Status:</span>
          <select
            value={availability}
            onChange={(e) => handleUpdateAvailability(e.target.value as any)}
            className={`px-3 py-1 rounded border text-sm font-medium ${
              availability === 'available' ? 'bg-green-100 text-green-700 border-green-300 dark:bg-green-900 dark:text-green-300' :
              availability === 'busy' ? 'bg-yellow-100 text-yellow-700 border-yellow-300 dark:bg-yellow-900 dark:text-yellow-300' :
              'bg-red-100 text-red-700 border-red-300 dark:bg-red-900 dark:text-red-300'
            }`}
          >
            <option value="available">Available</option>
            <option value="busy">Busy</option>
            <option value="offline">Offline</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm">
          <div className="flex items-center gap-3">
            <Calendar className="text-blue-500" size={24} />
            <div>
              <h3 className="text-lg font-semibold dark:text-white">{todayAppointments.length}</h3>
              <p className="text-gray-600 dark:text-gray-400">Today's Appointments</p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm">
          <div className="flex items-center gap-3">
            <Clock className="text-yellow-500" size={24} />
            <div>
              <h3 className="text-lg font-semibold dark:text-white">
                {todayAppointments.filter(apt => apt.status === 'pending').length}
              </h3>
              <p className="text-gray-600 dark:text-gray-400">Pending</p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm">
          <div className="flex items-center gap-3">
            <CheckCircle className="text-green-500" size={24} />
            <div>
              <h3 className="text-lg font-semibold dark:text-white">
                {todayAppointments.filter(apt => apt.status === 'confirmed').length}
              </h3>
              <p className="text-gray-600 dark:text-gray-400">Confirmed</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DoctorDashboard;