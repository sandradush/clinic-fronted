import React, { useEffect, useState } from 'react';
import { Plus, Trash2, Shield, RefreshCw } from 'lucide-react';
import { makeApiRequest } from '../utils/api';
import toast from 'react-hot-toast';
import { useAuth } from '../contexts/AuthContext';

interface RoleItem {
  id: number | string;
  name: string;
  permissions?: string[];
  description?: string;
  staffAssigned?: number;
  staffCount?: number;
}

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

const RolesPage: React.FC = () => {
  const { user } = useAuth();
  const [roles, setRoles] = useState<RoleItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [newName, setNewName] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [errors, setErrors] = useState<{ name?: string; description?: string }>({});

  const loadRoles = async () => {
    try {
      setLoading(true);
      const data = await makeApiRequest('/roles');
      const list = data || [];
      setRoles(list);

      // If Receptionist role is not present, create it with sensible defaults
      const hasReceptionist = list.some((r: any) => String(r.name).toLowerCase() === 'receptionist');
      if (!hasReceptionist) {
        try {
          await makeApiRequest('/roles', { method: 'POST', body: JSON.stringify({ name: 'Receptionist', permissions: roleDefaultPermissions['Receptionist'] }) });
          toast.success('Receptionist role created');
          // reload roles
          const refreshed = await makeApiRequest('/roles');
          setRoles(refreshed || []);
        } catch (err) {
          console.warn('Could not create Receptionist role automatically.', err);
        }
      }
    } catch (err) {
      console.error('Failed to load roles', err);
      toast.error('Failed to load roles');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadRoles(); }, []);

  const handleAdd = async () => {
    if (!newName.trim()) return toast.error('Enter a role name');
    try {
      setLoading(true);
      await makeApiRequest('/roles', { method: 'POST', body: JSON.stringify({ name: newName.trim(), description: newDescription.trim() }) });
      toast.success('Role created');
      setNewName('');
      setNewDescription('');
      setShowAddForm(false);
      await loadRoles();
    } catch (err) {
      console.error('Failed to add role', err);
      toast.error('Failed to add role');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number | string) => {
    if (!window.confirm('Delete role?')) return;
    try {
      setLoading(true);
      await makeApiRequest(`/roles/${id}`, { method: 'DELETE' });
      setRoles((prev) => prev.filter(r => String(r.id) !== String(id)));
      toast.success('Role deleted');
    } catch (err) {
      console.error('Failed to delete role', err);
      toast.error('Failed to delete role');
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  return (
    <div className="p-8">
      {/* Header Section */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-3xl font-semibold text-gray-900">Role & Permission Management</h1>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => { setShowAddForm(true); setNewName(''); setNewDescription(''); setErrors({}); }}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-brand-700 text-white rounded-lg hover:bg-brand-600 transition-colors shadow-sm"
          >
            <Plus size={18} />
            Create New Role
          </button>

          <button onClick={async () => { await loadRoles(); toast.success('Roles refreshed'); }} title="Refresh roles" className="inline-flex items-center gap-2 px-3 py-2 bg-gray-100 rounded hover:bg-gray-200">
            <RefreshCw size={16} />
            Refresh
          </button>
        </div>
      </div>

      {/* Add Role Modal - Moved outside the header div but inside the main div */}
      {showAddForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={() => { setShowAddForm(false); setErrors({}); }} />

          <div className="relative w-full max-w-2xl mx-4">
            <div className="bg-white rounded-lg p-6 shadow-xl border border-gray-100">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">Define System Role</h3>
                  <p className="text-sm text-gray-500">Add a concise role name and optional description.</p>
                </div>
                <button onClick={() => { setShowAddForm(false); setErrors({}); }} className="text-gray-400 hover:text-gray-600">✕</button>
              </div>

              <div className="mt-4 grid grid-cols-1 gap-4">
                <div>
                  <label className="block text-xs text-gray-600 mb-1">ROLE NAME</label>
                  <input
                    value={newName}
                    onChange={(e) => { setNewName(e.target.value); if (errors.name) setErrors(prev => ({ ...prev, name: undefined })); }}
                    className={`w-full bg-gray-50 border ${errors.name ? 'border-red-300' : 'border-gray-200'} rounded px-3 py-2 text-sm focus:outline-none`}
                    placeholder="e.g. Head Nurse"
                    autoFocus
                  />
                  {errors.name && <p className="text-xs text-red-600 mt-1">{errors.name}</p>}
                </div>

                <div>
                  <label className="block text-xs text-gray-600 mb-1">DESCRIPTION</label>
                  <textarea
                    value={newDescription}
                    onChange={(e) => { setNewDescription(e.target.value); if (errors.description) setErrors(prev => ({ ...prev, description: undefined })); }}
                    className={`w-full bg-gray-50 border ${errors.description ? 'border-red-300' : 'border-gray-200'} rounded px-3 py-2 text-sm h-28 resize-none focus:outline-none`}
                    placeholder="Purpose of this role..."
                    maxLength={250}
                  />
                  <div className="text-xs text-gray-400 mt-1">{newDescription.length}/250</div>
                  {errors.description && <p className="text-xs text-red-600 mt-1">{errors.description}</p>}
                </div>

                <div className="flex items-center justify-end gap-2">
                  <button
                    onClick={async () => {
                      const nameTrim = newName.trim();
                      const descTrim = newDescription.trim();
                      const newErrors: typeof errors = {};
                      if (!nameTrim) newErrors.name = 'Role name is required';
                      else if (nameTrim.length < 2) newErrors.name = 'Role name must be at least 2 characters';
                      if (descTrim.length > 250) newErrors.description = 'Description must be 250 characters or fewer';
                      if (Object.keys(newErrors).length) { setErrors(newErrors); return; }
                      await handleAdd();
                    }}
                    className="px-4 py-2 bg-brand-700 text-white rounded text-sm"
                  >
                    Save Role
                  </button>

                  <button onClick={() => { setShowAddForm(false); setErrors({}); }} className="px-4 py-2 bg-white border rounded text-sm">Cancel</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Roles Grid */}
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="text-gray-500">Loading roles...</div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {roles.map((r) => {
            const permissionsList = r.permissions && Array.isArray(r.permissions) 
              ? r.permissions 
              : (roleDefaultPermissions[r.name] || []);
            const description = r.description || roleDefaultDescriptions[r.name] || '';
            const staffAssigned = r.staffAssigned ?? r.staffCount ?? 0;

            return (
              <div 
                key={r.id} 
                className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow p-6"
              >
                {/* Role Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-gray-900">{r.name}</h3>
                    {description && (
                      <p className="text-sm text-gray-500 mt-1">{description}</p>
                    )}
                  </div>
                  <div className="text-gray-400">
                    <Shield size={24} />
                  </div>
                </div>

                {/* Active Permissions */}
                <div className="mb-6">
                  <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-3">
                    ACTIVE PERMISSIONS
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {permissionsList.length ? (
                      permissionsList.map((p, idx) => (
                        <span 
                          key={idx} 
                          className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800"
                        >
                          {p}
                        </span>
                      ))
                    ) : (
                      <span className="text-xs text-gray-400 italic">No permissions assigned</span>
                    )}
                  </div>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                  <div className="text-sm text-gray-600">
                    <span className="font-medium">{staffAssigned}</span> Staff Assigned
                  </div>
                  <button 
                    onClick={() => handleDelete(r.id)} 
                    className="text-gray-400 hover:text-red-600 transition-colors p-1 rounded-lg hover:bg-red-50"
                    title="Delete role"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Empty State intentionally removed */}
    </div>
  );
};

export default RolesPage;