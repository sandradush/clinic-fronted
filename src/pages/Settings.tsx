import React, { useState } from 'react';
import { User, Shield, Palette, Sun, Moon, Camera } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../services/api';
import toast from 'react-hot-toast';

const Settings: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'profile' | 'password' | 'appearance'>('profile');
  const [theme, setTheme] = useState<'light' | 'dark'>(localStorage.getItem('theme') as 'light' | 'dark' || 'light');
  const [profileImage, setProfileImage] = useState<string>(localStorage.getItem('profileImage') || '');

  // Profile state
  const [name, setName] = useState(user?.name || 'David Johnson');
  const [email, setEmail] = useState(user?.email || 'david@gmail.com');
  const [phone, setPhone] = useState('+1 234 567 8900');

  // Password state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const imageData = reader.result as string;
        setProfileImage(imageData);
        localStorage.setItem('profileImage', imageData);
        toast.success('Profile picture updated!');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleThemeChange = (newTheme: 'light' | 'dark') => {
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    
    if (newTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    
    toast.success(`Theme changed to ${newTheme} mode`);
  };

  const handleProfileSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await api.updateProfile({ name, email, phone });
      console.log('Profile update response:', response);
      toast.success('Profile updated successfully!');
      // Update local user data
      const userData = JSON.parse(localStorage.getItem('user') || '{}');
      userData.name = name;
      userData.email = email;
      localStorage.setItem('user', JSON.stringify(userData));
    } catch (error: any) {
      console.error('Failed to update profile:', error);
      console.error('Error details:', error.message);
      toast.error('Failed to update profile. Please try again.');
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword || !newPassword) {
      toast.error('Please fill all fields');
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    if (newPassword.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    
    try {
      await api.changePassword({ currentPassword, newPassword });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      toast.success('Password changed successfully!');
    } catch (error) {
      console.error('Failed to change password:', error);
      toast.error('Failed to change password. Please check your current password.');
    }
  };

  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold">Settings</h1>
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
          <button className={`w-full text-left px-3 py-2 rounded mt-2 ${activeTab === 'appearance' ? 'bg-blue-50 font-semibold' : 'hover:bg-gray-50'}`} onClick={() => setActiveTab('appearance')}>
            <div className="flex items-center gap-2"><Palette size={16} /> Appearance</div>
          </button>
        </aside>

        <div className="flex-1">
          {activeTab === 'profile' && (
            <form onSubmit={handleProfileSave} className="space-y-4 max-w-2xl">
              <div className="flex items-center gap-4">
                <div className="relative">
                  {profileImage ? (
                    <img src={profileImage} alt="Profile" className="w-16 h-16 rounded-full object-cover" />
                  ) : (
                    <div className="w-16 h-16 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 text-xl font-semibold">
                      {(name || 'U').split(' ').map(n=>n[0]).slice(0,2).join('')}
                    </div>
                  )}
                  <label className="absolute bottom-0 right-0 w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center cursor-pointer hover:bg-blue-700">
                    <Camera size={14} className="text-white" />
                    <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                  </label>
                </div>
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

          {activeTab === 'appearance' && (
            <div className="max-w-md space-y-4">
              <div>
                <h3 className="text-lg font-semibold mb-4">Theme</h3>
              </div>

              <div className="space-y-3">
                <button
                  onClick={() => handleThemeChange('light')}
                  className={`w-full flex items-center justify-between p-4 border-2 rounded-lg transition-all ${
                    theme === 'light' ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Sun size={24} className="text-yellow-500" />
                    <div className="text-left">
                      <div className="font-medium">Light Mode</div>
                    </div>
                  </div>
                  {theme === 'light' && (
                    <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                      <div className="w-2 h-2 bg-white rounded-full"></div>
                    </div>
                  )}
                </button>

                <button
                  onClick={() => handleThemeChange('dark')}
                  className={`w-full flex items-center justify-between p-4 border-2 rounded-lg transition-all ${
                    theme === 'dark' ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Moon size={24} className="text-indigo-500" />
                    <div className="text-left">
                      <div className="font-medium">Dark Mode</div>
                    </div>
                  </div>
                  {theme === 'dark' && (
                    <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                      <div className="w-2 h-2 bg-white rounded-full"></div>
                    </div>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Settings;