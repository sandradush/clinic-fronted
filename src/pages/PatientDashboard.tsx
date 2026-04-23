import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FileText, 
  Calendar, 
  Clock, 
  User, 
  Download, 
  Eye,
  Bell,
  Activity,
  ChevronRight
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { makeApiRequest } from '../utils/api';
import toast from 'react-hot-toast';

interface Prescription {
  id: number;
  title: string;
  note: string;
  created_at: string;
  appointment_id: number;
  appointment?: {
    date: string;
    time: string;
    doctor_name: string;
    patient_name: string;
  };
}

interface Appointment {
  id: number;
  date: string;
  time: string;
  description: string;
  status: string;
  doctor_name: string;
}

const PatientDashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [recentPrescriptions, setRecentPrescriptions] = useState<Prescription[]>([]);
  const [upcomingAppointments, setUpcomingAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, [user]);

  const fetchDashboardData = async () => {
    if (!user?.id) return;
    
    try {
      setLoading(true);
      
      // Fetch recent prescriptions (consultation summaries)
      const prescriptionsData = await makeApiRequest(`/prescriptions/patient/${user.id}`);
      setRecentPrescriptions((prescriptionsData || []).slice(0, 3)); // Show only 3 most recent
      
      // Fetch upcoming appointments
      const appointmentsData = await makeApiRequest(`/appointments/patient/${user.id}`);
      const upcoming = (appointmentsData || [])
        .filter((apt: Appointment) => new Date(apt.date) >= new Date() && apt.status !== 'completed')
        .slice(0, 3);
      setUpcomingAppointments(upcoming);
      
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const downloadPrescription = (prescription: Prescription) => {
    const content = `
CONSULTATION SUMMARY
${prescription.title}

Date: ${new Date(prescription.created_at).toLocaleDateString()}
Doctor: ${prescription.appointment?.doctor_name || 'N/A'}
Patient: ${user?.name || 'N/A'}

${prescription.note}

Generated on ${new Date().toLocaleString()}
SmartHealth Clinic Management System
    `.trim();

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `consultation-summary-${prescription.id}-${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success('Consultation summary downloaded');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="px-4 py-6">
          <h1 className="text-2xl font-bold text-gray-900">Welcome back, {user?.name}!</h1>
          <p className="text-gray-600 mt-1">Here's your health summary and recent updates</p>
        </div>
      </div>

      <div className="p-4 max-w-7xl mx-auto">
        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <button
            onClick={() => navigate('/patient-prescriptions')}
            className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow text-left"
          >
            <div className="flex items-center justify-between">
              <div>
                <FileText className="text-blue-600 mb-2" size={24} />
                <h3 className="font-semibold text-gray-900">Consultation Summaries</h3>
                <p className="text-sm text-gray-600 mt-1">View your medical summaries</p>
              </div>
              <ChevronRight className="text-gray-400" size={20} />
            </div>
          </button>

          <button
            onClick={() => navigate('/appointments')}
            className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow text-left"
          >
            <div className="flex items-center justify-between">
              <div>
                <Calendar className="text-green-600 mb-2" size={24} />
                <h3 className="font-semibold text-gray-900">My Appointments</h3>
                <p className="text-sm text-gray-600 mt-1">Schedule & manage visits</p>
              </div>
              <ChevronRight className="text-gray-400" size={20} />
            </div>
          </button>

          <button
            onClick={() => navigate('/medical-records')}
            className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow text-left"
          >
            <div className="flex items-center justify-between">
              <div>
                <Activity className="text-purple-600 mb-2" size={24} />
                <h3 className="font-semibold text-gray-900">Medical Records</h3>
                <p className="text-sm text-gray-600 mt-1">Access your health history</p>
              </div>
              <ChevronRight className="text-gray-400" size={20} />
            </div>
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Consultation Summaries */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <FileText className="text-blue-600" size={20} />
                  Recent Consultation Summaries
                </h2>
                <button
                  onClick={() => navigate('/patient-prescriptions')}
                  className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                >
                  View All
                </button>
              </div>
            </div>
            
            <div className="p-4">
              {recentPrescriptions.length === 0 ? (
                <div className="text-center py-8">
                  <FileText size={32} className="mx-auto text-gray-300 mb-2" />
                  <p className="text-gray-500 text-sm">No consultation summaries yet</p>
                  <p className="text-gray-400 text-xs mt-1">Summaries will appear after your appointments</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {recentPrescriptions.map((prescription) => (
                    <div key={prescription.id} className="p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900 text-sm">{prescription.title}</h4>
                          <div className="flex items-center gap-3 text-xs text-gray-600 mt-1">
                            <span>{new Date(prescription.created_at).toLocaleDateString()}</span>
                            {prescription.appointment?.doctor_name && (
                              <span>Dr. {prescription.appointment.doctor_name}</span>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => navigate('/patient-prescriptions')}
                            className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                            title="View Details"
                          >
                            <Eye size={14} />
                          </button>
                          <button
                            onClick={() => downloadPrescription(prescription)}
                            className="p-1 text-gray-600 hover:bg-gray-100 rounded"
                            title="Download"
                          >
                            <Download size={14} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Upcoming Appointments */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <Calendar className="text-green-600" size={20} />
                  Upcoming Appointments
                </h2>
                <button
                  onClick={() => navigate('/appointments')}
                  className="text-green-600 hover:text-green-700 text-sm font-medium"
                >
                  View All
                </button>
              </div>
            </div>
            
            <div className="p-4">
              {upcomingAppointments.length === 0 ? (
                <div className="text-center py-8">
                  <Calendar size={32} className="mx-auto text-gray-300 mb-2" />
                  <p className="text-gray-500 text-sm">No upcoming appointments</p>
                  <button
                    onClick={() => navigate('/appointments')}
                    className="text-blue-600 hover:text-blue-700 text-xs mt-1"
                  >
                    Schedule an appointment
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {upcomingAppointments.map((appointment) => (
                    <div key={appointment.id} className="p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="flex items-center gap-2 text-sm font-medium text-gray-900">
                            <User size={14} />
                            Dr. {appointment.doctor_name}
                          </div>
                          <div className="flex items-center gap-3 text-xs text-gray-600 mt-1">
                            <div className="flex items-center gap-1">
                              <Calendar size={12} />
                              {new Date(appointment.date).toLocaleDateString()}
                            </div>
                            <div className="flex items-center gap-1">
                              <Clock size={12} />
                              {appointment.time}
                            </div>
                          </div>
                        </div>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          appointment.status === 'approved' ? 'bg-green-100 text-green-700' :
                          appointment.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                          'bg-gray-100 text-gray-700'
                        }`}>
                          {appointment.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Health Tips */}
        <div className="mt-6 bg-blue-50 rounded-lg p-6">
          <div className="flex items-start gap-3">
            <Bell className="text-blue-600 mt-1" size={20} />
            <div>
              <h3 className="font-semibold text-blue-900 mb-2">Health Reminder</h3>
              <p className="text-blue-800 text-sm">
                Remember to follow your doctor's recommendations and take prescribed medications as directed. 
                If you have any questions about your consultation summary, don't hesitate to contact your healthcare provider.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PatientDashboard;