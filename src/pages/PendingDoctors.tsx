import React, { useEffect, useState } from 'react';
import { CheckCircle, XCircle, Mail, Phone, FileText } from 'lucide-react';
import toast from 'react-hot-toast';

interface PendingDoctor {
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
}

const PendingDoctors: React.FC = () => {
  const [doctors, setDoctors] = useState<PendingDoctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState<number | null>(null);

  useEffect(() => {
    fetchPendingDoctors();
  }, []);

  const fetchPendingDoctors = async () => {
    try {
      const response = await fetch('https://clinic-backend-s2lx.onrender.com/api/auth/doctors/pending');
      const data = await response.json();
      setDoctors(data);
    } catch (error) {
      toast.error('Failed to load pending doctors');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (doctorId: number) => {
    setProcessing(doctorId);
    try {
      const response = await fetch(`https://clinic-backend-s2lx.onrender.com/api/auth/doctors/${doctorId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'approved' })
      });
      if (response.ok) {
        toast.success('Doctor approved successfully!');
        fetchPendingDoctors();
      }
    } catch (error) {
      toast.error('Failed to approve doctor');
    } finally {
      setProcessing(null);
    }
  };

  const handleReject = async (doctorId: number) => {
    setProcessing(doctorId);
    try {
      const response = await fetch(`https://clinic-backend-s2lx.onrender.com/api/auth/doctors/${doctorId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'rejected' })
      });
      if (response.ok) {
        toast.success('Doctor rejected');
        fetchPendingDoctors();
      }
    } catch (error) {
      toast.error('Failed to reject doctor');
    } finally {
      setProcessing(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="p-4">
      <h2 className="text-xl font-semibold mb-4">Pending Doctor Approvals</h2>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {doctors.map((doctor) => (
            <div key={doctor.doctor_id} className="bg-white border rounded-lg p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-semibold">
                      {doctor.name.split(' ').map(n => n[0]).slice(0, 2).join('')}
                    </div>
                    <div>
                      <h3 className="text-lg font-medium">{doctor.name}</h3>
                      <span className="text-sm text-gray-600">{doctor.speciality}</span>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                    <div className="flex items-center gap-2 text-gray-600">
                      <Mail size={16} />
                      {doctor.email}
                    </div>
                    <div className="flex items-center gap-2 text-gray-600">
                      <Phone size={16} />
                      {doctor.phone}
                    </div>
                    <div className="flex items-center gap-2 text-gray-600">
                      <FileText size={16} />
                      National ID: {doctor.national_id}
                    </div>
                    <div className="flex items-center gap-2 text-gray-600">
                      <FileText size={16} />
                      License: {doctor.licence_file_path}
                    </div>
                  </div>
                  
                  <div className="mt-3 text-xs text-gray-500">
                    Submitted: {new Date(doctor.created_at).toLocaleString()}
                  </div>
                </div>
                
                <div className="flex items-center gap-2 ml-4">
                  <button
                    onClick={() => handleReject(doctor.doctor_id)}
                    disabled={processing === doctor.doctor_id}
                    className="flex items-center gap-1 px-4 py-2 text-red-600 border border-red-200 rounded hover:bg-red-50 disabled:opacity-50"
                  >
                    <XCircle size={16} />
                    Reject
                  </button>
                  <button
                    onClick={() => handleApprove(doctor.doctor_id)}
                    disabled={processing === doctor.doctor_id}
                    className="flex items-center gap-1 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
                  >
                    <CheckCircle size={16} />
                    Approve
                  </button>
                </div>
              </div>
            </div>
          ))}
      </div>
    </div>
  );
};

export default PendingDoctors;
