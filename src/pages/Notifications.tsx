import React, { useState, useEffect } from 'react';
import { Megaphone, Calendar, AlertTriangle, Send } from 'lucide-react';
import { makeApiRequest } from '../utils/api';
import toast from 'react-hot-toast';

const Notifications: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'announcements' | 'reminders' | 'alerts'>('announcements');
  const [announcement, setAnnouncement] = useState({ title: '', message: '' });
  const [reminder, setReminder] = useState({ appointmentId: '', message: '' });
  const [alert, setAlert] = useState({ title: '', message: '', severity: 'info' });
  const [appointments, setAppointments] = useState<any[]>([]);

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        const data = await makeApiRequest('/appointments');
        setAppointments(data);
      } catch (error) {
        console.error('Failed to fetch appointments:', error);
      }
    };
    fetchAppointments();
  }, []);

  const handleSendAnnouncement = async () => {
    try {
      await makeApiRequest('/notifications/announcements', {
        method: 'POST',
        body: JSON.stringify(announcement)
      });
      toast.success('Announcement sent successfully');
      setAnnouncement({ title: '', message: '' });
    } catch (error) {
      toast.error('Failed to send announcement');
    }
  };

  const handleSendReminder = async () => {
    try {
      await makeApiRequest('/notifications/reminders', {
        method: 'POST',
        body: JSON.stringify(reminder)
      });
      toast.success('Reminder sent successfully');
      setReminder({ appointmentId: '', message: '' });
    } catch (error) {
      toast.error('Failed to send reminder');
    }
  };

  const handleSendAlert = async () => {
    try {
      await makeApiRequest('/notifications/alerts', {
        method: 'POST',
        body: JSON.stringify(alert)
      });
      toast.success('Alert sent successfully');
      setAlert({ title: '', message: '', severity: 'info' });
    } catch (error) {
      toast.error('Failed to send alert');
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-6">Notifications</h1>

      <div className="bg-white rounded-lg shadow-sm p-4 mb-4">
        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab('announcements')}
            className={`flex items-center gap-2 px-4 py-2 rounded ${activeTab === 'announcements' ? 'bg-blue-500 text-white' : 'bg-gray-100'}`}
          >
            <Megaphone size={18} />
            Announcements
          </button>
          <button
            onClick={() => setActiveTab('reminders')}
            className={`flex items-center gap-2 px-4 py-2 rounded ${activeTab === 'reminders' ? 'bg-blue-500 text-white' : 'bg-gray-100'}`}
          >
            <Calendar size={18} />
            Appointment Reminders
          </button>
          <button
            onClick={() => setActiveTab('alerts')}
            className={`flex items-center gap-2 px-4 py-2 rounded ${activeTab === 'alerts' ? 'bg-blue-500 text-white' : 'bg-gray-100'}`}
          >
            <AlertTriangle size={18} />
            System Alerts
          </button>
        </div>
      </div>

      {activeTab === 'announcements' && (
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-semibold mb-4">Send Announcement</h2>
          <div className="space-y-4">
            <input
              type="text"
              placeholder="Announcement Title"
              value={announcement.title}
              onChange={(e) => setAnnouncement({ ...announcement, title: e.target.value })}
              className="w-full px-3 py-2 border rounded-md"
            />
            <textarea
              placeholder="Announcement Message"
              value={announcement.message}
              onChange={(e) => setAnnouncement({ ...announcement, message: e.target.value })}
              rows={4}
              className="w-full px-3 py-2 border rounded-md"
            />
            <button
              onClick={handleSendAnnouncement}
              className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              <Send size={18} />
              Send Announcement
            </button>
          </div>
        </div>
      )}

      {activeTab === 'reminders' && (
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-semibold mb-4">Send Appointment Reminder</h2>
          <div className="space-y-4">
            <select
              value={reminder.appointmentId}
              onChange={(e) => setReminder({ ...reminder, appointmentId: e.target.value })}
              className="w-full px-3 py-2 border rounded-md"
            >
              <option value="">Select Appointment</option>
              {appointments.map((apt) => (
                <option key={apt.id} value={apt.id}>
                  {apt.patientName} - {apt.date} {apt.time}
                </option>
              ))}
            </select>
            <textarea
              placeholder="Reminder Message"
              value={reminder.message}
              onChange={(e) => setReminder({ ...reminder, message: e.target.value })}
              rows={4}
              className="w-full px-3 py-2 border rounded-md"
            />
            <button
              onClick={handleSendReminder}
              className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              <Send size={18} />
              Send Reminder
            </button>
          </div>
        </div>
      )}

      {activeTab === 'alerts' && (
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-semibold mb-4">Send System Alert</h2>
          <div className="space-y-4">
            <input
              type="text"
              placeholder="Alert Title"
              value={alert.title}
              onChange={(e) => setAlert({ ...alert, title: e.target.value })}
              className="w-full px-3 py-2 border rounded-md"
            />
            <textarea
              placeholder="Alert Message"
              value={alert.message}
              onChange={(e) => setAlert({ ...alert, message: e.target.value })}
              rows={4}
              className="w-full px-3 py-2 border rounded-md"
            />
            <select
              value={alert.severity}
              onChange={(e) => setAlert({ ...alert, severity: e.target.value })}
              className="w-full px-3 py-2 border rounded-md"
            >
              <option value="info">Info</option>
              <option value="warning">Warning</option>
              <option value="error">Error</option>
            </select>
            <button
              onClick={handleSendAlert}
              className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              <Send size={18} />
              Send Alert
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Notifications;
