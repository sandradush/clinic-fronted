import React, { useState, useMemo } from 'react';
import { Search, CheckCircle, XCircle, Clock, Mail, Phone, User, GraduationCap, Edit } from 'lucide-react';
import { api } from '../services/api';
import { useDoctorRequests } from '../hooks/useApiData';

const DoctorRequests: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'approved' | 'rejected'>('pending');
  const [processing, setProcessing] = useState<string | null>(null);
  const [editingDoctor, setEditingDoctor] = useState<any>(null);
  const [editForm, setEditForm] = useState({
    name: '',
    email: '',
    phone: '',
    specialty: '',
    experience: 0,
    qualifications: '',
    licenseNumber: ''
  });
  
  const { doctorRequests, loading, refetch } = useDoctorRequests();

  const handleApprove = async (requestId: string) => {
    setProcessing(requestId);
    try {
      await api.approveDoctorRequest(requestId);
      refetch();
    } catch (error) {
      console.error('Approval failed:', error);
    } finally {
      setProcessing(null);
    }
  };

  const handleReject = async (requestId: string) => {
    setProcessing(requestId);
    try {
      await api.rejectDoctorRequest(requestId);
      refetch();
    } catch (error) {
      console.error('Rejection failed:', error);
    } finally {
      setProcessing(null);
    }
  };

  const handleEdit = (doctor: any) => {
    setEditingDoctor(doctor);
    setEditForm({
      name: doctor.name,
      email: doctor.email,
      phone: doctor.phone,
      specialty: doctor.specialty,
      experience: doctor.experience,
      qualifications: doctor.qualifications,
      licenseNumber: doctor.licenseNumber
    });
  };

  const handleUpdate = async () => {
    try {
      await api.updateDoctorRequest(editingDoctor.id, editForm);
      setEditingDoctor(null);
      refetch();
    } catch (error) {
      console.error('Update failed:', error);
    }
  };

  const filteredRequests = useMemo(() => {
    return doctorRequests.filter(request => {
      const matchesSearch = [request.name, request.email, request.specialty, request.licenseNumber]
        .join(' ').toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = filterStatus === 'all' || request.status === filterStatus;
      return matchesSearch && matchesStatus;
    });
  }, [doctorRequests, searchTerm, filterStatus]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'approved': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
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
              <h1 className="text-2xl font-semibold">Doctor Requests</h1>
              <p className="text-sm text-gray-600">Review and manage doctor applications</p>
            </div>
          </div>

          <div className="bg-white rounded-lg p-4 shadow-sm mb-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="flex items-center gap-3 flex-1">
                <div className="relative w-full max-w-md">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                  <input
                    className="pl-10 pr-3 py-2 w-full border rounded focus:outline-none focus:ring-2 focus:ring-blue-200"
                    placeholder="Search by name, email, specialty..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>

                <select
                  className="ml-2 px-3 py-2 border rounded bg-white text-sm"
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value as any)}
                >
                  <option value="all">All Status</option>
                  <option value="pending">Pending</option>
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>

              <div className="text-sm text-gray-600">{filteredRequests.length} requests found</div>
            </div>
          </div>

          <div className="space-y-4">
            {filteredRequests.map((request) => (
              <div key={request.id} className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4 flex-1">
                    <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 font-semibold">
                      {request.name.split(' ').map(n => n[0]).slice(0, 2).join('')}
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-medium">{request.name}</h3>
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(request.status)}`}>
                          {request.status}
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm text-gray-600">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <Mail size={16} />
                            <span>{request.email}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Phone size={16} />
                            <span>{request.phone}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <User size={16} />
                            <span>{request.specialty}</span>
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <GraduationCap size={16} />
                            <span>{request.experience} years experience</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Clock size={16} />
                            <span>Applied: {new Date(request.requestDate).toLocaleDateString()}</span>
                          </div>
                          <div>
                            <span className="font-medium">License:</span> {request.licenseNumber}
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <div>
                            <span className="font-medium">Qualifications:</span>
                            <p className="text-sm text-gray-700 mt-1">{request.qualifications}</p>
                          </div>
                          {request.documents && (
                            <div>
                              <span className="text-sm font-medium text-gray-700">Documents:</span>
                              <div className="flex gap-2 mt-1 flex-wrap">
                                {request.documents.map((doc, index) => (
                                  <span key={index} className="text-xs bg-gray-100 px-2 py-1 rounded">
                                    {doc}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 ml-4">
                    <button
                      onClick={() => handleEdit(request)}
                      className="flex items-center gap-1 px-3 py-2 text-blue-600 border border-blue-200 rounded hover:bg-blue-50"
                    >
                      <Edit size={16} />
                      Edit
                    </button>
                    {request.status === 'pending' && (
                      <>
                        <button
                          onClick={() => handleReject(request.id)}
                          disabled={processing === request.id}
                          className="flex items-center gap-1 px-3 py-2 text-red-600 border border-red-200 rounded hover:bg-red-50 disabled:opacity-50"
                        >
                          <XCircle size={16} />
                          Reject
                        </button>
                        <button
                          onClick={() => handleApprove(request.id)}
                          disabled={processing === request.id}
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
            
            {filteredRequests.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                No doctor requests found matching your criteria.
              </div>
            )}
          </div>
        </>
      )}

      {/* Edit Modal */}
      {editingDoctor && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-semibold mb-4">Edit Doctor Request</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Name</label>
                <input
                  type="text"
                  value={editForm.name}
                  onChange={(e) => setEditForm({...editForm, name: e.target.value})}
                  className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Email</label>
                <input
                  type="email"
                  value={editForm.email}
                  onChange={(e) => setEditForm({...editForm, email: e.target.value})}
                  className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Phone</label>
                <input
                  type="tel"
                  value={editForm.phone}
                  onChange={(e) => setEditForm({...editForm, phone: e.target.value})}
                  className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Specialty</label>
                <input
                  type="text"
                  value={editForm.specialty}
                  onChange={(e) => setEditForm({...editForm, specialty: e.target.value})}
                  className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Experience (years)</label>
                <input
                  type="number"
                  value={editForm.experience}
                  onChange={(e) => setEditForm({...editForm, experience: parseInt(e.target.value)})}
                  className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">License Number</label>
                <input
                  type="text"
                  value={editForm.licenseNumber}
                  onChange={(e) => setEditForm({...editForm, licenseNumber: e.target.value})}
                  className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            
            <div className="mt-4">
              <label className="block text-sm font-medium mb-1">Qualifications</label>
              <textarea
                value={editForm.qualifications}
                onChange={(e) => setEditForm({...editForm, qualifications: e.target.value})}
                rows={3}
                className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setEditingDoctor(null)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdate}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Update
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DoctorRequests;