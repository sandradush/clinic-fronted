import React, { useEffect, useState } from 'react';
import { Clock, Users, Calendar } from 'lucide-react';
import { makeApiRequest } from '../utils/api';
import toast from 'react-hot-toast';

const ReceptionistDashboard: React.FC = () => {
  const [clinicName, setClinicName] = useState('King Faisal Hospital - Clinova Branch');
  const [primaryAddress, setPrimaryAddress] = useState('KG 544 St, Kigali, Rwanda');
  const [defaultLanguage, setDefaultLanguage] = useState('English');
  const [baseCurrency, setBaseCurrency] = useState('RWF (Rwandan Franc)');
  const [operatingHours, setOperatingHours] = useState<Array<{ day: string; enabled: boolean; open: string; close: string }>>([
    { day: 'Monday', enabled: true, open: '08:00', close: '17:00' },
    { day: 'Tuesday', enabled: true, open: '08:00', close: '17:00' },
    { day: 'Wednesday', enabled: true, open: '08:00', close: '17:00' },
    { day: 'Thursday', enabled: true, open: '08:00', close: '17:00' },
    { day: 'Friday', enabled: true, open: '08:00', close: '17:00' },
    { day: 'Saturday', enabled: false, open: '09:00', close: '13:00' },
    { day: 'Sunday', enabled: false, open: '00:00', close: '00:00' },
  ]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // attempt to fetch existing settings
    const load = async () => {
      try {
        setLoading(true);
        const s = await makeApiRequest('/settings');
        if (s) {
          setClinicName(s.clinicName || clinicName);
          setPrimaryAddress(s.primaryAddress || primaryAddress);
          setDefaultLanguage(s.defaultLanguage || defaultLanguage);
          setBaseCurrency(s.baseCurrency || baseCurrency);
        }
      } catch (err) {
        // ignore - use defaults
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const saveGeneral = async () => {
    try {
      setLoading(true);
      await makeApiRequest('/settings', { method: 'POST', body: JSON.stringify({ clinicName, primaryAddress, defaultLanguage, baseCurrency }) });
      toast.success('General settings saved');
    } catch (err) {
      console.error(err);
      toast.error('Failed to save general settings');
    } finally {
      setLoading(false);
    }
  };

  const saveOperatingHours = async () => {
    try {
      setLoading(true);
      await makeApiRequest('/settings/operating-hours', { method: 'POST', body: JSON.stringify({ hours: operatingHours }) });
      toast.success('Operating hours saved');
    } catch (err) {
      console.error(err);
      toast.error('Failed to save operating hours');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold">Receptionist Dashboard</h1>
          <p className="text-sm text-gray-500">Front desk management — clinic schedule and patient directory.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="col-span-2 bg-white rounded-lg p-6 shadow-sm">
          <h2 className="text-lg font-semibold mb-4">Clinic Identity</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-gray-500 mb-1">Clinic Name</label>
              <input value={clinicName} onChange={(e) => setClinicName(e.target.value)} className="w-full border rounded px-3 py-2" />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Primary Address</label>
              <input value={primaryAddress} onChange={(e) => setPrimaryAddress(e.target.value)} className="w-full border rounded px-3 py-2" />
            </div>
          </div>

          <div className="mt-6">
            <h3 className="text-sm font-semibold mb-2">Localization</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-gray-500 mb-1">Default Language</label>
                <select value={defaultLanguage} onChange={(e) => setDefaultLanguage(e.target.value)} className="w-full border rounded px-3 py-2">
                  <option>English</option>
                  <option>French</option>
                  <option>Kinyarwanda</option>
                </select>
              </div>

              <div>
                <label className="block text-xs text-gray-500 mb-1">Base Currency</label>
                <select value={baseCurrency} onChange={(e) => setBaseCurrency(e.target.value)} className="w-full border rounded px-3 py-2">
                  <option>RWF (Rwandan Franc)</option>
                  <option>USD (US Dollar)</option>
                </select>
              </div>
            </div>
          </div>

          <div className="mt-6 flex gap-3">
            <button onClick={saveGeneral} className="px-4 py-2 bg-brand-700 text-white rounded">Save</button>
          </div>
        </div>

        <div className="bg-white rounded-lg p-6 shadow-sm">
          <h2 className="text-lg font-semibold mb-4">Operating Hours</h2>
          <div className="space-y-3">
            {operatingHours.map((h, idx) => (
              <div key={h.day} className="flex items-center gap-4">
                <div className="w-28 font-medium">{h.day}</div>
                <label className="inline-flex items-center gap-2">
                  <input type="checkbox" checked={h.enabled} onChange={(e) => setOperatingHours(prev => { const copy = [...prev]; copy[idx] = { ...copy[idx], enabled: e.target.checked }; return copy; })} />
                  <span className="text-sm">Open</span>
                </label>
                <input type="time" value={h.open} onChange={(e) => setOperatingHours(prev => { const copy = [...prev]; copy[idx] = { ...copy[idx], open: e.target.value }; return copy; })} className="border rounded px-2 py-1" disabled={!h.enabled} />
                <span className="text-sm text-gray-400">to</span>
                <input type="time" value={h.close} onChange={(e) => setOperatingHours(prev => { const copy = [...prev]; copy[idx] = { ...copy[idx], close: e.target.value }; return copy; })} className="border rounded px-2 py-1" disabled={!h.enabled} />
              </div>
            ))}

            <div className="mt-4">
              <button onClick={saveOperatingHours} className="px-4 py-2 bg-brand-700 text-white rounded">Save Operating Hours</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReceptionistDashboard;
