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
        // Try to fetch doctor-specific appointments first
        const data = await makeApiRequest(`/appointments/doctor/${user.id}/statistic`);
        setStatistics(data);
      } catch (err) {
        console.error('Failed to fetch doctor statistics:', err);
        // Fallback: fetch all appointments and filter by doctor
        try {
          const allAppointments = await makeApiRequest('/appointments');
          const doctorAppointments = allAppointments.filter((apt: any) => 
            apt.doctor_id === user.id || apt.doctor_name_id === user.id
          );
          
          // Create statistics object
          const today = new Date().toISOString().split('T')[0];
          const todayAppointments = doctorAppointments.filter((apt: any) => 
            apt.date === today || new Date(apt.date).toDateString() === new Date().toDateString()
          );
          
          const counts = {
            pending: doctorAppointments.filter((apt: any) => apt.status === 'pending').length,
            approved: doctorAppointments.filter((apt: any) => apt.status === 'approved').length,
            rejected: doctorAppointments.filter((apt: any) => apt.status === 'rejected').length
          };
          
          setStatistics({ 
            todayAppointments, 
            counts, 
            allAppointments: doctorAppointments 
          });
        } catch (fallbackErr) {
          console.error('Fallback fetch also failed:', fallbackErr);
          setStatistics({ todayAppointments: [], counts: { pending: 0, approved: 0, rejected: 0 } });
        }
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
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mb-6">
        <StatCard title="Today's Appointments" value={todayAppointments.length} icon={<Calendar size={22} />} color="blue" />
        <StatCard title="Pending" value={statistics?.counts?.pending || 0} icon={<Clock size={22} />} color="yellow" />
        <StatCard title="Approved" value={statistics?.counts?.approved || 0} icon={<CheckCircle size={22} />} color="green" />
        <StatCard title="Rejected" value={statistics?.counts?.rejected || 0} icon={<FileText size={22} />} color="red" />
      </div>

      {/* Today's Schedule - Compact */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-semibold text-gray-800">Today's Schedule</h2>
            <p className="text-sm text-gray-500">{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}</p>
          </div>
          <div className="text-sm text-gray-500">
            {todayAppointments.length} appointment{todayAppointments.length !== 1 ? 's' : ''}
          </div>
        </div>
        
        <div className="space-y-3">
          {todayAppointments.map((appointment: { id: string | number; status: string; patient_name: React.ReactNode; time: React.ReactNode; date: string | number | Date; description: React.ReactNode; }) => (
            <div key={String(appointment.id)} className="bg-gray-50 rounded-lg border p-3 hover:shadow-sm transition-all">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className={`w-3 h-3 rounded-full shrink-0 ${
                    appointment.status === 'approved' ? 'bg-green-500' :
                    appointment.status === 'pending' ? 'bg-yellow-500' :
                    'bg-red-500'
                  }`}></div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-medium text-gray-800 truncate">{appointment.patient_name}</h3>
                      <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                        appointment.status === 'approved' ? 'bg-green-100 text-green-700' :
                        appointment.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-red-100 text-red-700'
                      }`}>
                        {appointment.status}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-sm text-gray-600">
                      <span className="font-medium">{appointment.time}</span>
                      {appointment.description && (
                        <span className="truncate">{appointment.description}</span>
                      )}
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => handleStartConsultation(String(appointment.id))}
                  className={`px-3 py-1.5 rounded text-sm font-medium transition-all shrink-0 ${
                    appointment.status === 'approved' 
                      ? 'bg-green-600 hover:bg-green-700 text-white' 
                      : appointment.status === 'pending'
                      ? 'bg-yellow-500 hover:bg-yellow-600 text-white'
                      : 'bg-gray-200 text-gray-600'
                  }`}
                >
                  {appointment.status === 'approved' ? 'Start' : 
                   appointment.status === 'pending' ? 'Pending' : 
                   'View'}
                </button>
              </div>
            </div>
          ))}
          
          {todayAppointments.length === 0 && (
            <div className="text-center py-6">
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