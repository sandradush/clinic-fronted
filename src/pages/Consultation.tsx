import React, { useState } from 'react';
import { Video, Phone, User, MessageCircle, Calendar, Clock, MapPin } from 'lucide-react';

const Consultation: React.FC = () => {
  const [selectedAppointment, setSelectedAppointment] = useState<string | null>(null);

  // Mock appointments with consultation preferences
  const appointments = [
    {
      id: '1',
      patientName: 'Jean de Dieu',
      time: '09:00 AM',
      type: 'Consultation',
      consultationMethod: 'video',
      phone: '078 123 4567',
      email: 'jean@example.com',
      notes: 'Patient prefers video call due to mobility issues',
      status: 'confirmed'
    },
    {
      id: '2',
      patientName: 'Marie Claire',
      time: '10:30 AM',
      type: 'Follow-up',
      consultationMethod: 'phone',
      phone: '073 987 6543',
      email: 'marie@example.com',
      notes: 'Phone consultation requested - diabetes follow-up',
      status: 'waiting'
    },
    {
      id: '3',
      patientName: 'Eric Ndayishimiye',
      time: '02:00 PM',
      type: 'Check-up',
      consultationMethod: 'in-person',
      phone: '072 555 1234',
      email: 'eric@example.com',
      notes: 'Physical examination required',
      status: 'confirmed'
    }
  ];

  const getConsultationIcon = (method: string) => {
    switch (method) {
      case 'video': return <Video size={20} />;
      case 'phone': return <Phone size={20} />;
      case 'in-person': return <User size={20} />;
      default: return <MessageCircle size={20} />;
    }
  };

  const getConsultationColor = (method: string) => {
    switch (method) {
      case 'video': return 'primary';
      case 'phone': return 'success';
      case 'in-person': return 'warning';
      default: return 'gray';
    }
  };

  return (
    <div className="consultation-page">
      <div className="page-header">
        <div>
          <h1>Consultation Management</h1>
          <p className="subtitle">View patient consultation preferences and start sessions</p>
        </div>
      </div>

      <div className="consultation-grid">
        {/* Appointments List */}
        <div className="appointments-section">
          <h3>Today's Appointments</h3>
          <div className="consultation-appointments">
            {appointments.map((appointment) => (
              <div 
                key={appointment.id} 
                className={`consultation-card ${selectedAppointment === appointment.id ? 'selected' : ''}`}
                onClick={() => setSelectedAppointment(appointment.id)}
              >
                <div className="consultation-header">
                  <div className="patient-info">
                    <h4>{appointment.patientName}</h4>
                    <div className="appointment-meta">
                      <Clock size={14} />
                      <span>{appointment.time}</span>
                      <span>•</span>
                      <span>{appointment.type}</span>
                    </div>
                  </div>
                  <div className={`consultation-method ${getConsultationColor(appointment.consultationMethod)}`}>
                    {getConsultationIcon(appointment.consultationMethod)}
                    <span>{appointment.consultationMethod.replace('-', ' ')}</span>
                  </div>
                </div>
                
                <div className="consultation-details">
                  <div className="contact-info">
                    <Phone size={14} />
                    <span>{appointment.phone}</span>
                  </div>
                  <div className="notes">
                    <MessageCircle size={14} />
                    <span>{appointment.notes}</span>
                  </div>
                </div>
                
                <div className="consultation-actions">
                  {appointment.consultationMethod === 'video' && (
                    <button className="btn btn-sm btn-primary">
                      <Video size={14} />
                      Start Video Call
                    </button>
                  )}
                  {appointment.consultationMethod === 'phone' && (
                    <button className="btn btn-sm btn-success">
                      <Phone size={14} />
                      Call Patient
                    </button>
                  )}
                  {appointment.consultationMethod === 'in-person' && (
                    <button className="btn btn-sm btn-warning">
                      <MapPin size={14} />
                      Patient Arrived
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Consultation Options */}
        <div className="consultation-options">
          <h3>Consultation Methods</h3>
          <div className="method-cards">
            <div className="method-card video">
              <Video size={32} />
              <h4>Video Consultation</h4>
              <p>Face-to-face consultation via video call</p>
              <ul>
                <li>Visual examination possible</li>
                <li>Screen sharing for results</li>
                <li>Recording available</li>
              </ul>
            </div>
            
            <div className="method-card phone">
              <Phone size={32} />
              <h4>Phone Consultation</h4>
              <p>Voice-only consultation call</p>
              <ul>
                <li>Quick follow-ups</li>
                <li>Medication reviews</li>
                <li>Test result discussions</li>
              </ul>
            </div>
            
            <div className="method-card in-person">
              <User size={32} />
              <h4>In-Person Visit</h4>
              <p>Traditional clinic visit</p>
              <ul>
                <li>Physical examination</li>
                <li>Procedures and tests</li>
                <li>Complex consultations</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Consultation;