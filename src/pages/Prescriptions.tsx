import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FileText, Search, Plus, Printer } from 'lucide-react';
import { format } from 'date-fns';

const Prescriptions: React.FC = () => {
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState('');

  // Mock prescriptions data
  const prescriptions = [
    {
      id: 'RX-001',
      patientName: 'Jean de Dieu',
      date: '2024-01-15',
      medications: [
        { name: 'Amoxicillin', dosage: '500mg', frequency: '3 times daily' },
        { name: 'Paracetamol', dosage: '500mg', frequency: 'As needed' }
      ],
      status: 'active',
      doctor: 'Dr. Sandra',
    },
    {
      id: 'RX-002',
      patientName: 'Marie Claire',
      date: '2024-01-10',
      medications: [
        { name: 'Metformin', dosage: '850mg', frequency: '2 times daily' }
      ],
      status: 'completed',
      doctor: 'Dr. Sandra',
    },
  ];

  return (
    <div className="prescriptions-page">
      {/* Page Header */}
      <div className="page-header">
        <div>
          <h1>Prescriptions</h1>
          <p className="subtitle">Write and manage patient prescriptions</p>
        </div>
        <div className="header-actions">
          <button className="btn btn-primary">
            <Plus size={18} />
            New Prescription
          </button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="search-section">
        <div className="search-bar">
          <Search size={20} />
          <input
            type="text"
            placeholder="Search prescriptions..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>

      </div>

      {/* Prescriptions List */}
      <div className="prescriptions-list">
        {prescriptions.map((prescription) => (
          <div key={prescription.id} className="prescription-card">
            <div className="prescription-header">
              <div className="prescription-id">
                <FileText size={20} />
                <span>{prescription.id}</span>
              </div>
              <div className={`status-badge ${prescription.status}`}>
                {prescription.status}
              </div>
            </div>

            <div className="prescription-body">
              <div className="patient-info">
                <h4>{prescription.patientName}</h4>
                <p>{format(new Date(prescription.date), 'MMM dd, yyyy')}</p>
              </div>

              <div className="medications-list">
                <h5>Medications:</h5>
                {prescription.medications.map((med, index) => (
                  <div key={index} className="medication-item">
                    <span className="med-name">{med.name}</span>
                    <span className="med-dosage">{med.dosage}</span>
                    <span className="med-frequency">{med.frequency}</span>
                  </div>
                ))}
              </div>

              <div className="prescription-footer">
                <span className="doctor">{prescription.doctor}</span>
                <div className="prescription-actions">
                  <button className="btn btn-sm btn-outline">
                    <Printer size={14} />
                    Print
                  </button>
                  <button className="btn btn-sm btn-black">
                    Edit
                  </button>
                  <button className="btn btn-sm btn-black">
                    Update
                  </button>
                  <button className="btn btn-sm btn-black">
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Prescriptions;