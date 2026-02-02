import React, { useState } from 'react';
import { User, Shield } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const Settings: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'profile' | 'password'>('profile');

  // Profile state
  const [name, setName] = useState(user?.name || 'David Johnson');
  const [email, setEmail] = useState(user?.email || 'david@gmail.com');
  const [phone, setPhone] = useState('+1 234 567 8900');

  // Password state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleProfileSave = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: wire to API
    alert('Profile updated');
  };

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword || !newPassword) return alert('Please fill all fields');
    if (newPassword !== confirmPassword) return alert('Passwords do not match');
    // TODO: call change-password API
    setCurrentPassword(''); setNewPassword(''); setConfirmPassword('');
    alert('Password changed');
  };

  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold">Settings</h1>
          <p className="text-sm text-gray-600">Profile and security</p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm p-4 flex gap-6">
        <aside className="w-48 border-r pr-4">
          <button className={`w-full text-left px-3 py-2 rounded ${activeTab === 'profile' ? 'bg-blue-50 font-semibold' : 'hover:bg-gray-50'}`} onClick={() => setActiveTab('profile')}>
            <div className="flex items-center gap-2"><User size={16} /> Profile</div>
          </button>
          <button className={`w-full text-left px-3 py-2 rounded mt-2 ${activeTab === 'password' ? 'bg-blue-50 font-semibold' : 'hover:bg-gray-50'}`} onClick={() => setActiveTab('password')}>
            <div className="flex items-center gap-2"><Shield size={16} /> Change Password</div>
          </button>
        </aside>

        <div className="flex-1">
          {activeTab === 'profile' && (
            <form onSubmit={handleProfileSave} className="space-y-4 max-w-2xl">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 text-xl font-semibold">{(name || 'U').split(' ').map(n=>n[0]).slice(0,2).join('')}</div>
                <div>
                  <div className="text-lg font-medium">{name}</div>
                  <div className="text-sm text-gray-500">{email}</div>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium">Full name</label>
                <input className="mt-1 block w-full border rounded px-3 py-2" value={name} onChange={e=>setName(e.target.value)} />
              </div>

              <div>
                <label className="text-sm font-medium">Email</label>
                <input className="mt-1 block w-full border rounded px-3 py-2" value={email} onChange={e=>setEmail(e.target.value)} />
              </div>

              <div>
                <label className="text-sm font-medium">Phone</label>
                <input className="mt-1 block w-full border rounded px-3 py-2" value={phone} onChange={e=>setPhone(e.target.value)} />
              </div>

              <div className="pt-4">
                <button className="px-4 py-2 bg-blue-600 text-white rounded">Save profile</button>
              </div>
            </form>
          )}

          {activeTab === 'password' && (
            <form onSubmit={handleChangePassword} className="max-w-md space-y-4">
              <div>
                <label className="text-sm font-medium">Current password</label>
                <input type="password" className="mt-1 block w-full border rounded px-3 py-2" value={currentPassword} onChange={e=>setCurrentPassword(e.target.value)} />
              </div>

              <div>
                <label className="text-sm font-medium">New password</label>
                <input type="password" className="mt-1 block w-full border rounded px-3 py-2" value={newPassword} onChange={e=>setNewPassword(e.target.value)} />
              </div>

              <div>
                <label className="text-sm font-medium">Confirm new password</label>
                <input type="password" className="mt-1 block w-full border rounded px-3 py-2" value={confirmPassword} onChange={e=>setConfirmPassword(e.target.value)} />
              </div>

              <div className="pt-2">
                <button className="px-4 py-2 bg-blue-600 text-white rounded">Change password</button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default Settings;