import React from 'react';
import { Plus, Calendar, FileText, Stethoscope, Pill, Clock, UserCheck } from 'lucide-react';
import { Link } from 'react-router-dom';

const QuickActions: React.FC = () => {
  const actions = [
    {
      icon: UserCheck,
      label: 'Confirm Appointment',
      description: 'Verify doctor availability',
      path: '/appointments/confirm',
      color: 'success',
      shortcut: 'Ctrl+C'
    },
    {
      icon: Calendar,
      label: 'Manage Schedule',
      description: 'View and organize appointments',
      path: '/appointments',
      color: 'primary',
      shortcut: 'Ctrl+A'
    },
    {
      icon: Stethoscope,
      label: 'Start Consultation',
      description: 'Begin patient consultation',
      path: '/consultation',
      color: 'info',
      shortcut: 'Ctrl+S'
    },
    {
      icon: FileText,
      label: 'Medical Records',
      description: 'View patient records',
      path: '/records',
      color: 'secondary',
      shortcut: 'Ctrl+R'
    },
    {
      icon: Clock,
      label: 'Doctor Availability',
      description: 'Check doctor schedules',
      path: '/doctors/availability',
      color: 'accent',
      shortcut: 'Ctrl+D'
    },
  ];

  return (
    <div className="quick-actions-grid">
      {actions.map((action, index) => (
        <Link key={index} to={action.path} className={`quick-action-card ${action.color}`}>
          <div className="action-icon">
            <action.icon size={24} />
          </div>
          <div className="action-content">
            <h4 className="action-title">{action.label}</h4>
            <p className="action-description">{action.description}</p>
            <span className="action-shortcut">{action.shortcut}</span>
          </div>
        </Link>
      ))}
    </div>
  );
};

export default QuickActions;