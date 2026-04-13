import React, { useMemo, useState, useEffect } from 'react';
import { Clock, User, Search, Plus, X, Mail, Phone, MapPin, Calendar, CreditCard } from 'lucide-react';
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
  const [page, setPage] = useState(1);
  const appointmentsPerPage = 6;
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

  // Patient info modal
  const [patientInfo, setPatientInfo] = useState<any | null>(null);
  const [patientInfoLoading, setPatientInfoLoading] = useState(false);


  useEffect(() => {
    // Fetch doctors and patients in parallel
    Promise.all([
      makeApiRequest('/auth/doctors', { method: 'GET', headers: { accept: 'application/json' } }),
      makeApiRequest('/auth/patients', { method: 'GET', headers: { accept: 'application/json' } }),
    ])
      .then(([docs, pats]) => {
        setDoctors(docs);
        setPatients(pats);
      })
      .catch((error) => {
        console.error('Failed to fetch data:', error);
      });
  }, []);

  const handlePatientClick = async (appointment: any) => {
    const found = patients.find(
      (p) => String(p.id) === String(appointment.patient_id) || p.name === appointment.patient_name
    );
    if (found) {
      setPatientInfo({ ...found, _appointment: appointment });
      return;
    }
    setPatientInfo({ name: appointment.patient_name, _appointment: appointment });
    if (appointment.patient_id) {
      setPatientInfoLoading(true);
      try {
        const data = await makeApiRequest(`/auth/patients/${appointment.patient_id}`);
        setPatientInfo({ ...data, _appointment: appointment });
      } catch {
        // keep what we have from appointment
      } finally {
        setPatientInfoLoading(false);
      }
    }
  };

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

  useEffect(() => {
    setPage(1);
  }, [searchTerm]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / appointmentsPerPage));
  const paginatedAppointments = useMemo(() => {
    const start = (page - 1) * appointmentsPerPage;
    return filtered.slice(start, start + appointmentsPerPage);
  }, [filtered, page]);

  const startIndex = filtered.length === 0 ? 0 : (page - 1) * appointmentsPerPage + 1;
  const endIndex = Math.min(page * appointmentsPerPage, filtered.length);

  return (
    <div className="p-2 sm:p-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 sm:mb-6">
        <h1 className="text-xl sm:text-2xl font-semibold mb-2 sm:mb-0">Appointments</h1>
      </div>

      <div className="bg-white rounded-lg p-3 sm:p-4 shadow-sm">
        <div className="flex flex-col gap-3 sm:gap-4 mb-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 flex-1">
              <div className="relative flex items-center w-full sm:max-w-md">
                <Search size={18} className="absolute left-3 text-gray-400" />
                <input
                  className="pl-10 pr-3 py-2 w-full border rounded focus:outline-none focus:ring-2 focus:ring-brand-100 text-sm"
                  placeholder="Search patient, phone, type, or doctor"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            <div className="flex items-center justify-between sm:justify-end gap-3 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <div className="text-xs text-gray-500">Showing</div>
                <div className="font-semibold">{startIndex}-{endIndex} of {filtered.length}</div>
              </div>
              <div className="text-sm text-gray-500 flex items-center gap-1">
                {loading ? 'Loading...' : <><Clock size={14} /> Today</>}
              </div>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <div className="min-w-full">
            {/* Skeleton rows while loading */}
            {loading && (
              <>
                {/* Mobile skeleton */}
                <div className="block sm:hidden space-y-3">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="bg-gray-50 rounded-lg p-3 border animate-pulse">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-8 h-8 rounded-full bg-gray-200" />
                        <div className="flex-1 space-y-1.5">
                          <div className="h-3 bg-gray-200 rounded w-1/2" />
                          <div className="h-2.5 bg-gray-200 rounded w-1/3" />
                        </div>
                        <div className="space-y-1.5 text-right">
                          <div className="h-3 bg-gray-200 rounded w-12 ml-auto" />
                          <div className="h-2.5 bg-gray-200 rounded w-16 ml-auto" />
                        </div>
                      </div>
                      <div className="h-2.5 bg-gray-200 rounded w-3/4 mb-2" />
                      <div className="flex justify-between">
                        <div className="h-5 bg-gray-200 rounded-full w-14" />
                        <div className="h-5 bg-gray-200 rounded-full w-16" />
                      </div>
                    </div>
                  ))}
                </div>
                {/* Desktop skeleton */}
                <table className="hidden sm:table w-full table-auto border-collapse">
                  <thead>
                    <tr className="text-left text-xs text-gray-500 border-b">
                      <th className="py-3 px-3">Time</th>
                      <th className="py-3 px-3">Date</th>
                      <th className="py-3 px-3">Patient</th>
                      <th className="py-3 px-3">Doctor</th>
                      <th className="py-3 px-3">Description</th>
                      <th className="py-3 px-3">Payment</th>
                      <th className="py-3 px-3">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Array.from({ length: 6 }).map((_, i) => (
                      <tr key={i} className="animate-pulse border-b last:border-0">
                        <td className="py-3 px-3"><div className="h-3 bg-gray-200 rounded w-14" /></td>
                        <td className="py-3 px-3"><div className="h-3 bg-gray-200 rounded w-20" /></td>
                        <td className="py-3 px-3">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full bg-gray-200 shrink-0" />
                            <div className="h-3 bg-gray-200 rounded w-24" />
                          </div>
                        </td>
                        <td className="py-3 px-3"><div className="h-3 bg-gray-200 rounded w-20" /></td>
                        <td className="py-3 px-3"><div className="h-3 bg-gray-200 rounded w-32" /></td>
                        <td className="py-3 px-3"><div className="h-5 bg-gray-200 rounded-full w-12" /></td>
                        <td className="py-3 px-3"><div className="h-5 bg-gray-200 rounded-full w-16" /></td>
                        <td className="py-3 px-3"><div className="h-6 bg-gray-200 rounded w-20" /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </>
            )}

            {!loading && (<>
            {/* Mobile Card View */}
            <div className="block sm:hidden space-y-3">
              {paginatedAppointments.map((a) => (
                <div key={a.id} className="bg-gray-50 rounded-lg p-3 border">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-8 h-8 rounded-full bg-brand-50 flex items-center justify-center text-brand-700">
                      <User size={14} />
                    </div>
                    <div className="flex-1">
                      <button
                        onClick={() => handlePatientClick(a)}
                        className="font-medium text-sm text-brand-700 hover:underline text-left"
                      >
                        {a.patient_name}
                      </button>
                      <div className="text-xs text-gray-500">Dr. {a.doctor_name}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium">{a.time}</div>
                      <div className="text-xs text-gray-500">{new Date(a.date).toLocaleDateString()}</div>
                    </div>
                  </div>
                  <div className="text-sm text-gray-700 mb-2">{a.description}</div>
                  <div className="flex items-center justify-between">
                    <div>
                      {a.payment_status && (
                        <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${a.payment_status === 'paid' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                          {a.payment_status}
                        </span>
                      )}
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      a.status === 'approved' ? 'bg-green-100 text-green-700' :
                      a.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-red-100 text-red-700'
                    }`}>
                      {a.status || 'pending'}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Desktop Table View */}
            <table className="hidden sm:table w-full table-auto border-collapse">
              <thead>
                <tr className="text-left text-xs text-gray-500 border-b">
                  <th className="py-3 px-3">Time</th>
                  <th className="py-3 px-3">Date</th>
                  <th className="py-3 px-3">Patient</th>
                  <th className="py-3 px-3">Doctor</th>
                  <th className="py-3 px-3">Description</th>
                  <th className="py-3 px-3">Payment</th>
                  <th className="py-3 px-3">Status</th>
                </tr>
              </thead>
              <tbody>
                {paginatedAppointments.map((a) => (
                  <tr key={a.id} className="hover:bg-gray-50">
                    <td className="py-3 px-3 align-top w-28 text-sm text-gray-700">{a.time}</td>
                    <td className="py-3 px-3 align-top text-sm text-gray-700">{new Date(a.date).toLocaleDateString()}</td>
                    <td className="py-3 px-3 align-top">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-brand-50 flex items-center justify-center text-brand-700"><User size={16} /></div>
                        <div>
                          <button
                            onClick={() => handlePatientClick(a)}
                            className="font-medium text-sm text-brand-700 hover:underline text-left"
                          >
                            {a.patient_name}
                          </button>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-3 align-top text-sm text-gray-700">{a.doctor_name}</td>
                    <td className="py-3 px-3 align-top text-sm text-gray-700">{a.description}</td>
                    <td className="py-3 px-3 align-top text-sm">
                      {a.payment_status ? (
                        <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${a.payment_status === 'paid' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                          {a.payment_status}
                        </span>
                      ) : (
                        <span className="text-xs text-gray-400">—</span>
                      )}
                    </td>
                    <td className="py-3 px-3 align-top text-sm">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        a.status === 'approved' ? 'bg-green-100 text-green-700' :
                        a.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-red-100 text-red-700'
                      }`}>
                        {a.status || 'pending'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            </>)}
          </div>

          {!loading && filtered.length === 0 && (
            <div className="py-8 text-center text-gray-500">No appointments found for the selected filters.</div>
          )}

          {filtered.length > 0 && (
            <div className="mt-4 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="text-sm text-gray-600 order-2 sm:order-1">
                Showing {startIndex}-{endIndex} of {filtered.length} appointments
              </div>
              <div className="flex items-center gap-2 order-1 sm:order-2">
                <button
                  type="button"
                  onClick={() => setPage((prev) => Math.max(1, prev - 1))}
                  disabled={page === 1}
                  className="px-3 py-2 bg-brand-700 text-white rounded-md text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-brand-600"
                >
                  Previous
                </button>
                <span className="px-3 py-2 text-sm text-gray-600">
                  {page} of {totalPages}
                </span>
                <button
                  type="button"
                  onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
                  disabled={page === totalPages}
                  className="px-3 py-2 bg-brand-700 text-white rounded-md text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-brand-600"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Patient Info Modal */}
      {patientInfo && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-md shadow-xl">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b">
              <h2 className="text-lg font-semibold text-gray-800">Patient Information</h2>
              <button onClick={() => setPatientInfo(null)} className="text-gray-400 hover:text-gray-600">
                <X size={20} />
              </button>
            </div>

            {patientInfoLoading ? (
              <div className="p-6 space-y-4 animate-pulse">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-full bg-gray-200" />
                  <div className="space-y-2 flex-1">
                    <div className="h-4 bg-gray-200 rounded w-1/2" />
                    <div className="h-3 bg-gray-200 rounded w-1/3" />
                  </div>
                </div>
                {[1,2,3,4].map(i => <div key={i} className="h-3 bg-gray-200 rounded w-full" />)}
              </div>
            ) : (
              <div className="p-6">
                {/* Avatar + name */}
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-16 h-16 rounded-full bg-brand-100 flex items-center justify-center shrink-0">
                    <span className="text-2xl font-bold text-brand-700">
                      {(patientInfo.name || '?').split(' ').map((n: string) => n[0]).slice(0, 2).join('').toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-800">{patientInfo.name || '—'}</h3>
                    {patientInfo.id && <p className="text-xs text-gray-400 mt-0.5">ID: #{patientInfo.id}</p>}
                  </div>
                </div>

                {/* Details */}
                <div className="space-y-3">
                  {patientInfo.email && (
                    <div className="flex items-center gap-3 text-sm text-gray-700">
                      <Mail size={16} className="text-brand-700 shrink-0" />
                      <span>{patientInfo.email}</span>
                    </div>
                  )}
                  {patientInfo.phone && (
                    <div className="flex items-center gap-3 text-sm text-gray-700">
                      <Phone size={16} className="text-brand-700 shrink-0" />
                      <span>{patientInfo.phone}</span>
                    </div>
                  )}
                  {(patientInfo.dateOfBirth || patientInfo.date_of_birth) && (
                    <div className="flex items-center gap-3 text-sm text-gray-700">
                      <Calendar size={16} className="text-brand-700 shrink-0" />
                      <span>DOB: {new Date(patientInfo.dateOfBirth || patientInfo.date_of_birth).toLocaleDateString()}</span>
                    </div>
                  )}
                  {patientInfo.address && (
                    <div className="flex items-center gap-3 text-sm text-gray-700">
                      <MapPin size={16} className="text-brand-700 shrink-0" />
                      <span>{patientInfo.address}</span>
                    </div>
                  )}
                </div>

                {/* Appointment context */}
                {patientInfo._appointment && (
                  <div className="mt-5 pt-4 border-t">
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Appointment Details</p>
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <p className="text-xs text-gray-400">Date</p>
                        <p className="font-medium">{new Date(patientInfo._appointment.date).toLocaleDateString()}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-400">Time</p>
                        <p className="font-medium">{patientInfo._appointment.time || '—'}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-400">Doctor</p>
                        <p className="font-medium">{patientInfo._appointment.doctor_name || '—'}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-400">Status</p>
                        <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${
                          patientInfo._appointment.status === 'approved' ? 'bg-green-100 text-green-700' :
                          patientInfo._appointment.status === 'pending' ? 'bg-amber-100 text-amber-700' :
                          'bg-red-100 text-red-700'
                        }`}>{patientInfo._appointment.status || 'pending'}</span>
                      </div>
                      {patientInfo._appointment.payment_status && (
                        <div>
                          <p className="text-xs text-gray-400">Payment</p>
                          <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${patientInfo._appointment.payment_status === 'paid' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                            {patientInfo._appointment.payment_status}
                          </span>
                        </div>
                      )}
                    </div>
                    {patientInfo._appointment.description && (
                      <div className="mt-3">
                        <p className="text-xs text-gray-400 mb-1">Description</p>
                        <p className="text-sm text-gray-700 bg-gray-50 rounded-lg p-2 border-l-4 border-brand-100">
                          {patientInfo._appointment.description}
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            <div className="px-6 py-4 border-t flex justify-end">
              <button
                onClick={() => setPatientInfo(null)}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 text-sm"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

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
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-700"
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-700"
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-700"
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-700"
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-700"
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
                  className="flex-1 px-4 py-2 bg-brand-700 text-white rounded-md hover:bg-brand-600 disabled:opacity-50"
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