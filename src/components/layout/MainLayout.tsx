import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';

// Components
import Sidebar from './Sidebar';
import Header from './Header';

const MainLayout: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar Navigation (hidden on small screens unless toggled) */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col transition-all duration-300 overflow-hidden min-h-0">
        {/* Header */}
        <Header onToggleSidebar={() => setSidebarOpen(prev => !prev)} />
        
        {/* Page Content */}
        <main className="flex-1 p-3 md:p-4 max-w-6xl mx-auto w-full mt-14 md:mt-16 overflow-auto pb-0">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default MainLayout;