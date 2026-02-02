import React, { Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { I18nextProvider } from 'react-i18next';
import { Toaster } from 'react-hot-toast';

// Layout
import MainLayout from './components/layout/MainLayout';
import OfflineIndicator from './components/common/OfflineIndicator';

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



// Loading Component
const Loading = () => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="text-center">
      <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-500 rounded-full animate-spin mx-auto mb-4"></div>
      <p className="text-gray-600">Loading...</p>
    </div>
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
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<Dashboard />} />
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
            <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
              <OfflineIndicator />
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