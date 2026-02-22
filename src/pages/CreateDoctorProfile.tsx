import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Phone, Stethoscope, Calendar } from 'lucide-react';
import { makeApiRequest } from '../utils/api';
import toast from 'react-hot-toast';

interface DoctorProfileData {
  doctor_id: string;
  speciality: string;
  phone: string;
  status: string;
}

const CreateDoctorProfile: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<DoctorProfileData>({
    doctor_id: '',
    speciality: '',
    phone: '',
    status: 'pending'
  });

  const specialities = [
    'General Medicine',
    'Cardiology', 
    'Pediatrics',
    'Dermatology',
    'Orthopedics',
    'Neurology',
    'Psychiatry',
    'Internal Medicine',
    'Surgery',
    'Gynecology',
    'Ophthalmology',
    'ENT',
    'Radiology',
    'Anesthesiology',
    'Emergency Medicine'
  ];

  const statusOptions = [
    { value: 'pending', label: 'Pending' },
    { value: 'approved', label: 'Approved' },
    { value: 'rejected', label: 'Rejected' },
    { value: 'suspended', label: 'Suspended' }
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await makeApiRequest('/doctors', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          doctor_id: parseInt(formData.doctor_id)
        })
      });

      toast.success('Doctor profile created successfully!');
      navigate('/doctors');
    } catch (error: any) {
      console.error('Error creating doctor profile:', error);
      toast.error(error.message || 'Failed to create doctor profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center mb-6">
            <User className="h-6 w-6 text-brand-700 mr-2" />
            <h1 className="text-2xl font-bold text-gray-900">Create Doctor Profile</h1>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="doctor_id" className="block text-sm font-medium text-gray-700 mb-2">
                  <User className="h-4 w-4 inline mr-1" />
                  Doctor ID (User ID)
                </label>
                <input
                  type="number"
                  id="doctor_id"
                  name="doctor_id"
                  value={formData.doctor_id}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-700 focus:border-transparent"
                  placeholder="Enter user ID"
                />
              </div>

              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                  <Phone className="h-4 w-4 inline mr-1" />
                  Phone Number
                </label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-700 focus:border-transparent"
                  placeholder="+1234567890"
                />
              </div>

              <div>
                <label htmlFor="speciality" className="block text-sm font-medium text-gray-700 mb-2">
                  <Stethoscope className="h-4 w-4 inline mr-1" />
                  Speciality
                </label>
                <select
                  id="speciality"
                  name="speciality"
                  value={formData.speciality}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-700 focus:border-transparent"
                >
                  <option value="">Select a speciality</option>
                  {specialities.map(speciality => (
                    <option key={speciality} value={speciality}>
                      {speciality}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-2">
                  <Calendar className="h-4 w-4 inline mr-1" />
                  Status
                </label>
                <select
                  id="status"
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-700 focus:border-transparent"
                >
                  {statusOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="bg-gray-50 p-4 rounded-md">
              <h3 className="text-sm font-medium text-gray-900 mb-2">Profile Information</h3>
              <div className="text-sm text-gray-600 space-y-1">
                <p><strong>ID:</strong> Auto-generated</p>
                <p><strong>Created At:</strong> Auto-generated timestamp</p>
              </div>
            </div>

            <div className="flex gap-4">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-brand-700 text-white py-2 px-4 rounded-md hover:bg-brand-600 focus:outline-none focus:ring-2 focus:ring-brand-700 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? 'Creating...' : 'Create Doctor Profile'}
              </button>
              
              <button
                type="button"
                onClick={() => navigate('/doctors')}
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-brand-700 focus:ring-offset-2 transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateDoctorProfile;