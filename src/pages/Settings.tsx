import React, { useState } from 'react';
import { User, Bell, Shield, Palette, Database, Globe, LogOut } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const Settings: React.FC = () => {
  const [activeTab, setActiveTab] = useState('account');
  const { user, logout } = useAuth();

  const tabs = [
    { id: 'account', label: 'Account', icon: User },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'appearance', label: 'Appearance', icon: Palette },
    { id: 'data', label: 'Data', icon: Database },
    { id: 'system', label: 'System', icon: Globe },
  ];

  return (
    <div className="settings-page">
      <div className="page-header">
        <div>
          <h1>Settings</h1>
          <p className="subtitle">Manage your clinic preferences and configuration</p>
        </div>
      </div>

      <div className="settings-layout">
        <div className="settings-sidebar">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`settings-tab ${activeTab === tab.id ? 'active' : ''}`}
              >
                <Icon size={18} />
                {tab.label}
              </button>
            );
          })}
        </div>

        <div className="settings-content">
          {activeTab === 'account' && (
            <div className="settings-section">
              <div className="account-header">
                <div className="user-avatar-large">
                  <User size={32} />
                </div>
                <div className="account-info">
                  <h3>{user?.name || 'User'}</h3>
                  <p>{user?.email || 'david@gmail.com'}</p>
                </div>
              </div>
              
              <div className="form-group">
                <label className="form-label">Full Name</label>
                <input type="text" className="form-input" defaultValue={user?.name || 'David Johnson'} />
              </div>
              <div className="form-group">
                <label className="form-label">Email</label>
                <input type="email" className="form-input" defaultValue={user?.email || 'david@gmail.com'} />
              </div>
              <div className="form-group">
                <label className="form-label">Phone</label>
                <input type="tel" className="form-input" defaultValue="+1 234 567 8900" />
              </div>
              <div className="form-group">
                <label className="form-label">Role</label>
                <input type="text" className="form-input" defaultValue="Administrator" disabled />
              </div>
              
              <div className="account-actions">
                <button className="btn btn-primary">Save Changes</button>
              </div>
            </div>
          )}

          {activeTab === 'profile' && (
            <div className="settings-section">
              <h3>Profile Settings</h3>
              <div className="form-group">
                <label className="form-label">Clinic Name</label>
                <input type="text" className="form-input" defaultValue="HealthCare Clinic" />
              </div>
              <div className="form-group">
                <label className="form-label">Administrator Name</label>
                <input type="text" className="form-input" defaultValue="Dr. Sandra" />
              </div>
              <div className="form-group">
                <label className="form-label">Email</label>
                <input type="email" className="form-input" defaultValue="admin@clinic.com" />
              </div>
              <div className="form-group">
                <label className="form-label">Phone</label>
                <input type="tel" className="form-input" defaultValue="+1 234 567 8900" />
              </div>
              <button className="btn btn-primary">Save Changes</button>
            </div>
          )}

          {activeTab === 'notifications' && (
            <div className="settings-section">
              <h3>Notification Preferences</h3>
              <div className="setting-item">
                <div>
                  <h4>Email Notifications</h4>
                  <p>Receive appointment reminders via email</p>
                </div>
                <input type="checkbox" defaultChecked />
              </div>
              <div className="setting-item">
                <div>
                  <h4>SMS Notifications</h4>
                  <p>Get text messages for urgent updates</p>
                </div>
                <input type="checkbox" defaultChecked />
              </div>
              <div className="setting-item">
                <div>
                  <h4>Desktop Notifications</h4>
                  <p>Show browser notifications</p>
                </div>
                <input type="checkbox" />
              </div>
            </div>
          )}

          {activeTab === 'security' && (
            <div className="settings-section">
              <h3>Security Settings</h3>
              <div className="form-group">
                <label className="form-label">Current Password</label>
                <input type="password" className="form-input" />
              </div>
              <div className="form-group">
                <label className="form-label">New Password</label>
                <input type="password" className="form-input" />
              </div>
              <div className="form-group">
                <label className="form-label">Confirm Password</label>
                <input type="password" className="form-input" />
              </div>
              <div className="setting-item">
                <div>
                  <h4>Two-Factor Authentication</h4>
                  <p>Add extra security to your account</p>
                </div>
                <button className="btn btn-outline">Enable</button>
              </div>
            </div>
          )}

          {activeTab === 'appearance' && (
            <div className="settings-section">
              <h3>Appearance Settings</h3>
              <div className="form-group">
                <label className="form-label">Theme</label>
                <select className="form-select">
                  <option>Light</option>
                  <option>Dark</option>
                  <option>Auto</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Language</label>
                <select className="form-select">
                  <option>English</option>
                  <option>French</option>
                  <option>Spanish</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Date Format</label>
                <select className="form-select">
                  <option>MM/DD/YYYY</option>
                  <option>DD/MM/YYYY</option>
                  <option>YYYY-MM-DD</option>
                </select>
              </div>
            </div>
          )}

          {activeTab === 'data' && (
            <div className="settings-section">
              <h3>Data Management</h3>
              <div className="setting-item">
                <div>
                  <h4>Export Data</h4>
                  <p>Download all clinic data as backup</p>
                </div>
                <button className="btn btn-outline">Export</button>
              </div>
              <div className="setting-item">
                <div>
                  <h4>Import Data</h4>
                  <p>Import data from previous system</p>
                </div>
                <button className="btn btn-outline">Import</button>
              </div>
              <div className="setting-item">
                <div>
                  <h4>Clear Cache</h4>
                  <p>Clear temporary data and cache</p>
                </div>
                <button className="btn btn-outline">Clear</button>
              </div>
            </div>
          )}

          {activeTab === 'system' && (
            <div className="settings-section">
              <h3>System Information</h3>
              <div className="info-grid">
                <div className="info-item">
                  <span className="info-label">Version</span>
                  <span className="info-value">1.0.0</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Last Updated</span>
                  <span className="info-value">Jan 15, 2024</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Database</span>
                  <span className="info-value">Connected</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Storage Used</span>
                  <span className="info-value">2.4 GB</span>
                </div>
              </div>
              <button className="btn btn-outline">Check for Updates</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Settings;