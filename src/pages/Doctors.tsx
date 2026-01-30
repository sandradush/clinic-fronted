import React, { useState } from 'react';
import { Search, Filter, Clock, Phone, Mail, MapPin, Calendar, CheckCircle, XCircle } from 'lucide-react';

interface Doctor {
  id: string;
  name: string;
  specialty: string;
  email: string;
  phone: string;
  location: string;
  availability: 'available' | 'busy' | 'offline';
  nextAvailable: string;
  experience: string;
  rating: number;
  todayAppointments: number;
  totalAppointments: number;
}

const Doctors: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  const doctors: Doctor[] = [
    {
      id: '1',
      name: 'Dr. Sarah Johnson',
      specialty: 'Cardiology',
      email: 'sarah.johnson@clinic.com',
      phone: '+1 (555) 123-4567',
      location: 'Room 201',
      availability: 'available',
      nextAvailable: 'Now',
      experience: '12 years',
      rating: 4.9,
      todayAppointments: 8,
      totalAppointments: 1247
    },
    {
      id: '2',
      name: 'Dr. Michael Chen',
      specialty: 'Pediatrics',
      email: 'michael.chen@clinic.com',
      phone: '+1 (555) 234-5678',
      location: 'Room 105',
      availability: 'busy',
      nextAvailable: '2:30 PM',
      experience: '8 years',
      rating: 4.8,
      todayAppointments: 12,
      totalAppointments: 892
    },
    {
      id: '3',
      name: 'Dr. Emily Rodriguez',
      specialty: 'Dermatology',
      email: 'emily.rodriguez@clinic.com',
      phone: '+1 (555) 345-6789',
      location: 'Room 303',
      availability: 'available',
      nextAvailable: 'Now',
      experience: '15 years',
      rating: 4.7,
      todayAppointments: 6,
      totalAppointments: 1456
    },
    {
      id: '4',
      name: 'Dr. James Wilson',
      specialty: 'Orthopedics',
      email: 'james.wilson@clinic.com',
      phone: '+1 (555) 456-7890',
      location: 'Room 208',
      availability: 'offline',
      nextAvailable: 'Tomorrow 9:00 AM',
      experience: '20 years',
      rating: 4.9,
      todayAppointments: 0,
      totalAppointments: 2134
    },
    {
      id: '5',
      name: 'Dr. Lisa Thompson',
      specialty: 'Internal Medicine',
      email: 'lisa.thompson@clinic.com',
      phone: '+1 (555) 567-8901',
      location: 'Room 150',
      availability: 'available',
      nextAvailable: 'Now',
      experience: '10 years',
      rating: 4.6,
      todayAppointments: 9,
      totalAppointments: 1089
    }
  ];

  const filteredDoctors = doctors.filter(doctor => {
    const matchesSearch = doctor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         doctor.specialty.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || doctor.availability === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available': return 'success';
      case 'busy': return 'warning';
      case 'offline': return 'danger';
      default: return 'gray';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'available': return <CheckCircle size={16} />;
      case 'busy': return <Clock size={16} />;
      case 'offline': return <XCircle size={16} />;
      default: return null;
    }
  };

  return (
    <div className="doctors-page">
      <div className="page-header">
        <div>
          <h1>Doctors</h1>
          <p className="subtitle">Manage doctor availability and schedules</p>
        </div>
        <div className="header-actions">
          <button className="btn btn-primary">
            Add Doctor
          </button>
        </div>
      </div>

      <div className="doctors-controls">
        <div className="controls-left">
          <div className="search-bar">
            <Search size={20} />
            <input
              type="text"
              placeholder="Search doctors by name or specialty..."
              className="search-input"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <select
            className="form-select"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="all">All Status</option>
            <option value="available">Available</option>
            <option value="busy">Busy</option>
            <option value="offline">Offline</option>
          </select>
        </div>
        <div className="filter-info">
          <Filter size={16} />
          <span>{filteredDoctors.length} doctors found</span>
        </div>
      </div>

      <div className="doctors-grid">
        {filteredDoctors.map((doctor) => (
          <div key={doctor.id} className="doctor-card">
            <div className="doctor-header">
              <div className="doctor-avatar">
                {doctor.name.split(' ').map(n => n[0]).join('')}
              </div>
              <div className="doctor-info">
                <h3 className="doctor-name">{doctor.name}</h3>
                <p className="doctor-specialty">{doctor.specialty}</p>
                <div className="doctor-experience">{doctor.experience} experience</div>
              </div>
              <div className={`availability-badge ${getStatusColor(doctor.availability)}`}>
                {getStatusIcon(doctor.availability)}
                <span>{doctor.availability}</span>
              </div>
            </div>

            <div className="doctor-details">
              <div className="detail-row">
                <div className="detail-item">
                  <Mail size={16} />
                  <span>{doctor.email}</span>
                </div>
                <div className="detail-item">
                  <Phone size={16} />
                  <span>{doctor.phone}</span>
                </div>
              </div>
              <div className="detail-row">
                <div className="detail-item">
                  <MapPin size={16} />
                  <span>{doctor.location}</span>
                </div>
                <div className="detail-item">
                  <Clock size={16} />
                  <span>Next: {doctor.nextAvailable}</span>
                </div>
              </div>
            </div>

            <div className="doctor-stats">
              <div className="stat">
                <span className="stat-value">{doctor.todayAppointments}</span>
                <span className="stat-label">Today</span>
              </div>
              <div className="stat">
                <span className="stat-value">{doctor.totalAppointments}</span>
                <span className="stat-label">Total</span>
              </div>
              <div className="stat">
                <span className="stat-value">{doctor.rating}</span>
                <span className="stat-label">Rating</span>
              </div>
            </div>

            <div className="doctor-actions">
              <button className="btn btn-outline btn-sm">
                <Calendar size={16} />
                View Schedule
              </button>
              <button className="btn btn-primary btn-sm">
                Book Appointment
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Doctors;