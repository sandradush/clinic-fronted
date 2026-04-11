import React, { useEffect, useState } from 'react';
import { Mail, Phone, FileText, X, Grid3X3, List, Edit, Trash2, Save, Search, Filter, MoreVertical, User, Calendar, Award, Shield } from 'lucide-react';
import toast from 'react-hot-toast';
import { makeApiRequest } from '../utils/api';

interface ApprovedDoctor {
  doctor_id: number;
  user_id: number;
  name: string;
  email: string;
  phone: string;
  speciality: string;
  licence_file_path: string;
  national_id: string;
  status: string;
  created_at: string;
  updated_at: string;
}

const ApprovedDoctors: React.FC = () => {
  const [doctors, setDoctors] = useState<ApprovedDoctor[]>([]);
  const [filteredDoctors, setFilteredDoctors] = useState<ApprovedDoctor[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState<ApprovedDoctor | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [editingDoctor, setEditingDoctor] = useState<ApprovedDoctor | null>(null);
  const [processing, setProcessing] = useState<number | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterSpecialty, setFilterSpecialty] = useState('all');
  const [sortBy, setSortBy] = useState<'name' | 'specialty' | 'date'>('name');

  useEffect(() => {
    fetchApprovedDoctors();
  }, []);

  const fetchApprovedDoctors = async () => {
    try {
      setLoading(true);
      const data = await makeApiRequest('/auth/doctors/approved');
      setDoctors(data);
      setFilteredDoctors(data);
    } catch (error: any) {
      console.error('Failed to fetch approved doctors:', error);
      if (error.message && error.message.includes('ERR_HTTP2_PROTOCOL_ERROR')) {
        toast.error('Connection issue detected. Please refresh the page.');
      } else {
        toast.error('Failed to load approved doctors');
      }
    } finally {
      setLoading(false);
    }
  };

  // Filter and search functionality
  useEffect(() => {
    let filtered = doctors;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(doctor => 
        doctor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doctor.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doctor.speciality.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Specialty filter
    if (filterSpecialty !== 'all') {
      filtered = filtered.filter(doctor => doctor.speciality === filterSpecialty);
    }

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'specialty':
          return a.speciality.localeCompare(b.speciality);
        case 'date':
          return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
        default:
          return 0;
      }
    });

    setFilteredDoctors(filtered);
  }, [doctors, searchTerm, filterSpecialty, sortBy]);

  // Get unique specialties for filter
  const specialties = Array.from(new Set(doctors.map(doctor => doctor.speciality)));

  const handleEdit = async (doctor: ApprovedDoctor) => {
    // TODO: Implement when backend endpoint is ready
    toast.error('Edit functionality coming soon!');
    return;
    
    setEditingDoctor({ ...doctor });
  };

  const handleSaveEdit = async () => {
    if (!editingDoctor) return;
    
    setProcessing(editingDoctor.doctor_id);
    try {
      // TODO: Update when backend provides edit endpoint
      await makeApiRequest(`/auth/doctors/${editingDoctor.doctor_id}`, {
        method: 'PUT',
        body: JSON.stringify({
          name: editingDoctor.name,
          email: editingDoctor.email,
          phone: editingDoctor.phone,
          speciality: editingDoctor.speciality,
          national_id: editingDoctor.national_id
        })
      });
      
      toast.success('Doctor updated successfully!');
      setEditingDoctor(null);
      fetchApprovedDoctors();
    } catch (error: any) {
      console.error('Failed to update doctor:', error);
      if (error.message && error.message.includes('ERR_HTTP2_PROTOCOL_ERROR')) {
        toast.error('Connection issue. Please try again.');
      } else {
        toast.error('Failed to update doctor');
      }
    } finally {
      setProcessing(null);
    }
  };

  const handleDelete = async (doctorId: number) => {
    setProcessing(doctorId);
    try {
      // Use status update endpoint for soft delete
      await makeApiRequest(`/auth/doctors/${doctorId}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status: 'deleted' })
      });
      
      toast.success('Doctor removed successfully!');
      setShowDeleteConfirm(null);
      fetchApprovedDoctors();
    } catch (error: any) {
      console.error('Failed to delete doctor:', error);
      if (error.message && error.message.includes('ERR_HTTP2_PROTOCOL_ERROR')) {
        toast.error('Connection issue. Please try again.');
      } else {
        toast.error('Failed to remove doctor');
      }
    } finally {
      setProcessing(null);
    }
  };

  const DoctorCard = ({ doctor }: { doctor: ApprovedDoctor }) => (
    <div className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-all duration-200 group">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center text-white text-xl font-bold shadow-lg">
              {doctor.name.split(' ').map(n => n[0]).slice(0, 2).join('')}
            </div>
            <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
              <Shield size={12} className="text-white" />
            </div>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 group-hover:text-brand-700 transition-colors">
              {doctor.name}
            </h3>
            <div className="flex items-center gap-2 mt-1">
              <Award size={14} className="text-brand-600" />
              <span className="text-sm font-medium text-brand-600">{doctor.speciality}</span>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleEdit(doctor);
            }}
            className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
            title="Edit Doctor"
          >
            <Edit size={16} />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowDeleteConfirm(doctor.doctor_id);
            }}
            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            title="Delete Doctor"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>
      
      <div className="space-y-3">
        <div className="flex items-center gap-3 text-sm text-gray-600">
          <Mail size={16} className="text-gray-400" />
          <span className="truncate">{doctor.email}</span>
        </div>
        <div className="flex items-center gap-3 text-sm text-gray-600">
          <Phone size={16} className="text-gray-400" />
          <span>{doctor.phone}</span>
        </div>
        <div className="flex items-center gap-3 text-sm text-gray-600">
          <FileText size={16} className="text-gray-400" />
          <span>ID: {doctor.national_id}</span>
        </div>
      </div>
      
      <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs text-gray-500">
          <Calendar size={12} />
          <span>Approved {new Date(doctor.updated_at).toLocaleDateString()}</span>
        </div>
        <button
          onClick={() => setSelectedDoctor(doctor)}
          className="text-xs font-medium text-brand-600 hover:text-brand-700 px-3 py-1 rounded-full border border-brand-200 hover:bg-brand-50 transition-colors"
        >
          View Details
        </button>
      </div>
    </div>
  );

  if (loading) {
    return null; // Simplified loading
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Approved Doctors</h1>
            <p className="text-gray-600 mt-1">Manage your approved medical professionals</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="bg-white rounded-lg border border-gray-200 p-1 flex">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-md transition-colors ${
                  viewMode === 'grid' 
                    ? 'bg-brand-100 text-brand-700 shadow-sm' 
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                }`}
                title="Grid View"
              >
                <Grid3X3 size={18} />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-md transition-colors ${
                  viewMode === 'list' 
                    ? 'bg-brand-100 text-brand-700 shadow-sm' 
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                }`}
                title="List View"
              >
                <List size={18} />
              </button>
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search doctors by name, email, or specialty..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-colors"
                />
              </div>
            </div>
            
            {/* Specialty Filter */}
            <div className="lg:w-64">
              <div className="relative">
                <Filter size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <select
                  value={filterSpecialty}
                  onChange={(e) => setFilterSpecialty(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent appearance-none bg-white transition-colors"
                >
                  <option value="all">All Specialties</option>
                  {specialties.map(specialty => (
                    <option key={specialty} value={specialty}>{specialty}</option>
                  ))}
                </select>
              </div>
            </div>
            
            {/* Sort */}
            <div className="lg:w-48">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as 'name' | 'specialty' | 'date')}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent appearance-none bg-white transition-colors"
              >
                <option value="name">Sort by Name</option>
                <option value="specialty">Sort by Specialty</option>
                <option value="date">Sort by Date</option>
              </select>
            </div>
          </div>
          
          {/* Results Count */}
          <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between">
            <p className="text-sm text-gray-600">
              Showing <span className="font-medium">{filteredDoctors.length}</span> of <span className="font-medium">{doctors.length}</span> doctors
            </p>
            {(searchTerm || filterSpecialty !== 'all') && (
              <button
                onClick={() => {
                  setSearchTerm('');
                  setFilterSpecialty('all');
                }}
                className="text-sm text-brand-600 hover:text-brand-700 font-medium"
              >
                Clear filters
              </button>
            )}
          </div>
        </div>
      </div>
      {/* Content */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-brand-100 border-t-brand-600 rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Loading doctors...</p>
          </div>
        </div>
      ) : filteredDoctors.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <User size={32} className="text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            {doctors.length === 0 ? 'No approved doctors yet' : 'No doctors match your search'}
          </h3>
          <p className="text-gray-600 mb-4">
            {doctors.length === 0 
              ? 'Approved doctors will appear here once they are verified.' 
              : 'Try adjusting your search terms or filters.'}
          </p>
          {(searchTerm || filterSpecialty !== 'all') && (
            <button
              onClick={() => {
                setSearchTerm('');
                setFilterSpecialty('all');
              }}
              className="px-4 py-2 bg-brand-600 text-white rounded-lg hover:bg-brand-700 transition-colors"
            >
              Clear filters
            </button>
          )}
        </div>
      ) : (
        <>
          {viewMode === 'grid' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6">
              {filteredDoctors.map((doctor) => (
                <DoctorCard key={doctor.doctor_id} doctor={doctor} />
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="text-left p-6 font-semibold text-gray-700">Doctor</th>
                      <th className="text-left p-6 font-semibold text-gray-700">Specialty</th>
                      <th className="text-left p-6 font-semibold text-gray-700">Contact</th>
                      <th className="text-left p-6 font-semibold text-gray-700">National ID</th>
                      <th className="text-left p-6 font-semibold text-gray-700">Approved Date</th>
                      <th className="text-left p-6 font-semibold text-gray-700">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredDoctors.map((doctor, index) => (
                      <tr key={doctor.doctor_id} className={`border-b border-gray-100 hover:bg-gray-50 transition-colors ${
                        index === filteredDoctors.length - 1 ? 'border-b-0' : ''
                      }`}>
                        <td className="p-6">
                          <div className="flex items-center gap-4">
                            <div className="relative">
                              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center text-white font-semibold">
                                {doctor.name.split(' ').map(n => n[0]).slice(0, 2).join('')}
                              </div>
                              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                                <Shield size={8} className="text-white" />
                              </div>
                            </div>
                            <div>
                              <div className="font-semibold text-gray-900">{doctor.name}</div>
                              <div className="text-sm text-gray-500">{doctor.email}</div>
                            </div>
                          </div>
                        </td>
                        <td className="p-6">
                          <div className="flex items-center gap-2">
                            <Award size={16} className="text-brand-600" />
                            <span className="font-medium text-brand-600">{doctor.speciality}</span>
                          </div>
                        </td>
                        <td className="p-6 text-gray-700">{doctor.phone}</td>
                        <td className="p-6 text-gray-700">{doctor.national_id}</td>
                        <td className="p-6 text-gray-700">
                          {new Date(doctor.updated_at).toLocaleDateString()}
                        </td>
                        <td className="p-6">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => setSelectedDoctor(doctor)}
                              className="px-3 py-1 text-sm font-medium text-brand-600 hover:text-brand-700 hover:bg-brand-50 rounded-md transition-colors"
                            >
                              View
                            </button>
                            <button
                              onClick={() => handleEdit(doctor)}
                              className="px-3 py-1 text-sm font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-md transition-colors"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => setShowDeleteConfirm(doctor.doctor_id)}
                              className="px-3 py-1 text-sm font-medium text-red-600 hover:text-red-700 hover:bg-red-50 rounded-md transition-colors"
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}

      {/* Enhanced Doctor Detail Modal */}
      {selectedDoctor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between z-10 rounded-t-2xl">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center text-white text-xl font-bold shadow-lg">
                    {selectedDoctor.name.split(' ').map(n => n[0]).slice(0, 2).join('')}
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                    <Shield size={12} className="text-white" />
                  </div>
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">{selectedDoctor.name}</h2>
                  <div className="flex items-center gap-2 mt-1">
                    <Award size={16} className="text-brand-600" />
                    <span className="text-brand-600 font-medium">{selectedDoctor.speciality}</span>
                  </div>
                </div>
              </div>
              <button 
                onClick={() => setSelectedDoctor(null)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X size={24} />
              </button>
            </div>
            
            <div className="p-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Contact Information */}
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                      <User size={20} className="text-brand-600" />
                      Contact Information
                    </h3>
                    <div className="space-y-4">
                      <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
                        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                          <Mail size={20} className="text-blue-600" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-500">Email Address</p>
                          <p className="text-gray-900 font-medium">{selectedDoctor.email}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
                        <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                          <Phone size={20} className="text-green-600" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-500">Phone Number</p>
                          <p className="text-gray-900 font-medium">{selectedDoctor.phone}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Verification Details */}
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                      <Shield size={20} className="text-brand-600" />
                      Verification Details
                    </h3>
                    <div className="space-y-4">
                      <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
                        <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                          <FileText size={20} className="text-purple-600" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-500">National ID</p>
                          <p className="text-gray-900 font-medium">{selectedDoctor.national_id}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
                        <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                          <FileText size={20} className="text-orange-600" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-500">License Document</p>
                          <p className="text-gray-900 font-medium">{selectedDoctor.licence_file_path}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Status and Dates */}
              <div className="mt-8 pt-6 border-t border-gray-200">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center p-4 bg-green-50 rounded-xl">
                    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
                      <Shield size={24} className="text-green-600" />
                    </div>
                    <p className="text-sm font-medium text-gray-500">Status</p>
                    <p className="text-lg font-semibold text-green-600 capitalize">{selectedDoctor.status}</p>
                  </div>
                  <div className="text-center p-4 bg-blue-50 rounded-xl">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
                      <Calendar size={24} className="text-blue-600" />
                    </div>
                    <p className="text-sm font-medium text-gray-500">Joined</p>
                    <p className="text-lg font-semibold text-blue-600">{new Date(selectedDoctor.created_at).toLocaleDateString()}</p>
                  </div>
                  <div className="text-center p-4 bg-purple-50 rounded-xl">
                    <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-2">
                      <Calendar size={24} className="text-purple-600" />
                    </div>
                    <p className="text-sm font-medium text-gray-500">Approved</p>
                    <p className="text-lg font-semibold text-purple-600">{new Date(selectedDoctor.updated_at).toLocaleDateString()}</p>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-8 pt-6 border-t border-gray-200 flex items-center justify-end gap-3">
                <button
                  onClick={() => {
                    setSelectedDoctor(null);
                    handleEdit(selectedDoctor);
                  }}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 font-medium"
                >
                  <Edit size={18} />
                  Edit Doctor
                </button>
                <button
                  onClick={() => {
                    setSelectedDoctor(null);
                    setShowDeleteConfirm(selectedDoctor.doctor_id);
                  }}
                  className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2 font-medium"
                >
                  <Trash2 size={18} />
                  Remove Doctor
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Doctor Modal */}
      {editingDoctor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 overflow-y-auto">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
            <div className="border-b p-4 flex items-center justify-between">
              <h2 className="text-xl font-bold">Edit Doctor</h2>
              <button 
                onClick={() => setEditingDoctor(null)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <input
                  type="text"
                  value={editingDoctor.name}
                  onChange={(e) => setEditingDoctor({ ...editingDoctor, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  value={editingDoctor.email}
                  onChange={(e) => setEditingDoctor({ ...editingDoctor, email: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                <input
                  type="tel"
                  value={editingDoctor.phone}
                  onChange={(e) => setEditingDoctor({ ...editingDoctor, phone: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Specialty</label>
                <input
                  type="text"
                  value={editingDoctor.speciality}
                  onChange={(e) => setEditingDoctor({ ...editingDoctor, speciality: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">National ID</label>
                <input
                  type="text"
                  value={editingDoctor.national_id}
                  onChange={(e) => setEditingDoctor({ ...editingDoctor, national_id: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                />
              </div>
            </div>
            
            <div className="border-t p-4 flex items-center justify-end gap-3">
              <button
                onClick={() => setEditingDoctor(null)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveEdit}
                disabled={processing === editingDoctor.doctor_id}
                className="px-4 py-2 bg-brand-600 text-white rounded-lg hover:bg-brand-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {processing === editingDoctor.doctor_id ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <Save size={16} />
                )}
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
            <div className="p-6">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                  <Trash2 className="text-red-600" size={24} />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Delete Doctor</h3>
                  <p className="text-gray-600">This action cannot be undone.</p>
                </div>
              </div>
              
              <p className="text-gray-700 mb-6">
                Are you sure you want to delete this doctor? All associated data will be permanently removed.
              </p>
              
              <div className="flex items-center justify-end gap-3">
                <button
                  onClick={() => setShowDeleteConfirm(null)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleDelete(showDeleteConfirm)}
                  disabled={processing === showDeleteConfirm}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {processing === showDeleteConfirm ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <Trash2 size={16} />
                  )}
                  Delete Doctor
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ApprovedDoctors;
