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
    <header className="fixed top-0 left-64 right-0 h-16 bg-white border-b border-gray-200 flex items-center justify-center px-8 shadow-sm z-40">
      <div className="absolute left-1/2 transform -translate-x-1/2">
        <h1 className="text-xl font-semibold text-gray-800">{user?.name || user?.email || 'User'}</h1>
      </div>

      <div className="flex items-center gap-4 ml-auto">
        <div className="relative">
          <button
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className="flex items-center gap-3 hover:bg-gray-50 rounded-lg px-3 py-2 transition-colors"
          >
            <div className="w-9 h-9 rounded-full bg-blue-600 flex items-center justify-center text-white font-semibold text-sm">
              {userInitials}
            </div>
            <div className="text-left">
              <div className="text-sm font-medium text-gray-900">{user?.name || 'User'}</div>
              <div className="text-xs text-gray-500">{user?.email}</div>
            </div>
            <ChevronDown size={16} className="text-gray-400" />
          </button>

          {showProfileMenu && (
            <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200">
              <button
                onClick={() => {
                  setShowNotifications(!showNotifications);
                }}
                className="w-full flex items-center justify-between px-4 py-3 hover:bg-gray-50 text-left border-b"
              >
                <div className="flex items-center gap-3">
                  <Bell size={18} className="text-gray-600" />
                  <span className="text-sm text-gray-700">Notifications</span>
                </div>
                {unreadCount > 0 && (
                  <span className="w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </button>
              <button
                onClick={() => {
                  navigate('/settings');
                  setShowProfileMenu(false);
                }}
                className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 text-left border-b"
              >
                <Settings size={18} className="text-gray-600" />
                <span className="text-sm text-gray-700">Settings</span>
              </button>
              <button
                onClick={handleSignOut}
                className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 text-left text-red-600"
              >
                <LogOut size={18} />
                <span className="text-sm">Sign Out</span>
              </button>
            </div>
          )}

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-96 bg-white rounded-lg shadow-lg border border-gray-200 max-h-[500px] overflow-hidden">
              <div className="flex items-center justify-between p-4 border-b">
                <h3 className="font-semibold text-gray-900">Notifications</h3>
                <button 
                  onClick={() => setShowNotifications(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X size={18} />
                </button>
              </div>
              <div className="overflow-y-auto max-h-[400px]">
                {notifications.length === 0 ? (
                  <div className="p-8 text-center text-gray-500">
                    <CheckCircle size={48} className="mx-auto mb-2 text-gray-300" />
                    <p>No new notifications</p>
                  </div>
                ) : (
                  notifications.map(notif => (
                    <button
                      key={notif.id}
                      onClick={() => {
                        notif.action();
                        setShowNotifications(false);
                        setShowProfileMenu(false);
                      }}
                      className="w-full p-4 hover:bg-gray-50 border-b last:border-b-0 text-left transition-colors"
                    >
                      <div className="flex items-start gap-3">
                        <div className="mt-1">{notif.icon}</div>
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900 text-sm">{notif.title}</h4>
                          <p className="text-sm text-gray-600 mt-1">{notif.message}</p>
                          <p className="text-xs text-gray-400 mt-1">
                            {new Date(notif.time).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </button>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;