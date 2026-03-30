import React, { useEffect, useState } from 'react';
import { Clock, User, Calendar, UserPlus } from 'lucide-react';
import toast from 'react-hot-toast';
import { api } from '../services/api';

interface AppointmentRequest {
  id: number;
  patient_name: string;
  doctor_name: string;
  doctor_id?: number;
  time: string;
  date: string;
  description: string;
  status: string;
}

interface Doctor {
  id: number;
  name: string;
  specialty: string;
  availability: string;
}

const WaitingPatients: React.FC = () => {
  const [appointments, setAppointments] = useState<AppointmentRequest[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAppointment, setSelectedAppointment] = useState<number | null>(null);
  const [selectedDoctor, setSelectedDoctor] = useState<string>('');

  useEffect(() => {
    fetchAppointments();
    fetchDoctors();
  }, []);

  const fetchAppointments = async () => {
    try {
      const data = await api.getWaitingAppointments();
      setAppointments(data || []);
    } catch (error) {
      toast.error('Failed to load waiting appointments');
    } finally {
      setLoading(false);
    }
  };

  const fetchDoctors = async () => {
    try {
      const data = await api.getAvailableDoctors();
      setDoctors(data || []);
    } catch (error) {
      console.error('Failed to fetch doctors:', error);
    }
  };

  const handleAssignDoctor = async (appointmentId: number) => {
    if (!selectedDoctor) {
      toast.error('Please select a doctor');
      return;
    }

    try {
      await api.assignDoctorToAppointment(appointmentId, parseInt(selectedDoctor));
      toast.success('Doctor assigned successfully');
      setSelectedAppointment(null);
      setSelectedDoctor('');
      fetchAppointments();
    } catch (error) {
      toast.error('Failed to assign doctor');
      console.error('Error assigning doctor:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="w-8 h-8 border-4 border-brand-100 border-t-brand-700 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6">
      <h1 className="text-xl sm:text-2xl font-semibold mb-4 sm:mb-6">Waiting Patients</h1>

      <div className="bg-white rounded-lg shadow-sm p-3 sm:p-6">
        <div className="space-y-3">
          {appointments.map((appointment) => (
            <div key={appointment.id} className="p-3 sm:p-4 border rounded-lg hover:bg-gray-50">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 sm:w-12 sm:h-12 shrink-0 rounded-full bg-brand-100 flex items-center justify-center">
                  <User size={20} className="text-brand-700" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
                    <div className="min-w-0">
                      <h3 className="font-medium text-base sm:text-lg truncate">{appointment.patient_name}</h3>
                      <p className="text-sm text-gray-600">
                        {appointment.doctor_name ? `Dr. ${appointment.doctor_name}` : 'No doctor assigned'}
                      </p>
                      {appointment.description && (
                        <p className="text-sm text-gray-500 mt-1 line-clamp-2">{appointment.description}</p>
                      )}
                      <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                        <div className="flex items-center gap-1.5 font-medium">
                          <Clock size={14} className="text-brand-700" />
                          {appointment.time}
                        </div>
                        <div className="flex items-center gap-1.5 text-xs text-gray-500">
                          <Calendar size={13} />
                          {new Date(appointment.date).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        setSelectedAppointment(appointment.id);
                        setSelectedDoctor(appointment.doctor_id?.toString() || '');
                      }}
                      className="flex items-center gap-2 px-3 py-2 sm:px-4 bg-brand-700 text-white rounded-lg hover:bg-brand-600 transition-colors text-sm shrink-0 self-start"
                    >
                      <UserPlus size={16} />
                      {appointment.doctor_id ? 'Reassign' : 'Assign'} Doctor
                    </button>
                  </div>
                </div>
              </div>

              {selectedAppointment === appointment.id && (
                <div className="mt-4 pt-4 border-t">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
                    <label className="text-sm font-medium text-gray-700 shrink-0">Select Doctor:</label>
                    <select
                      value={selectedDoctor}
                      onChange={(e) => setSelectedDoctor(e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-700 text-sm"
                    >
                      <option value="">Choose a doctor...</option>
                      {doctors.map((doctor) => (
                        <option key={doctor.id} value={doctor.id}>
                          Dr. {doctor.name} - {doctor.specialty} ({doctor.availability})
                        </option>
                      ))}
                    </select>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleAssignDoctor(appointment.id)}
                        className="flex-1 sm:flex-none px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
                      >
                        Confirm
                      </button>
                      <button
                        onClick={() => {
                          setSelectedAppointment(null);
                          setSelectedDoctor('');
                        }}
                        className="flex-1 sm:flex-none px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors text-sm"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default WaitingPatients;
