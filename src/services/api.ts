export interface Patient {
  id: string;
  name: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  address: string;
}

export interface Doctor {
  id: string;
  name: string;
  specialty: string;
  email: string;
  phone: string;
  experience: number;
  availability: 'available' | 'busy' | 'offline';
}

export interface Appointment {
  id: string;
  patientId: string;
  doctorId: string;
  date: string;
  time: string;
  duration: number;
  status: 'confirmed' | 'pending' | 'cancelled';
  type: string;
  notes?: string;
}

export interface Prescription {
  id: string;
  patientId: string;
  doctorId: string;
  medications: Array<{
    name: string;
    dosage: string;
    frequency: string;
  }>;
  date: string;
  status: 'active' | 'completed';
}

export const api = {
  getPatients: async (): Promise<Patient[]> => {
    return [];
  },
  
  getDoctors: async (): Promise<Doctor[]> => {
    return [];
  },
  
  getAppointments: async (): Promise<Appointment[]> => {
    return [];
  },
  
  getPrescriptions: async (): Promise<Prescription[]> => {
    return [];
  }
};