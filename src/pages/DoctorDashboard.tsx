import React, { useState, useEffect } from 'react';
import { Calendar, Clock, User, FileText, CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAppointments } from '../hooks/useApiData';
import { useAuth } from '../contexts/AuthContext';
import { makeApiRequest } from '../utils/api';

const DoctorDashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [statistics, setStatistics] = useState<any>(null);
  const [availability, setAvailability] = useState<'available' | 'busy' | 'offline'>('available');
  const [selectedAppointment, setSelectedAppointment] = useState<string | null>(null);

  // Fetch appointment statistics for current doctor from backend
  useEffect(() => {
    const fetchDoctorStatistics = async () => {
      if (!user?.id) return;
      try {
        const data = await makeApiRequest(`/appointments/doctor/${user.id}/statistic`);
        setStatistics(data);
      } catch (err) {
        console.error('Failed to fetch doctor statistics:', err);
      }
    };

    fetchDoctorStatistics();
  }, [user]);

  const todayAppointments = statistics?.todayAppointments || [];

  const handleUpdateAvailability = async (newAvailability: 'available' | 'busy' | 'offline') => {
    try {
      await makeApiRequest(`/doctors/${user?.id || '1'}`, {
        method: 'PUT',
        body: JSON.stringify({ availability: newAvailability })
      });
      setAvailability(newAvailability);
    } catch (error) {
      console.error('Failed to update availability:', error);
    }
  };

  const handleStartConsultation = (appointmentId: string) => {
    navigate(`/consultation/${appointmentId}`);
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
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
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
              <h3 className="text-lg font-semibold">{statistics?.counts?.pending || 0}</h3>
              <p className="text-gray-600">Pending</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm">
          <div className="flex items-center gap-3">
            <CheckCircle className="text-green-500" size={24} />
            <div>
              <h3 className="text-lg font-semibold">{statistics?.counts?.approved || 0}</h3>
              <p className="text-gray-600">Approved</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm">
          <div className="flex items-center gap-3">
            <FileText className="text-red-500" size={24} />
            <div>
              <h3 className="text-lg font-semibold">{statistics?.counts?.rejected || 0}</h3>
              <p className="text-gray-600">Rejected</p>
            </div>
          </div>
        </div>
      </div>

      {/* Today's Schedule */}
      <div className="bg-gradient-to-br from-white to-gray-50 rounded-xl shadow-lg border border-gray-100 p-6 mb-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
            <Calendar size={20} className="text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-800">Today's Schedule</h2>
            <p className="text-sm text-gray-500">{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
          </div>
        </div>
        
        <div className="space-y-4">
          {todayAppointments.map((appointment: { id: string | number; status: string; patient_name: React.ReactNode; time: React.ReactNode; date: string | number | Date; description: React.ReactNode; }, index: any) => (
            <div key={String(appointment.id)} className="group relative bg-white rounded-xl border border-gray-200 p-5 shadow-sm hover:shadow-md transition-all duration-300 hover:border-blue-200">
              {/* Time indicator line */}
              <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-blue-400 to-blue-600 rounded-l-xl"></div>
              
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4 flex-1">
                  {/* Patient Avatar */}
                  <div className="relative">
                    <div className="w-14 h-14 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-xl flex items-center justify-center shadow-sm">
                      <User size={24} className="text-blue-600" />
                    </div>
                    {/* Status dot indicator */}
                    <div className={`absolute -top-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${
                      appointment.status === 'approved' ? 'bg-green-500' :
                      appointment.status === 'pending' ? 'bg-yellow-500' :
                      'bg-red-500'
                    }`}></div>
                  </div>
                  
                  {/* Appointment Details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-800 truncate">{appointment.patient_name}</h3>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium shadow-sm ${
                        appointment.status === 'approved' ? 'bg-green-100 text-green-700 border border-green-200' :
                        appointment.status === 'pending' ? 'bg-amber-100 text-amber-700 border border-amber-200' :
                        'bg-red-100 text-red-700 border border-red-200'
                      }`}>
                        {appointment.status || 'pending'}
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Clock size={16} className="text-blue-500" />
                        <span className="font-medium">{appointment.time}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Calendar size={16} className="text-green-500" />
                        <span>{new Date(appointment.date).toLocaleDateString()}</span>
                      </div>
                    </div>
                    
                    {appointment.description && (
                      <div className="mb-3">
                        <p className="text-sm text-gray-700 bg-gray-50 rounded-lg p-3 border-l-4 border-blue-200">
                          {appointment.description}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Action Button */}
                <div className="flex flex-col items-end gap-2 ml-4">
                  <button
                    onClick={() => handleStartConsultation(String(appointment.id))}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 shadow-sm ${
                      appointment.status === 'approved' 
                        ? 'bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white focus:ring-blue-500' 
                        : 'bg-gray-100 hover:bg-gray-200 text-gray-600 focus:ring-gray-500'
                    }`}
                    disabled={appointment.status !== 'approved'}
                  >
                    {appointment.status === 'approved' ? 'Start Consultation' : 'View Details'}
                  </button>
                  <span className="text-xs text-gray-400">#{appointment.id}</span>
                </div>
              </div>
            </div>
          ))}
          
          {todayAppointments.length === 0 && (
            <div className="text-center py-12">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Calendar size={32} className="text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-600 mb-2">No appointments today</h3>
              <p className="text-gray-500">Take a break! You have no scheduled appointments for today.</p>
            </div>
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