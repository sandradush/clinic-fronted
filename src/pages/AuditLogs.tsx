import React, { useEffect, useState } from 'react';
import { Shield, LogIn, Edit } from 'lucide-react';
import { makeApiRequest } from '../utils/api';

interface AuditLog {
  id: string;
  action: string;
  user: string;
  timestamp: string;
  type: 'admin_action' | 'login' | 'data_change';
  details?: string;
}

const AuditLogs: React.FC = () => {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [filter, setFilter] = useState<string>('all');

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const data = await makeApiRequest('/audit-logs');
        setLogs(data);
      } catch (error) {
        console.error('Failed to fetch audit logs:', error);
      }
    };
    fetchLogs();
  }, []);

  const filteredLogs = filter === 'all' ? logs : logs.filter(log => log.type === filter);

  const getIcon = (type: string) => {
    switch (type) {
      case 'admin_action': return <Shield className="text-blue-500" size={20} />;
      case 'login': return <LogIn className="text-green-500" size={20} />;
      case 'data_change': return <Edit className="text-orange-500" size={20} />;
      default: return <Shield className="text-gray-500" size={20} />;
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-6">Audit Logs</h1>

      <div className="bg-white rounded-lg shadow-sm p-4 mb-4">
        <div className="flex gap-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded ${filter === 'all' ? 'bg-blue-500 text-white' : 'bg-gray-100'}`}
          >
            All
          </button>
          <button
            onClick={() => setFilter('admin_action')}
            className={`px-4 py-2 rounded ${filter === 'admin_action' ? 'bg-blue-500 text-white' : 'bg-gray-100'}`}
          >
            Admin Actions
          </button>
          <button
            onClick={() => setFilter('login')}
            className={`px-4 py-2 rounded ${filter === 'login' ? 'bg-blue-500 text-white' : 'bg-gray-100'}`}
          >
            Login History
          </button>
          <button
            onClick={() => setFilter('data_change')}
            className={`px-4 py-2 rounded ${filter === 'data_change' ? 'bg-blue-500 text-white' : 'bg-gray-100'}`}
          >
            Data Changes
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-semibold">Type</th>
              <th className="px-4 py-3 text-left text-sm font-semibold">Action</th>
              <th className="px-4 py-3 text-left text-sm font-semibold">User</th>
              <th className="px-4 py-3 text-left text-sm font-semibold">Timestamp</th>
              <th className="px-4 py-3 text-left text-sm font-semibold">Details</th>
            </tr>
          </thead>
          <tbody>
            {filteredLogs.map((log) => (
              <tr key={log.id} className="border-b hover:bg-gray-50">
                <td className="px-4 py-3">{getIcon(log.type)}</td>
                <td className="px-4 py-3 text-sm">{log.action}</td>
                <td className="px-4 py-3 text-sm">{log.user}</td>
                <td className="px-4 py-3 text-sm text-gray-600">{new Date(log.timestamp).toLocaleString()}</td>
                <td className="px-4 py-3 text-sm text-gray-600">{log.details || '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AuditLogs;
