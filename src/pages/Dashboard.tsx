import React from 'react';
import { Calendar, Clock, FileText, Users, TrendingUp, TrendingDown, Activity } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useAppointments, useDoctors, usePrescriptions, usePatients } from '../hooks/useApiData';

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const { appointments, loading: appointmentsLoading } = useAppointments();
  const { doctors, loading: doctorsLoading } = useDoctors();
  const { prescriptions, loading: prescriptionsLoading } = usePrescriptions();
  const { patients, loading: patientsLoading } = usePatients();

  // Calculate statistics
  const totalAppointments = appointments.length;
  const todayAppointments = appointments.filter(apt => {
    const today = new Date().toISOString().split('T')[0];
    return apt.date === today || apt.date.startsWith('2024');
  }).length;
  
  const pendingPrescriptions = prescriptions.filter(p => 
    new Date(p.date) >= new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
  ).length;
  
  const waitingRoom = 4; // Mock data
  const totalDoctors = doctors.length;
  const availableDoctors = Math.ceil(totalDoctors * 0.6); // Mock: 60% available
  const patientsSeenToday = patients.length > 10 ? Math.floor(patients.length * 0.8) : patients.length;
  const avgWaitTime = 12; // Mock data in minutes

  const stats = [
    {
      title: 'Total Appointments',
      value: totalAppointments.toLocaleString(),
      icon: <Calendar size={24} />,
      change: '+12% this month',
      changeType: 'positive' as const,
      color: 'primary',
      bgColor: 'rgba(14, 165, 233, 0.1)',
      iconColor: '#0ea5e9',
    },
    {
      title: "Today's Appointments",
      value: todayAppointments.toString(),
      icon: <Clock size={24} />,
      change: '+3 from yesterday',
      changeType: 'positive' as const,
      color: 'success',
      bgColor: 'rgba(16, 185, 129, 0.1)',
      iconColor: '#10b981',
    },
    {
      title: 'Pending Prescriptions',
      value: pendingPrescriptions.toString(),
      icon: <FileText size={24} />,
      change: '-2 from yesterday',
      changeType: 'negative' as const,
      color: 'warning',
      bgColor: 'rgba(245, 158, 11, 0.1)',
      iconColor: '#f59e0b',
    },
    {
      title: 'Waiting Room',
      value: waitingRoom.toString(),
      icon: <Users size={24} />,
      change: '+1 patient',
      changeType: 'positive' as const,
      color: 'info',
      bgColor: 'rgba(6, 182, 212, 0.1)',
      iconColor: '#06b6d4',
    },
  ];

  if (appointmentsLoading || doctorsLoading || prescriptionsLoading || patientsLoading) {
    return (
      <div className="loading-screen">
        <div className="loading-spinner"></div>
        <p>Loading dashboard...</p>
      </div>
    );
  }

  // Calculate circular progress percentages
  const appointmentProgress = todayAppointments && totalAppointments
    ? (todayAppointments / Math.max(totalAppointments, 22)) * 100
    : 82;
  const doctorProgress = availableDoctors && totalDoctors
    ? (availableDoctors / totalDoctors) * 100
    : 60;

  return (
    <div className="p-4">
      {/* Welcome Section */}
      <div className="mb-6">
        <h1 className="text-2xl font-semibold mb-2">
          Welcome back, <span className="text-blue-600">{user?.name || 'david'}</span>
        </h1>
        <p className="text-gray-600 text-sm mb-4">Manage appointments and clinic operations</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {stats.map((stat, index) => (
          <div key={index} className="bg-white p-4 rounded-lg shadow-sm flex items-center gap-3">
            <div 
              className="w-14 h-14 rounded-lg flex items-center justify-center"
              style={{ 
                background: stat.bgColor,
                color: stat.iconColor
              }}
            >
              {stat.icon}
            </div>
            <div className="flex-1">
              <div className="flex items-start justify-between mb-1">
                <h3 className="text-xl font-bold">{stat.value}</h3>
                <div className="text-xs">
                  {stat.changeType === 'positive' ? (
                    <TrendingUp size={16} className="text-green-500" />
                  ) : (
                    <TrendingDown size={16} className="text-red-500" />
                  )}
                </div>
              </div>
              <p className="text-sm text-gray-600 mb-1">{stat.title}</p>
              <div className={`text-xs ${stat.changeType === 'positive' ? 'text-green-600' : 'text-red-600'}`}>
                {stat.change}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="w-full">
        {/* Today's Summary */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h3 className="text-xl font-semibold">Today's Summary</h3>
              <p className="text-gray-600 text-sm">Daily clinic overview</p>
            </div>
            <div className="flex items-center gap-2 text-green-500">
              <Activity size={16} />
            </div>
          </div>

          <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
            {/* Pie chart (Appointments) */}
            <div className="w-full md:w-1/2 flex justify-center">
              <div
                className="w-full max-w-[280px] aspect-square rounded-full flex items-center justify-center relative shadow-lg overflow-hidden"
                style={{
                  background: `conic-gradient(
                    #0ea5e9 ${appointmentProgress * 3.6}deg,
                    #e5e7eb 0deg
                  )`,
                } as React.CSSProperties}
              >
                <div className="absolute w-[60%] h-[60%] rounded-full bg-white z-0"></div>
                <div className="absolute z-10 flex flex-col items-center justify-center">
                  <span className="text-3xl font-bold text-blue-500">{Math.round(appointmentProgress)}%</span>
                  <span className="text-sm text-gray-700">{todayAppointments} of {Math.max(totalAppointments, 22)}</span>
                  <span className="text-xs text-gray-500 uppercase">completed</span>
                </div>
              </div>
            </div>

            {/* Bar charts column */}
            <div className="w-full md:w-1/2 flex flex-col gap-6">
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2">Patients Seen Today</h4>
                <div className="w-full h-3 bg-gray-100 rounded overflow-hidden">
                  <div
                    className="h-3 bg-blue-500 rounded"
                    style={{ width: `${(patientsSeenToday / Math.max(patients.length, 30)) * 100}%` }}
                  ></div>
                </div>
                <div className="mt-2 text-sm text-gray-600 font-semibold">{patientsSeenToday} Patients</div>
              </div>

              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2">Average Wait Time</h4>
                <div className="w-full h-3 bg-gray-100 rounded overflow-hidden">
                  <div
                    className="h-3 bg-yellow-500 rounded"
                    style={{ width: `${(avgWaitTime / 30) * 100}%` }}
                  ></div>
                </div>
                <div className="mt-2 text-sm text-gray-600 font-semibold">{avgWaitTime} minutes</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
