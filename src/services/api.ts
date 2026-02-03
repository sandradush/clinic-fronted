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

// Mock data
let mockDoctors: Doctor[] = [
  { id: '1', name: 'Dr. Sandra', specialty: 'General Medicine', email: 'sandra@clinic.com', phone: '078 555 0001', experience: 8, availability: 'available' },
  { id: '2', name: 'Dr. Paul', specialty: 'Pediatrics', email: 'paul@clinic.com', phone: '078 555 0002', experience: 12, availability: 'busy' },
];

let mockAppointments: Appointment[] = [
  { id: '1', patientId: '1', doctorId: '1', date: '2024-01-15', time: '09:00', duration: 30, status: 'confirmed', type: 'Consultation' },
  { id: '2', patientId: '2', doctorId: '1', date: '2024-01-15', time: '10:30', duration: 45, status: 'pending', type: 'Follow-up' },
];

class ApiService {
  // Mock auth
  async login(email: string, password: string) {
    return new Promise(resolve => setTimeout(() => resolve({
      session: { token: 'mock-token' },
      user: { email, name: email.split('@')[0], role: 'doctor' }
    }), 500));
  }

  async register(name: string, email: string, password: string, role: 'admin' | 'doctor') {
    return new Promise(resolve => setTimeout(() => resolve({
      session: { token: 'mock-token' },
      user: { email, name, role }
    }), 500));
  }

  // Mock data
  async getPatients(): Promise<Patient[]> {
    return new Promise(resolve => setTimeout(() => resolve([
      { id: '1', name: 'Jean de Dieu', email: 'jean@example.com', phone: '078 123 4567', dateOfBirth: '1990-05-15', address: 'Kigali, Rwanda' },
      { id: '2', name: 'Marie Claire', email: 'marie@example.com', phone: '073 987 6543', dateOfBirth: '1985-08-22', address: 'Butare, Rwanda' },
    ]), 500));
  }
  
  async getDoctors(): Promise<Doctor[]> {
    return new Promise(resolve => setTimeout(() => resolve([...mockDoctors]), 500));
  }
  
  async getAppointments(): Promise<Appointment[]> {
    return new Promise(resolve => setTimeout(() => resolve([...mockAppointments]), 500));
  }
  
  async getPrescriptions(): Promise<Prescription[]> {
    return new Promise(resolve => setTimeout(() => resolve([
      { id: '1', patientId: '1', doctorId: '1', medications: [{ name: 'Paracetamol', dosage: '500mg', frequency: 'Twice daily' }], date: '2024-01-10', status: 'active' },
    ]), 500));
  }

  // Mock admin functions
  async transferAppointment(appointmentId: string, newDoctorId: string) {
    return new Promise(resolve => {
      setTimeout(() => {
        const apt = mockAppointments.find(a => a.id === appointmentId);
        if (apt) apt.doctorId = newDoctorId;
        resolve({ success: true });
      }, 500);
    });
  }

  async updateDoctorAvailability(doctorId: string, availability: 'available' | 'busy' | 'offline') {
    return new Promise(resolve => {
      setTimeout(() => {
        const doctor = mockDoctors.find(d => d.id === doctorId);
        if (doctor) doctor.availability = availability;
        resolve({ success: true });
      }, 500);
    });
  }
}

export const api = new ApiService();