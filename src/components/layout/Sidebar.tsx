import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Users, Calendar, FileText, UserCheck, ClipboardList, History } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const Sidebar: React.FC = () => {
  const location = useLocation();
  const { user } = useAuth();

  const adminMenuItems = [
    { path: '/dashboard', icon: Home, label: 'Dashboard' },
    { path: '/appointments', icon: Calendar, label: 'Appointments' },
    { path: '/consultation', icon: Users, label: 'Consultation' },
    { path: '/prescriptions', icon: FileText, label: 'Prescriptions' },
    { path: '/doctors', icon: UserCheck, label: 'Doctors' },
  ];

  const doctorMenuItems = [
    { path: '/dashboard', icon: Home, label: 'Overview' },
    { path: '/doctor/requests', icon: ClipboardList, label: 'Requests' },
    { path: '/doctor/history', icon: History, label: 'History' },
  ];

  const menuItems = user?.role === 'doctor' ? doctorMenuItems : adminMenuItems;

  return (
    <div className="w-64 h-screen bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 z-20 flex flex-col sticky top-0 shadow-lg overflow-y-auto">
      <div className="px-6 py-6 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-blue-500 to-blue-600 text-white">
        <h2 className="text-xl font-bold">Clinova</h2>
      </div>
      <nav className="flex-1 px-0 py-4 overflow-y-auto">
        {menuItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`flex items-center gap-3 px-6 py-3 text-gray-700 dark:text-gray-300 transition-all duration-200 border-l-3 border-transparent mx-1 ${
              location.pathname === item.path
                ? 'bg-blue-50 dark:bg-blue-900 text-blue-600 dark:text-blue-300 border-l-blue-600 font-semibold'
                : 'hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-blue-600 dark:hover:text-blue-400 hover:border-l-blue-300'
            }`}
          >
            <item.icon size={20} />
            <span>{item.label}</span>
          </Link>
        ))}
      </nav>
    </div>
  );
};

export default Sidebar;
