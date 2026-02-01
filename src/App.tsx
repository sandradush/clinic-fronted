import React, { Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { I18nextProvider } from 'react-i18next';
import { Toaster } from 'react-hot-toast';

// Layout
import MainLayout from './components/layout/MainLayout';
import OfflineIndicator from './components/common/OfflineIndicator';
import LanguageToggle from './components/common/LanguageToggle';

// Pages
import Dashboard from './pages/Dashboard';
import Appointments from './pages/Appointments';
import Prescriptions from './pages/Prescriptions';
import NewAppointment from './pages/NewAppointment';
import Consultation from './pages/Consultation';
import Doctors from './pages/Doctors';
import Settings from './pages/Settings';
import Login from './pages/Login';

// Context & Config
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { OfflineProvider } from './contexts/OfflineContext';
import i18n from './i18n/config';

// Styles
import './styles/global.css';

// Loading Component
const Loading = () => (
  <div className="loading-screen">
    <div className="loading-spinner"></div>
    <p>Loading...</p>
  </div>
);

// Protected Routes Component
const ProtectedRoutes = () => {
  const { isAuthenticated } = useAuth();
  
  if (!isAuthenticated) {
    return <Login />;
  }

  return (
    <Routes>
      <Route path="/" element={<MainLayout />}>
        <Route index element={<Dashboard />} />
        <Route path="appointments" element={<Appointments />} />
        <Route path="appointments/new" element={<NewAppointment />} />
        <Route path="consultation" element={<Consultation />} />
        <Route path="prescriptions" element={<Prescriptions />} />
        <Route path="doctors" element={<Doctors />} />
        <Route path="settings" element={<Settings />} />
      </Route>
    </Routes>
  );
};

const App: React.FC = () => {
  return (
    <I18nextProvider i18n={i18n}>
      <OfflineProvider>
        <AuthProvider>
          <Router>
            <div className="app-container">
              <OfflineIndicator />
              <LanguageToggle />
              <Toaster position="top-right" />
              
              <Suspense fallback={<Loading />}>
                <ProtectedRoutes />
              </Suspense>
            </div>
          </Router>
        </AuthProvider>
      </OfflineProvider>
    </I18nextProvider>
  );
};

export default App;