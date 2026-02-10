import React, { useState, useMemo, useEffect } from 'react';
import { Search, CheckCircle, XCircle, Clock, Mail, Phone, User, GraduationCap, Edit, Calendar } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';
import { makeApiRequest } from '../utils/api';

const DoctorRequests: React.FC = () => {
  const { user } = useAuth();
  const [doctorRequests, setDoctorRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'approved' | 'rejected'>('pending');
  const [processing, setProcessing] = useState<string | null>(null);
  const [editingDoctor, setEditingDoctor] = useState<any>(null);
  
  // Fetch doctor requests directly
  useEffect(() => {
    const fetchDoctorRequests = async () => {
      if (!user?.id) {
        setLoading(false);
        return;
      }
      
      try {
        setLoading(true);
        const endpoint = `/appointments/doctor/${user.id}`;
        const data = await makeApiRequest(endpoint);
        setDoctorRequests(data || []);
      } catch (error) {
        console.error('Failed to fetch doctor appointments:', error);
        toast.error('Failed to load doctor appointments');
        setDoctorRequests([]);
      } finally {
        setLoading(false);
      }
    };

    fetchDoctorRequests();
  }, [user?.id]);

  const refetch = async () => {
    if (!user?.id) return;
    
    try {
      const endpoint = `/appointments/doctor/${user.id}`;
      const data = await makeApiRequest(endpoint);
      setDoctorRequests(data || []);
    } catch (error) {
      console.error('Failed to refetch doctor appointments:', error);
      toast.error('Failed to reload doctor appointments');
    }
  };

  const handleApprove = async (requestId: string) => {
    setProcessing(requestId);
    try {
      await makeApiRequest(`/appointments/${requestId}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status: 'approved' })
      });
      toast.success('Appointment approved successfully!');
      refetch();
    } catch (error) {
      console.error('Approval failed:', error);
      toast.error('Failed to approve appointment. Please try again.');
    } finally {
      setProcessing(null);
    }
  };

  const handleReject = async (requestId: string) => {
    setProcessing(requestId);
    try {
      await makeApiRequest(`/appointments/${requestId}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status: 'rejected' })
      });
      toast.success('Appointment rejected.');
      refetch();
    } catch (error) {
      console.error('Rejection failed:', error);
      toast.error('Failed to reject appointment. Please try again.');
    } finally {
      setProcessing(null);
    }
  };

  const handleEdit = (appointment: any) => {
    setEditingDoctor(appointment);
  };

  const filteredAppointments = useMemo(() => {
    return doctorRequests.filter(appointment => {
      const searchableText = [
        appointment?.patient_name || '',
        appointment?.doctor_name || '', 
        appointment?.description || '', 
        appointment?.time || '',
        appointment?.date || ''
      ].join(' ').toLowerCase();
      
      return searchableText.includes(searchTerm.toLowerCase());
    });
  }, [doctorRequests, searchTerm, filterStatus]);

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'approved': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'confirmed': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="p-4">
      {loading ? (
        <div className="flex items-center justify-center py-8">
          <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-500 rounded-full animate-spin"></div>
        </div>
      ) : (
        <>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-semibold">My Appointments</h1>
              <p className="text-sm text-gray-600">View and manage your scheduled appointments</p>
            </div>
          </div>

          <div className="bg-white rounded-lg p-4 shadow-sm mb-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="flex items-center gap-3 flex-1">
                <div className="relative w-full max-w-md">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                  <input
                    className="pl-10 pr-3 py-2 w-full border rounded focus:outline-none focus:ring-2 focus:ring-blue-200"
                    placeholder="Search by patient name, description, time..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>

              <div className="text-sm text-gray-600">{filteredAppointments.length} appointments found</div>
            </div>
          </div>

          <div className="space-y-4">
            {filteredAppointments.map((appointment) => (
              <div key={appointment.id} className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4 flex-1">
                    <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 font-semibold">
                      {(appointment.patient_name || 'U').split(' ').map(n => n[0]).slice(0, 2).join('')}
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-medium">
                          {appointment.patient_name || 'Unknown Patient'}
                        </h3>
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(appointment.status || 'pending')}`}>
                          {appointment.status || 'Pending'}
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm text-gray-600">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <Calendar size={16} />
                            <span>Date: {appointment.date ? new Date(appointment.date).toLocaleDateString() : 'No date'}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Clock size={16} />
                            <span>Time: {appointment.time || 'No time'}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <User size={16} />
                            <span>Doctor: {appointment.doctor_name || 'Unknown Doctor'}</span>
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <div>
                            <span className="font-medium">Description:</span>
                            <p className="text-sm text-gray-700 mt-1">
                              {appointment.description || 'No description provided'}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <Clock size={16} />
                            <span>Created: {appointment.created_at ? new Date(appointment.created_at).toLocaleDateString() : 'Unknown'}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 ml-4">
                    <button
                      onClick={() => handleEdit(appointment)}
                      className="flex items-center gap-1 px-3 py-2 text-blue-600 border border-blue-200 rounded hover:bg-blue-50"
                    >
                      <Edit size={16} />
                      View
                    </button>
                    {(appointment.status === 'pending' || !appointment.status) && (
                      <>
                        <button
                          onClick={() => handleReject(appointment.id)}
                          disabled={processing === appointment.id}
                          className="flex items-center gap-1 px-3 py-2 text-red-600 border border-red-200 rounded hover:bg-red-50 disabled:opacity-50"
                        >
                          <XCircle size={16} />
                          Reject
                        </button>
                        <button
                          onClick={() => handleApprove(appointment.id)}
                          disabled={processing === appointment.id}
                          className="flex items-center gap-1 px-3 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
                        >
                          <CheckCircle size={16} />
                          Approve
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}
            
            {filteredAppointments.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                No appointments found matching your criteria.
              </div>
            )}
          </div>
        </>
      )}

      {/* Appointment Detail Modal */}
      {editingDoctor && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-semibold mb-4">Appointment Details</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Patient Name</label>
                <div className="w-full px-3 py-2 bg-gray-50 border rounded">
                  {editingDoctor.patient_name || 'Unknown Patient'}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Doctor Name</label>
                <div className="w-full px-3 py-2 bg-gray-50 border rounded">
                  {editingDoctor.doctor_name || 'Unknown Doctor'}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Date</label>
                <div className="w-full px-3 py-2 bg-gray-50 border rounded">
                  {editingDoctor.date ? new Date(editingDoctor.date).toLocaleDateString() : 'No date'}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Time</label>
                <div className="w-full px-3 py-2 bg-gray-50 border rounded">
                  {editingDoctor.time || 'No time'}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Status</label>
                <div className="w-full px-3 py-2 bg-gray-50 border rounded">
                  <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(editingDoctor.status || 'pending')}`}>
                    {editingDoctor.status || 'Pending'}
                  </span>
                </div>
              </div>
            </div>
            
            <div className="mt-4">
              <label className="block text-sm font-medium mb-1">Description</label>
              <div className="w-full px-3 py-2 bg-gray-50 border rounded min-h-[80px]">
                {editingDoctor.description || 'No description provided'}
              </div>
            </div>
            
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setEditingDoctor(null)}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded hover:bg-gray-50"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DoctorRequests;