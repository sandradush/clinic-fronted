import React from 'react';
import { useTranslation } from 'react-i18next';
import { Calendar, Users, FileText, Clock, Bell, Search, TrendingUp, Activity } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

// Components
import TodaySchedule from '../components/dashboard/TodaySchedule';
import QuickActions from '../components/dashboard/QuickActions';
import RecentPatients from '../components/dashboard/RecentPatients';

const Dashboard: React.FC = () => {
  const { t } = useTranslation();
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
        <div className="header-actions">
          <div className="search-bar">
            <Search size={20} />
            <input 
              type="text" 
              placeholder="Search patients, appointments..."
              className="search-input"
            />
          </div>
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
        {/* Today's Schedule */}
        <div className="card dashboard-schedule">
          <div className="card-header">
            <div>
              <h3>Today's Schedule</h3>
              <p className="card-subtitle">18 appointments scheduled</p>
            </div>
            <button className="btn btn-outline btn-sm">
              View All
            </button>
          </div>
          <TodaySchedule />
        </div>

        {/* Recent Patients */}
        <div className="card dashboard-patients">
          <div className="card-header">
            <div>
              <h3>Recent Appointments</h3>
              <p className="card-subtitle">Latest scheduled appointments</p>
            </div>
            <button className="btn btn-outline btn-sm">
              See All
            </button>
          </div>
          <RecentPatients />
        </div>

        {/* Quick Actions */}
        <div className="card dashboard-actions">
          <div className="card-header">
            <h3>Quick Actions</h3>
          </div>
          <QuickActions />
        </div>

        {/* System Status */}
        <div className="card dashboard-status">
          <div className="card-header">
            <div>
              <h3>System Status</h3>
              <p className="card-subtitle">All systems operational</p>
            </div>
            <div className="status-indicator online">
              <Activity size={16} />
            </div>
          </div>
          <div className="status-grid">
            <div className="status-item">
              <span className="status-label">Server Status</span>
              <span className="status-value success">Online</span>
            </div>
            <div className="status-item">
              <span className="status-label">Last Sync</span>
              <span className="status-value">2 min ago</span>
            </div>
            <div className="status-item">
              <span className="status-label">Storage Used</span>
              <div className="storage-bar">
                <div className="storage-fill" style={{ width: '65%' }}></div>
              </div>
              <span className="status-value">65%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;