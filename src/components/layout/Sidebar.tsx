import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Calendar, UserCheck, ClipboardList, History, Activity, Clock, Users, Settings } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const Sidebar: React.FC = () => {
  const location = useLocation();
  const { user } = useAuth();
  const [logoError, setLogoError] = React.useState(false);

    const adminMenuItems = [
    { path: '/dashboard', icon: Home, label: 'Analytics Overview' },
    { path: '/appointments', icon: Calendar, label: 'Appointments' },
    { path: '/doctors', icon: UserCheck, label: 'Doctors' },
    { path: '/waiting-patients', icon: Clock, label: 'Waiting Patients' },
<<<<<<< HEAD
=======
    { path: '/roles', icon: Users, label: 'Role & Permissions' },
    { path: '/staff-management', icon: Users, label: 'Staff' },
>>>>>>> bfdfd7ab5737074acaafdbe6deba76451d4cf2ca
      { path: '/settings', icon: Settings, label: 'Settings' },
  ];

  const doctorMenuItems = [
    { path: '/dashboard', icon: Home, label: 'Overview' },
    { path: '/doctor/appointment-requests', icon: ClipboardList, label: 'Requests' },
    { path: '/prescription', icon: Activity, label: 'Prescription' },
    { path: '/doctor/history', icon: History, label: 'History' },
  ];

  const receptionistMenuItems = [
    { path: '/receptionist-dashboard', icon: Home, label: 'Reception Dashboard' },
    { path: '/schedules', icon: Calendar, label: 'Schedule' },
    { path: '/waiting-patients', icon: Clock, label: 'Waiting Patients' },
<<<<<<< HEAD
  ];
=======
    { path: '/roles', icon: Users, label: 'Role & Permissions' },
    { path: '/staff-management', icon: Users, label: 'Staff' },
  ];

  const menuItems = user?.role === 'doctor' ? doctorMenuItems : user?.role === 'receptionist' ? receptionistMenuItems : adminMenuItems;
>>>>>>> bfdfd7ab5737074acaafdbe6deba76451d4cf2ca

  const menuItems = user?.role === 'doctor' ? doctorMenuItems : user?.role === 'receptionist' ? receptionistMenuItems : adminMenuItems;
  return (
    <div className="w-64 h-screen bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 z-20 flex flex-col sticky top-0 shadow-lg overflow-y-auto">
      <div className="border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
        <div className="mx-1 px-6 py-4 flex items-center gap-3">
          {!logoError && (
            <img
              src="/clinova-logo"
              alt="Clinova icon"
              className="h-9 w-9 rounded-sm bg-white p-1"
              onError={() => setLogoError(true)}
            />
          )}
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Clinova</h2>
        </div>
      </div>

      <nav className="flex-1 px-0 py-4 overflow-y-auto">
        {menuItems.map((item) => {
          const basePath = String(item.path).split('?')[0];
          const isActive = location.pathname === basePath;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-6 py-3 text-gray-700 dark:text-gray-300 transition-all duration-200 border-l-3 border-transparent mx-1 ${
                isActive
<<<<<<< HEAD
                  ? 'bg-brand-100/40 dark:bg-brand-700/40 text-brand-700 dark:text-brand-100 border-l-brand-600 font-semibold'
                  : 'hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-brand-600 dark:hover:text-brand-100 hover:border-l-brand-500'
=======
                  ? 'bg-blue-50 dark:bg-blue-900 text-blue-600 dark:text-blue-300 border-l-blue-600 font-semibold'
                  : 'hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-blue-600 dark:hover:text-blue-400 hover:border-l-blue-300'
>>>>>>> bfdfd7ab5737074acaafdbe6deba76451d4cf2ca
              }`}
            >
              <item.icon size={20} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
};

export default Sidebar;
