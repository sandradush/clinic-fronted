import React, { useEffect } from 'react';
// import DoctorSidebarChat from '../common/DoctorSidebarChat';
// import SidebarChatButton from '../common/SidebarChatButton';
import { Link, useLocation } from 'react-router-dom';
import { Home, Calendar, UserCheck, ClipboardList, History, Activity, Clock, FileText, LogOut, Menu, Bell, BarChart3, Send } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen = false, onClose }) => {
  const location = useLocation();
  const { user, logout } = useAuth();
  const isDoctor = user?.role === 'doctor';
  const [isCollapsed, setIsCollapsed] = React.useState(false);
  // const [showChat, setShowChat] = React.useState(false);

  useEffect(() => {
    // Sync sidebar width with a global CSS variable so the Header can adjust automatically
    document.documentElement.style.setProperty('--sidebar-width', isCollapsed ? '5rem' : '14rem');
  }, [isCollapsed]);

  const adminMenuItems = [
    { path: '/dashboard', icon: Home, label: 'Overview' },
    { path: '/appointments', icon: Calendar, label: 'Appointments' },
    { path: '/doctors', icon: UserCheck, label: 'Doctors' },
    { path: '/waiting-patients', icon: Clock, label: 'Waiting Patients' },
    { path: '/medical-records', icon: FileText, label: 'Medical Records' },
    { path: '/notifications', icon: Bell, label: 'Notifications' },
    { path: '/admin-reports', icon: BarChart3, label: 'Reports' },
    { path: '/payments', icon: ClipboardList, label: 'Payments' },

  ];

  const doctorMenuItems = [
    { path: '/dashboard', icon: Home, label: 'Overview' },
    { path: '/doctor/appointment-requests', icon: ClipboardList, label: 'Requests' },
    { path: '/prescription', icon: Activity, label: 'Prescription' },
    { path: '/doctor/history', icon: History, label: 'History' },
    { path: '/doctor/medical-records', icon: FileText, label: 'Medical Records' },
   // { path: '/doctor/notifications', icon: Bell, label: 'Notifications' },
    { path: '/doctor/sent-notifications', icon: Send, label: 'Sent Notifications' },
  ];

  const patientMenuItems = [
    { path: '/dashboard', icon: Home, label: 'Overview' },
    { path: '/patient-prescriptions', icon: FileText, label: 'My Prescriptions' },
  ];

  const receptionistMenuItems = [
    { path: '/receptionist-dashboard', icon: Home, label: 'Reception Dashboard' },
    { path: '/schedules', icon: Calendar, label: 'Schedule' },
    { path: '/waiting-patients', icon: Clock, label: 'Waiting Patients' },
  ];

  const handleSignOut = () => {
    logout();
  };

  const menuItems = user?.role === 'doctor' ? doctorMenuItems : user?.role === 'receptionist' ? receptionistMenuItems : user?.role === 'patient' ? patientMenuItems : adminMenuItems;

  return (
    <>
      {/* Mobile overlay/backdrop when sidebar is open */}
      <div className={`fixed inset-0 bg-black bg-opacity-40 z-30 md:hidden transition-opacity ${isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`} onClick={onClose}></div>

      <div className={`fixed inset-y-0 left-0 z-40 transform ${isOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 md:relative md:inset-auto md:left-auto md:transform-none ${isCollapsed ? 'md:w-20' : 'md:w-56'} h-screen bg-[#001e3c] border-r border-blue-900/50 flex flex-col shadow-lg transition-all duration-300` }>
      <div className={`border-b border-blue-900/50 bg-[#001e3c]`}>
        <div className={`h-14 md:h-16 ${isCollapsed ? 'px-0 justify-center' : 'px-6'} flex items-center gap-3 transition-all duration-300`}>
          <button 
            onClick={() => setIsCollapsed(!isCollapsed)}
            className={`p-2 rounded-lg transition-colors shrink-0 ${isDoctor ? 'text-white hover:bg-white/10' : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700'}`}
            title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
          >
            <Menu size={20} />
          </button>
          <div className={`flex items-center gap-3 overflow-hidden ${isCollapsed ? 'w-0 opacity-0' : 'w-auto opacity-100'} transition-all duration-300`}>
            <h2 className={`text-lg md:text-xl font-bold whitespace-nowrap ${isDoctor ? 'text-white' : 'text-gray-900 dark:text-white'}`}>Smarthealth</h2>
          </div>
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
              className={`flex items-center ${isCollapsed ? 'justify-center px-0' : 'gap-3 px-4 md:px-6'} py-2 md:py-3 transition-all duration-200 border-l-3 border-transparent mx-1
                ${isActive ? 'bg-white/10 text-white border-l-white font-semibold' : 'text-blue-100 hover:bg-white/5 hover:text-white hover:border-l-blue-400'}`}
              onClick={() => {
                if (onClose && isOpen) onClose();
              }}
              title={isCollapsed ? item.label : ''}
            >
              <item.icon className="w-5 h-5 md:w-6 md:h-6 shrink-0" />
              {!isCollapsed && <span className="text-sm md:text-base truncate transition-opacity duration-300">{item.label}</span>}
            </Link>
          );
        })}
        {/* Chat button removed */}
      </nav>
      

      
      {/* Sign Out Button */}
      <div className="px-0 py-4 border-t border-blue-900/50">
        <button
          onClick={handleSignOut}
          className={`flex items-center ${isCollapsed ? 'justify-center px-0' : 'gap-3 px-4 md:px-6'} py-2 md:py-3 transition-all duration-200 border-l-3 border-transparent mx-1 w-full text-left text-blue-100 hover:bg-white/5 hover:text-red-300 hover:border-l-red-400`}
          title={isCollapsed ? "Sign Out" : ""}
        >
          <LogOut className="w-5 h-5 md:w-6 md:h-6 shrink-0" />
          {!isCollapsed && <span className="text-sm md:text-base truncate transition-opacity duration-300">Sign Out</span>}
        </button>
      </div>

      {/* Chat area removed */}
    </div>
    </>
  );
};

export default Sidebar;
