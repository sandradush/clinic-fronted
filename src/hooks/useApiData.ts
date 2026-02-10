import { useState, useEffect } from 'react';
import { makeApiRequest } from '../utils/api';

interface Patient {
  id: string;
  name: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  address: string;
}

interface Doctor {
  location: any;
  nextAvailable: string;
  totalAppointments: number;
  rating: string;
  todayAppointments: number;
  id: string;
  name: string;
  specialty: string;
  email: string;
  phone: string;
  experience: number;
  availability: 'available' | 'busy' | 'offline';
  status?: string;
  password?: string;
}

interface Appointment {
  id: string;
  patientId: string;
  doctorId: string;
  date: string;
  time: string;
  duration: number;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  type: string;
  notes?: string;
}

interface Prescription {
  id: string;
  patientId: string;
  doctorId: string;
  medications: { name: string; dosage: string; frequency: string }[];
  date: string;
  status: 'active' | 'completed';
}

interface DoctorRequest {
  id: string;
  name: string;
  email: string;
  phone: string;
  specialty: string;
  experience: number;
  qualifications: string;
  licenseNumber: string;
  requestDate: string;
  status: 'pending' | 'approved' | 'rejected';
  documents: string[];
}

export const usePatients = () => {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchPatients = async () => {
    try {
      setLoading(true);
      const data = await makeApiRequest('/patients');
      setPatients(data);
      setError(null);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPatients();
  }, []);

  return { patients, loading, error, refetch: fetchPatients };
};

export const useDoctors = () => {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchDoctors = async () => {
    try {
      setLoading(true);
      const data = await makeApiRequest('/doctors');
      setDoctors(data);
      setError(null);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDoctors();
  }, []);

  return { doctors, loading, error, refetch: fetchDoctors };
};

export const useAppointments = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const data = await makeApiRequest('/appointments');
      setAppointments(data);
      setError(null);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  return { appointments, loading, error, refetch: fetchAppointments };
};

export const usePrescriptions = () => {
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchPrescriptions = async () => {
    try {
      setLoading(true);
      const data = await makeApiRequest('/prescriptions');
      setPrescriptions(data);
      setError(null);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPrescriptions();
  }, []);

  return { prescriptions, loading, error, refetch: fetchPrescriptions };
};

export const useDoctorRequests = (doctorId?: string) => {
  const [doctorRequests, setDoctorRequests] = useState<DoctorRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchDoctorRequests = async () => {
    try {
      setLoading(true);
      const endpoint = doctorId ? `/doctor-requests/doctor/${doctorId}` : '/doctor-requests';
      const data = await makeApiRequest(endpoint);
      setDoctorRequests(data);
      setError(null);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDoctorRequests();
  }, [doctorId]);

  return { doctorRequests, loading, error, refetch: fetchDoctorRequests };
};
