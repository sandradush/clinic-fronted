import React, { useEffect, useState } from 'react';
import { Users, Search, Plus, Trash2, Edit } from 'lucide-react';
import { makeApiRequest } from '../utils/api';
import toast from 'react-hot-toast';

interface Staff { id: number; name: string; role?: string; email?: string; phone?: string }

const StaffManagement: React.FC = () => {
  const [staff, setStaff] = useState<Staff[]>([]);
  const [loading, setLoading] = useState(false);
  const [query, setQuery] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newRole, setNewRole] = useState<'Doctor'|'Nurse'|'Receptionist'|'Admin'|'Staff'>('Staff');
  const [newSpecialist, setNewSpecialist] = useState('');
  const [creating, setCreating] = useState(false);

  const fetchStaff = async () => {
    try {
      setLoading(true);
      const data = await makeApiRequest('/staff');
      setStaff(Array.isArray(data) ? data : (data?.data || []));
    } catch (err) {
      console.error('Failed to load staff', err);
      toast.error('Failed to load staff directory');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchStaff(); }, []);

  const handleDelete = async (id: number) => {
    if (!window.confirm('Delete staff member?')) return;
    try {
      await makeApiRequest(`/staff/${id}`, { method: 'DELETE' });
      setStaff(prev => prev.filter(s => s.id !== id));
      toast.success('Staff deleted');
    } catch (err) {
      console.error(err);
      toast.error('Failed to delete staff');
    }
  };

  const filtered = staff.filter(s => (s.name || '').toLowerCase().includes(query.toLowerCase()) || (s.email || '').toLowerCase().includes(query.toLowerCase()));

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold flex items-center gap-3"><Users size={20} /> Staff Directory</h1>
        <div className="flex items-center gap-2">
          <div className="relative">
            <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search staff by name or email" className="border rounded px-3 py-2 pr-10 w-72" />
            <Search size={16} className="absolute right-2 top-2 text-gray-400" />
          </div>
          <button onClick={() => setShowAddForm(true)} className="px-3 py-2 bg-blue-600 text-white rounded inline-flex items-center gap-2"><Plus size={14} /> Add</button>
        </div>
      </div>

      {showAddForm && (
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
          <h3 className="text-lg font-semibold mb-3">Add Staff Member</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <input placeholder="Full name" value={newName} onChange={e => setNewName(e.target.value)} className="border rounded px-3 py-2 md:col-span-1" />
            <input placeholder="Email" value={newEmail} onChange={e => setNewEmail(e.target.value)} className="border rounded px-3 py-2 md:col-span-1" />
            <select value={newRole} onChange={e => setNewRole(e.target.value as any)} className="border rounded px-3 py-2 md:col-span-1">
              <option value="Staff">Staff</option>
              <option value="Doctor">Doctor</option>
              <option value="Nurse">Nurse</option>
              <option value="Receptionist">Receptionist</option>
              <option value="Admin">Admin</option>
            </select>
            {newRole === 'Doctor' && (
              <input placeholder="Specialist (e.g. Cardiology)" value={newSpecialist} onChange={e => setNewSpecialist(e.target.value)} className="border rounded px-3 py-2 md:col-span-3" />
            )}
          </div>

          <div className="mt-4 flex items-center gap-2">
            <button disabled={creating} onClick={async () => {
              if (!newName.trim() || !newEmail.trim()) { toast.error('Name and email are required'); return; }
              try {
                setCreating(true);
                const payload: any = { name: newName.trim(), email: newEmail.trim(), role: newRole };
                if (newRole === 'Doctor' && newSpecialist.trim()) payload.specialist = newSpecialist.trim();
                const created = await makeApiRequest('/staff', { method: 'POST', body: JSON.stringify(payload) });
                const item = (created && created.id) ? created : (created?.data || created);
                // optimistic add
                setStaff(prev => [item, ...prev]);
                toast.success('Staff created');
                setNewName(''); setNewEmail(''); setNewRole('Staff'); setNewSpecialist(''); setShowAddForm(false);
              } catch (err) {
                console.error('Failed to create staff', err);
                toast.error('Failed to create staff');
              } finally { setCreating(false); }
            }} className="px-4 py-2 bg-blue-600 text-white rounded disabled:opacity-50">{creating ? 'Creating...' : 'Create'}</button>

            <button onClick={() => { setShowAddForm(false); setNewName(''); setNewEmail(''); setNewRole('Staff'); setNewSpecialist(''); }} className="px-4 py-2 bg-white border rounded">Cancel</button>
          </div>
        </div>
      )}

      <div className="bg-white rounded-lg shadow-sm p-4">
        {loading ? (
          <div className="text-center py-8">Loading...</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map(s => (
              <div key={s.id} className="p-4 border rounded flex flex-col justify-between">
                <div>
                  <div className="text-lg font-semibold">{s.name}</div>
                  <div className="text-sm text-gray-500">{s.role || 'Staff'}</div>
                  {s.email && <div className="text-sm text-gray-600 mt-2">{s.email}</div>}
                  {s.phone && <div className="text-sm text-gray-600">{s.phone}</div>}
                </div>

                <div className="flex items-center justify-end gap-2 mt-4">
                  <button className="text-blue-600 hover:underline inline-flex items-center gap-2"><Edit size={14} /> Edit</button>
                  <button onClick={() => handleDelete(s.id)} className="text-red-600 inline-flex items-center gap-2"><Trash2 size={14} /> Delete</button>
                </div>
              </div>
            ))}

            {filtered.length === 0 && (
              <div className="col-span-full text-center p-8 text-gray-500">No staff found.</div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default StaffManagement;
