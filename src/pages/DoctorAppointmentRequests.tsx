import React, { useEffect, useState } from 'react';
import { CheckCircle, XCircle, Clock, Calendar, User, FileText, Video } from 'lucide-react';
import toast from 'react-hot-toast';
import { makeApiRequest } from '../utils/api';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

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
      await makeApiRequest(`/appointments/${appointmentId}`, {
        method: 'PATCH',
        body: JSON.stringify({ status: 'approved' })
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
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-semibold">My Appointment Requests</h2>
          <p className="text-gray-600 text-sm mt-1">Review and approve appointments assigned to you</p>
        </div>
        <button
          onClick={fetchAssignedAppointments}
          className="px-4 py-2 bg-brand-600 text-white rounded-lg hover:bg-brand-700 transition-colors"
        >
          🔄 Refresh
        </button>
      </div>
      
      {appointments.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm p-8 text-center">
          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Calendar size={32} className="text-gray-400" />
          </div>
          <p className="text-gray-500">No pending appointment requests</p>
        </div>
      ) : (
        <div className="space-y-4">
          {appointments.map((appointment) => (
            <div key={appointment.id} className="bg-white border rounded-lg p-4 sm:p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-12 h-12 rounded-full bg-brand-100 flex items-center justify-center">
                      <User size={24} className="text-brand-700" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold">{appointment.patient_name}</h3>
                      <div className="flex items-center gap-2">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          appointment.status === 'approved' ? 'bg-green-100 text-green-800' :
                          appointment.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          appointment.status === 'rejected' ? 'bg-red-100 text-red-800' :
                          appointment.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {appointment.status === 'approved' ? '✅ Approved' :
                           appointment.status === 'pending' ? '⏳ Pending' :
                           appointment.status === 'rejected' ? '❌ Rejected' :
                           appointment.status === 'completed' ? '✓ Completed' :
                           appointment.status}
                        </span>
                        {/** payment status if present */}
                        {(
                          (appointment as any).payment_status || null
                        ) && (
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${((appointment as any).payment_status) === 'paid' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                            {(appointment as any).payment_status}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm mb-3">
                    <div className="flex items-center gap-2 text-gray-600">
                      <Clock size={16} className="text-brand-700" />
                      <span className="font-medium">{appointment.time}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600">
                      <Calendar size={16} className="text-green-500" />
                      <span>{new Date(appointment.date).toLocaleDateString()}</span>
                    </div>
                  </div>

                  {appointment.description && (
                    <div className="mb-3">
                      <div className="flex items-start gap-2 text-sm">
                        <FileText size={16} className="text-gray-500 mt-0.5" />
                        <div>
                          <p className="text-gray-600 font-medium">Description:</p>
                          <p className="text-gray-700 bg-gray-50 rounded-lg p-3 mt-1 border-l-4 border-brand-100">
                            {appointment.description}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  <div className="text-xs text-gray-500">
                    Requested: {new Date(appointment.created_at).toLocaleString()}
                  </div>
                </div>
                
                <div className="flex items-center gap-2 flex-wrap sm:ml-4 shrink-0">
                  {appointment.status === 'pending' ? (
                    <>
                      <button
                        onClick={() => handleReject(appointment.id)}
                        disabled={processing === appointment.id}
                        className="flex items-center gap-1.5 px-3 sm:px-4 py-2 text-red-600 border border-red-200 rounded-lg hover:bg-red-50 disabled:opacity-50 transition-colors text-sm"
                      >
                        <XCircle size={16} />
                        Reject
                      </button>
                      <button
                        onClick={() => handleApprove(appointment.id)}
                        disabled={processing === appointment.id}
                        className="flex items-center gap-1.5 px-3 sm:px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors text-sm"
                      >
                        <CheckCircle size={16} />
                        Approve
                      </button>
                    </>
                  ) : appointment.status === 'approved' ? (
                    <button
                      onClick={() => navigate(`/consultation/${appointment.id}`)}
                      className="flex items-center gap-2 px-4 sm:px-6 py-2 sm:py-3 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg hover:from-green-700 hover:to-green-800 transition-all shadow-md text-sm"
                    >
                      <Video size={18} />
                      🩺 Start Consultation
                    </button>
                  ) : (
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      appointment.status === 'rejected' ? 'bg-red-100 text-red-700' :
                      appointment.status === 'completed' ? 'bg-blue-100 text-blue-700' :
                      'bg-gray-100 text-gray-700'
                    }`}>
                      {appointment.status === 'rejected' ? '❌ Rejected' :
                       appointment.status === 'completed' ? '✅ Completed' :
                       appointment.status}
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
