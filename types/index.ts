export interface Patient {
  id: string;
  name: string;
  email: string;
  dateOfBirth: string;
  age: number;
  gender: string;
  phone: string;
  lastVisit: string;
  status: string;
  conditions: string[];
}