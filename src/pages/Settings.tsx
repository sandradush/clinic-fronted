import React, { useState, useEffect } from 'react';
import { Building2, Clock, Settings as SettingsIcon, Upload } from 'lucide-react';
import { makeApiRequest } from '../utils/api';
import toast from 'react-hot-toast';

const Settings: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'clinic' | 'hours' | 'preferences'>('clinic');
  const [clinicInfo, setClinicInfo] = useState({ name: '', address: '', logo: '' });
  const [workingHours, setWorkingHours] = useState({ start: '09:00', end: '17:00' });
  const [preferences, setPreferences] = useState({ language: 'en', theme: 'light' });

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const data = await makeApiRequest('/settings');
        if (data.clinicInfo) setClinicInfo(data.clinicInfo);
        if (data.workingHours) setWorkingHours(data.workingHours);
        if (data.preferences) setPreferences(data.preferences);
      } catch (error) {
        console.error('Failed to fetch settings:', error);
      }
    };
    fetchSettings();
  }, []);

  const handleSaveClinicInfo = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await makeApiRequest('/settings/clinic', {
        method: 'PUT',
        body: JSON.stringify(clinicInfo),
      });
      toast.success('Clinic information updated successfully!');
    } catch {
      toast.error('Failed to update clinic information');
    }
  };

  const handleSaveWorkingHours = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await makeApiRequest('/settings/working-hours', {
        method: 'PUT',
        body: JSON.stringify(workingHours),
      });
      toast.success('Working hours updated successfully!');
    } catch {
      toast.error('Failed to update working hours');
    }
  };

  const handleSavePreferences = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await makeApiRequest('/settings/preferences', {
        method: 'PUT',
        body: JSON.stringify(preferences),
      });
      toast.success('System preferences updated successfully!');
    } catch {
      toast.error('Failed to update preferences');
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-6">Settings</h1>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow-sm p-4 mb-4">
        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab('clinic')}
            className={`flex items-center gap-2 px-4 py-2 rounded ${
              activeTab === 'clinic' ? 'bg-blue-500 text-white' : 'bg-gray-100'
            }`}
          >
            <Building2 size={18} />
            Clinic Information
          </button>

          <button
            onClick={() => setActiveTab('hours')}
            className={`flex items-center gap-2 px-4 py-2 rounded ${
              activeTab === 'hours' ? 'bg-blue-500 text-white' : 'bg-gray-100'
            }`}
          >
            <Clock size={18} />
            Working Hours
          </button>

          <button
            onClick={() => setActiveTab('preferences')}
            className={`flex items-center gap-2 px-4 py-2 rounded ${
              activeTab === 'preferences' ? 'bg-blue-500 text-white' : 'bg-gray-100'
            }`}
          >
            <SettingsIcon size={18} />
            System Preferences
          </button>
        </div>
      </div>

      {/* Clinic Info */}
      {activeTab === 'clinic' && (
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-semibold mb-4">Clinic Information</h2>

          <form onSubmit={handleSaveClinicInfo} className="space-y-4 max-w-2xl">
            <div>
              <label className="text-sm font-medium">Clinic Name</label>
              <input
                type="text"
                value={clinicInfo.name}
                onChange={(e) => setClinicInfo({ ...clinicInfo, name: e.target.value })}
                className="mt-1 block w-full border rounded px-3 py-2"
              />
            </div>

            <div>
              <label className="text-sm font-medium">Address</label>
              <textarea
                value={clinicInfo.address}
                onChange={(e) => setClinicInfo({ ...clinicInfo, address: e.target.value })}
                rows={3}
                className="mt-1 block w-full border rounded px-3 py-2"
              />
            </div>

            <div>
              <label className="text-sm font-medium">Logo URL</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={clinicInfo.logo}
                  onChange={(e) => setClinicInfo({ ...clinicInfo, logo: e.target.value })}
                  className="mt-1 block w-full border rounded px-3 py-2"
                  placeholder="https://example.com/logo.png"
                />
                <button
                  type="button"
                  className="mt-1 px-4 py-2 border rounded flex items-center gap-2"
                >
                  <Upload size={16} />
                  Upload
                </button>
              </div>
            </div>

            <button type="submit" className="px-4 py-2 bg-blue-500 text-white rounded">
              Save Clinic Information
            </button>
          </form>
        </div>
      )}

      {/* Working Hours */}
      {activeTab === 'hours' && (
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-semibold mb-4">Working Hours</h2>

          <form onSubmit={handleSaveWorkingHours} className="space-y-4 max-w-2xl">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Start Time</label>
                <input
                  type="time"
                  value={workingHours.start}
                  onChange={(e) =>
                    setWorkingHours({ ...workingHours, start: e.target.value })
                  }
                  className="mt-1 block w-full border rounded px-3 py-2"
                />
              </div>

              <div>
                <label className="text-sm font-medium">End Time</label>
                <input
                  type="time"
                  value={workingHours.end}
                  onChange={(e) =>
                    setWorkingHours({ ...workingHours, end: e.target.value })
                  }
                  className="mt-1 block w-full border rounded px-3 py-2"
                />
              </div>
            </div>

            <button type="submit" className="px-4 py-2 bg-blue-500 text-white rounded">
              Save Working Hours
            </button>
          </form>
        </div>
      )}

      {/* Preferences */}
      {activeTab === 'preferences' && (
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-semibold mb-4">System Preferences</h2>

          <form onSubmit={handleSavePreferences} className="space-y-4 max-w-2xl">
            <div>
              <label className="text-sm font-medium">Language</label>
              <select
                value={preferences.language}
                onChange={(e) =>
                  setPreferences({ ...preferences, language: e.target.value })
                }
                className="mt-1 block w-full border rounded px-3 py-2"
              >
                <option value="en">English</option>
                <option value="es">Spanish</option>
                <option value="fr">French</option>
              </select>
            </div>

            <div>
              <label className="text-sm font-medium">Theme</label>
              <select
                value={preferences.theme}
                onChange={(e) =>
                  setPreferences({ ...preferences, theme: e.target.value })
                }
                className="mt-1 block w-full border rounded px-3 py-2"
              >
                <option value="light">Light</option>
                <option value="dark">Dark</option>
              </select>
            </div>

            <button type="submit" className="px-4 py-2 bg-blue-500 text-white rounded">
              Save Preferences
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default Settings;
