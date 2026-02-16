// App.tsx - Simplified version
import React, { Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { I18nextProvider } from 'react-i18next';
import { Toaster } from 'react-hot-toast';

// Layout
import MainLayout from './components/layout/MainLayout';
import OfflineIndicator from './components/common/OfflineIndicator';

// Pages
import Dashboard from './pages/Dashboard';
import AdminDashboard from './pages/AdminDashboard';
import Appointments from './pages/Appointments';
import NewAppointment from './pages/NewAppointment';
import Consultation from './pages/Consultation';
import Perception from './pages/Perception';
import Doctors from './pages/Doctors';
import Patients from './pages/Patients';
import Schedules from './pages/Schedules';
import AuditLogs from './pages/AuditLogs';
import Notifications from './pages/Notifications';
import Settings from './pages/Settings';
import Login from './pages/Login';
import Register from './pages/Register';
import ProfileSetup from './pages/ProfileSetup';
import DoctorRequestsPage from './pages/DoctorRequests';
import DoctorHistory from './pages/DoctorHistory';
import CreateDoctorProfile from './pages/CreateDoctorProfile';
import WaitingPatients from './pages/WaitingPatients';
import DoctorAppointmentRequests from './pages/DoctorAppointmentRequests';

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
        <Route path="/perception" element={<Perception />} />
        <Route path="/doctors" element={<Doctors />} />
        <Route path="/patients" element={<Patients />} />
        <Route path="/waiting-patients" element={<WaitingPatients />} />
        <Route path="/schedules" element={<Schedules />} />
        <Route path="/audit-logs" element={<AuditLogs />} />
        <Route path="/notifications" element={<Notifications />} />
        <Route path="/doctors/create" element={<CreateDoctorProfile />} />
        <Route path="/doctor/requests" element={<DoctorRequestsPage />} />
        <Route path="/doctor/appointment-requests" element={<DoctorAppointmentRequests />} />
        <Route path="/doctor/history" element={<DoctorHistory />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Route>
    </Routes>
  );
};

// Main App Component
const App: React.FC = () => {
  // Initialize theme on app load
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