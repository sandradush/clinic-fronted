import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';

// Components
import Sidebar from './Sidebar';
import Header from './Header';

const MainLayout: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      {/* Sidebar Navigation */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

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