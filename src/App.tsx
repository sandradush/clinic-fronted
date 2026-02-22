import React, { Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { I18nextProvider } from 'react-i18next';
import { Toaster } from 'react-hot-toast';

import MainLayout from './components/layout/MainLayout';
import OfflineIndicator from './components/common/OfflineIndicator';

import Dashboard from './pages/Dashboard';
import AdminDashboard from './pages/AdminDashboard';
import Appointments from './pages/Appointments';
import NewAppointment from './pages/NewAppointment';
import Consultation from './pages/Consultation';
import Perception from './pages/prescription';
import Doctors from './pages/Doctors';
import Schedules from './pages/Schedules';
import SettingPage from './pages/setting';
import ReceptionistDashboard from './pages/ReceptionistDashboard';
import Login from './pages/Login';
import Register from './pages/Register';
import ProfileSetup from './pages/ProfileSetup';
import DoctorRequestsPage from './pages/DoctorRequests';
import DoctorHistory from './pages/DoctorHistory';
import CreateDoctorProfile from './pages/CreateDoctorProfile';
import WaitingPatients from './pages/WaitingPatients';
import DoctorAppointmentRequests from './pages/DoctorAppointmentRequests';

import { AuthProvider, useAuth } from './contexts/AuthContext';
import { OfflineProvider } from './contexts/OfflineContext';
import i18n from './i18n/config';

const Loading = () => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="text-center">
      <div className="w-12 h-12 border-4 border-brand-100 border-t-brand-700 rounded-full animate-spin mx-auto mb-4"></div>
      <p className="text-gray-600">Loading...</p>
    </div>
  </div>
);

const ProtectedRoutes = () => {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return (
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/profilesetup" element={<ProfileSetup />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    );
  }

  return (
    <Routes>
      <Route path="/profilesetup" element={<ProfileSetup />} />
      <Route path="/" element={<MainLayout />}>
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/admin-dashboard" element={<AdminDashboard />} />
        <Route path="/appointments" element={<Appointments />} />
        <Route path="/appointments/new" element={<NewAppointment />} />
        <Route path="/consultation/:appointmentId" element={<Consultation />} />
        <Route path="/prescription" element={<Perception />} />
        <Route path="/doctors" element={<Doctors />} />
        <Route path="/waiting-patients" element={<WaitingPatients />} />
        <Route path="/schedules" element={<Schedules />} />
        <Route path="/doctors/create" element={<CreateDoctorProfile />} />
        <Route path="/doctor/requests" element={<DoctorRequestsPage />} />
        <Route path="/doctor/appointment-requests" element={<DoctorAppointmentRequests />} />
        <Route path="/doctor/history" element={<DoctorHistory />} />
        <Route path="/settings" element={<SettingPage />} />
        <Route path="/receptionist-dashboard" element={<ReceptionistDashboard />} />
        <Route path="/setting" element={<SettingPage />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Route>
    </Routes>
  );
};

const App: React.FC = () => {
  React.useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, []);

  return (
    <I18nextProvider i18n={i18n}>
      <OfflineProvider>
        <AuthProvider>
          <Router>
            <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 transition-colors duration-200">
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
