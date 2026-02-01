import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Users, Calendar, FileText, UserCheck, Settings, LogOut } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const Sidebar: React.FC = () => {
  const location = useLocation();
  const { logout } = useAuth();

  const menuItems = [
    { path: '/', icon: Home, label: 'Dashboard' },
    { path: '/appointments', icon: Calendar, label: 'Appointments' },
    { path: '/doctors', icon: UserCheck, label: 'Doctors' },
    { path: '/consultation', icon: Users, label: 'Consultation' },
    { path: '/prescriptions', icon: FileText, label: 'Prescriptions' },
    { path: '/settings', icon: Settings, label: 'Settings' },
  ];

  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <h2>Clinic Management</h2>
      </div>
      <nav className="sidebar-nav">
        {menuItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`sidebar-item ${location.pathname === item.path ? 'active' : ''}`}
          >
            <item.icon size={20} />
            <span>{item.label}</span>
          </Link>
        ))}
      </nav>
      
      <div className="sidebar-footer">
        <button onClick={logout} className="sidebar-settings">
          <LogOut size={20} />
          <span>Sign Out</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
