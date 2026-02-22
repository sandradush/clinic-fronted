<<<<<<< HEAD
import React, { useState } from 'react';
=======
import React, { useState, useEffect } from 'react';
import { Users, CreditCard, Bed, Key, Settings as SettingsIcon, Upload, Camera, Plus, Trash2, Shield } from 'lucide-react';
import { makeApiRequest, uploadProfileImage } from '../utils/api';
import { useAuth } from '../contexts/AuthContext';
>>>>>>> bfdfd7ab5737074acaafdbe6deba76451d4cf2ca
import toast from 'react-hot-toast';
import { makeApiRequest } from '../utils/api';

<<<<<<< HEAD
type SettingsTab = 'general' | 'billing' | 'hours';
=======
type TabKey = 'roles' | 'insurances' | 'rooms' | 'permissions' | 'system' | 'profile';
>>>>>>> bfdfd7ab5737074acaafdbe6deba76451d4cf2ca

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
<<<<<<< HEAD
=======
  const [newName, setNewName] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [systemTab, setSystemTab] = useState<'general' | 'operations' | 'billing' | 'audit'>('general');

  // System configuration state (General)
  const [clinicName, setClinicName] = useState('King Faisal Hospital - Clinova Branch');
  const systemId = 'CLIN-KGL-001';
  const [primaryAddress, setPrimaryAddress] = useState('KG 544 St, Kigali, Rwanda');
  const [defaultLanguage, setDefaultLanguage] = useState('English');
  const [baseCurrency, setBaseCurrency] = useState('RWF (Rwandan Franc)');
  // Operations (Operating hours)
  const [operatingHours, setOperatingHours] = useState<Array<{ day: string; enabled: boolean; open: string; close: string }>>([
    { day: 'Monday', enabled: true, open: '08:00', close: '17:00' },
    { day: 'Tuesday', enabled: true, open: '08:00', close: '17:00' },
    { day: 'Wednesday', enabled: true, open: '08:00', close: '17:00' },
    { day: 'Thursday', enabled: true, open: '08:00', close: '17:00' },
    { day: 'Friday', enabled: true, open: '08:00', close: '17:00' },
    { day: 'Saturday', enabled: false, open: '09:00', close: '13:00' },
    { day: 'Sunday', enabled: false, open: '00:00', close: '00:00' },
  ]);

  // Billing
  const [taxRate, setTaxRate] = useState<number>(18);
  const [paymentGateway, setPaymentGateway] = useState<string>('stripe');

  // Audit logs
  const [auditLogs, setAuditLogs] = useState<Array<{ id: string; time: string; user?: string; action: string; ip?: string; severity?: string }>>([]);
  const [auditFilterSeverity, setAuditFilterSeverity] = useState<string>('all');
  const [auditLoading, setAuditLoading] = useState(false);
  
  // Profile image state
  const [profileImage, setProfileImage] = useState<File | null>(null);
  const [profileImagePreview, setProfileImagePreview] = useState<string | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [currentProfileImage, setCurrentProfileImage] = useState<string | null>(null);
>>>>>>> bfdfd7ab5737074acaafdbe6deba76451d4cf2ca

  const [clinicName, setClinicName] = useState('King Faisal Hospital - Clinova Branch');
  const [primaryAddress, setPrimaryAddress] = useState('KG 544 St, Kigali, Rwanda');
  const [defaultLanguage, setDefaultLanguage] = useState('English');

<<<<<<< HEAD
  const [baseCurrency, setBaseCurrency] = useState('RWF (Rwandan Franc)');
  const [taxRate, setTaxRate] = useState<number>(18);
  const [paymentGateway, setPaymentGateway] = useState<string>('stripe');

  const [operatingHours, setOperatingHours] = useState(defaultHours);
