import React, { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

// Components
import Sidebar from './Sidebar';
import Header from './Header';

const MainLayout: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user } = useAuth();
  const location = useLocation();

  // Determine if the sidebar should use the dark blue theme
  const isDarkSidebar = user?.role === 'admin' || location.pathname === '/admin-dashboard';

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      {/* Sidebar Navigation */}
      <Sidebar 
        isOpen={sidebarOpen} 
        onClose={() => setSidebarOpen(false)} 
        variant={isDarkSidebar ? 'dark' : 'light'}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col transition-all duration-300 overflow-hidden min-h-0">
        {/* Header */}
        <Header onToggleSidebar={() => setSidebarOpen(prev => !prev)} />
        
        {/* Page Content */}
        <main className="flex-1 p-2 sm:p-3 md:p-4 lg:p-6 w-full mt-14 md:mt-16 overflow-auto">
          <div className="max-w-full mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default MainLayout;