import React, { useEffect, useState } from 'react';
import { CheckCircle, XCircle, Clock, Calendar, User, FileText, Video } from 'lucide-react';
import toast from 'react-hot-toast';
import { makeApiRequest } from '../utils/api';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import VideoCallButton from '../components/VideoCallButton';

interface AppointmentRequest {
  id: number;
  patient_name: string;
  patient_id: number;
  date: string;
  time: string;
  description: string;
  status: string;
  created_at: string;
}

const DoctorAppointmentRequests: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState<AppointmentRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState<number | null>(null);

  useEffect(() => {
    if (user?.id) {
      fetchAssignedAppointments();
    }
  }, [user]);

  const fetchAssignedAppointments = async () => {
    if (!user?.id) return;
    setLoading(true);
    try {
      // Fetch all appointments and filter by doctor
      const allAppointments = await makeApiRequest('/appointments');
      
      // Filter appointments assigned to this doctor
      const doctorAppointments = allAppointments.filter((apt: any) => 
        apt.doctor_id === user.id || apt.doctor_name_id === user.id
      );
      
      console.log('Doctor appointments:', doctorAppointments);
      setAppointments(doctorAppointments || []);
    } catch (error) {
      console.error('Failed to fetch appointments:', error);
      toast.error('Failed to load appointment requests');
      setAppointments([]);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (appointmentId: number) => {
    setProcessing(appointmentId);
    try {
      await makeApiRequest(`/appointments/${appointmentId}/approve`, {
        method: 'PATCH',
        headers: { 'accept': 'application/json' },
      });
      toast.success('Appointment approved! You can now start consultation.');
      fetchAssignedAppointments();
    } catch (error) {
      toast.error('Failed to approve appointment');
      console.error('Error approving appointment:', error);
    } finally {
      setProcessing(null);
    }
  };

  const handleReject = async (appointmentId: number) => {
    setProcessing(appointmentId);
    try {
      await makeApiRequest(`/appointments/${appointmentId}`, {
        method: 'PATCH',
        body: JSON.stringify({ status: 'rejected' })
      });
      toast.success('Appointment rejected');
      fetchAssignedAppointments();
    } catch (error) {
      toast.error('Failed to reject appointment');
      console.error('Error rejecting appointment:', error);
    } finally {
      setProcessing(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="w-8 h-8 border-4 border-brand-100 border-t-brand-700 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="p-4">
      <div className="mb-6">
        <h2 className="text-2xl font-semibold">My Appointment Requests</h2>
        <p className="text-gray-600 text-sm mt-1">Review and approve appointments assigned to you</p>
      </div>
      
      {appointments.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm p-8 text-center">
          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Calendar size={32} className="text-gray-400" />
          </div>
          <p className="text-gray-500">No pending appointment requests</p>
        </div>
      ) : (
        <div className="space-y-3">
          {appointments.map((appointment) => (
            <div key={appointment.id} className="bg-white border rounded-lg p-3 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className={`w-3 h-3 rounded-full shrink-0 ${
                    appointment.status === 'approved' ? 'bg-green-500' :
                    appointment.status === 'pending' ? 'bg-yellow-500' :
                    appointment.status === 'rejected' ? 'bg-red-500' :
                    appointment.status === 'completed' ? 'bg-blue-500' :
                    'bg-gray-500'
                  }`}></div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-medium text-gray-800 truncate">{appointment.patient_name}</h3>
                      <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                        appointment.status === 'approved' ? 'bg-green-100 text-green-700' :
                        appointment.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                        appointment.status === 'rejected' ? 'bg-red-100 text-red-700' :
                        appointment.status === 'completed' ? 'bg-blue-100 text-blue-700' :
                        'bg-gray-100 text-gray-700'
                      }`}>
                        {appointment.status}
                      </span>
                      {(appointment as any).payment_status && (
                        <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                          (appointment as any).payment_status === 'paid' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
                        }`}>
                          {(appointment as any).payment_status}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <span className="font-medium">{appointment.time}</span>
                      <span>{new Date(appointment.date).toLocaleDateString()}</span>
                      {appointment.description && (
                        <span className="truncate">{appointment.description}</span>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2 shrink-0">
                  {appointment.status === 'pending' ? (
                    <>
                      <button
                        onClick={() => handleReject(appointment.id)}
                        disabled={processing === appointment.id}
                        className="px-3 py-1.5 text-red-600 border border-red-200 rounded hover:bg-red-50 disabled:opacity-50 transition-colors text-sm"
                      >
                        Reject
                      </button>
                      <button
                        onClick={() => handleApprove(appointment.id)}
                        disabled={processing === appointment.id}
                        className="px-3 py-1.5 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50 transition-colors text-sm"
                      >
                        Approve
                      </button>
                    </>
                  ) : appointment.status === 'approved' ? (
                    <div className="flex items-center gap-2">
                      <VideoCallButton 
                        appointmentId={appointment.id}
                        status={appointment.status}
                        size="sm"
                      />
                      <button
                        onClick={() => navigate(`/consultation/${appointment.id}`)}
                        className="px-3 py-1.5 bg-blue-600 text-white rounded hover:bg-blue-700 transition-all text-sm"
                      >
                        Consult
                      </button>
                    </div>
                  ) : (
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      appointment.status === 'rejected' ? 'bg-red-100 text-red-700' :
                      appointment.status === 'completed' ? 'bg-blue-100 text-blue-700' :
                      'bg-gray-100 text-gray-700'
                    }`}>
                      {appointment.status}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default DoctorAppointmentRequests;
