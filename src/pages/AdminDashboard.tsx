import React, { useEffect, useState } from 'react';
import { Users, Calendar, UserCheck, Activity, Clock } from 'lucide-react';
import AdminCharts from '../components/dashboard/AdminCharts';
import StatCard from '../components/common/StatCard';

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

interface ApiAppointment {
  id: string;
  patient_name?: string;
  doctor_name?: string;
  patient_name_id?: string;
  doctor_name_id?: string;
  appointment_date?: string;
  appointment_time?: string;
  status?: string;
  type?: string;
  date?: string;
  time?: string;
  patientId?: string;
  doctorId?: string;
}

interface ApiDoctor {
  id: string;
  name?: string;
  full_name?: string;
  specialty?: string;
  specialization?: string;
  email?: string;
  phone?: string;
  experience?: number;
  years_of_experience?: number;
  availability?: string;
  status?: string;
}

// Transformed interfaces for the charts
interface Appointment {
  id: string;
  patientId: string;
  doctorId: string;
  date: string;
  time: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  type: string;
}

interface Doctor {
  id: string;
  name: string;
  specialty: string;
  email: string;
  phone: string;
  experience: number;
  availability: 'available' | 'busy' | 'offline';
  status?: string;
}

const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats>({
    totalDoctors: 0,
    totalPatients: 0,
    pendingAppointments: 0,
    approvedAppointments: 0
  });
  const [waitingPatients, setWaitingPatients] = useState<WaitingPatient[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);

  // Transform API appointment data to match Appointment interface
  const transformAppointment = (apiAppointment: ApiAppointment): Appointment | null => {
    try {
      // Handle different possible field names from API
      const status = apiAppointment.status?.toLowerCase() || 'pending';
      
      // Validate status
      const validStatus: Appointment['status'] = 
        status === 'confirmed' || status === 'completed' || status === 'cancelled' 
          ? status 
          : 'pending';

      return {
        id: apiAppointment.id || String(Math.random()),
        patientId: apiAppointment.patientId || apiAppointment.patient_name_id || '',
        doctorId: apiAppointment.doctorId || apiAppointment.doctor_name_id || '',
        date: apiAppointment.date || apiAppointment.appointment_date || new Date().toISOString().split('T')[0],
        time: apiAppointment.time || apiAppointment.appointment_time || '00:00',
        status: validStatus,
        type: apiAppointment.type || 'General Checkup',
      };
    } catch (error) {
      console.error('Error transforming appointment:', error);
      return null;
    }
  };

  // Transform API doctor data to match Doctor interface
  const transformDoctor = (apiDoctor: ApiDoctor): Doctor | null => {
    try {
      // Handle different possible field names from API
      const availability = apiDoctor.availability?.toLowerCase() || 'available';
      
      // Validate availability
      const validAvailability: Doctor['availability'] = 
        availability === 'busy' || availability === 'offline' 
          ? availability 
          : 'available';

      return {
        id: apiDoctor.id || String(Math.random()),
        name: apiDoctor.name || apiDoctor.full_name || 'Unknown Doctor',
        specialty: apiDoctor.specialty || apiDoctor.specialization || 'General',
        email: apiDoctor.email || '',
        phone: apiDoctor.phone || '',
        experience: apiDoctor.experience || apiDoctor.years_of_experience || 0,
        availability: validAvailability,
        status: apiDoctor.status || 'active',
      };
    } catch (error) {
      console.error('Error transforming doctor:', error);
      return null;
    }
  };

  useEffect(() => {
    const fetchDashboardStats = async () => {
      try {
        const response = await fetch('https://clinic-backend-s2lx.onrender.com/api/auth/dashboard');
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        
        // Handle different possible response structures
        setStats({
          totalDoctors: data.totalDoctors || data.doctors_count || 0,
          totalPatients: data.totalPatients || data.patients_count || 0,
          pendingAppointments: data.pendingAppointments || data.pending_count || 0,
          approvedAppointments: data.approvedAppointments || data.approved_count || 0
        });
      } catch (error) {
        console.error('Failed to fetch dashboard stats:', error);
        // Set default values on error
        setStats({
          totalDoctors: 0,
          totalPatients: 0,
          pendingAppointments: 0,
          approvedAppointments: 0
        });
      }
    };

    const fetchWaitingPatients = async () => {
      try {
        const response = await fetch('https://clinic-backend-s2lx.onrender.com/api/appointments');
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        
        // Handle both array and object responses
        const appointmentsData = Array.isArray(data) ? data : data.appointments || [];
        
        setWaitingPatients(appointmentsData);
        
        // Transform and set appointments for charts
        const transformedAppointments = appointmentsData
          .map(transformAppointment)
          .filter((apt: Appointment | null): apt is Appointment => apt !== null);
        
        setAppointments(transformedAppointments);
      } catch (error) {
        console.error('Failed to fetch waiting patients:', error);
        setWaitingPatients([]);
        setAppointments([]);
      }
    };

    const fetchDoctors = async () => {
      try {
        const response = await fetch('https://clinic-backend-s2lx.onrender.com/api/auth/doctors');
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        
        // Handle both array and object responses
        const doctorsData = Array.isArray(data) ? data : data.doctors || [];
        
        // Transform doctors for charts
        const transformedDoctors = doctorsData
          .map(transformDoctor)
          .filter((doc: Doctor | null): doc is Doctor => doc !== null);
        
        setDoctors(transformedDoctors);
      } catch (error) {
        console.error('Failed to fetch doctors:', error);
        setDoctors([]);
      } finally {
        setLoading(false);
      }
    };

    // Execute all fetch functions
    Promise.all([
      fetchDashboardStats(),
      fetchWaitingPatients(),
      fetchDoctors()
    ]).catch(error => {
      console.error('Error fetching dashboard data:', error);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-6">Analytics Overview</h1>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
        <StatCard title="Total Doctors" value={stats.totalDoctors} icon={<Users size={22} />} color="blue" />
        <StatCard title="Total Patients" value={stats.totalPatients} icon={<Activity size={22} />} color="purple" />
        <StatCard title="Pending Appointments" value={stats.pendingAppointments} icon={<Calendar size={22} />} color="yellow" />
        <StatCard title="Approved Appointments" value={stats.approvedAppointments} icon={<UserCheck size={22} />} color="green" />
        <StatCard title="Waiting Patients" value={waitingPatients.length} icon={<Clock size={22} />} color="orange" />
      </div>

      {/* Charts Section */}
      <div className="mt-8">
        <AdminCharts 
          appointments={appointments} 
          doctors={doctors} 
        />
      </div>
    </div>
  );
};

export default AdminDashboard;