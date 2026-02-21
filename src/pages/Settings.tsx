import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { makeApiRequest } from '../utils/api';

type SettingsTab = 'general' | 'billing' | 'hours';

const defaultHours = [
  { day: 'Monday', enabled: true, open: '08:00', close: '17:00' },
  { day: 'Tuesday', enabled: true, open: '08:00', close: '17:00' },
  { day: 'Wednesday', enabled: true, open: '08:00', close: '17:00' },
  { day: 'Thursday', enabled: true, open: '08:00', close: '17:00' },
  { day: 'Friday', enabled: true, open: '08:00', close: '17:00' },
  { day: 'Saturday', enabled: false, open: '09:00', close: '13:00' },
  { day: 'Sunday', enabled: false, open: '00:00', close: '00:00' },
];

const Settings: React.FC = () => {
  const [activeTab, setActiveTab] = useState<SettingsTab>('general');
  const [loading, setLoading] = useState(false);

  const [clinicName, setClinicName] = useState('King Faisal Hospital - Clinova Branch');
  const [primaryAddress, setPrimaryAddress] = useState('KG 544 St, Kigali, Rwanda');
  const [defaultLanguage, setDefaultLanguage] = useState('English');

  const [baseCurrency, setBaseCurrency] = useState('RWF (Rwandan Franc)');
  const [taxRate, setTaxRate] = useState<number>(18);
  const [paymentGateway, setPaymentGateway] = useState<string>('stripe');

  const [operatingHours, setOperatingHours] = useState(defaultHours);

  const saveGeneral = async () => {
    try {
      setLoading(true);
      await makeApiRequest('/settings', {
        method: 'POST',
        body: JSON.stringify({ clinicName, primaryAddress, defaultLanguage }),
      });
      toast.success('General settings saved');
    } catch (err) {
      console.error('Failed to save general settings', err);
      toast.error('Failed to save general settings');
    } finally {
      setLoading(false);
    }
  };

  const saveBilling = async () => {
    try {
      setLoading(true);
      await makeApiRequest('/settings/billing', {
        method: 'POST',
        body: JSON.stringify({ baseCurrency, taxRate, paymentGateway }),
      });
      toast.success('Billing settings saved');
    } catch (err) {
      console.error('Failed to save billing settings', err);
      toast.error('Failed to save billing settings');
    } finally {
      setLoading(false);
    }
  };

  const saveOperatingHours = async () => {
    try {
      setLoading(true);
      await makeApiRequest('/settings/operating-hours', {
        method: 'POST',
        body: JSON.stringify({ hours: operatingHours }),
      });
      toast.success('Operating hours saved');
    } catch (err) {
      console.error('Failed to save operating hours', err);
      toast.error('Failed to save operating hours');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-2">Settings</h1>
      <p className="text-sm text-gray-500 mb-6">Update clinic details, billing, and operating hours.</p>

      <div className="bg-white rounded-lg border shadow-sm p-2 inline-flex gap-2 mb-6">
        <button
          onClick={() => setActiveTab('general')}
          className={`px-4 py-2 rounded-md text-sm ${activeTab === 'general' ? 'bg-brand-700 text-white' : 'text-gray-600 hover:bg-gray-50'}`}
        >
          General
        </button>
        <button
          onClick={() => setActiveTab('billing')}
          className={`px-4 py-2 rounded-md text-sm ${activeTab === 'billing' ? 'bg-brand-700 text-white' : 'text-gray-600 hover:bg-gray-50'}`}
        >
          Billing
        </button>
        <button
          onClick={() => setActiveTab('hours')}
          className={`px-4 py-2 rounded-md text-sm ${activeTab === 'hours' ? 'bg-brand-700 text-white' : 'text-gray-600 hover:bg-gray-50'}`}
        >
          Operating Hours
        </button>
      </div>

      {activeTab === 'general' && (
        <section className="bg-white rounded-lg border shadow-sm p-6 max-w-4xl">
          <h2 className="text-lg font-semibold mb-1">General</h2>
          <p className="text-sm text-gray-500 mb-5">Basic clinic identity and language preferences.</p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Clinic Name</label>
              <input
                value={clinicName}
                onChange={(e) => setClinicName(e.target.value)}
                className="w-full border rounded px-3 py-2"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Default Language</label>
              <select
                value={defaultLanguage}
                onChange={(e) => setDefaultLanguage(e.target.value)}
                className="w-full border rounded px-3 py-2 bg-white"
              >
                <option>English</option>
                <option>French</option>
                <option>Kinyarwanda</option>
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-600 mb-1">Primary Address</label>
              <input
                value={primaryAddress}
                onChange={(e) => setPrimaryAddress(e.target.value)}
                className="w-full border rounded px-3 py-2"
              />
            </div>
          </div>

          <div className="mt-6 flex gap-3">
            <button onClick={saveGeneral} disabled={loading} className="px-4 py-2 bg-brand-700 text-white rounded disabled:opacity-50">
              Save General
            </button>
            <button
              onClick={() => {
                setClinicName('King Faisal Hospital - Clinova Branch');
                setPrimaryAddress('KG 544 St, Kigali, Rwanda');
                setDefaultLanguage('English');
              }}
              className="px-4 py-2 border rounded"
            >
              Reset
            </button>
          </div>
        </section>
      )}

      {activeTab === 'billing' && (
        <section className="bg-white rounded-lg border shadow-sm p-6 max-w-4xl">
          <h2 className="text-lg font-semibold mb-1">Billing</h2>
          <p className="text-sm text-gray-500 mb-5">Set currency, tax, and payment provider.</p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Base Currency</label>
              <select value={baseCurrency} onChange={(e) => setBaseCurrency(e.target.value)} className="w-full border rounded px-3 py-2 bg-white">
                <option>RWF (Rwandan Franc)</option>
                <option>USD (US Dollar)</option>
                <option>EUR (Euro)</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Tax Rate (%)</label>
              <input
                type="number"
                min={0}
                max={100}
                value={taxRate}
                onChange={(e) => setTaxRate(Number(e.target.value))}
                className="w-full border rounded px-3 py-2"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-600 mb-1">Payment Gateway</label>
              <select value={paymentGateway} onChange={(e) => setPaymentGateway(e.target.value)} className="w-full border rounded px-3 py-2 bg-white">
                <option value="stripe">Stripe</option>
                <option value="paystack">Paystack</option>
                <option value="flutterwave">Flutterwave</option>
              </select>
            </div>
          </div>

          <div className="mt-6">
            <button onClick={saveBilling} disabled={loading} className="px-4 py-2 bg-brand-700 text-white rounded disabled:opacity-50">
              Save Billing
            </button>
          </div>
        </section>
      )}

      {activeTab === 'hours' && (
        <section className="bg-white rounded-lg border shadow-sm p-6 max-w-4xl">
          <h2 className="text-lg font-semibold mb-1">Operating Hours</h2>
          <p className="text-sm text-gray-500 mb-5">Set open days and time ranges.</p>

          <div className="space-y-3">
            {operatingHours.map((item, index) => (
              <div key={item.day} className="grid grid-cols-1 md:grid-cols-6 gap-3 items-center border rounded p-3">
                <div className="font-medium text-sm md:col-span-2">{item.day}</div>
                <label className="inline-flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={item.enabled}
                    onChange={(e) =>
                      setOperatingHours((prev) => {
                        const copy = [...prev];
                        copy[index] = { ...copy[index], enabled: e.target.checked };
                        return copy;
                      })
                    }
                  />
                  Open
                </label>
                <input
                  type="time"
                  value={item.open}
                  disabled={!item.enabled}
                  onChange={(e) =>
                    setOperatingHours((prev) => {
                      const copy = [...prev];
                      copy[index] = { ...copy[index], open: e.target.value };
                      return copy;
                    })
                  }
                  className="border rounded px-2 py-1"
                />
                <input
                  type="time"
                  value={item.close}
                  disabled={!item.enabled}
                  onChange={(e) =>
                    setOperatingHours((prev) => {
                      const copy = [...prev];
                      copy[index] = { ...copy[index], close: e.target.value };
                      return copy;
                    })
                  }
                  className="border rounded px-2 py-1"
                />
              </div>
            ))}
          </div>

          <div className="mt-6">
            <button onClick={saveOperatingHours} disabled={loading} className="px-4 py-2 bg-brand-700 text-white rounded disabled:opacity-50">
              Save Hours
            </button>
          </div>
        </section>
      )}
    </div>
  );
};

export default Settings;
