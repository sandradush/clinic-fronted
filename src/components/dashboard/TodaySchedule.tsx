import React from 'react';
import { Clock, User, MapPin, Phone } from 'lucide-react';

const TodaySchedule: React.FC = () => {
  // Mock today's appointments
  const todaysAppointments = [
    {
      id: '1',
      time: '09:00',
      patient: 'Jean de Dieu',
      type: 'Consultation',
      duration: '30 min',
      status: 'confirmed',
      room: 'Room 101'
    },
    {
      id: '2',
      time: '10:30',
      patient: 'Marie Claire',
      type: 'Follow-up',
      duration: '45 min',
      status: 'waiting',
      room: 'Room 102'
    },
    {
      id: '3',
      time: '14:00',
      patient: 'Eric Ndayishimiye',
      type: 'Check-up',
      duration: '30 min',
      status: 'pending',
      room: 'Room 101'
    },
    {
      id: '4',
      time: '15:30',
      patient: 'Alice Mukamana',
      type: 'Vaccination',
      duration: '15 min',
      status: 'confirmed',
      room: 'Room 103'
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'success';
      case 'waiting': return 'warning';
      case 'pending': return 'info';
      default: return 'gray';
    }
  };

  return (
    <div className="schedule-timeline">
      {todaysAppointments.map((appointment, index) => (
        <div key={appointment.id} className="timeline-item">
          <div className="timeline-marker">
            <div className={`timeline-dot ${getStatusColor(appointment.status)}`}></div>
            {index < todaysAppointments.length - 1 && <div className="timeline-line"></div>}
          </div>
          
          <div className="timeline-content">
            <div className="appointment-card">
              <div className="appointment-header">
                <div className="appointment-time">
                  <Clock size={16} />
                  <span className="time">{appointment.time}</span>
                  <span className="duration">({appointment.duration})</span>
                </div>
                <span className={`status-badge ${appointment.status}`}>
                  {appointment.status}
                </span>
              </div>
              
              <div className="appointment-body">
                <div className="patient-info">
                  <div className="patient-avatar">
                    <User size={18} />
                  </div>
                  <div className="patient-details">
                    <h4 className="patient-name">{appointment.patient}</h4>
                    <p className="appointment-type">{appointment.type}</p>
                  </div>
                </div>
                
                <div className="appointment-meta">
                  <div className="meta-item">
                    <MapPin size={14} />
                    <span>{appointment.room}</span>
                  </div>
                  <div className="meta-item">
                    <Phone size={14} />
                    <span>Call</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}
      
      <div className="schedule-summary">
        <div className="summary-stats">
          <div className="stat">
            <span className="stat-number">{todaysAppointments.length}</span>
            <span className="stat-label">Total</span>
          </div>
          <div className="stat">
            <span className="stat-number">{todaysAppointments.filter(a => a.status === 'confirmed').length}</span>
            <span className="stat-label">Confirmed</span>
          </div>
          <div className="stat">
            <span className="stat-number">{todaysAppointments.filter(a => a.status === 'waiting').length}</span>
            <span className="stat-label">Waiting</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TodaySchedule;