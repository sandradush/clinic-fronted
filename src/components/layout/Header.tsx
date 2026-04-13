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
    <header className="fixed top-0 left-0 right-0 md:left-[var(--sidebar-width,14rem)] h-14 md:h-16 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 flex items-center justify-end px-4 md:px-8 shadow-sm z-40 transition-[left] duration-300">
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
          <div className="font-semibold text-lg text-white">Smarthealth</div>
        </div>

        <div className="flex items-center gap-2 ml-auto">
          {/* Notifications Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 relative transition-colors"
              title="Notifications"
            >
              <Bell size={20} className="text-gray-600 dark:text-gray-300" />
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-brand-600 text-[10px] font-medium text-white ring-2 ring-white dark:ring-gray-800">
                  {unreadCount}
                </span>
              )}
            </button>

            {showNotifications && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setShowNotifications(false)}></div>
                <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 z-20 overflow-hidden">
                  <div className="p-3 border-b border-gray-200 dark:border-gray-700 font-semibold text-sm text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-900/50">
                    Notifications
                  </div>
                  <div className="max-h-[28rem] overflow-y-auto">
                    {notifications.length > 0 ? (
                      notifications.map((notif) => (
                        <button
                          key={notif.id}
                          onClick={() => {
                            notif.action();
                            setShowNotifications(false);
                          }}
                          className="w-full text-left p-4 hover:bg-gray-50 dark:hover:bg-gray-700 flex gap-3 border-b border-gray-100 dark:border-gray-700 last:border-0 transition-colors"
                        >
                          <div className="mt-0.5 flex-shrink-0">{notif.icon}</div>
                          <div>
                            <div className="text-sm font-semibold text-gray-900 dark:text-white">{notif.title}</div>
                            <div className="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">{notif.message}</div>
                          </div>
                        </button>
                      ))
                    ) : (
                      <div className="p-8 text-center text-sm text-gray-500 dark:text-gray-400">No new notifications</div>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>

          <div className="relative">
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
          </button>

          {showProfileMenu && (
            <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
              {/* Profile menu without sign out */}
            </div>
          )}
        </div>
        </div>
      </div>
    </header>
  );
};

export default Header;