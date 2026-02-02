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
    <div className="w-64 h-screen bg-white border-r border-gray-200 z-20 flex flex-col sticky top-0 shadow-lg overflow-y-auto">
      <div className="px-6 py-6 border-b border-gray-200 bg-gradient-to-r from-blue-500 to-blue-600 text-white">
        <h2 className="text-xl font-bold">Clinic Management</h2>
      </div>
      <nav className="flex-1 px-0 py-4 overflow-y-auto">
        {menuItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`flex items-center gap-3 px-6 py-3 text-gray-700 transition-all duration-200 border-l-3 border-transparent mx-1 ${
              location.pathname === item.path
                ? 'bg-blue-50 text-blue-600 border-l-blue-600 font-semibold'
                : 'hover:bg-gray-50 hover:text-blue-600 hover:border-l-blue-300'
            }`}
          >
            <item.icon size={20} />
            <span>{item.label}</span>
          </Link>
        ))}
      </nav>
      
      <div className="p-4 border-t border-gray-200">
        <button 
          onClick={logout} 
          className="w-full flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-50 hover:text-red-600 rounded-md transition-all duration-200"
        >
          <LogOut size={20} />
          <span>Sign Out</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
