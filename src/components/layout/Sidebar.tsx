import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Calendar, UserCheck, ClipboardList, History, Activity, Clock, Settings } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen = false, onClose }) => {
  const location = useLocation();
  const { user } = useAuth();
  const [logoError, setLogoError] = React.useState(false);

  const adminMenuItems = [
    { path: '/dashboard', icon: Home, label: 'Analytics Overview' },
    { path: '/appointments', icon: Calendar, label: 'Appointments' },
    { path: '/doctors', icon: UserCheck, label: 'Doctors' },
    { path: '/waiting-patients', icon: Clock, label: 'Waiting Patients' },
    { path: '/payments', icon: ClipboardList, label: 'Payments' },
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
  ];

  const menuItems = user?.role === 'doctor' ? doctorMenuItems : user?.role === 'receptionist' ? receptionistMenuItems : adminMenuItems;

  return (
    <>
      {/* Mobile overlay/backdrop when sidebar is open */}
      <div className={`fixed inset-0 bg-black bg-opacity-40 z-30 md:hidden transition-opacity ${isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`} onClick={onClose}></div>

      <div className={`fixed inset-y-0 left-0 z-40 transform ${isOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 md:relative md:inset-auto md:left-auto md:transform-none w-64 h-screen bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col shadow-lg overflow-y-auto transition-transform` }>
      <div className="border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
        <div className="mx-1 px-6 py-4 flex items-center gap-3">
          {!logoError && (
            <img
              src="/Clinova-logo.JPG"
              alt="Clinova icon"
              className="h-8 w-8 md:h-9 md:w-9 rounded-sm bg-white p-1"
              onError={() => setLogoError(true)}
            />
          )}
          <h2 className="text-lg md:text-xl font-bold text-gray-900 dark:text-white">Clinova</h2>
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
              className={`flex items-center gap-3 px-4 md:px-6 py-2 md:py-3 text-gray-700 dark:text-gray-300 transition-all duration-200 border-l-3 border-transparent mx-1 ${
                isActive
                  ? 'bg-brand-100/40 dark:bg-brand-700/40 text-brand-700 dark:text-brand-100 border-l-brand-600 font-semibold'
                  : 'hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-brand-600 dark:hover:text-brand-100 hover:border-l-brand-500'
              }`}
              onClick={() => {
                if (onClose && isOpen) onClose();
              }}
            >
              <item.icon className="w-5 h-5 md:w-6 md:h-6" />
              <span className="text-sm md:text-base">{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
    </>
  );
};

export default Sidebar;
