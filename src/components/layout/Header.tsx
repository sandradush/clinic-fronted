import React, { useState } from 'react';
import { Bell, X, UserPlus, AlertCircle, CheckCircle } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useDoctorRequests, useDoctors } from '../../hooks/useApiData';
import { useNavigate } from 'react-router-dom';

const Header: React.FC = () => {
  const { user } = useAuth();
  const { doctorRequests = [] } = useDoctorRequests();
  const { doctors = [] } = useDoctors();
  const [showNotifications, setShowNotifications] = useState(false);
  const navigate = useNavigate();

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
    <header className="fixed top-0 left-64 right-0 h-16 bg-white border-b border-gray-200 flex items-center justify-between px-8 shadow-sm z-40">
      <div className="flex items-center">
        <span className="text-gray-600">Welcome, {user?.name || user?.email}</span>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative">
          <button 
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative flex items-center justify-center w-11 h-11 bg-gray-100 hover:bg-gray-200 text-gray-600 hover:text-gray-800 rounded-md transition-all duration-200 hover:-translate-y-0.5"
          >
            <Bell size={20} />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

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