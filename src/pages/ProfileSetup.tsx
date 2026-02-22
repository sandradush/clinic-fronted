import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload } from 'lucide-react';
import { makeApiRequest } from '../utils/api';
import toast from 'react-hot-toast';
import { trackEvent } from '../services/analytics';

const ProfileSetup: React.FC = () => {
  const [formData, setFormData] = useState({
    phone: '',
    specialty: '',
    nationalId: ''
  });
  const [licenseFile, setLicenseFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
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
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const userId = user.id;

      if (!userId) {
        toast.error('User not found. Please login again.');
        navigate('/login');
        return;
      }

      const formDataToSend = new FormData();
      formDataToSend.append('user_id', userId.toString());
      formDataToSend.append('phone', formData.phone);
      formDataToSend.append('speciality', formData.specialty);
      formDataToSend.append('national_id', formData.nationalId);
      if (licenseFile) {
        formDataToSend.append('licence_file', licenseFile);
      }

      const response = await fetch('https://clinic-backend-s2lx.onrender.com/api/auth/doctors', {
        method: 'POST',
        body: formDataToSend
      });

      if (!response.ok) {
        throw new Error('Failed to submit profile');
      }
      
      toast.success('Profile submitted successfully!');
      trackEvent('profile_setup_saved', { specialty: formData.specialty || 'unknown' });
      setSubmitted(true);
    } catch (error) {
      trackEvent('profile_setup_failed');
      toast.error('Failed to setup profile');
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-white rounded-lg shadow-lg p-8 text-center">
          <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold mb-2">Waiting for Admin Approval</h2>
          <p className="text-gray-600 mb-4">Your profile has been submitted successfully. Please wait for admin verification.</p>
          <p className="text-sm text-gray-500">Status: <span className="font-semibold text-yellow-600">Pending</span></p>
          <button
            onClick={() => navigate('/login')}
            className="mt-6 px-6 py-2 bg-brand-700 text-white rounded hover:bg-brand-600"
          >
            Back to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl bg-white rounded-lg shadow-lg p-8">
        <h1 className="text-2xl font-bold text-center mb-6">Doctor Profile Setup</h1>

        <form onSubmit={handleSubmit} className="space-y-4">
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
            <label className="text-sm font-medium">National ID</label>
            <input
              type="text"
              value={formData.nationalId}
              onChange={(e) => setFormData({ ...formData, nationalId: e.target.value })}
              className="mt-1 block w-full border rounded px-3 py-2"
              placeholder="Enter National ID number"
              required
            />
          </div>

          <div>
            <label className="text-sm font-medium">License Document (PDF/Image)</label>
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

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-brand-700 text-white py-3 rounded hover:bg-brand-600 disabled:opacity-50"
          >
            {loading ? 'Submitting...' : 'Complete Setup'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ProfileSetup;
