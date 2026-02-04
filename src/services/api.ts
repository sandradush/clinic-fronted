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
  status?: 'pending' | 'approved' | 'rejected';
  password?: string;
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

export interface DoctorRequest {
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
  documents?: string[];
  notes?: string;
  password: string;
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

let mockPrescriptions: Prescription[] = [
  { id: '1', patientId: '1', doctorId: '1', medications: [{ name: 'Paracetamol', dosage: '500mg', frequency: 'Twice daily' }], date: '2024-01-10', status: 'active' },
];

let mockDoctorRequests: DoctorRequest[] = [
  {
    id: '1',
    name: 'Dr. Alice Uwimana',
    email: 'alice.uwimana@gmail.com',
    phone: '+250 788 123 456',
    specialty: 'Cardiology',
    experience: 5,
    qualifications: 'MD, Cardiology Specialist',
    licenseNumber: 'RW-DOC-2019-001',
    requestDate: '2024-01-10',
    status: 'pending',
    documents: ['license.pdf', 'cv.pdf', 'certificates.pdf']
  },
  {
    id: '2',
    name: 'Dr. John Mugisha',
    email: 'john.mugisha@gmail.com',
    phone: '+250 788 234 567',
    specialty: 'Pediatrics',
    experience: 8,
    qualifications: 'MD, Pediatrics',
    licenseNumber: 'RW-DOC-2018-045',
    requestDate: '2024-01-12',
    status: 'pending',
    documents: ['license.pdf', 'cv.pdf']
  }
];

let mockPendingUsers: Array<{
  id: string;
  name: string;
  email: string;
  password: string;
  status: 'pending' | 'approved' | 'rejected';
  requestId: string;
}> = [];

class ApiService {
  // Mock auth
  async login(email: string, password: string) {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        // Check if user is in pending users (not yet approved)
        const pendingUser = mockPendingUsers.find(u => u.email === email && u.password === password);
        if (pendingUser && pendingUser.status === 'pending') {
          reject(new Error('Your account is pending admin approval. Please wait for approval before logging in.'));
          return;
        }
        if (pendingUser && pendingUser.status === 'rejected') {
          reject(new Error('Your account application was rejected. Please contact admin.'));
          return;
        }
        
        // Normal login for approved users or admin
        resolve({
          session: { token: 'mock-token' },
          user: { email, name: email.split('@')[0], role: 'doctor' }
        });
      }, 500);
    });
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
    return new Promise(resolve => setTimeout(() => resolve([...mockPrescriptions]), 500));
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

  async createDoctor(doctorData: {
    name: string;
    specialty: string;
    phone: string;
    email: string;
    password: string;
  }) {
    return new Promise(resolve => {
      setTimeout(() => {
        const newDoctor: Doctor = {
          id: `doc_${Date.now()}`,
          name: doctorData.name,
          specialty: doctorData.specialty,
          email: doctorData.email,
          phone: doctorData.phone,
          experience: 0,
          availability: 'available',
          password: doctorData.password
        };
        mockDoctors.push(newDoctor);
        resolve({ success: true, doctor: newDoctor });
      }, 500);
    });
  }

  // Doctor request management
  async getDoctorRequests(): Promise<DoctorRequest[]> {
    return new Promise(resolve => setTimeout(() => resolve([...mockDoctorRequests]), 500));
  }

  async approveDoctorRequest(requestId: string) {
    return new Promise(resolve => {
      setTimeout(() => {
        const request = mockDoctorRequests.find(r => r.id === requestId);
        if (request) {
          request.status = 'approved';
          // Add approved doctor to doctors list
          const newDoctor: Doctor = {
            id: `doc_${Date.now()}`,
            name: request.name,
            specialty: request.specialty,
            email: request.email,
            phone: request.phone,
            experience: request.experience,
            availability: 'available',
            status: 'approved'
          };
          mockDoctors.push(newDoctor);
          
          // Approve user account
          const pendingUser = mockPendingUsers.find(u => u.requestId === requestId);
          if (pendingUser) {
            pendingUser.status = 'approved';
          }
        }
        resolve({ success: true });
      }, 500);
    });
  }

  async rejectDoctorRequest(requestId: string) {
    return new Promise(resolve => {
      setTimeout(() => {
        const request = mockDoctorRequests.find(r => r.id === requestId);
        if (request) request.status = 'rejected';
        
        // Reject user account
        const pendingUser = mockPendingUsers.find(u => u.requestId === requestId);
        if (pendingUser) {
          pendingUser.status = 'rejected';
        }
        
        resolve({ success: true });
      }, 500);
    });
  }

  async submitDoctorRequest(requestData: {
    name: string;
    email: string;
    phone: string;
    specialty: string;
    experience: number;
    qualifications: string;
    licenseNumber: string;
    documents: string[];
    password: string;
  }) {
    return new Promise(resolve => {
      setTimeout(() => {
        const requestId = `req_${Date.now()}`;
        const newRequest: DoctorRequest = {
          id: requestId,
          name: requestData.name,
          email: requestData.email,
          phone: requestData.phone,
          specialty: requestData.specialty,
          experience: requestData.experience,
          qualifications: requestData.qualifications,
          licenseNumber: requestData.licenseNumber,
          requestDate: new Date().toISOString().split('T')[0],
          status: 'pending',
          documents: requestData.documents,
          password: requestData.password
        };
        mockDoctorRequests.push(newRequest);
        
        // Create pending user account
        mockPendingUsers.push({
          id: `user_${Date.now()}`,
          name: requestData.name,
          email: requestData.email,
          password: requestData.password,
          status: 'pending',
          requestId: requestId
        });
        
        resolve({ success: true });
      }, 1000);
    });
  }

  async createAppointment(appointmentData: {
    patientName: string;
    patientPhone: string;
    patientEmail: string;
    date: string;
    time: string;
    type: string;
    doctor: string;
    notes: string;
  }) {
    return new Promise(resolve => {
      setTimeout(() => {
        const newAppointment: Appointment = {
          id: `apt_${Date.now()}`,
          patientId: `patient_${Date.now()}`,
          doctorId: '1', // Default doctor ID
          date: appointmentData.date,
          time: appointmentData.time,
          duration: 30,
          status: 'confirmed',
          type: appointmentData.type,
          notes: appointmentData.notes
        };
        mockAppointments.push(newAppointment);
        resolve({ success: true });
      }, 500);
    });
  }

  async createPrescription(prescriptionData: {
    patientName: string;
    medications: { name: string; dosage: string; frequency: string }[];
    notes: string;
  }) {
    return new Promise(resolve => {
      setTimeout(() => {
        const newPrescription: Prescription = {
          id: `rx_${Date.now()}`,
          patientId: `patient_${Date.now()}`,
          doctorId: '1', // Default doctor ID
          medications: prescriptionData.medications,
          date: new Date().toISOString().split('T')[0],
          status: 'active'
        };
        mockPrescriptions.push(newPrescription);
        resolve({ success: true });
      }, 500);
    });
  }
}

export const api = new ApiService();