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
    <div className="dashboard">
      {/* Welcome Section */}
      <div className="welcome-section">
        <h1>
          Welcome back, <span className="text-primary">{user?.name || 'david'}</span>
        </h1>
        <p className="subtitle">Manage appointments and clinic operations</p>
      </div>

      {/* Stats Cards */}
      <div className="stats-grid">
        {stats.map((stat, index) => (
          <div key={index} className={`stat-card ${stat.color}`}>
            <div className="stat-header">
              <div 
                className="stat-icon"
                style={{ 
                  background: stat.bgColor,
                  color: stat.iconColor
                }}
              >
                {stat.icon}
              </div>
              <div className="stat-trend">
                {stat.changeType === 'positive' ? (
                  <TrendingUp size={16} style={{ color: '#10b981' }} />
                ) : (
                  <TrendingDown size={16} style={{ color: '#ef4444' }} />
                )}
              </div>
            </div>
            <div className="stat-content">
              <h3 className="stat-value">{stat.value}</h3>
              <p className="stat-title">{stat.title}</p>
              <div className={`stat-change ${stat.changeType}`}>
                {stat.change}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="dashboard-grid">
        {/* Today's Summary */}
        <div className="card dashboard-status">
          <div className="card-header">
            <div>
              <h3>Today's Summary</h3>
              <p className="card-subtitle">Daily clinic overview</p>
            </div>
            <div className="status-indicator online">
              <Activity size={16} />
            </div>
          </div>
          
          <div className="summary-charts">
            {/* Circular Progress 1 - Appointments */}
            <div className="chart-item">
              <div className="circular-chart">
                <div 
                  className="circle-progress" 
                  style={{ 
                    '--progress': `${appointmentProgress}%`,
                    background: `conic-gradient(
                      #0ea5e9 ${appointmentProgress * 3.6}deg,
                      #e5e7eb 0deg
                    )`
                  } as React.CSSProperties}
                >
                  <span className="chart-value">
                    {todayAppointments}/{Math.max(totalAppointments, 22)}
                  </span>
                </div>
              </div>
              <span className="chart-label">Appointments</span>
            </div>

            {/* Circular Progress 2 - Doctors Available */}
            <div className="chart-item">
              <div className="circular-chart">
                <div 
                  className="circle-progress success" 
                  style={{ 
                    '--progress': `${doctorProgress}%`,
                    background: `conic-gradient(
                      #10b981 ${doctorProgress * 3.6}deg,
                      #e5e7eb 0deg
                    )`
                  } as React.CSSProperties}
                >
                  <span className="chart-value">
                    {availableDoctors}/{totalDoctors}
                  </span>
                </div>
              </div>
              <span className="chart-label">Doctors Available</span>
            </div>

            {/* Bar Chart 1 - Patients Seen */}
            <div className="chart-item">
              <div className="bar-chart">
                <div className="bar-label">Patients Seen</div>
                <div className="bar-container">
                  <div 
                    className="bar-fill" 
                    style={{ 
                      width: `${(patientsSeenToday / Math.max(patients.length, 30)) * 100}%`,
                      background: '#0ea5e9'
                    }}
                  ></div>
                </div>
                <div className="bar-value">{patientsSeenToday}</div>
              </div>
            </div>

            {/* Bar Chart 2 - Avg Wait Time */}
            <div className="chart-item">
              <div className="bar-chart">
                <div className="bar-label">Avg Wait Time</div>
                <div className="bar-container">
                  <div 
                    className="bar-fill warning" 
                    style={{ 
                      width: `${(avgWaitTime / 30) * 100}%`,
                      background: '#f59e0b'
                    }}
                  ></div>
                </div>
                <div className="bar-value">{avgWaitTime} min</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
