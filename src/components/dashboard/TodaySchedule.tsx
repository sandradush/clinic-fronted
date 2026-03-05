import React from 'react';
import { Clock, User, MapPin, Phone } from 'lucide-react';

const TodaySchedule: React.FC = () => {
  // Mock today's appointments
  const todaysAppointments = [
    {
      id: '1',
      time: '09:00',
      patient: 'Jean de Dieu',
      type: 'Consultation',
      duration: '30 min',
      status: 'confirmed',
      room: 'Room 101'
    },
    {
      id: '2',
      time: '10:30',
      patient: 'Marie Claire',
      type: 'Follow-up',
      duration: '45 min',
      status: 'waiting',
      room: 'Room 102'
    },
    {
      id: '3',
      time: '14:00',
      patient: 'Eric Ndayishimiye',
      type: 'Check-up',
      duration: '30 min',
      status: 'pending',
      room: 'Room 101'
    },
    {
      id: '4',
      time: '15:30',
      patient: 'Alice Mukamana',
      type: 'Vaccination',
      duration: '15 min',
      status: 'confirmed',
      room: 'Room 103'
    },
  ];

  const getStatusDotClass = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-emerald-500';
      case 'waiting': return 'bg-amber-400';
      case 'pending': return 'bg-sky-400';
      default: return 'bg-gray-400';
    }
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-green-100 text-green-700';
      case 'waiting': return 'bg-amber-100 text-amber-700';
      case 'pending': return 'bg-sky-100 text-sky-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="space-y-2">
      {todaysAppointments.map((appointment, index) => (
        <div key={appointment.id} className="flex items-start gap-2">
          <div className="flex flex-col items-center mt-1">
            <div className={`w-2 h-2 rounded-full ${getStatusDotClass(appointment.status)}`}></div>
            {index < todaysAppointments.length - 1 && <div className="w-px bg-gray-200 h-4 mt-1"></div>}
          </div>

          <div className="flex-1">
            <div className="ui-card p-2">
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-1 text-xs text-gray-600">
                  <Clock size={12} />
                  <span className="font-medium text-xs">{appointment.time}</span>
                  <span className="text-[10px] text-gray-400">({appointment.duration})</span>
                </div>
                <span className={`text-[10px] px-2 py-0.5 rounded-full ${getStatusBadgeClass(appointment.status)}`}>{appointment.status}</span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center">
                    <User size={12} />
                  </div>
                  <div className="text-xs">
                    <div className="font-medium text-xs truncate max-w-[180px]">{appointment.patient}</div>
                    <div className="text-[10px] text-gray-500">{appointment.type}</div>
                  </div>
                </div>

                <div className="flex flex-col items-end text-[10px] text-gray-500 gap-0.5">
                  <div className="flex items-center gap-1"><MapPin size={10} /> <span>{appointment.room}</span></div>
                  <div className="flex items-center gap-1"><Phone size={10} /> <span>Call</span></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}

      <div className="mt-1">
        <div className="flex gap-3 text-xs text-gray-600">
          <div className="flex flex-col items-center">
            <span className="text-sm font-medium">{todaysAppointments.length}</span>
            <span className="text-[10px] text-gray-400">Total</span>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-sm font-medium">{todaysAppointments.filter(a => a.status === 'confirmed').length}</span>
            <span className="text-[10px] text-gray-400">Confirmed</span>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-sm font-medium">{todaysAppointments.filter(a => a.status === 'waiting').length}</span>
            <span className="text-[10px] text-gray-400">Waiting</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TodaySchedule;