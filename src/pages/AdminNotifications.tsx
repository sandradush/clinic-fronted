import React, { useState, useEffect } from 'react';
import { Bell, Plus, Send, Users, User, X, Eye, Edit, Trash2, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
}

interface Notification {
  id: number;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'success' | 'error' | 'general';
  user_id: number;
  user_name: string;
  user_email: string;
  user_role: string;
  sent_by_id: number | null;
  sent_by: string;
  is_read: boolean;
  created_at: string;
}

const AdminNotifications: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingNotification, setEditingNotification] = useState<Notification | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);
  const [selectedNotification, setSelectedNotification] = useState<Notification | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    message: '',
    type: 'general' as 'info' | 'warning' | 'success' | 'error' | 'general',
    user_id: 0,
    is_read: false
  });

  useEffect(() => {
    fetchNotifications();
    fetchUsers();
  }, []);

  const fetchNotifications = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/notifications');
      if (response.ok) {
        const data = await response.json();
        setNotifications(Array.isArray(data) ? data : []);
      } else {
        console.error('Failed to fetch notifications:', response.status);
        setNotifications([]);
        toast.error('Failed to fetch notifications');
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
      setNotifications([]);
      toast.error('Failed to fetch notifications');
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/users');
      const data = await response.json();
      setUsers(data);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Failed to fetch users');
    }
  };

  const createNotification = async () => {
    if (!formData.title.trim() || !formData.message.trim() || !formData.user_id) {
      toast.error('Please fill all fields and select a recipient');
      return;
    }

    try {
      const response = await fetch('http://localhost:3001/api/notifications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const newNotification = await response.json();
        setNotifications([newNotification, ...notifications]);
        resetForm();
        toast.success('Notification sent successfully');
      } else {
        toast.error('Failed to send notification');
      }
    } catch (error) {
      console.error('Error creating notification:', error);
      toast.error('Failed to send notification');
    }
  };

  const updateNotification = async () => {
    if (!editingNotification) return;
    
    if (!formData.title.trim() || !formData.message.trim() || !formData.user_id) {
      toast.error('Please fill all fields and select a recipient');
      return;
    }

    try {
      const response = await fetch(`http://localhost:3001/api/notifications/${editingNotification.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const updatedNotification = await response.json();
        setNotifications(notifications.map(n => n.id === editingNotification.id ? updatedNotification : n));
        resetForm();
        toast.success('Notification updated successfully');
      } else {
        toast.error('Failed to update notification');
      }
    } catch (error) {
      console.error('Error updating notification:', error);
      toast.error('Failed to update notification');
    }
  };

  const deleteNotification = async (notificationId: number) => {
    try {
      const response = await fetch(`http://localhost:3001/api/notifications/${notificationId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setNotifications(notifications.filter(n => n.id !== notificationId));
        setDeleteConfirm(null);
        toast.success('Notification deleted successfully');
      } else {
        toast.error('Failed to delete notification');
      }
    } catch (error) {
      console.error('Error deleting notification:', error);
      toast.error('Failed to delete notification');
    }
  };

  const handleEdit = (notification: Notification) => {
    setEditingNotification(notification);
    setFormData({
      title: notification.title,
      message: notification.message,
      type: notification.type,
      user_id: notification.user_id,
      is_read: notification.is_read
    });
  };

  const handleSubmit = () => {
    if (editingNotification) {
      updateNotification();
    } else {
      createNotification();
    }
  };

  const resetForm = () => {
    setShowCreateModal(false);
    setEditingNotification(null);
    setFormData({ title: '', message: '', type: 'general', user_id: 0, is_read: false });
  };

  const toggleRecipient = (userId: number) => {
    setFormData(prev => ({
      ...prev,
      user_id: userId
    }));
  };

  const selectAllUsers = () => {
    // Not needed for single user selection
  };

  const clearAllUsers = () => {
    setFormData(prev => ({
      ...prev,
      user_id: 0
    }));
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

  return (
    <div className="p-6">
      <div className="mb-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Notifications Management</h1>
            <p className="text-gray-600">Create and manage system notifications</p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus size={20} />
            Create Notification
          </button>
        </div>
      </div>

      {/* Notifications List */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <Bell size={20} />
            Recent Notifications
          </h2>
        </div>
        
        <div className="divide-y divide-gray-200">
          {!Array.isArray(notifications) || notifications.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <Bell size={48} className="mx-auto text-gray-400 mb-4" />
              <p>No notifications sent yet</p>
            </div>
          ) : (
            notifications.map((notification) => (
              <div key={notification.id} className="p-4 hover:bg-gray-50">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold text-gray-900">{notification.title}</h3>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getTypeColor(notification.type)}`}>
                        {notification.type}
                      </span>
                    </div>
                    <p className="text-gray-600 mb-3">{notification.message}</p>
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <span>To: {notification.user_name} ({notification.user_role})</span>
                      <span>From: {notification.sent_by}</span>
                      <span>Status: {notification.is_read ? 'Read' : 'Unread'}</span>
                      <span>{new Date(notification.created_at).toLocaleString()}</span>
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
                    {!notification.is_read && (
                      <button
                        onClick={() => markAsRead(notification.id)}
                        className="flex items-center gap-1 px-3 py-1 text-green-600 hover:text-green-900 hover:bg-green-50 rounded transition-colors"
                      >
                        <CheckCircle size={16} />
                        Mark Read
                      </button>
                    )}
                    <button
                      onClick={() => handleEdit(notification)}
                      className="flex items-center gap-1 px-3 py-1 text-yellow-600 hover:text-yellow-900 hover:bg-yellow-50 rounded transition-colors"
                    >
                      <Edit size={16} />
                      Edit
                    </button>
                    <button
                      onClick={() => setDeleteConfirm(notification.id)}
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

      {/* Create/Edit Notification Modal */}
      {(showCreateModal || editingNotification) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900">
                  {editingNotification ? 'Edit Notification' : 'Create Notification'}
                </h2>
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
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Title
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter notification title"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Message
                </label>
                <textarea
                  value={formData.message}
                  onChange={(e) => setFormData({...formData, message: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={4}
                  placeholder="Enter notification message"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Type
                </label>
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
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Recipient
                </label>
                <select
                  value={formData.user_id || ''}
                  onChange={(e) => setFormData({...formData, user_id: parseInt(e.target.value) || 0})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                >
                  <option value="">Select a user</option>
                  {users.map((user) => (
                    <option key={user.id} value={user.id}>
                      {user.name} ({user.email}) - {user.role}
                    </option>
                  ))}
                </select>
              </div>

              {editingNotification && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Status
                  </label>
                  <div className="flex items-center gap-3">
                    <label className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="is_read"
                        checked={!formData.is_read}
                        onChange={() => setFormData({...formData, is_read: false})}
                        className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700">Unread</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="is_read"
                        checked={formData.is_read}
                        onChange={() => setFormData({...formData, is_read: true})}
                        className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700">Read</span>
                    </label>
                  </div>
                </div>
              )}

              <div className="flex gap-3 pt-4">
                <button
                  onClick={handleSubmit}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Send size={16} />
                  {editingNotification ? 'Update Notification' : 'Send Notification'}
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

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-sm">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Delete Notification</h3>
              <p className="text-gray-600 mb-6">Are you sure you want to delete this notification? This action cannot be undone.</p>
              <div className="flex gap-3">
                <button
                  onClick={() => deleteNotification(deleteConfirm)}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  Delete
                </button>
                <button
                  onClick={() => setDeleteConfirm(null)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Notification Details Modal */}
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
                  <div className="font-medium text-gray-900">{selectedNotification.user_name}</div>
                  <div className="text-sm text-gray-500">{selectedNotification.user_email} • {selectedNotification.user_role}</div>
                  <div className="text-sm text-gray-500">Status: {selectedNotification.is_read ? 'Read' : 'Unread'}</div>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-2">Sender</h3>
                <div className="p-2 bg-gray-50 rounded">
                  <div className="font-medium text-gray-900">{selectedNotification.sent_by}</div>
                  {selectedNotification.sent_by_id && (
                    <div className="text-sm text-gray-500">Sender ID: {selectedNotification.sent_by_id}</div>
                  )}
                </div>
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-2">Created</h3>
                <div className="text-sm text-gray-600">
                  <p>Date: {new Date(selectedNotification.created_at).toLocaleString()}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminNotifications;