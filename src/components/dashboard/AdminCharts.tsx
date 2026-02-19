import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell
} from 'recharts';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

interface Appointment {
  id: string;
  patientId: string;
  doctorId: string;
  date: string;
  time: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  type: string;
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
}

interface AdminChartsProps {
  appointments: Appointment[];
  doctors: Doctor[];
}

// Bar Chart - Appointments by Status
export const AppointmentsByStatusChart: React.FC<{ appointments: Appointment[] }> = ({ appointments }) => {
  const statusCounts = appointments.reduce((acc, apt) => {
    const status = apt.status || 'pending';
    acc[status] = (acc[status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const data = [
    { name: 'Pending', value: statusCounts.pending || 0 },
    { name: 'Confirmed', value: statusCounts.confirmed || 0 },
    { name: 'Completed', value: statusCounts.completed || 0 },
    { name: 'Cancelled', value: statusCounts.cancelled || 0 },
  ];

  return (
    <div className="bg-white p-4 rounded-lg shadow-sm">
      <h3 className="text-lg font-semibold mb-4">Appointments by Status</h3>
      <ResponsiveContainer width="100%" height={250}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar dataKey="value" fill="#8884d8" name="Count" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

// Line Chart - Appointments over time
export const AppointmentsTrendChart: React.FC<{ appointments: Appointment[] }> = ({ appointments }) => {
  // Group appointments by date
  const dateCounts = appointments.reduce((acc, apt) => {
    const date = apt.date;
    if (date) {
      acc[date] = (acc[date] || 0) + 1;
    }
    return acc;
  }, {} as Record<string, number>);

  // Sort by date and take last 7 days
  const sortedDates = Object.keys(dateCounts).sort().slice(-7);
  const data = sortedDates.map(date => ({
    date: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    appointments: dateCounts[date] || 0,
  }));

  return (
    <div className="bg-white p-4 rounded-lg shadow-sm">
      <h3 className="text-lg font-semibold mb-4">Appointments Trend (Last 7 Days)</h3>
      <ResponsiveContainer width="100%" height={250}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Line type="monotone" dataKey="appointments" stroke="#82ca9d" strokeWidth={2} name="Appointments" />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

// Pie Chart - Doctors by Specialty
export const DoctorsBySpecialtyChart: React.FC<{ doctors: Doctor[] }> = ({ doctors }) => {
  const specialtyCounts = doctors.reduce((acc, doc) => {
    const specialty = doc.specialty || 'General';
    acc[specialty] = (acc[specialty] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const data = Object.entries(specialtyCounts).map(([name, value]) => ({
    name,
    value,
  }));

  return (
    <div className="bg-white p-4 rounded-lg shadow-sm">
      <h3 className="text-lg font-semibold mb-4">Doctors by Specialty</h3>
      <ResponsiveContainer width="100%" height={250}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
            outerRadius={80}
            fill="#8884d8"
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

// Combined Admin Charts Component
const AdminCharts: React.FC<AdminChartsProps> = ({ appointments, doctors }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
      <AppointmentsByStatusChart appointments={appointments} />
      <AppointmentsTrendChart appointments={appointments} />
      <DoctorsBySpecialtyChart doctors={doctors} />
    </div>
  );
};

export default AdminCharts;
