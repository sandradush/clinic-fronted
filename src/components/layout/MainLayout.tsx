import React from 'react';
import { Outlet } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

// Components
import Sidebar from './Sidebar';
import Header from './Header';

const MainLayout: React.FC = () => {
  const { t } = useTranslation();

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar Navigation */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col transition-all duration-300 overflow-hidden">
        {/* Header */}
        <Header />
        
        {/* Page Content */}
        <main className="flex-1 p-2 max-w-6xl mx-auto w-full mt-16 overflow-auto">
          <Outlet />
        </main>
        
        {/* Footer */}
        <footer className="border-t border-gray-200 bg-white px-6 py-4 text-center text-sm text-gray-600">
          <p>© {new Date().getFullYear()} Clinic Management System • {t('footer.rights')}</p>
          <p className="text-xs mt-1">v1.0.0 • {t('footer.offlineReady')}</p>
        </footer>
      </div>
    </div>
  );
};

export default MainLayout;