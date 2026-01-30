import React from 'react';
import { Calendar, Users, FileText, Clock, TrendingUp, Activity } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const Dashboard: React.FC = () => {
  const { user } = useAuth();

  const stats = [
    {
      title: 'Total Appointments',
      value: '1,248',
      icon: <Calendar size={24} />,
      change: '+12% this month',
      changeType: 'positive',
      color: 'primary',
    },
    {
      title: 'Today\'s Appointments',
      value: '18',
      icon: <Clock size={24} />,
      change: '+3 from yesterday',
      changeType: 'positive',
      color: 'success',
    },
    {
      title: 'Pending Prescriptions',
      value: '7',
      icon: <FileText size={24} />,
      change: '-2 from yesterday',
      changeType: 'negative',
      color: 'warning',
    },
    {
      title: 'Waiting Room',
      value: '4',
      icon: <Users size={24} />,
      change: '+1 patient',
      changeType: 'positive',
      color: 'info',
    },
  ];

  return (
    <div className="dashboard">
      {/* Welcome Header */}
      <div className="page-header">
        <div>
          <h1>Welcome back, <span className="text-primary">{user?.name || 'Clinic Administrator'}</span> 👋</h1>
          <p className="subtitle">Manage appointments and clinic operations</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="stats-grid">
        {stats.map((stat, index) => (
          <div key={index} className={`stat-card ${stat.color}`}>
            <div className="stat-header">
              <div className="stat-icon">
                {stat.icon}
              </div>
              <div className="stat-trend">
                <TrendingUp size={16} />
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
            <div className="chart-item">
              <div className="circular-chart">
                <div className="circle-progress" style={{ '--progress': '82%' } as React.CSSProperties}>
                  <span className="chart-value">18/22</span>
                </div>
              </div>
              <span className="chart-label">Appointments</span>
            </div>
            <div className="chart-item">
              <div className="circular-chart">
                <div className="circle-progress success" style={{ '--progress': '60%' } as React.CSSProperties}>
                  <span className="chart-value">3/5</span>
                </div>
              </div>
              <span className="chart-label">Doctors Available</span>
            </div>
            <div className="chart-item">
              <div className="bar-chart">
                <div className="bar-label">Patients Seen</div>
                <div className="bar-container">
                  <div className="bar-fill" style={{ width: '80%' }}></div>
                </div>
                <div className="bar-value">24</div>
              </div>
            </div>
            <div className="chart-item">
              <div className="bar-chart">
                <div className="bar-label">Avg Wait Time</div>
                <div className="bar-container">
                  <div className="bar-fill warning" style={{ width: '40%' }}></div>
                </div>
                <div className="bar-value">12 min</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;