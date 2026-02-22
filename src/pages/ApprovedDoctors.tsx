import React, { useEffect, useState } from 'react';
import { Mail, Phone, FileText } from 'lucide-react';
import toast from 'react-hot-toast';

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
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchApprovedDoctors();
  }, []);

  const fetchApprovedDoctors = async () => {
    try {
      const response = await fetch('https://clinic-backend-s2lx.onrender.com/api/auth/doctors/approved');
      const data = await response.json();
      setDoctors(data);
    } catch (error) {
      toast.error('Failed to load approved doctors');
    } finally {
      setLoading(false);
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
      <h2 className="text-xl font-semibold mb-4">Approved</h2>
      
      {doctors.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          No doctors found
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {doctors.map((doctor) => (
            <div key={doctor.doctor_id} className="bg-white border rounded-lg p-6">
              <div className="flex items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center text-green-600 font-semibold">
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
                    Approved: {new Date(doctor.updated_at).toLocaleString()}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ApprovedDoctors;
