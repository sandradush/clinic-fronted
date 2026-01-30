import React from 'react';
import { Outlet } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

// Components
import Sidebar from './Sidebar';
import Header from './Header';

const MainLayout: React.FC = () => {
  const { t } = useTranslation();

  return (
    <div className="main-layout">
      {/* Sidebar Navigation */}
      <Sidebar />
      
      {/* Main Content Area */}
      <div className="main-content">
        {/* Header */}
        <Header />
        
        {/* Page Content */}
        <main className="content-area">
          <Outlet />
        </main>
        
        {/* Footer */}
        <footer className="footer">
          <p>© {new Date().getFullYear()} Clinic Management System • {t('footer.rights')}</p>
          <p className="version">v1.0.0 • {t('footer.offlineReady')}</p>
        </footer>
      </div>
    </div>
  );
};

export default MainLayout;