import React, { useState, useEffect } from 'react';
import { Calendar, Clock, Plus, X, Save } from 'lucide-react';
import { makeApiRequest } from '../utils/api';
import toast from 'react-hot-toast';

interface Doctor {
  id: string;
  name: string;
  specialty: string;
}

interface WorkingHours {
  doctorId: string;
  monday: { start: string; end: string; isWorking: boolean };
  tuesday: { start: string; end: string; isWorking: boolean };
  wednesday: { start: string; end: string; isWorking: boolean };
  thursday: { start: string; end: string; isWorking: boolean };
  friday: { start: string; end: string; isWorking: boolean };
  saturday: { start: string; end: string; isWorking: boolean };
  sunday: { start: string; end: string; isWorking: boolean };
}

interface Holiday {
  id?: string;
  doctorId: string;
  date: string;
  reason: string;
}

const Schedules: React.FC = () => {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [selectedDoctor, setSelectedDoctor] = useState<string>('');
  const [workingHours, setWorkingHours] = useState<WorkingHours | null>(null);
  const [holidays, setHolidays] = useState<Holiday[]>([]);
  const [newHoliday, setNewHoliday] = useState({ date: '', reason: '' });
  const [loading, setLoading] = useState(false);

  const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

  useEffect(() => {
    fetchDoctors();
  }, []);

  useEffect(() => {
    if (selectedDoctor) {
      fetchDoctorSchedule(selectedDoctor);
      fetchDoctorHolidays(selectedDoctor);
    }
  }, [selectedDoctor]);

  const fetchDoctors = async () => {
    try {
      const data = await makeApiRequest('/doctors');
      setDoctors(data || []);
    } catch (error) {
      console.error('Failed to fetch doctors:', error);
    }
  };

  const fetchDoctorSchedule = async (doctorId: string) => {
    try {
      const data = await makeApiRequest(`/schedules/${doctorId}`);
      setWorkingHours(data || getDefaultWorkingHours(doctorId));
    } catch (error) {
      setWorkingHours(getDefaultWorkingHours(doctorId));
    }
  };

  const fetchDoctorHolidays = async (doctorId: string) => {
    try {
      const data = await makeApiRequest(`/holidays/${doctorId}`);
      setHolidays(data || []);
    } catch (error) {
      setHolidays([]);
    }
  };

  const getDefaultWorkingHours = (doctorId: string): WorkingHours => ({
    doctorId,
    monday: { start: '09:00', end: '17:00', isWorking: true },
    tuesday: { start: '09:00', end: '17:00', isWorking: true },
    wednesday: { start: '09:00', end: '17:00', isWorking: true },
    thursday: { start: '09:00', end: '17:00', isWorking: true },
    friday: { start: '09:00', end: '17:00', isWorking: true },
    saturday: { start: '09:00', end: '13:00', isWorking: false },
    sunday: { start: '09:00', end: '13:00', isWorking: false },
  });

  const handleWorkingHoursChange = (day: string, field: string, value: string | boolean) => {
    if (!workingHours) return;
    setWorkingHours({
      ...workingHours,
      [day]: { ...workingHours[day as keyof WorkingHours], [field]: value },
    });
  };

  const saveWorkingHours = async () => {
    if (!workingHours) return;
    setLoading(true);
    try {
      await makeApiRequest(`/schedules/${selectedDoctor}`, {
        method: 'POST',
        body: JSON.stringify(workingHours),
      });
      toast.success('Working hours saved successfully!');
    } catch (error) {
      toast.error('Failed to save working hours');
    } finally {
      setLoading(false);
    }
  };

  const addHoliday = async () => {
    if (!newHoliday.date || !newHoliday.reason) {
      toast.error('Please fill in all fields');
      return;
    }
    try {
      await makeApiRequest('/holidays', {
        method: 'POST',
        body: JSON.stringify({ ...newHoliday, doctorId: selectedDoctor }),
      });
      toast.success('Holiday added successfully!');
      setNewHoliday({ date: '', reason: '' });
      fetchDoctorHolidays(selectedDoctor);
    } catch (error) {
      toast.error('Failed to add holiday');
    }
  };

  const deleteHoliday = async (holidayId: string) => {
    try {
      await makeApiRequest(`/holidays/${holidayId}`, { method: 'DELETE' });
      toast.success('Holiday deleted successfully!');
      fetchDoctorHolidays(selectedDoctor);
    } catch (error) {
      toast.error('Failed to delete holiday');
    }
  };

  return (
    <div className="p-4 sm:p-6">
      <div className="mb-4 sm:mb-6">
        <h1 className="text-xl sm:text-2xl font-semibold">Doctor Schedules & Holidays</h1>
        <p className="text-sm text-gray-600">Manage working hours and holidays for doctors</p>
      </div>

      <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6 mb-4 sm:mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">Select Doctor</label>
        <select
          value={selectedDoctor}
          onChange={(e) => setSelectedDoctor(e.target.value)}
          className="w-full max-w-md px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-brand-700"
        >
          <option value="">Choose a doctor...</option>
          {doctors.map((doctor) => (
            <option key={doctor.id} value={doctor.id}>
              {doctor.name} - {doctor.specialty}
            </option>
          ))}
        </select>
      </div>

      {selectedDoctor && workingHours && (
        <>
      <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6 mb-4 sm:mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <Clock size={20} />
                Working Hours
              </h2>
              <button
                onClick={saveWorkingHours}
                disabled={loading}
                className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-brand-700 text-white rounded hover:bg-brand-600 disabled:opacity-50 text-sm"
              >
                <Save size={16} />
                Save Changes
              </button>
            </div>

            <div className="space-y-2">
              {days.map((day) => (
                <div key={day} className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 p-3 border rounded">
                  <div className="w-full sm:w-32 shrink-0">
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={workingHours[day as keyof WorkingHours].isWorking}
                        onChange={(e) => handleWorkingHoursChange(day, 'isWorking', e.target.checked)}
                        className="rounded"
                      />
                      <span className="font-medium capitalize">{day}</span>
                    </label>
                  </div>
                  {workingHours[day as keyof WorkingHours].isWorking && (
                    <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
                      <input
                        type="time"
                        value={workingHours[day as keyof WorkingHours].start}
                        onChange={(e) => handleWorkingHoursChange(day, 'start', e.target.value)}
                        className="px-2 sm:px-3 py-1.5 sm:py-2 border rounded text-sm"
                      />
                      <span className="text-gray-500">to</span>
                      <input
                        type="time"
                        value={workingHours[day as keyof WorkingHours].end}
                        onChange={(e) => handleWorkingHoursChange(day, 'end', e.target.value)}
                        className="px-2 sm:px-3 py-1.5 sm:py-2 border rounded text-sm"
                      />
                    </div>
                  )}
                  {!workingHours[day as keyof WorkingHours].isWorking && (
                    <span className="text-gray-500 text-sm">Off Day</span>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6">
            <h2 className="text-lg font-semibold flex items-center gap-2 mb-4">
              <Calendar size={20} />
              Holidays & Off Days
            </h2>

            <div className="mb-6 p-3 sm:p-4 bg-gray-50 rounded">
              <h3 className="font-medium mb-3">Add New Holiday</h3>
              <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                <input
                  type="date"
                  value={newHoliday.date}
                  onChange={(e) => setNewHoliday({ ...newHoliday, date: e.target.value })}
                  className="px-3 py-2 border rounded text-sm"
                />
                <input
                  type="text"
                  placeholder="Reason (e.g., Annual Leave)"
                  value={newHoliday.reason}
                  onChange={(e) => setNewHoliday({ ...newHoliday, reason: e.target.value })}
                  className="flex-1 px-3 py-2 border rounded text-sm"
                />
                <button
                  onClick={addHoliday}
                  className="flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 text-sm"
                >
                  <Plus size={16} />
                  Add
                </button>
              </div>
            </div>

            <div className="space-y-2">
              {holidays.length === 0 ? (
                <p className="text-gray-500 text-center py-4">No holidays scheduled</p>
              ) : (
                holidays.map((holiday) => (
                  <div key={holiday.id} className="flex items-center justify-between p-3 border rounded">
                    <div>
                      <p className="font-medium">{new Date(holiday.date).toLocaleDateString()}</p>
                      <p className="text-sm text-gray-600">{holiday.reason}</p>
                    </div>
                    <button
                      onClick={() => holiday.id && deleteHoliday(holiday.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded"
                    >
                      <X size={16} />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </>
      )}


    </div>
  );
};

export default Schedules;
