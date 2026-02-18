import React, { useMemo, useState, useEffect } from 'react';
import { Clock, User, Search, Plus, X } from 'lucide-react';
import { useAppointments } from '../hooks/useApiData';
import toast from 'react-hot-toast';
import { makeApiRequest } from '../utils/api';

interface NewAppointmentForm {
  patientId: string;
  date: string;
  time: string;
  doctor: string;
  notes: string;
}

const Appointments: React.FC = () => {
  const { appointments = [], loading, refetch } = useAppointments();
  const [searchTerm, setSearchTerm] = useState('');
  const [showNewAppointment, setShowNewAppointment] = useState(false);
  const [formData, setFormData] = useState<NewAppointmentForm>({
    patientId: '',
    date: '',
    time: '',
    doctor: '',
    notes: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [doctors, setDoctors] = useState<any[]>([]);
  const [patients, setPatients] = useState<any[]>([]);


  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch doctors
        const doctors = await makeApiRequest('/auth/doctors', {
          method: 'GET',
          headers: {
            'accept': 'application/json'
          }
        });
        setDoctors(doctors);

        // Fetch patients
        const patients = await makeApiRequest('/auth/patients', {
          method: 'GET',
          headers: {
            'accept': 'application/json'
          }
        });
        setPatients(patients);
      } catch (error) {
        console.error('Failed to fetch data:', error);
        toast.error('Failed to load data. Please try again later.');
      }
    };

    fetchData();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    
    try {
      // Build body matching curl example expected by backend
      const body = {
        id: 0,
        patient_id: Number(formData.patientId),
        doctor_id: Number(formData.doctor),
        date: formData.date,
        time: formData.time,
        description: formData.notes,
        created_at: new Date().toISOString(),
      };

      await makeApiRequest('/appointments', {
        method: 'POST',
        body: JSON.stringify(body),
      });

      toast.success('Appointment created successfully!');

      setFormData({
        patientId: '',
        date: '',
        time: '',
        doctor: '',
        notes: ''
      });
      setShowNewAppointment(false);
      refetch();
    } catch (error) {
      console.error('Failed to create appointment:', error);
      toast.error('Failed to create appointment. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };
  const rows = appointments as any[];

  const filtered = useMemo(() => {
    return rows.filter(r => {
      const hay = [r.patient_name, r.doctor_name, r.description, r.time].join(' ').toLowerCase();
      const matchesSearch = hay.includes(searchTerm.toLowerCase());
      return matchesSearch;
    });
  }, [rows, searchTerm]);

  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold">Appointments</h1>

        <div className="flex items-center gap-2">
          <button 
            onClick={() => setShowNewAppointment(true)}
            className="inline-flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded shadow-sm text-sm"
          >
            <Plus size={16} /> New Appointment
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg p-4 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
          <div className="flex items-center gap-3 flex-1">
            <div className="relative flex items-center w-full max-w-md">
              <Search size={18} className="absolute left-3 text-gray-400" />
              <input
                className="pl-10 pr-3 py-2 w-full border rounded focus:outline-none focus:ring-2 focus:ring-blue-200"
                placeholder="Search patient, phone, type, or doctor"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            {/* status filter removed — statuses are optional */}
          </div>

          <div className="flex items-center gap-3 text-sm text-gray-600">
            <div className="hidden sm:flex items-center gap-2">
              <div className="text-xs text-gray-500">Total</div>
              <div className="font-semibold">{rows.length}</div>
            </div>
            <div className="text-sm text-gray-500 flex items-center gap-1">{loading ? 'Loading...' : <><Clock size={14} /> Today</>}</div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full table-auto border-collapse">
            <thead>
              <tr className="text-left text-xs text-gray-500 border-b">
                <th className="py-3 px-3">Time</th>
                <th className="py-3 px-3">Date</th>
                <th className="py-3 px-3">Patient</th>
                <th className="py-3 px-3">Doctor</th>
                <th className="py-3 px-3">Description</th>
                
              </tr>
            </thead>
            <tbody>
              {filtered.map((a) => (
                <tr key={a.id} className="hover:bg-gray-50">
                  <td className="py-3 px-3 align-top w-28 text-sm text-gray-700">{a.time}</td>
                  <td className="py-3 px-3 align-top text-sm text-gray-700">{new Date(a.date).toLocaleDateString()}</td>
                  <td className="py-3 px-3 align-top">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-blue-50 flex items-center justify-center text-blue-600"><User size={16} /></div>
                      <div>
                        <div className="font-medium text-sm">{a.patient_name}</div>
                        <div className="text-xs text-gray-500">&nbsp;</div>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-3 align-top text-sm text-gray-700">{a.doctor_name}</td>
                  <td className="py-3 px-3 align-top text-sm text-gray-700">{a.description}</td>
                  {/* actions column removed */}
                </tr>
              ))}
            </tbody>
          </table>

          {filtered.length === 0 && (
            <div className="py-8 text-center text-gray-500">No appointments found for the selected filters.</div>
          )}
        </div>
      </div>

      {/* New Appointment Modal */}
      {showNewAppointment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">New Appointment</h2>
              <button 
                onClick={() => setShowNewAppointment(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* 1. Select Patient */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Patient *</label>
                <select
                  name="patientId"
                  value={formData.patientId}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Select patient</option>
                  {patients.map(patient => (
                    <option key={patient.id} value={patient.id}>{patient.name}</option>
                  ))}
                </select>
              </div>

              {/* 2. Select Doctor */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Doctor *</label>
                <select
                  name="doctor"
                  value={formData.doctor}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Select doctor</option>
                  {doctors.map(doctor => (
                    <option key={doctor.id} value={doctor.id}>{doctor.name}</option>
                  ))}
                </select>
              </div>

              {/* 3. Date and Time */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date *</label>
                  <input
                    type="date"
                    name="date"
                    value={formData.date}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Time *</label>
                  <input
                    type="time"
                    name="time"
                    value={formData.time}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
              </div>

              {/* 4. Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Appointment description or notes..."
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowNewAppointment(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                >
                  {submitting ? 'Creating...' : 'Create Appointment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Appointments;