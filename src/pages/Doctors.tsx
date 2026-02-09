import React, { useState } from 'react';
import { UserPlus, UserCheck } from 'lucide-react';
import DoctorRequests from './DoctorRequests';
import ApprovedDoctors from './ApprovedDoctors';

const Doctors: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'requests' | 'approved'>('requests');

  const tabs = [
    { id: 'requests', label: 'Doctor Requests', icon: UserPlus, component: DoctorRequests },
    { id: 'approved', label: 'Approved Doctors', icon: UserCheck, component: ApprovedDoctors },
  ];

  const ActiveComponent = tabs.find(tab => tab.id === activeTab)?.component || DoctorRequests;

  return (
    <div className="p-4">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold mb-2">Doctors Management</h1>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white rounded-lg shadow-sm mb-6">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as 'requests' | 'approved')}
                className={`flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <tab.icon size={18} />
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Tab Content */}
      <div>
        <ActiveComponent />
      </div>
    </div>
  );
};

export default Doctors;