=======
  useEffect(() => {
    const fetchList = async () => {
      try {
        setLoading(true);
        if (activeTab === 'roles') {
          const data = await makeApiRequest('/roles');
          setRoles(data || []);
        } else if (activeTab === 'insurances') {
          const data = await makeApiRequest('/insurances');
          setInsurances(data || []);
        } else if (activeTab === 'rooms') {
          const data = await makeApiRequest('/rooms');
          setRooms(data || []);
        } else if (activeTab === 'permissions') {
          const data = await makeApiRequest('/permissions');
          setPermissions(data || []);
        }
        // load audit logs when system tab is active and audit selected
        if (activeTab === 'system' && systemTab === 'audit') {
          setAuditLoading(true);
          try {
            const logs = await makeApiRequest('/audit-logs');
            setAuditLogs(Array.isArray(logs) ? logs : (logs?.data || []));
          } catch (err) {
            // fallback to mock logs
            setAuditLogs([
              { id: '1', time: new Date().toISOString(), user: 'admin', action: 'User login', ip: '192.168.1.10', severity: 'info' },
              { id: '2', time: new Date().toISOString(), user: 'system', action: 'Failed payment attempt', ip: '192.168.1.12', severity: 'warning' },
              { id: '3', time: new Date().toISOString(), user: 'security', action: 'Disabled 2FA for user', ip: '192.168.1.15', severity: 'critical' },
            ]);
          } finally {
            setAuditLoading(false);
          }
        }
      } catch (err) {
        console.error('Failed to load list data', err);
        toast.error('Failed to load data');
      } finally {
        setLoading(false);
      }
    };

    fetchList();
  }, [activeTab, systemTab]);

  // Default permission sets and descriptions for when API doesn't provide detailed role info
  const roleDefaultPermissions: Record<string, string[]> = {
    Doctor: ['View Dashboard', 'View Patient Records', 'Consult Patients', 'Write Prescriptions'],
    Receptionist: ['View Dashboard', 'Reception Access', 'Assign Appointments', 'Manage Clinic Schedule', 'View Patient Directory'],
    'System Admin': ['View Dashboard', 'Manage Staff', 'Approve Doctors', 'Assign Appointments', 'View Patient Records', 'Consult Patients', 'Write Prescriptions', 'Reception Access'],
  };

  const roleDefaultDescriptions: Record<string, string> = {
    Doctor: 'Clinical staff for patient care',
    Receptionist: 'Front desk management — handles scheduling and patient directory',
    'System Admin': 'Full platform access',
  };
