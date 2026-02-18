import React, { useState, useEffect } from 'react';
import { Users, CreditCard, Bed, Key, Settings as SettingsIcon, Upload, Camera } from 'lucide-react';
import { makeApiRequest, uploadProfileImage } from '../utils/api';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';

type TabKey = 'roles' | 'insurances' | 'rooms' | 'permissions' | 'more' | 'profile';

interface SimpleItem { id: number; name: string }

const Settings: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabKey>('roles');
  const { user } = useAuth();

  const [roles, setRoles] = useState<SimpleItem[]>([]);
  const [insurances, setInsurances] = useState<SimpleItem[]>([]);
  const [rooms, setRooms] = useState<SimpleItem[]>([]);
  const [permissions, setPermissions] = useState<SimpleItem[]>([]);

  const [loading, setLoading] = useState(false);
  const [newName, setNewName] = useState('');
  
  // Profile image state
  const [profileImage, setProfileImage] = useState<File | null>(null);
  const [profileImagePreview, setProfileImagePreview] = useState<string | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [currentProfileImage, setCurrentProfileImage] = useState<string | null>(null);

  // Load saved profile image from localStorage
  useEffect(() => {
    const savedImage = localStorage.getItem('profileImage');
    if (savedImage) {
      setCurrentProfileImage(savedImage);
    }
  }, []);

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
      } catch (err) {
        console.error('Failed to load list data', err);
        toast.error('Failed to load data');
      } finally {
        setLoading(false);
      }
    };

    fetchList();
  }, [activeTab]);

  const handleAdd = async () => {
    if (!newName.trim()) return toast.error('Enter a name');
    try {
      let endpoint = '';
      if (activeTab === 'roles') endpoint = '/roles';
      if (activeTab === 'insurances') endpoint = '/insurances';
      if (activeTab === 'rooms') endpoint = '/rooms';
      if (activeTab === 'permissions') endpoint = '/permissions';
      if (!endpoint) return;

      await makeApiRequest(endpoint, { method: 'POST', body: JSON.stringify({ name: newName.trim() }) });
      toast.success('Added');
      setNewName('');
      // refresh
      setActiveTab((t) => t);
    } catch (err) {
      console.error('Failed to add', err);
      toast.error('Failed to add item');
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-6">Settings</h1>

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
                onClick={() => setActiveTab('more')}
                className={`w-full text-left flex items-center gap-3 px-3 py-2 rounded ${activeTab === 'more' ? 'bg-blue-500 text-white' : 'hover:bg-gray-50'}`}
              >
                <SettingsIcon size={18} />
                <span>More</span>
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
              <h2 className="text-lg font-semibold mb-4">Roles Management</h2>
              <div className="mb-4">
                <div className="flex gap-2 max-w-md">
                  <input className="flex-1 border rounded px-3 py-2" placeholder="New role name" value={newName} onChange={(e) => setNewName(e.target.value)} />
                  <button className="px-4 py-2 bg-green-500 text-white rounded" onClick={handleAdd}>Add</button>
                </div>
              </div>
              {loading ? <div>Loading...</div> : (
                <ul className="space-y-2">
                  {roles.map(r => <li key={r.id} className="p-3 border rounded flex items-center justify-between">{r.name}</li>)}
                </ul>
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

          {activeTab === 'more' && (
            <section className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold mb-4">More Settings</h2>
              <p className="text-sm text-gray-600">Add additional system settings here (feature flags, integrations, audit retention, etc.).</p>
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
      </div>
    </div>
  );
};

export default Settings;
