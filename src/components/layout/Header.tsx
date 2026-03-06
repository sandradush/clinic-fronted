import React, { useState } from 'react';
import { Bell, X, UserPlus, AlertCircle, CheckCircle, LogOut, ChevronDown } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useDoctorRequests, useDoctors } from '../../hooks/useApiData';
import { useNavigate } from 'react-router-dom';

interface HeaderProps {
  onToggleSidebar?: () => void;
}

const Header: React.FC<HeaderProps> = ({ onToggleSidebar }) => {
  const { user, logout } = useAuth();
  const { doctorRequests = [] } = useDoctorRequests();
  const { doctors = [] } = useDoctors();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const navigate = useNavigate();

  const handleSignOut = () => {
    logout();
    navigate('/login');
  };

  const userInitials = (user?.name || user?.email || 'U').split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase();

  const pendingRequests = doctorRequests.filter(r => r.status === 'pending');
  const offlineDoctors = doctors.filter(d => d.availability === 'offline');
  const busyDoctors = doctors.filter(d => d.availability === 'busy');

  const notifications = [
    ...pendingRequests.map(req => ({
      id: `req-${req.id}`,
      type: 'request',
      title: 'New Doctor Request',
      message: `${req.name} applied for ${req.specialty}`,
      time: req.requestDate,
      icon: <UserPlus size={18} className="text-brand-700" />,
      action: () => navigate('/doctors/requests')
    })),
    ...offlineDoctors.map(doc => ({
      id: `offline-${doc.id}`,
      type: 'offline',
      title: 'Doctor Offline',
      message: `${doc.name} is currently offline`,
      time: new Date().toISOString(),
      icon: <AlertCircle size={18} className="text-red-600" />,
      action: () => navigate('/doctors/approved')
    })),
    ...busyDoctors.map(doc => ({
      id: `busy-${doc.id}`,
      type: 'busy',
      title: 'Doctor Busy',
      message: `${doc.name} is currently busy`,
      time: new Date().toISOString(),
      icon: <AlertCircle size={18} className="text-yellow-600" />,
      action: () => navigate('/doctors/approved')
    }))
  ];

  const unreadCount = notifications.length;

  return (
    <header className="fixed top-0 left-0 right-0 md:left-64 h-14 md:h-16 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 flex items-center justify-end px-4 md:px-8 shadow-sm z-40">
      <div className="flex items-center gap-4 w-full">
        {/* Mobile hamburger to toggle sidebar */}
        <div className="md:hidden mr-auto">
          <button onClick={onToggleSidebar} className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>

        {/* Center title for mobile */}
        <div className="absolute left-0 right-0 flex items-center justify-center md:hidden pointer-events-none">
          <div className="font-semibold text-lg text-gray-900 dark:text-white">Clinova</div>
        </div>

        <div className="relative ml-auto">
          <button
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className="flex items-center gap-3 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg px-2 py-1 md:px-3 md:py-2 transition-colors"
          >
            <div className="w-8 h-8 md:w-9 md:h-9 rounded-full bg-brand-700 flex items-center justify-center text-white font-semibold text-sm">
              {userInitials}
            </div>
            <div className="text-left hidden md:block">
              <div className="text-sm font-medium text-gray-900 dark:text-white">{user?.name || 'User'}</div>
              <div className="text-xs text-gray-500 dark:text-gray-400">{user?.email}</div>
            </div>
            <ChevronDown size={16} className="text-gray-400 dark:text-gray-500" />
          </button>

          {showProfileMenu && (
            <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
              {/* Settings removed from header menu */}
              <button
                onClick={handleSignOut}
                className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700 text-left text-red-600 dark:text-red-400"
              >
                <LogOut size={18} />
                <span className="text-sm">Sign Out</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;