import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import AdminDashboard from './AdminDashboard';
import DoctorDashboard from './DoctorDashboard';
import PatientDashboard from './PatientDashboard';

const Dashboard: React.FC = () => {
  const { user } = useAuth();

  if (user?.role === 'admin') {
    return <AdminDashboard />;
  }

  if (user?.role === 'doctor') {
    return <DoctorDashboard />;
  }

  if (user?.role === 'patient') {
    return <PatientDashboard />;
  }

  // Default fallback for patients
  return <PatientDashboard />;
};

export default Dashboard;