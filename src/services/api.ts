// Types
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

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'https://clinic-backend-s2lx.onrender.com/api';

console.log('Using API Base URL:', API_BASE_URL);

class ApiService {
  private async request(endpoint: string, options: RequestInit = {}) {
    const token = JSON.parse(localStorage.getItem('session') || '{}').token;
    
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
      ...options,
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  // Auth
  async login(email: string, password: string) {
    return this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  }

  async register(name: string, email: string, password: string, role: 'admin' | 'doctor') {
    return this.request('/auth/signup', {
      method: 'POST',
      body: JSON.stringify({ name, email, password, role }),
    });
  }

  // Patients
  async getPatients() {
    return this.request('/patients');
  }

  // Doctors
  async getDoctors() {
    return this.request('/auth/doctors');
  }

  async createDoctor(doctorData: any) {
    return this.request('/doctors', {
      method: 'POST',
      body: JSON.stringify(doctorData),
    });
  }

  async updateDoctor(doctorId: string, data: any) {
    return this.request(`/doctors/${doctorId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async updateDoctorAvailability(doctorId: string, availability: 'available' | 'busy' | 'offline') {
    return this.request(`/doctors/${doctorId}`, {
      method: 'PUT',
      body: JSON.stringify({ availability }),
    });
  }

  // Appointments
  async getAppointments() {
    return this.request('/appointments');
  }

  async createAppointment(appointmentData: any) {
    return this.request('/appointments', {
      method: 'POST',
      body: JSON.stringify(appointmentData),
    });
  }

  async transferAppointment(appointmentId: string, newDoctorId: string) {
    return this.request(`/appointments/${appointmentId}/transfer`, {
      method: 'PUT',
      body: JSON.stringify({ newDoctorId }),
    });
  }

  // Prescriptions
  async getPrescriptions() {
    return this.request('/prescriptions');
  }

  async createPrescription(prescriptionData: any) {
    return this.request('/prescriptions', {
      method: 'POST',
      body: JSON.stringify(prescriptionData),
    });
  }

  async updatePrescription(prescriptionId: string, data: any) {
    return this.request(`/prescriptions/${prescriptionId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async cancelPrescription(prescriptionId: string) {
    return this.request(`/prescriptions/${prescriptionId}/cancel`, {
      method: 'PUT',
    });
  }

  async deletePrescription(prescriptionId: string) {
    return this.request(`/prescriptions/${prescriptionId}`, {
      method: 'DELETE',
    });
  }

  async updateProfile(data: any) {
    try {
      return await this.request('/profile', {
        method: 'PUT',
        body: JSON.stringify(data),
      });
    } catch (error: any) {
      console.error('API updateProfile error:', error);
      throw error;
    }
  }

  async changePassword(data: any) {
    return this.request('/profile/change-password', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  // Doctor Requests
  async getDoctorRequests() {
    return this.request('/doctor-requests');
  }

  async submitDoctorRequest(requestData: any, password: string) {
    return this.request('/doctor-requests', {
      method: 'POST',
      body: JSON.stringify({ ...requestData, password }),
    });
  }

  async approveDoctorRequest(requestId: string) {
    return this.request(`/doctor-requests/${requestId}/approve`, {
      method: 'PUT',
    });
  }

  async rejectDoctorRequest(requestId: string) {
    return this.request(`/doctor-requests/${requestId}/reject`, {
      method: 'PUT',
    });
  }

  async updateDoctorRequest(requestId: string, data: any) {
    return this.request(`/doctor-requests/${requestId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async getAvailableDoctors() {
    return this.request('/auth/doctors', {
      method: 'GET',
      headers: {
        'accept': 'application/json',
      },
    });
  }
}

export const api = new ApiService();