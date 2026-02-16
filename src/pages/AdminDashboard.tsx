import React, { useEffect, useState } from 'react';
import { Users, Calendar, UserCheck, Activity, Clock, User } from 'lucide-react';

interface DashboardStats {
  totalDoctors: number;
  totalPatients: number;
  pendingAppointments: number;
  approvedAppointments: number;
}

interface WaitingPatient {
  id: number;
  patient_name: string;
  doctor_name: string;
  time: string;
  date: string;
  description: string;
}

const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats>({
    totalDoctors: 0,
    totalPatients: 0,
    pendingAppointments: 0,
    approvedAppointments: 0
  });
  const [waitingPatients, setWaitingPatients] = useState<WaitingPatient[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardStats = async () => {
      try {
        const response = await fetch('https://clinic-backend-s2lx.onrender.com/api/auth/dashboard');
        const data = await response.json();
        setStats(data);
      } catch (error) {
        console.error('Failed to fetch dashboard stats:', error);
      } finally {
        setLoading(false);
      }
    };

    const fetchWaitingPatients = async () => {
      try {
        const response = await fetch('https://clinic-backend-s2lx.onrender.com/api/appointments');
        const data = await response.json();
        setWaitingPatients(data || []);
      } catch (error) {
        console.error('Failed to fetch waiting patients:', error);
      }
    };

    fetchDashboardStats();
    fetchWaitingPatients();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="p-4">
      <h1 className="text-2xl font-semibold mb-6">Admin Dashboard</h1>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg shadow-sm">
          <div className="flex items-center gap-3">
            <Users className="text-blue-500" size={24} />
            <div>
            <h3 className="text-lg font-semibold">{stats.totalDoctors}</h3>
              <p className="text-gray-600">Total Doctors</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm">
          <div className="flex items-center gap-3">
            <Activity className="text-purple-500" size={24} />
            <div>
            <h3 className="text-lg font-semibold">{stats.totalPatients}</h3>
              <p className="text-gray-600">Total Patients</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm">
          <div className="flex items-center gap-3">
            <Calendar className="text-yellow-500" size={24} />
            <div>
            <h3 className="text-lg font-semibold">{stats.pendingAppointments}</h3>
              <p className="text-gray-600">Pending Appointments</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm">
          <div className="flex items-center gap-3">
            <UserCheck className="text-green-500" size={24} />
            <div>
            <h3 className="text-lg font-semibold">{stats.approvedAppointments}</h3>
              <p className="text-gray-600">Approved Appointments</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm cursor-pointer hover:shadow-md transition-shadow" onClick={() => window.location.href = '/waiting-patients'}>
          <div className="flex items-center gap-3">
            <Clock className="text-orange-500" size={24} />
            <div>
            <h3 className="text-lg font-semibold">{waitingPatients.length}</h3>
              <p className="text-gray-600">Waiting Patients</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;