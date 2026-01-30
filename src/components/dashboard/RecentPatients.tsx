import React from 'react';
import { User, Phone, Mail, Calendar, MoreVertical, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';

interface Appointment {
  id: string;
  patientName: string;
  time: string;
  type: string;
  status: 'confirmed' | 'waiting' | 'in-progress' | 'completed';
  duration: string;
  phone?: string;
}

interface RecentAppointmentsProps {
  appointments?: Appointment[];
}

const RecentPatients: React.FC<RecentAppointmentsProps> = ({ appointments = [] }) => {
  const sampleAppointments: Appointment[] = [
    { 
      id: '1', 
      patientName: 'John Doe', 
      time: '09:00',
      type: 'Consultation',
      status: 'confirmed',
      duration: '30 min',
      phone: '078 123 4567'
    },
    { 
      id: '2', 
      patientName: 'Jane Smith', 
      time: '10:30',
      type: 'Follow-up',
      status: 'waiting',
      duration: '45 min',
      phone: '073 987 6543'
    },
    { 
      id: '3', 
      patientName: 'Robert Johnson', 
      time: '14:00',
      type: 'Check-up',
      status: 'in-progress',
      duration: '30 min',
      phone: '072 555 1234'
    },
    { 
      id: '4', 
      patientName: 'Maria Garcia', 
      time: '15:30',
      type: 'Vaccination',
      status: 'completed',
      duration: '15 min',
      phone: '071 444 5678'
    },
  ];

  const displayAppointments = appointments.length > 0 ? appointments : sampleAppointments;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'success';
      case 'waiting': return 'warning';
      case 'in-progress': return 'info';
      case 'completed': return 'gray';
      default: return 'gray';
    }
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  return (
    <div className="recent-patients-list">
      {displayAppointments.map((appointment) => (
        <div key={appointment.id} className="patient-item">
          <div className="patient-avatar-wrapper">
            <div className="patient-avatar">
              <span className="avatar-initials">{getInitials(appointment.patientName)}</span>
            </div>
            <div className={`status-indicator ${getStatusColor(appointment.status)}`}></div>
          </div>
          
          <div className="patient-details">
            <div className="patient-header">
              <h4 className="patient-name">{appointment.patientName}</h4>
              <span className={`patient-status ${getStatusColor(appointment.status)}`}>
                {appointment.status}
              </span>
            </div>
            
            <div className="patient-info">
              <div className="info-item">
                <Clock size={14} />
                <span>{appointment.time} ({appointment.duration})</span>
              </div>
              <div className="info-item">
                <User size={14} />
                <span>{appointment.type}</span>
              </div>
            </div>
            
            <div className="patient-meta">
              <span className="last-visit">
                Phone: {appointment.phone}
              </span>
            </div>
          </div>
          
          <div className="patient-actions">
            <Link to={`/appointments/${appointment.id}`} className="btn btn-sm btn-outline">
              View
            </Link>
            <button className="btn btn-sm btn-ghost">
              <MoreVertical size={16} />
            </button>
          </div>
        </div>
      ))}
      
      <div className="patients-footer">
        <Link to="/appointments" className="btn btn-outline btn-sm">
          View All Appointments
        </Link>
      </div>
    </div>
  );
};

export default RecentPatients;