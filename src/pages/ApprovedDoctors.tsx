import React, { useEffect, useState } from 'react';
import { Mail, Phone, FileText, X } from 'lucide-react';
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
  const [loading, setLoading] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState<ApprovedDoctor | null>(null);

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
    return null; // Simplified loading
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
            <div 
              key={doctor.doctor_id} 
              className="bg-white border rounded-lg p-6 cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => setSelectedDoctor(doctor)}
            >
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

      {/* Doctor Detail Modal */}
      {selectedDoctor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 overflow-y-auto">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white dark:bg-gray-800 border-b p-4 flex items-center justify-between z-10">
              <h2 className="text-xl font-bold">Doctor Details</h2>
              <button 
                onClick={() => setSelectedDoctor(null)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="p-6">
              <div className="flex flex-col md:flex-row gap-6 mb-6">
                <div className="w-24 h-24 rounded-full bg-green-100 flex items-center justify-center text-green-600 text-3xl font-bold shrink-0 mx-auto md:mx-0">
                  {selectedDoctor.name.split(' ').map(n => n[0]).slice(0, 2).join('')}
                </div>
                <div className="text-center md:text-left">
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{selectedDoctor.name}</h3>
                  <p className="text-brand-600 font-medium">{selectedDoctor.speciality}</p>
                  <div className="mt-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    {selectedDoctor.status}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="text-sm font-semibold text-gray-500 uppercase">Contact Information</h4>
                  <div className="flex items-center gap-3 text-gray-700 dark:text-gray-300">
                    <Mail size={18} className="text-gray-400" />
                    <span>{selectedDoctor.email}</span>
                  </div>
                  <div className="flex items-center gap-3 text-gray-700 dark:text-gray-300">
                    <Phone size={18} className="text-gray-400" />
                    <span>{selectedDoctor.phone}</span>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="text-sm font-semibold text-gray-500 uppercase">Verification</h4>
                  <div className="flex items-center gap-3 text-gray-700 dark:text-gray-300">
                    <FileText size={18} className="text-gray-400" />
                    <span>National ID: {selectedDoctor.national_id}</span>
                  </div>
                  <div className="flex items-center gap-3 text-gray-700 dark:text-gray-300">
                    <FileText size={18} className="text-gray-400" />
                    <span>License: {selectedDoctor.licence_file_path}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ApprovedDoctors;
