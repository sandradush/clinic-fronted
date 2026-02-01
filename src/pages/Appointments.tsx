import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Clock, User, Search, Filter, Plus, CheckCircle, AlertCircle, Calendar as CalendarIcon, Phone, Mail } from 'lucide-react';
import { format } from 'date-fns';

const Appointments: React.FC = () => {
  const { t } = useTranslation();
  const [selectedDate] = useState(new Date());
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Mock appointments data
  const appointments = [
    {
      id: '1',
      patientName: 'Jean de Dieu',
      patientPhone: '078 123 4567',
      patientEmail: 'jean@example.com',
      time: '09:00 AM',
      duration: '30 min',
      type: 'Consultation',
      status: 'confirmed',
      doctor: 'Dr. Sandra',
      room: 'Room 101',
      notes: 'Regular checkup'
    },
    {
      id: '2',
      patientName: 'Marie Claire',
      patientPhone: '073 987 6543',
      patientEmail: 'marie@example.com',
      time: '10:30 AM',
      duration: '45 min',
      type: 'Follow-up',
      status: 'waiting',
      doctor: 'Dr. Sandra',
      room: 'Room 102',
      notes: 'Diabetes follow-up'
    },
    {
      id: '3',
      patientName: 'Eric Ndayishimiye',
      patientPhone: '072 555 1234',
      patientEmail: 'eric@example.com',
      time: '02:00 PM',
      duration: '30 min',
      type: 'Check-up',
      status: 'in-progress',
      doctor: 'Dr. Sandra',
      room: 'Room 101',
      notes: 'Routine examination'
    },
    {
      id: '4',
      patientName: 'Alice Mukamana',
      patientPhone: '071 444 5678',
      patientEmail: 'alice@example.com',
      time: '03:30 PM',
      duration: '15 min',
      type: 'Vaccination',
      status: 'pending',
      doctor: 'Dr. Sandra',
      room: 'Room 103',
      notes: 'COVID-19 booster'
    },
  ];

  const filteredAppointments = appointments.filter(appointment => {
    const matchesSearch = appointment.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         appointment.patientPhone.includes(searchTerm) ||
                         appointment.type.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || appointment.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'confirmed': return <CheckCircle size={16} className="text-success" />;
      case 'waiting': return <Clock size={16} className="text-warning" />;
      case 'in-progress': return <AlertCircle size={16} className="text-info" />;
      case 'pending': return <Clock size={16} className="text-gray" />;
      default: return <Clock size={16} />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'success';
      case 'waiting': return 'warning';
      case 'in-progress': return 'info';
      case 'pending': return 'gray';
      default: return 'gray';
    }
  };

  return (
    <div className="appointments-page">
      {/* Page Header */}
      <div className="page-header">
        <div>
          <h1>Appointments</h1>
          <p className="subtitle">Manage today's appointments and patient visits</p>
        </div>
        <div className="header-actions">
          <button className="btn btn-secondary">
            <CalendarIcon size={18} />
            Calendar View
          </button>
          <button className="btn btn-primary">
            <Plus size={18} />
            New Appointment
          </button>
        </div>
      </div>

      {/* Controls */}
      <div className="appointments-controls">
        <div className="controls-left">
          <div className="search-bar">
            <Search size={20} />
            <input 
              type="text" 
              placeholder="Search by patient name, phone, or appointment type..."
              className="search-input"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <select 
            value={filterStatus} 
            onChange={(e) => setFilterStatus(e.target.value)}
            className="form-select"
          >
            <option value="all">All Status</option>
            <option value="confirmed">Confirmed</option>
            <option value="waiting">Waiting</option>
            <option value="in-progress">In Progress</option>
            <option value="pending">Pending</option>
          </select>
        </div>
        
        <div className="date-info">
          <CalendarIcon size={16} />
          <span>{format(selectedDate, 'EEEE, MMMM d, yyyy')}</span>
        </div>
      </div>

      {/* Appointments List */}
      <div className="appointments-content">
        <div className="appointments-summary">
          <div className="summary-card">
            <h3>{appointments.length}</h3>
            <p>Total Appointments</p>
          </div>
          <div className="summary-card">
            <h3>{appointments.filter(a => a.status === 'confirmed').length}</h3>
            <p>Confirmed</p>
          </div>
          <div className="summary-card">
            <h3>{appointments.filter(a => a.status === 'waiting').length}</h3>
            <p>Waiting</p>
          </div>
          <div className="summary-card">
            <h3>{appointments.filter(a => a.status === 'in-progress').length}</h3>
            <p>In Progress</p>
          </div>
        </div>

        <div className="appointments-timeline">
          {filteredAppointments.map((appointment) => (
            <div key={appointment.id} className={`appointment-card ${appointment.status}`}>
              <div className="appointment-time-marker">
                <div className="time-display">
                  <Clock size={16} />
                  <span className="time">{appointment.time}</span>
                </div>
                <div className="duration">{appointment.duration}</div>
              </div>
              
              <div className="appointment-content">
                <div className="appointment-header">
                  <div className="patient-info">
                    <div className="patient-avatar">
                      <User size={20} />
                    </div>
                    <div className="patient-details">
                      <h4 className="patient-name">{appointment.patientName}</h4>
                      <p className="appointment-type">{appointment.type}</p>
                    </div>
                  </div>
                  
                  <div className="appointment-status">
                    {getStatusIcon(appointment.status)}
                    <span className={`status-badge ${getStatusColor(appointment.status)}`}>
                      {appointment.status.replace('-', ' ')}
                    </span>
                  </div>
                </div>
                
                <div className="appointment-details">
                  <div className="detail-row">
                    <div className="detail-item">
                      <Phone size={14} />
                      <span>{appointment.patientPhone}</span>
                    </div>
                    <div className="detail-item">
                      <Mail size={14} />
                      <span>{appointment.patientEmail}</span>
                    </div>
                  </div>
                  
                  <div className="detail-row">
                    <div className="detail-item">
                      <User size={14} />
                      <span>{appointment.doctor}</span>
                    </div>
                  </div>
                  
                  {appointment.notes && (
                    <div className="appointment-notes">
                      <strong>Notes:</strong> {appointment.notes}
                    </div>
                  )}
                </div>
                
                <div className="appointment-actions">
                  {appointment.status === 'confirmed' && (
                    <button className="btn btn-sm btn-success">
                      Check In
                    </button>
                  )}
                  {appointment.status === 'waiting' && (
                    <button className="btn btn-sm btn-primary">
                      Start Consultation
                    </button>
                  )}
                  {appointment.status === 'in-progress' && (
                    <button className="btn btn-sm btn-warning">
                      Complete
                    </button>
                  )}
                  <button className="btn btn-sm btn-outline">
                    Reschedule
                  </button>
                  <button className="btn btn-sm btn-outline">
                    Contact
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {filteredAppointments.length === 0 && (
          <div className="empty-state">
            <div className="empty-icon">📅</div>
            <h3>No appointments found</h3>
            <p>No appointments match your current filters</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Appointments;