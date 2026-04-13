import React, { useState, useEffect } from 'react';
import { Edit, Trash2, Eye, X, Save, Plus, Send, User } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';

interface Patient {
  id: number;
  name: string;
  email: string;
  role: string;
}

interface SentNotification {
  id: number;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'success' | 'error' | 'general';
  user_id: number;
  patient_name: string;
  sent_by_id: number;
  sent_by: string;
  is_read: boolean;
  created_at: string;
}

const DoctorSentNotifications: React.FC = () => {
  const { user } = useAuth();
  const [sentNotifications, setSentNotifications] = useState<SentNotification[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [selectedNotification, setSelectedNotification] = useState<SentNotification | null>(null);
  const [editingNotification, setEditingNotification] = useState<SentNotification | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    title: '',
    message: '',
    type: 'general' as 'info' | 'warning' | 'success' | 'error' | 'general',
    user_id: 0
  });

  useEffect(() => {
    if (user?.id) {
      fetchSentNotifications();
      fetchPatients();
    }
  }, [user]);

  const fetchSentNotifications = async () => {
    if (!user?.id) return;
    
    try {
      setLoading(true);
      const response = await fetch(`http://localhost:3001/api/notifications/sent/${user.id}`);
      if (response.ok) {
        const data = await response.json();
        setSentNotifications(Array.isArray(data) ? data : []);
      } else {
        console.error('Failed to fetch sent notifications:', response.status);
        setSentNotifications([]);
        toast.error('Failed to fetch sent notifications');
      }
    } catch (error) {
      console.error('Error fetching sent notifications:', error);
      setSentNotifications([]);
      toast.error('Failed to fetch sent notifications');
    } finally {
      setLoading(false);
    }
  };

  const fetchPatients = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/users');
      if (response.ok) {
        const data = await response.json();
        const patientUsers = data.filter((u: Patient) => u.role === 'patient');
        setPatients(Array.isArray(patientUsers) ? patientUsers : []);
      } else {
        console.error('Failed to fetch patients:', response.status);
        setPatients([]);
      }
    } catch (error) {
      console.error('Error fetching patients:', error);
      setPatients([]);
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      message: '',
      type: 'general',
      user_id: 0
    });
    setShowCreateModal(false);
  };

  const createNotification = async () => {
    if (!formData.title.trim() || !formData.message.trim() || !formData.user_id || !user?.id) {
      toast.error('Please fill all fields and select a patient');
      return;
    }

    try {
      const response = await fetch('http://localhost:3001/api/notifications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          sent_by_id: user.id
        }),
      });

      if (response.ok) {
        toast.success('Notification sent successfully');
        resetForm();
        fetchSentNotifications();
      } else {
        toast.error('Failed to send notification');
      }
    } catch (error) {
      console.error('Error creating notification:', error);
      toast.error('Failed to send notification');
    }
  };

  const updateNotification = async () => {
    if (!editingNotification || !user?.id) return;

    try {
      const response = await fetch(`http://localhost:3001/api/notifications/${editingNotification.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: editingNotification.title,
          message: editingNotification.message,
          type: editingNotification.type,
          user_id: editingNotification.user_id,
          is_read: editingNotification.is_read
        }),
      });

      if (response.ok) {
        const updatedNotification = await response.json();
        toast.success('Notification updated successfully');
        setSentNotifications(sentNotifications.map(n => 
          n.id === editingNotification.id ? { ...n, ...updatedNotification } : n
        ));
        setEditingNotification(null);
      } else {
        toast.error('Failed to update notification');
      }
    } catch (error) {
      console.error('Error updating notification:', error);
      toast.error('Failed to update notification');
    }
  };

  const deleteNotification = async (notificationId: number) => {
    if (!window.confirm('Are you sure you want to delete this notification?')) {
      return;
    }

    try {
      const response = await fetch(`http://localhost:3001/api/notifications/${notificationId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        const result = await response.json();
        toast.success(result.message || 'Notification deleted successfully');
        setSentNotifications(sentNotifications.filter(n => n.id !== notificationId));
      } else {
        toast.error('Failed to delete notification');
      }
    } catch (error) {
      console.error('Error deleting notification:', error);
      toast.error('Failed to delete notification');
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'success': return 'bg-green-100 text-green-800 border-green-200';
      case 'warning': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'error': return 'bg-red-100 text-red-800 border-red-200';
      case 'general': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-blue-100 text-blue-800 border-blue-200';
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Sent Notifications</h1>
            <p className="text-gray-600">
              {sentNotifications.length} notifications sent
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <Plus size={20} />
              Send New
            </button>
            <button
              onClick={fetchSentNotifications}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Refresh
            </button>
          </div>
        </div>
      </div>

      {/* Sent Notifications List */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="divide-y divide-gray-200">
          {sentNotifications.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <Send size={48} className="mx-auto text-gray-400 mb-4" />
              <p>No notifications sent yet</p>
            </div>
          ) : (
            sentNotifications.map((notification) => (
              <div key={notification.id} className="p-4 hover:bg-gray-50">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold text-gray-900">{notification.title}</h3>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getTypeColor(notification.type)}`}>
                        {notification.type}
                      </span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${notification.is_read ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                        {notification.is_read ? 'Read' : 'Unread'}
                      </span>
                    </div>
                    <p className="text-gray-600 mb-3">{notification.message}</p>
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <span>To: {notification.patient_name}</span>
                      <span>Sent: {new Date(notification.created_at).toLocaleString()}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setSelectedNotification(notification)}
                      className="flex items-center gap-1 px-3 py-1 text-blue-600 hover:text-blue-900 hover:bg-blue-50 rounded transition-colors"
                    >
                      <Eye size={16} />
                      View
                    </button>
                    <button
                      onClick={() => setEditingNotification(notification)}
                      className="flex items-center gap-1 px-3 py-1 text-green-600 hover:text-green-900 hover:bg-green-50 rounded transition-colors"
                    >
                      <Edit size={16} />
                      Edit
                    </button>
                    <button
                      onClick={() => deleteNotification(notification.id)}
                      className="flex items-center gap-1 px-3 py-1 text-red-600 hover:text-red-900 hover:bg-red-50 rounded transition-colors"
                    >
                      <Trash2 size={16} />
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* View Notification Modal */}
      {selectedNotification && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900">Notification Details</h2>
                <button
                  onClick={() => setSelectedNotification(null)}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <X size={20} />
                </button>
              </div>
            </div>
            
            <div className="p-6 space-y-4">
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-2">Title</h3>
                <p className="text-gray-900">{selectedNotification.title}</p>
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-2">Message</h3>
                <p className="text-gray-900">{selectedNotification.message}</p>
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-2">Type</h3>
                <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getTypeColor(selectedNotification.type)}`}>
                  {selectedNotification.type}
                </span>
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-2">Recipient</h3>
                <div className="p-2 bg-gray-50 rounded">
                  <div className="font-medium text-gray-900">{selectedNotification.patient_name}</div>
                  <div className="text-sm text-gray-500">Patient ID: {selectedNotification.user_id}</div>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-2">Status & Date</h3>
                <div className="text-sm text-gray-600">
                  <p>Status: {selectedNotification.is_read ? 'Read by patient' : 'Not read yet'}</p>
                  <p>Sent: {new Date(selectedNotification.created_at).toLocaleString()}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Notification Modal */}
      {editingNotification && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900">Edit Notification</h2>
                <button
                  onClick={() => setEditingNotification(null)}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <X size={20} />
                </button>
              </div>
            </div>
            
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
                <input
                  type="text"
                  value={editingNotification.title}
                  onChange={(e) => setEditingNotification({...editingNotification, title: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Message</label>
                <textarea
                  value={editingNotification.message}
                  onChange={(e) => setEditingNotification({...editingNotification, message: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={4}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
                <select
                  value={editingNotification.type}
                  onChange={(e) => setEditingNotification({...editingNotification, type: e.target.value as any})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="general">General</option>
                  <option value="info">Info</option>
                  <option value="success">Success</option>
                  <option value="warning">Warning</option>
                  <option value="error">Error</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Patient</label>
                <select
                  value={editingNotification.user_id}
                  onChange={(e) => setEditingNotification({...editingNotification, user_id: parseInt(e.target.value)})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {patients.map((patient) => (
                    <option key={patient.id} value={patient.id}>
                      {patient.name} ({patient.email})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Mark as Read</label>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={editingNotification.is_read}
                    onChange={(e) => setEditingNotification({...editingNotification, is_read: e.target.checked})}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label className="ml-2 text-sm text-gray-700">
                    Mark notification as read by patient
                  </label>
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={updateNotification}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Save size={16} />
                  Update
                </button>
                <button
                  onClick={() => setEditingNotification(null)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create Notification Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900">Send New Notification</h2>
                <button
                  onClick={resetForm}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <X size={20} />
                </button>
              </div>
            </div>
            
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter notification title"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Message</label>
                <textarea
                  value={formData.message}
                  onChange={(e) => setFormData({...formData, message: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={4}
                  placeholder="Enter notification message"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({...formData, type: e.target.value as any})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="general">General</option>
                  <option value="info">Info</option>
                  <option value="success">Success</option>
                  <option value="warning">Warning</option>
                  <option value="error">Error</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Patient</label>
                <select
                  value={formData.user_id || ''}
                  onChange={(e) => setFormData({...formData, user_id: parseInt(e.target.value) || 0})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                >
                  <option value="">Select a patient</option>
                  {patients.map((patient) => (
                    <option key={patient.id} value={patient.id}>
                      {patient.name} ({patient.email})
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={createNotification}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Send size={16} />
                  Send Notification
                </button>
                <button
                  onClick={resetForm}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DoctorSentNotifications;