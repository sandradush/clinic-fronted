import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload } from 'lucide-react';
import { makeApiRequest } from '../utils/api';
import toast from 'react-hot-toast';

const ProfileSetup: React.FC = () => {
  const [formData, setFormData] = useState({
    doctorId: '',
    phone: '',
    specialty: ''
  });
  const [licenseFile, setLicenseFile] = useState<File | null>(null);
  const [nationalIdFile, setNationalIdFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const specialties = [
    'General Medicine', 'Cardiology', 'Pediatrics', 'Dermatology',
    'Orthopedics', 'Neurology', 'Psychiatry', 'Internal Medicine',
    'Surgery', 'Gynecology', 'Ophthalmology', 'ENT'
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await makeApiRequest('/doctors/profile-setup', {
        method: 'POST',
        body: JSON.stringify({
          ...formData,
          licenseFilePath: licenseFile?.name || '',
          nationalIdPath: nationalIdFile?.name || ''
        })
      });
      toast.success('Profile setup completed successfully!');
      navigate('/dashboard');
    } catch (error) {
      toast.error('Failed to setup profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl bg-white rounded-lg shadow-lg p-8">
        <h1 className="text-2xl font-bold text-center mb-6">Doctor Profile Setup</h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-medium">Doctor ID</label>
            <input
              type="text"
              value={formData.doctorId}
              onChange={(e) => setFormData({ ...formData, doctorId: e.target.value })}
              className="mt-1 block w-full border rounded px-3 py-2"
              required
            />
          </div>

          <div>
            <label className="text-sm font-medium">Phone</label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="mt-1 block w-full border rounded px-3 py-2"
              required
            />
          </div>

          <div>
            <label className="text-sm font-medium">Specialty</label>
            <select
              value={formData.specialty}
              onChange={(e) => setFormData({ ...formData, specialty: e.target.value })}
              className="mt-1 block w-full border rounded px-3 py-2"
              required
            >
              <option value="">Select Specialty</option>
              {specialties.map((specialty) => (
                <option key={specialty} value={specialty}>{specialty}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-sm font-medium">License File</label>
            <div className="mt-1 flex items-center gap-2">
              <input
                type="file"
                onChange={(e) => setLicenseFile(e.target.files?.[0] || null)}
                className="block w-full text-sm"
                accept=".pdf,.jpg,.jpeg,.png"
                required
              />
              <Upload size={20} className="text-gray-400" />
            </div>
            {licenseFile && <p className="text-xs text-gray-600 mt-1">{licenseFile.name}</p>}
          </div>

          <div>
            <label className="text-sm font-medium">National ID</label>
            <div className="mt-1 flex items-center gap-2">
              <input
                type="file"
                onChange={(e) => setNationalIdFile(e.target.files?.[0] || null)}
                className="block w-full text-sm"
                accept=".pdf,.jpg,.jpeg,.png"
                required
              />
              <Upload size={20} className="text-gray-400" />
            </div>
            {nationalIdFile && <p className="text-xs text-gray-600 mt-1">{nationalIdFile.name}</p>}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-500 text-white py-3 rounded hover:bg-blue-600 disabled:opacity-50"
          >
            {loading ? 'Submitting...' : 'Complete Setup'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ProfileSetup;
