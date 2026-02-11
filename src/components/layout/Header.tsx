import React, { useState } from 'react';
import { Bell, X, UserPlus, AlertCircle, CheckCircle, Settings, LogOut, ChevronDown } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useDoctorRequests, useDoctors } from '../../hooks/useApiData';
import { useNavigate } from 'react-router-dom';

const Header: React.FC = () => {
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
      icon: <UserPlus size={18} className="text-blue-600" />,
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
    <header className="fixed top-0 left-64 right-0 h-16 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 flex items-center justify-end px-8 shadow-sm z-40">
      <div className="flex items-center gap-4">
        <div className="relative">
          <button
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className="flex items-center gap-3 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg px-3 py-2 transition-colors"
          >
            <div className="w-9 h-9 rounded-full bg-blue-600 flex items-center justify-center text-white font-semibold text-sm">
              {userInitials}
            </div>
            <div className="text-left">
              <div className="text-sm font-medium text-gray-900 dark:text-white">{user?.name || 'User'}</div>
              <div className="text-xs text-gray-500 dark:text-gray-400">{user?.email}</div>
            </div>
            <ChevronDown size={16} className="text-gray-400 dark:text-gray-500" />
          </button>

          {showProfileMenu && (
            <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
              <button
                onClick={() => {
                  navigate('/settings');
                  setShowProfileMenu(false);
                }}
                className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700 text-left border-b dark:border-gray-700"
              >
                <Settings size={18} className="text-gray-600 dark:text-gray-400" />
                <span className="text-sm text-gray-700 dark:text-gray-300">Settings</span>
              </button>
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