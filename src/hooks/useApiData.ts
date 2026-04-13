import { useState, useEffect, useRef } from 'react';
import { makeApiRequest } from '../utils/api';

// Simple in-memory cache so navigating away and back shows data instantly
const cache: Record<string, any[]> = {};

interface Patient {
  id: string;
  name: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  address: string;
}

interface Doctor {
  id: string;
  name: string;
  specialty: string;
  email: string;
  phone: string;
  experience: number;
  availability: 'online' | 'offline' | 'busy';
  status?: string;
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
  const [loading, setLoading] = useState(false);
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
  const [loading, setLoading] = useState(false);
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
  const CACHE_KEY = '/appointments';
  const [appointments, setAppointments] = useState<Appointment[]>(cache[CACHE_KEY] ?? []);
  // Only show loading spinner on the very first fetch (no cached data yet)
  const [loading, setLoading] = useState(!cache[CACHE_KEY]);
  const [error, setError] = useState<Error | null>(null);

  const fetchAppointments = async (showSpinner = false) => {
    try {
      if (showSpinner) setLoading(true);
      const data = await makeApiRequest(CACHE_KEY);
      cache[CACHE_KEY] = data;
      setAppointments(data);
      setError(null);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // If we already have cached data, refresh silently in the background
    fetchAppointments(!cache[CACHE_KEY]);
  }, []);

  return { appointments, loading, error, refetch: () => fetchAppointments(false) };
};

export const usePrescriptions = () => {
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [loading, setLoading] = useState(false);
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
  const [loading, setLoading] = useState(false);
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
