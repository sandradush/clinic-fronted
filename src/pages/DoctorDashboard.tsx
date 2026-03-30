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

      {/* Today's Schedule */}
      <div className="bg-gradient-to-br from-white to-gray-50 rounded-xl shadow-lg border border-gray-100 p-4 sm:p-6 mb-6">
        <div className="flex flex-wrap items-start sm:items-center justify-between gap-3 mb-6">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div className="w-10 h-10 shrink-0 bg-gradient-to-r from-brand-700 to-brand-600 rounded-lg flex items-center justify-center">
              <Calendar size={20} className="text-white" />
            </div>
            <div className="min-w-0">
              <h2 className="text-lg sm:text-xl font-bold text-gray-800">Today's Schedule</h2>
              <p className="text-xs sm:text-sm text-gray-500 truncate">{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-wrap justify-end">
            <div className="text-sm text-gray-500">
              {todayAppointments.length} appointment{todayAppointments.length !== 1 ? 's' : ''} today
            </div>
          </div>
        </div>
        
        <div className="space-y-4">
          {todayAppointments.map((appointment: { id: string | number; status: string; patient_name: React.ReactNode; time: React.ReactNode; date: string | number | Date; description: React.ReactNode; }, index: any) => (
            <div key={String(appointment.id)} className="group relative bg-white rounded-xl border border-gray-200 p-5 shadow-sm hover:shadow-md transition-all duration-300 hover:border-brand-100">
              {/* Time indicator line */}
              <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-brand-500 to-brand-700 rounded-l-xl"></div>
              
              <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                <div className="flex items-start gap-3 sm:gap-4 flex-1 min-w-0">
                  {/* Patient Avatar */}
                  <div className="relative shrink-0">
                    <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-brand-100 to-brand-50 rounded-xl flex items-center justify-center shadow-sm">
                      <User size={22} className="text-brand-700" />
                    </div>
                    <div className={`absolute -top-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${
                      appointment.status === 'approved' ? 'bg-green-500' :
                      appointment.status === 'pending' ? 'bg-yellow-500' :
                      'bg-red-500'
                    }`}></div>
                  </div>
                  
                  {/* Appointment Details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <h3 className="text-base sm:text-lg font-semibold text-gray-800 truncate">{appointment.patient_name}</h3>
                      <span className={`shrink-0 px-2 py-0.5 rounded-full text-xs font-medium shadow-sm ${
                            appointment.status === 'approved' ? 'bg-green-100 text-green-700 border border-green-200' :
                            appointment.status === 'pending' ? 'bg-amber-100 text-amber-700 border border-amber-200' :
                            'bg-red-100 text-red-700 border border-red-200'
                          }`}>
                            {appointment.status || 'pending'}
                          </span>
                    </div>
                    
                    <div className="flex flex-wrap gap-3 mb-3">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Clock size={15} className="text-brand-700" />
                        <span className="font-medium">{appointment.time}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Calendar size={15} className="text-green-500" />
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
                <div className="flex flex-row sm:flex-col items-center sm:items-end gap-2 sm:ml-0">
                  <button
                    onClick={() => handleStartConsultation(String(appointment.id))}
                    className={`flex-1 sm:flex-none px-4 sm:px-6 py-2 sm:py-3 rounded-lg text-sm font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 shadow-md ${
                      appointment.status === 'approved' 
                        ? 'bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white focus:ring-green-500' 
                        : appointment.status === 'pending'
                        ? 'bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-white focus:ring-yellow-500'
                        : 'bg-gray-100 hover:bg-gray-200 text-gray-600 focus:ring-gray-500'
                    }`}
                  >
                    {appointment.status === 'approved' ? ' Start Consultation' : 
                     appointment.status === 'pending' ? ' Pending' : 
                     ' View'}
                  </button>
                  <span className="text-xs text-gray-400 whitespace-nowrap">ID: #{appointment.id}</span>
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

      {/* All Appointments Section */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-4 sm:p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg flex items-center justify-center">
            <FileText size={20} className="text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-800">All My Appointments</h2>
            <p className="text-sm text-gray-500">Click "Start Consultation" for approved appointments</p>
          </div>
        </div>
        
        <div className="space-y-4">
          {statistics?.allAppointments?.length > 0 ? (
            statistics.allAppointments.map((appointment: any) => (
              <div key={String(appointment.id)} className="bg-gray-50 rounded-lg border p-3 sm:p-4 hover:shadow-md transition-all">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 shrink-0 bg-brand-100 rounded-full flex items-center justify-center">
                      <User size={18} className="text-brand-700" />
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-semibold text-gray-800 truncate">{appointment.patient_name}</h3>
                      <div className="flex flex-wrap items-center gap-2 text-sm text-gray-600 mt-0.5">
                        <span> {new Date(appointment.date).toLocaleDateString()}</span>
                        <span> {appointment.time}</span>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                          appointment.status === 'approved' ? 'bg-green-100 text-green-700' :
                          appointment.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                          'bg-red-100 text-red-700'
                        }`}>
                          {appointment.status}
                        </span>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => handleStartConsultation(String(appointment.id))}
                    className={`self-end sm:self-auto px-4 py-2 rounded-lg text-sm font-semibold transition-all shrink-0 ${
                      appointment.status === 'approved' 
                        ? 'bg-green-600 hover:bg-green-700 text-white' 
                        : 'bg-gray-200 text-gray-600 cursor-not-allowed'
                    }`}
                    disabled={appointment.status !== 'approved'}
                  >
                    {appointment.status === 'approved' ? '🩺 Start Consultation' : 'Not Available'}
                  </button>
                </div>
                {appointment.description && (
                  <p className="mt-2 text-sm text-gray-600 sm:ml-14">{appointment.description}</p>
                )}
              </div>
            ))
          ) : (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <FileText size={24} className="text-gray-400" />
              </div>
              <p className="text-gray-500">No appointments found</p>
              <p className="text-sm text-gray-400 mt-1">Appointments will appear here once scheduled</p>
            </div>
          )}
        </div>
      </div>

      {/* Consultation interface removed - no dummy implementation */}
    </div>
  );
};

export default DoctorDashboard;