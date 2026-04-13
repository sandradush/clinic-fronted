import React, { useState, useEffect } from 'react';
import { Calendar, Clock, User, FileText, CheckCircle, TrendingUp, BarChart3 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { makeApiRequest } from '../utils/api';
import StatCard from '../components/common/StatCard';

const DoctorDashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [statistics, setStatistics] = useState<any>(null);
  const [selectedAppointment, setSelectedAppointment] = useState<string | null>(null);
  const [weeklyData, setWeeklyData] = useState<any[]>([]);
  const [monthlyData, setMonthlyData] = useState<any[]>([]);

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
          
          // Generate weekly and monthly data for charts
          generateChartData(doctorAppointments);
        } catch (fallbackErr) {
          console.error('Fallback fetch also failed:', fallbackErr);
          setStatistics({ todayAppointments: [], counts: { pending: 0, approved: 0, rejected: 0 } });
        }
      }
    };

    fetchDoctorStatistics();
  }, [user]);

  const generateChartData = (appointments: any[]) => {
    // Generate last 7 days data
    const last7Days = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      const dayAppointments = appointments.filter(apt => 
        apt.date === dateStr || new Date(apt.date).toDateString() === date.toDateString()
      );
      
      last7Days.push({
        day: date.toLocaleDateString('en-US', { weekday: 'short' }),
        date: dateStr,
        total: dayAppointments.length,
        approved: dayAppointments.filter(apt => apt.status === 'approved').length,
        pending: dayAppointments.filter(apt => apt.status === 'pending').length,
        rejected: dayAppointments.filter(apt => apt.status === 'rejected').length
      });
    }
    setWeeklyData(last7Days);

    // Generate last 6 months data
    const last6Months = [];
    for (let i = 5; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const monthStart = new Date(date.getFullYear(), date.getMonth(), 1);
      const monthEnd = new Date(date.getFullYear(), date.getMonth() + 1, 0);
      
      const monthAppointments = appointments.filter(apt => {
        const aptDate = new Date(apt.date);
        return aptDate >= monthStart && aptDate <= monthEnd;
      });
      
      last6Months.push({
        month: date.toLocaleDateString('en-US', { month: 'short' }),
        total: monthAppointments.length,
        approved: monthAppointments.filter(apt => apt.status === 'approved').length,
        pending: monthAppointments.filter(apt => apt.status === 'pending').length,
        rejected: monthAppointments.filter(apt => apt.status === 'rejected').length
      });
    }
    setMonthlyData(last6Months);
  };

  const SimpleLineChart = ({ data, title, color = "blue" }: { data: any[], title: string, color?: string }) => {
    const maxValue = Math.max(...data.map(item => item.total), 1);
    const points = data.map((item, index) => {
      const x = (index / (data.length - 1)) * 100;
      const y = 100 - ((item.total / maxValue) * 80);
      return `${x},${y}`;
    }).join(' ');

    return (
      <div className="bg-white rounded-lg border border-gray-200 p-3">
        <h4 className="text-sm font-medium text-gray-700 mb-2">{title}</h4>
        <div className="h-16 relative">
          <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
            <polyline
              fill="none"
              stroke={color === "blue" ? "#3b82f6" : color === "green" ? "#10b981" : "#f59e0b"}
              strokeWidth="2"
              points={points}
            />
            {data.map((item, index) => {
              const x = (index / (data.length - 1)) * 100;
              const y = 100 - ((item.total / maxValue) * 80);
              return (
                <circle
                  key={index}
                  cx={x}
                  cy={y}
                  r="2"
                  fill={color === "blue" ? "#3b82f6" : color === "green" ? "#10b981" : "#f59e0b"}
                />
              );
            })}
          </svg>
        </div>
        <div className="flex justify-between text-xs text-gray-500 mt-1">
          <span>{data[0]?.day || data[0]?.month}</span>
          <span>{data[data.length - 1]?.day || data[data.length - 1]?.month}</span>
        </div>
      </div>
    );
  };

  const MiniBarChart = ({ data, title }: { data: any[], title: string }) => {
    const maxValue = Math.max(...data.map(item => item.total), 1);
    
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-3">
        <h4 className="text-sm font-medium text-gray-700 mb-2">{title}</h4>
        <div className="flex items-end justify-between gap-1 h-12">
          {data.slice(-7).map((item, index) => (
            <div key={index} className="flex flex-col items-center flex-1">
              <div className="w-full flex flex-col">
                <div 
                  className="w-full bg-blue-500 rounded-t"
                  style={{ height: `${(item.total / maxValue) * 40}px`, minHeight: item.total > 0 ? '2px' : '0px' }}
                ></div>
              </div>
              <span className="text-xs text-gray-500 mt-1">{item.day?.slice(0, 1) || item.month?.slice(0, 1)}</span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const StatusPieChart = () => {
    const total = (statistics?.counts?.pending || 0) + (statistics?.counts?.approved || 0) + (statistics?.counts?.rejected || 0);
    if (total === 0) return null;
    
    const approved = statistics?.counts?.approved || 0;
    const pending = statistics?.counts?.pending || 0;
    const rejected = statistics?.counts?.rejected || 0;
    
    const approvedAngle = (approved / total) * 360;
    const pendingAngle = (pending / total) * 360;
    const rejectedAngle = (rejected / total) * 360;
    
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-3">
        <h4 className="text-sm font-medium text-gray-700 mb-2">Status Overview</h4>
        <div className="flex items-center gap-3">
          <div className="relative w-12 h-12">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 42 42">
              <circle cx="21" cy="21" r="15.915" fill="transparent" stroke="#e5e7eb" strokeWidth="3"/>
              <circle 
                cx="21" cy="21" r="15.915" fill="transparent" 
                stroke="#10b981" strokeWidth="3"
                strokeDasharray={`${(approved/total) * 100} ${100 - (approved/total) * 100}`}
                strokeDashoffset="0"
              />
              <circle 
                cx="21" cy="21" r="15.915" fill="transparent" 
                stroke="#f59e0b" strokeWidth="3"
                strokeDasharray={`${(pending/total) * 100} ${100 - (pending/total) * 100}`}
                strokeDashoffset={`-${(approved/total) * 100}`}
              />
              <circle 
                cx="21" cy="21" r="15.915" fill="transparent" 
                stroke="#ef4444" strokeWidth="3"
                strokeDasharray={`${(rejected/total) * 100} ${100 - (rejected/total) * 100}`}
                strokeDashoffset={`-${((approved + pending)/total) * 100}`}
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-xs font-medium">{total}</span>
            </div>
          </div>
          <div className="flex-1 space-y-1">
            <div className="flex items-center gap-2 text-xs">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span>{approved}</span>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
              <span>{pending}</span>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <div className="w-2 h-2 bg-red-500 rounded-full"></div>
              <span>{rejected}</span>
            </div>
          </div>
        </div>
      </div>
    );
  };

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

      {/* Mini Charts */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-6">
        <SimpleLineChart data={weeklyData} title="Weekly Trend" color="blue" />
        <MiniBarChart data={weeklyData} title="Last 7 Days" />
        <StatusPieChart />
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