import React, { useState, useEffect } from 'react';
import { Calendar, Clock, User, FileText, CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { makeApiRequest } from '../utils/api';
import StatCard from '../components/common/StatCard';

const DoctorDashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [statistics, setStatistics] = useState<any>(null);
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

  const handleStartConsultation = (appointmentId: string) => {
    navigate(`/consultation/${appointmentId}`);
  };

  return (
    <div className="p-4">

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <StatCard title="Today's Appointments" value={todayAppointments.length} icon={<Calendar size={22} />} color="blue" />
        <StatCard title="Pending" value={statistics?.counts?.pending || 0} icon={<Clock size={22} />} color="yellow" />
        <StatCard title="Approved" value={statistics?.counts?.approved || 0} icon={<CheckCircle size={22} />} color="green" />
        <StatCard title="Rejected" value={statistics?.counts?.rejected || 0} icon={<FileText size={22} />} color="red" />
      </div>

      {/* Today's Schedule */}
      <div className="bg-gradient-to-br from-white to-gray-50 rounded-xl shadow-lg border border-gray-100 p-6 mb-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-gradient-to-r from-brand-700 to-brand-600 rounded-lg flex items-center justify-center">
            <Calendar size={20} className="text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-800">Today's Schedule</h2>
            <p className="text-sm text-gray-500">{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
          </div>
        </div>
        
        <div className="space-y-4">
          {todayAppointments.map((appointment: { id: string | number; status: string; patient_name: React.ReactNode; time: React.ReactNode; date: string | number | Date; description: React.ReactNode; }, index: any) => (
            <div key={String(appointment.id)} className="group relative bg-white rounded-xl border border-gray-200 p-5 shadow-sm hover:shadow-md transition-all duration-300 hover:border-brand-100">
              {/* Time indicator line */}
              <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-brand-500 to-brand-700 rounded-l-xl"></div>
              
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4 flex-1">
                  {/* Patient Avatar */}
                  <div className="relative">
                    <div className="w-14 h-14 bg-gradient-to-br from-brand-100 to-brand-50 rounded-xl flex items-center justify-center shadow-sm">
                      <User size={24} className="text-brand-700" />
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
                        <Clock size={16} className="text-brand-700" />
                        <span className="font-medium">{appointment.time}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Calendar size={16} className="text-green-500" />
                        <span>{new Date(appointment.date).toLocaleDateString()}</span>
                      </div>
                    </div>
                    
                    {appointment.description && (
                      <div className="mb-3">
                        <p className="text-sm text-gray-700 bg-gray-50 rounded-lg p-3 border-l-4 border-brand-100">
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
                        ? 'bg-gradient-to-r from-brand-700 to-brand-600 hover:from-brand-600 hover:to-brand-700 text-white focus:ring-brand-700' 
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
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Calendar size={24} className="text-gray-400" />
              </div>
              <p className="text-gray-500">No appointments today</p>
            </div>
          )}
        </div>
      </div>

      {/* Consultation interface removed - no dummy implementation */}
    </div>
  );
};

export default DoctorDashboard;