>>>>>>> bfdfd7ab5737074acaafdbe6deba76451d4cf2ca

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

  const saveOperatingHours = async () => {
    try {
      setLoading(true);
      await makeApiRequest('/settings/operating-hours', { method: 'POST', body: JSON.stringify({ hours: operatingHours }) });
      toast.success('Operating hours saved');
    } catch (err) {
      console.error('Failed to save operating hours', err);
      toast.error('Failed to save operating hours');
    } finally {
      setLoading(false);
    }
  };

  const saveBilling = async () => {
    try {
      setLoading(true);
      await makeApiRequest('/settings/billing', { method: 'POST', body: JSON.stringify({ baseCurrency, taxRate, paymentGateway }) });
      toast.success('Billing settings saved');
    } catch (err) {
      console.error('Failed to save billing settings', err);
      toast.error('Failed to save billing settings');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-2">Settings</h1>
      <p className="text-sm text-gray-500 mb-6">Update clinic details, billing, and operating hours.</p>

<<<<<<< HEAD
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
=======
      <div className="flex gap-6">
        {/* Left menu */}
        <nav className="w-64 bg-white border rounded-lg shadow-sm p-4">
          <ul className="space-y-1">
            <li>
              <button
                onClick={() => setActiveTab('roles')}
                className={`w-full text-left flex items-center gap-3 px-3 py-2 rounded ${activeTab === 'roles' ? 'bg-blue-500 text-white' : 'hover:bg-gray-50'}`}
              >
                <Users size={18} />
                <span>Roles</span>
              </button>
            </li>

            <li>
              <button
                onClick={() => setActiveTab('insurances')}
                className={`w-full text-left flex items-center gap-3 px-3 py-2 rounded ${activeTab === 'insurances' ? 'bg-blue-500 text-white' : 'hover:bg-gray-50'}`}
              >
                <CreditCard size={18} />
                <span>Insurances</span>
              </button>
            </li>

            <li>
              <button
                onClick={() => setActiveTab('rooms')}
                className={`w-full text-left flex items-center gap-3 px-3 py-2 rounded ${activeTab === 'rooms' ? 'bg-blue-500 text-white' : 'hover:bg-gray-50'}`}
              >
                <Bed size={18} />
                <span>Rooms & Beds</span>
              </button>
            </li>

            <li>
              <button
                onClick={() => setActiveTab('permissions')}
                className={`w-full text-left flex items-center gap-3 px-3 py-2 rounded ${activeTab === 'permissions' ? 'bg-blue-500 text-white' : 'hover:bg-gray-50'}`}
              >
                <Key size={18} />
                <span>Permissions</span>
              </button>
            </li>

            <li>
              <button
                onClick={() => setActiveTab('system')}
                className={`w-full text-left flex items-center gap-3 px-3 py-2 rounded ${activeTab === 'system' ? 'bg-blue-500 text-white' : 'hover:bg-gray-50'}`}
              >
                <SettingsIcon size={18} />
                <span>System Configuration</span>
              </button>
            </li>

            <li>
              <button
                onClick={() => setActiveTab('profile')}
                className={`w-full text-left flex items-center gap-3 px-3 py-2 rounded ${activeTab === 'profile' ? 'bg-blue-500 text-white' : 'hover:bg-gray-50'}`}
              >
                <Camera size={18} />
                <span>Profile</span>
              </button>
            </li>
          </ul>
        </nav>

        {/* Content panel */}
        <main className="flex-1">
          {activeTab === 'roles' && (
            <section className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-start justify-between mb-4">
                <h2 className="text-lg font-semibold">Role & Permission Management</h2>
                <div className="flex items-center gap-3">
                  {!showAddForm ? (
                    <button
                      onClick={() => { setShowAddForm(true); setNewName(''); }}
                      className="inline-flex items-center gap-2 px-3 py-2 bg-blue-800 text-white rounded-lg hover:bg-blue-900"
                    >
                      <Plus size={14} />
                      Create New Role
                    </button>
                  ) : (
                    <div className="flex items-center gap-2">
                      <input className="border rounded px-3 py-2" placeholder="New role name" value={newName} onChange={(e) => setNewName(e.target.value)} />
                      <button className="px-3 py-2 bg-green-500 text-white rounded" onClick={async () => { await handleAdd(); setShowAddForm(false); }}>Add</button>
                      <button className="px-3 py-2 bg-gray-100 rounded" onClick={() => setShowAddForm(false)}>Cancel</button>
                    </div>
                  )}
                </div>
              </div>

              {loading ? <div>Loading...</div> : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {roles.map((r: any) => {
                    const permissionsList: string[] = r.permissions && Array.isArray(r.permissions)
                      ? r.permissions
                      : (roleDefaultPermissions[r.name] || []);
                    const description = r.description || roleDefaultDescriptions[r.name] || '';
                    const staffAssigned = r.staffAssigned ?? r.staffCount ?? 0;

                    return (
                      <div key={r.id} className="p-6 border rounded-lg bg-white shadow-sm">
                        <div className="flex items-start justify-between mb-4">
                          <div>
                            <h3 className="text-lg font-semibold">{r.name}</h3>
                            {description && <p className="text-sm text-gray-500">{description}</p>}
                          </div>
                          <div className="text-gray-300">
                            <Shield size={20} />
                          </div>
                        </div>

                        <div className="mb-4">
                          <p className="text-xs text-gray-400 mb-2">ACTIVE PERMISSIONS</p>
                          <div className="flex flex-wrap gap-2">
                            {permissionsList.length ? permissionsList.map((p, idx) => (
                              <span key={idx} className="text-xs px-2 py-1 bg-gray-100 rounded text-gray-700">{p}</span>
                            )) : (
                              <span className="text-xs text-gray-400">No permissions assigned</span>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center justify-between text-sm text-gray-500">
                          <div>{staffAssigned} Staff Assigned</div>
                          <button onClick={async () => { if (window.confirm('Delete role?')) { try { await makeApiRequest(`/roles/${r.id}`, { method: 'DELETE' }); setRoles((prev) => prev.filter(x => x.id !== r.id)); } catch (err) { console.error(err); } } }} className="text-red-500 hover:text-red-600">
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </section>
          )}

          {activeTab === 'insurances' && (
            <section className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold mb-4">Insurances Management</h2>
              <div className="mb-4">
                <div className="flex gap-2 max-w-md">
                  <input className="flex-1 border rounded px-3 py-2" placeholder="New insurance name" value={newName} onChange={(e) => setNewName(e.target.value)} />
                  <button className="px-4 py-2 bg-green-500 text-white rounded" onClick={handleAdd}>Add</button>
                </div>
              </div>
              {loading ? <div>Loading...</div> : (
                <ul className="space-y-2">
                  {insurances.map(i => <li key={i.id} className="p-3 border rounded">{i.name}</li>)}
                </ul>
              )}
            </section>
          )}

          {activeTab === 'rooms' && (
            <section className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold mb-4">Room & Bed Management</h2>
              <div className="mb-4">
                <div className="flex gap-2 max-w-md">
                  <input className="flex-1 border rounded px-3 py-2" placeholder="New room name/number" value={newName} onChange={(e) => setNewName(e.target.value)} />
                  <button className="px-4 py-2 bg-green-500 text-white rounded" onClick={handleAdd}>Add</button>
                </div>
              </div>
              {loading ? <div>Loading...</div> : (
                <ul className="space-y-2">
                  {rooms.map(r => <li key={r.id} className="p-3 border rounded">{r.name}</li>)}
                </ul>
              )}
            </section>
          )}

          {activeTab === 'permissions' && (
            <section className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold mb-4">Permissions Management</h2>
              <div className="mb-4">
                <div className="flex gap-2 max-w-md">
                  <input className="flex-1 border rounded px-3 py-2" placeholder="New permission key" value={newName} onChange={(e) => setNewName(e.target.value)} />
                  <button className="px-4 py-2 bg-green-500 text-white rounded" onClick={handleAdd}>Add</button>
                </div>
              </div>
              {loading ? <div>Loading...</div> : (
                <ul className="space-y-2">
                  {permissions.map(p => <li key={p.id} className="p-3 border rounded">{p.name}</li>)}
                </ul>
              )}
            </section>
          )}

          {activeTab === 'system' && (
            <section className="bg-white rounded-lg shadow-sm p-6">
              <div className="mb-6">
                <h2 className="text-lg font-semibold">System Configuration</h2>
                <p className="text-sm text-gray-500">Fine-tune Clinova's operational and clinical settings.</p>
              </div>

              <div className="mb-6">
                <div className="inline-flex rounded-lg bg-gray-50 p-1 shadow-sm">
                  <button
                    onClick={() => setSystemTab('general')}
                    className={`px-4 py-2 rounded-md ${systemTab === 'general' ? 'bg-white shadow text-red-600 font-semibold' : 'text-gray-600'}`}
                  >
                    General
                  </button>
                  <button
                    onClick={() => setSystemTab('operations')}
                    className={`px-4 py-2 rounded-md ${systemTab === 'operations' ? 'bg-white shadow text-red-600 font-semibold' : 'text-gray-600'}`}
                  >
                    Operations
                  </button>
                  <button
                    onClick={() => setSystemTab('billing')}
                    className={`px-4 py-2 rounded-md ${systemTab === 'billing' ? 'bg-white shadow text-red-600 font-semibold' : 'text-gray-600'}`}
                  >
                    Billing
                  </button>
                  <button
                    onClick={() => setSystemTab('audit')}
                    className={`px-4 py-2 rounded-md ${systemTab === 'audit' ? 'bg-white shadow text-red-600 font-semibold' : 'text-gray-600'}`}
                  >
                    Audit Logs
                  </button>
                </div>
              </div>

              {systemTab === 'general' && (
                <div className="bg-white rounded-lg p-6 border">
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="col-span-2">
                      <div className="mb-6">
                        <h3 className="text-sm font-semibold text-gray-700 mb-2">Clinic Identity</h3>
                        <p className="text-xs text-gray-400 mb-4">Public information seen by patients in the mobile app.</p>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-xs text-gray-500 mb-1">Clinic Name</label>
                            <input value={clinicName} onChange={(e) => setClinicName(e.target.value)} className="w-full border rounded px-3 py-2 bg-gray-50" />
                          </div>

                          <div>
                            <label className="block text-xs text-gray-500 mb-1">System ID</label>
                            <input value={systemId} disabled className="w-full border rounded px-3 py-2 bg-gray-100 text-gray-500" />
                          </div>
                        </div>

                        <div className="mt-4">
                          <label className="block text-xs text-gray-500 mb-1">Primary Address</label>
                          <input value={primaryAddress} onChange={(e) => setPrimaryAddress(e.target.value)} className="w-full border rounded px-3 py-2 bg-gray-50" />
                        </div>
                      </div>

                      <div>
                        <h3 className="text-sm font-semibold text-gray-700 mb-2">Localization</h3>
                        <p className="text-xs text-gray-400 mb-4">Default display languages and regional standards.</p>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-xs text-gray-500 mb-1">Default Language</label>
                            <select value={defaultLanguage} onChange={(e) => setDefaultLanguage(e.target.value)} className="w-full border rounded px-3 py-2 bg-white">
                              <option>English</option>
                              <option>French</option>
                              <option>Kinyarwanda</option>
                            </select>
                          </div>

                          <div>
                            <label className="block text-xs text-gray-500 mb-1">Base Currency</label>
                            <select value={baseCurrency} onChange={(e) => setBaseCurrency(e.target.value)} className="w-full border rounded px-3 py-2 bg-white">
                              <option>RWF (Rwandan Franc)</option>
                              <option>USD (US Dollar)</option>
                              <option>EUR (Euro)</option>
                            </select>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="col-span-1">
                      <div className="p-4 border rounded-lg bg-gray-50 h-full">
                        <h4 className="text-sm font-semibold mb-2">Summary</h4>
                        <p className="text-sm text-gray-600 mb-4">Quick overview of the clinic identity and localization settings. Save changes to apply them across the system.</p>
                        <div className="flex flex-col gap-3 mt-4">
                          <button onClick={async () => { try { setLoading(true); await makeApiRequest('/settings', { method: 'POST', body: JSON.stringify({ clinicName, primaryAddress, defaultLanguage, baseCurrency }) }); toast.success('General settings saved'); } catch (err) { console.error(err); toast.error('Failed to save general settings'); } finally { setLoading(false); } }} className="px-4 py-2 bg-red-800 text-white rounded">Save Changes</button>
                          <button onClick={() => { setClinicName('King Faisal Hospital - Clinova Branch'); setPrimaryAddress('KG 544 St, Kigali, Rwanda'); setDefaultLanguage('English'); setBaseCurrency('RWF (Rwandan Franc)'); }} className="px-4 py-2 bg-white border rounded">Reset</button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {systemTab === 'operations' && (
                <div className="bg-white rounded-lg p-6 border">
                  <h3 className="text-lg font-semibold mb-4">Operating Hours</h3>
                  <p className="text-sm text-gray-500 mb-4">Configure clinic opening hours for each day of the week.</p>
                  <div className="space-y-3">
                    {operatingHours.map((h, idx) => (
                      <div key={h.day} className="flex items-center gap-4">
                        <div className="w-32 text-sm font-medium">{h.day}</div>
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
                      <button onClick={saveOperatingHours} className="px-4 py-2 bg-blue-700 text-white rounded">Save Operating Hours</button>
                    </div>
                  </div>
                </div>
              )}

              {systemTab === 'billing' && (
                <div className="bg-white rounded-lg p-6 border">
                  <h3 className="text-lg font-semibold mb-4">Billing Settings</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Base Currency</label>
                      <select value={baseCurrency} onChange={(e) => setBaseCurrency(e.target.value)} className="w-full border rounded px-3 py-2 bg-white">
                        <option>RWF (Rwandan Franc)</option>
                        <option>USD (US Dollar)</option>
                        <option>EUR (Euro)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Tax Rate (%)</label>
                      <input type="number" min={0} max={100} value={taxRate} onChange={(e) => setTaxRate(Number(e.target.value))} className="w-full border rounded px-3 py-2" />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-xs text-gray-500 mb-1">Payment Gateway</label>
                      <select value={paymentGateway} onChange={(e) => setPaymentGateway(e.target.value)} className="w-full border rounded px-3 py-2 bg-white">
                        <option value="stripe">Stripe</option>
                        <option value="paystack">Paystack</option>
                        <option value="flutterwave">Flutterwave</option>
                      </select>
                    </div>
                  </div>

                  <div className="mt-4">
                    <button onClick={saveBilling} className="px-4 py-2 bg-blue-700 text-white rounded">Save Billing Settings</button>
                  </div>
                </div>
              )}

              {systemTab === 'audit' && (
                <div className="bg-white rounded-lg p-6 border">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-semibold">Audit & Security Logs</h3>
                      <p className="text-sm text-gray-500">Recent security and system events. Filter and investigate suspicious activity.</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <select value={auditFilterSeverity} onChange={(e) => setAuditFilterSeverity(e.target.value)} className="border rounded px-2 py-1">
                        <option value="all">All</option>
                        <option value="info">Info</option>
                        <option value="warning">Warning</option>
                        <option value="critical">Critical</option>
                      </select>
                      <button onClick={() => { setSystemTab('audit'); }} className="px-3 py-1 bg-gray-100 rounded">Refresh</button>
                    </div>
                  </div>

                  {auditLoading ? (
                    <div>Loading logs...</div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-sm">
                        <thead>
                          <tr className="text-xs text-gray-500 uppercase">
                            <th className="px-3 py-2">Time</th>
                            <th className="px-3 py-2">User</th>
                            <th className="px-3 py-2">Action</th>
                            <th className="px-3 py-2">IP</th>
                            <th className="px-3 py-2">Severity</th>
                          </tr>
                        </thead>
                        <tbody>
                          {auditLogs.filter(l => auditFilterSeverity === 'all' ? true : (l.severity === auditFilterSeverity)).map(l => (
                            <tr key={l.id} className="border-t">
                              <td className="px-3 py-2 align-top">{new Date(l.time).toLocaleString()}</td>
                              <td className="px-3 py-2 align-top">{l.user || 'system'}</td>
                              <td className="px-3 py-2 align-top">{l.action}</td>
                              <td className="px-3 py-2 align-top">{l.ip || '-'}</td>
                              <td className="px-3 py-2 align-top"><span className={`px-2 py-1 rounded text-xs ${l.severity === 'critical' ? 'bg-red-100 text-red-700' : l.severity === 'warning' ? 'bg-yellow-100 text-yellow-700' : 'bg-green-100 text-green-700'}`}>{l.severity}</span></td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}
            </section>
          )}

          {activeTab === 'profile' && (
            <section className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold mb-4">Profile Settings</h2>
              
              <div className="flex flex-col items-center">
                {/* Profile Image Display */}
                <div className="mb-6">
                  <div className="w-32 h-32 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden border-4 border-blue-500">
                    {currentProfileImage || profileImagePreview ? (
                      <img 
                        src={profileImagePreview || currentProfileImage || ''} 
                        alt="Profile" 
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <Camera size={48} className="text-gray-400" />
                    )}
                  </div>
                </div>

                {/* User Info */}
                <div className="mb-6 text-center">
                  <h3 className="text-xl font-semibold">{user?.name || 'User'}</h3>
                  <p className="text-gray-500">{user?.email}</p>
                  <p className="text-sm text-gray-400 capitalize">{user?.role}</p>
                </div>

                {/* Image Upload */}
                <div className="w-full max-w-md">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Upload Profile Image
                  </label>
                  <div className="flex items-center gap-4">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          setProfileImage(file);
                          // Create preview URL
                          const reader = new FileReader();
                          reader.onloadend = () => {
                            setProfileImagePreview(reader.result as string);
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                      className="block w-full text-sm text-gray-500
                        file:mr-4 file:py-2 file:px-4
                        file:rounded-full file:border-0
                        file:text-sm file:font-semibold
                        file:bg-blue-50 file:text-blue-700
                        hover:file:bg-blue-100"
                    />
                  </div>
                  
                  {profileImage && (
                    <div className="mt-4">
                      <p className="text-sm text-gray-600 mb-2">
                        Selected: {profileImage.name}
                      </p>
                      <button
                        onClick={async () => {
                          if (!user?.id) {
                            toast.error('User not found. Please login again.');
                            return;
                          }
                          
                          try {
                            setUploadingImage(true);
                            const userId = parseInt(user.id);
                            await uploadProfileImage(userId, profileImage);
                            
                            // Save to localStorage for display
                            localStorage.setItem('profileImage', profileImagePreview || '');
                            setCurrentProfileImage(profileImagePreview);
                            
                            toast.success('Profile image uploaded successfully!');
                            setProfileImage(null);
                          } catch (error) {
                            console.error('Failed to upload profile image:', error);
                            toast.error('Failed to upload profile image');
                          } finally {
                            setUploadingImage(false);
                          }
                        }}
                        disabled={uploadingImage}
                        className="w-full px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 flex items-center justify-center gap-2"
                      >
                        <Upload size={18} />
                        {uploadingImage ? 'Uploading...' : 'Upload Image'}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </section>
          )}
        </main>
>>>>>>> bfdfd7ab5737074acaafdbe6deba76451d4cf2ca
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
