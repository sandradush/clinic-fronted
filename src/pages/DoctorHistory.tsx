import React, { useState, useEffect } from 'react';
import { Calendar, Clock, User, FileText, Eye, Download, Grid, List } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { makeApiRequest } from '../utils/api';
import toast from 'react-hot-toast';
import Card from '../components/common/Card';
import Button from '../components/common/Button';

interface Appointment {
  id: number;
  date: string;
  time: string;
  description: string;
  status: string;
  created_at: string;
  patient_id: number;
  patient_name: string;
  doctor_id: number;
  doctor_name: string;
  summary?: string;
  payment_status?: string;
}

interface Prescription {
  id: number;
  appointment_id: number;
  title: string;
  note: string;
  created_at: string;
}

const DoctorHistory: React.FC = () => {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Appointment | null>(null);
  const [prescriptions, setPrescriptions] = useState<{[key: number]: Prescription[]}>({});
  const [loadingPrescriptions, setLoadingPrescriptions] = useState<{[key: number]: boolean}>({});
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const navigate = useNavigate();


  useEffect(() => {
    const fetchEndedAppointments = async () => {
      if (!user?.id) return;
      try {
        setLoading(true);
        const data = await makeApiRequest(`/appointments/doctor/${user.id}`);
        // Only keep appointments that are completed
        const completedStatuses = ['completed', 'done', 'finished'];
        const completedAppointments = (data || []).filter((appt: Appointment) => 
          completedStatuses.includes(appt.status?.toLowerCase())
        );
        setAppointments(completedAppointments);
        
        // Fetch prescriptions for each completed appointment
        completedAppointments.forEach(appointment => {
          fetchPrescriptionForAppointment(appointment.id);
        });
      } catch (error) {
        console.error('Failed to load completed appointments:', error);
        toast.error('Failed to load appointments');
        setAppointments([]);
      } finally {
        setLoading(false);
      }
    };

    fetchEndedAppointments();
  }, [user]);

  const downloadConsultationSummary = (appointment: Appointment, prescription: Prescription) => {
    const content = `
CONSULTATION SUMMARY - MEDICAL RECORD
${'='.repeat(60)}

PATIENT INFORMATION:
Name: ${appointment.patient_name}
Patient ID: ${appointment.patient_id}
Consultation Date: ${new Date(appointment.date).toLocaleDateString()}
Consultation Time: ${appointment.time}
Doctor: Dr. ${user?.name || 'Doctor'}
Appointment ID: ${appointment.id}

${'='.repeat(60)}

${prescription.note}

${'='.repeat(60)}

CONSULTATION DETAILS:
Status: ${appointment.status}
Original Description: ${appointment.description || 'None provided'}
Summary Created: ${new Date(prescription.created_at).toLocaleString()}
Payment Status: ${appointment.payment_status || 'Not specified'}

${'='.repeat(60)}
Generated for Medical Record Preparation
Date: ${new Date().toLocaleString()}
SmartHealth Clinic Management System
    `.trim();

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `medical-record-${appointment.patient_name.replace(/\s+/g, '-')}-${new Date(appointment.date).toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success('Consultation summary downloaded for medical record preparation');
  };

  const downloadAllSummariesForPatient = (appointment: Appointment) => {
    const patientPrescriptions = prescriptions[appointment.id] || [];
    if (patientPrescriptions.length === 0) {
      toast.error('No consultation summaries available to download');
      return;
    }

    let combinedContent = `
COMPREHENSIVE MEDICAL RECORD
${'='.repeat(60)}

PATIENT INFORMATION:
Name: ${appointment.patient_name}
Patient ID: ${appointment.patient_id}
Doctor: Dr. ${user?.name || 'Doctor'}
Record Generated: ${new Date().toLocaleString()}

${'='.repeat(60)}
`;

    patientPrescriptions.forEach((prescription, index) => {
      combinedContent += `

CONSULTATION #${index + 1}
Date: ${new Date(prescription.created_at).toLocaleDateString()}
Title: ${prescription.title}

${prescription.note}

${'='.repeat(40)}`;
    });

    combinedContent += `

END OF MEDICAL RECORD
Total Consultations: ${patientPrescriptions.length}
SmartHealth Clinic Management System
    `;

    const blob = new Blob([combinedContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `complete-medical-record-${appointment.patient_name.replace(/\s+/g, '-')}-${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success('Complete medical record downloaded');
  };

  const fetchPrescriptionForAppointment = async (appointmentId: number) => {
    try {
      setLoadingPrescriptions(prev => ({ ...prev, [appointmentId]: true }));
      console.log(`Fetching prescriptions for appointment ${appointmentId}`);
      
      const data = await makeApiRequest(`/prescriptions/appointment/${appointmentId}`);
      console.log(`Prescription data for appointment ${appointmentId}:`, data);
      
      // Filter out empty strings and invalid entries
      const validPrescriptions = (data || []).filter((item: any) => 
        item && typeof item === 'object' && item.id && item.note && item.note.trim() !== ''
      );
      
      setPrescriptions(prev => ({ ...prev, [appointmentId]: validPrescriptions }));
    } catch (error) {
      console.error(`Failed to load prescription for appointment ${appointmentId}:`, error);
      setPrescriptions(prev => ({ ...prev, [appointmentId]: [] }));
    } finally {
      setLoadingPrescriptions(prev => ({ ...prev, [appointmentId]: false }));
    }
  };

  return (
    <div className="p-6">

      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Consultation History</h1>
        <div className="flex items-center gap-3">
          {/* View Toggle */}
          <div className="flex items-center bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-md transition-colors ${
                viewMode === 'grid' 
                  ? 'bg-white text-brand-700 shadow-sm' 
                  : 'text-gray-600 hover:text-gray-800'
              }`}
              title="Grid View"
            >
              <Grid size={18} />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-md transition-colors ${
                viewMode === 'list' 
                  ? 'bg-white text-brand-700 shadow-sm' 
                  : 'text-gray-600 hover:text-gray-800'
              }`}
              title="List View"
            >
              <List size={18} />
            </button>
          </div>
          
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-brand-700 text-white rounded-lg hover:bg-brand-600 transition-colors text-sm"
          >
            Refresh
          </button>
        </div>
      </div>

      {loading ? (
        <div className="animate-pulse space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-32 bg-gray-200 rounded"></div>
          ))}
        </div>
      ) : appointments.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm p-12 text-center">
          <FileText size={48} className="mx-auto text-gray-300 mb-4" />
          <p className="text-gray-500">No appointments for today</p>
        </div>
      ) : (
        <div className={viewMode === 'grid' ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4' : 'space-y-4'}>
          {appointments.map(appointment => {
            const isClickable = true;
            const initials = (appointment.patient_name || 'P')
              .split(' ')
              .map(s => s[0])
              .slice(0, 2)
              .join('')
              .toUpperCase();
            
            const appointmentPrescriptions = prescriptions[appointment.id] || [];
            const hasPrescription = appointmentPrescriptions.length > 0;

            if (viewMode === 'list') {
              // List View
              return (
                <Card
                  key={appointment.id}
                  className={`p-4 hover:shadow-md transition-shadow ${isClickable ? 'cursor-pointer' : ''}`}
                  onClick={() => setSelected(appointment) as any}
                  onKeyDown={(e: React.KeyboardEvent) => { if (e.key === 'Enter' || e.key === ' ') setSelected(appointment); }}
                  role="button"
                  tabIndex={0}
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-brand-100 flex items-center justify-center text-white font-semibold flex-shrink-0">
                      {initials}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-bold text-lg text-gray-900 truncate">{appointment.patient_name}</h3>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          {hasPrescription && (
                            <div className="w-2 h-2 rounded-full bg-green-500" title="Has prescription"></div>
                          )}
                          <span className="inline-block px-2 py-1 rounded-full text-xs font-medium bg-brand-100 text-brand-700 capitalize">
                            {appointment.status}
                          </span>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-sm text-gray-600 mb-2">
                        <div className="flex items-center gap-2">
                          <Calendar size={14} className="flex-shrink-0" />
                          <span>{new Date(appointment.date).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock size={14} className="flex-shrink-0" />
                          <span>{appointment.time}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <FileText size={14} className="flex-shrink-0" />
                          <span>ID: {appointment.patient_id}</span>
                        </div>
                      </div>
                      
                      {appointment.description && (
                        <p className="text-sm text-gray-700 line-clamp-2 mb-2">{appointment.description}</p>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {hasPrescription && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            const prescription = appointmentPrescriptions[0];
                            if (prescription) {
                              downloadConsultationSummary(appointment, prescription);
                            }
                          }}
                          className="px-3 py-2 bg-blue-500 text-white rounded text-sm hover:bg-blue-600 transition-colors flex items-center gap-1"
                          title="Download for medical record"
                        >
                          <Download size={14} />
                          Download
                        </button>
                      )}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelected(appointment);
                        }}
                        className="px-3 py-2 bg-gray-500 text-white rounded text-sm hover:bg-gray-600 transition-colors flex items-center gap-1"
                        title="View Details"
                      >
                        <Eye size={14} />
                        View
                      </button>
                    </div>
                  </div>
                </Card>
              );
            } else {
              // Grid View (Original)
              return (
                <Card
                  key={appointment.id}
                  className={`p-4 hover:shadow-md transition-shadow ${isClickable ? 'cursor-pointer' : ''}`}
                  onClick={() => setSelected(appointment) as any}
                  onKeyDown={(e: React.KeyboardEvent) => { if (e.key === 'Enter' || e.key === ' ') setSelected(appointment); }}
                  role="button"
                  tabIndex={0}
                >
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-full bg-brand-100 flex items-center justify-center text-white font-semibold">{initials}</div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h3 className="font-bold text-lg">{appointment.patient_name}</h3>
                        <div className="flex items-center gap-2">
                          {hasPrescription && (
                            <div className="w-2 h-2 rounded-full bg-green-500" title="Has prescription"></div>
                          )}
                          <span className="inline-block px-2 py-1 rounded-full text-xs font-medium bg-brand-100 text-brand-700 capitalize">
                            {appointment.status}
                          </span>
                        </div>
                      </div>

                      <div className="mt-3 grid grid-cols-1 sm:grid-cols-3 gap-2 text-sm text-gray-600">
                        <div className="flex items-center gap-2"><Calendar size={16} /><span>{new Date(appointment.date).toLocaleDateString()}</span></div>
                        <div className="flex items-center gap-2"><Clock size={16} /><span>{appointment.time}</span></div>
                        <div className="flex items-center gap-2"><FileText size={16} /><span>Patient ID: {appointment.patient_id}</span></div>
                      </div>

                      {appointment.description && (
                        <p className="mt-3 text-sm text-gray-700 line-clamp-3">{appointment.description}</p>
                      )}
                      
                      {hasPrescription && (
                        <div className="mt-3 flex items-center justify-between">
                          <div className="text-xs text-green-600 font-medium">
                            ✓ Consultation summary available
                          </div>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              const prescription = appointmentPrescriptions[0];
                              if (prescription) {
                                downloadConsultationSummary(appointment, prescription);
                              }
                            }}
                            className="px-2 py-1 bg-blue-500 text-white rounded text-xs hover:bg-blue-600 transition-colors flex items-center gap-1"
                            title="Download for medical record"
                          >
                            <Download size={12} />
                            Download
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </Card>
              );
            }
          })}
        </div>
      )}

      {/* Detail modal */}
      {selected && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" role="dialog" aria-modal="true">
          <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto p-6">
            <div className="flex items-start justify-between gap-4 mb-6">
              <div className="flex items-start gap-4">
                <div className="w-14 h-14 rounded-full bg-brand-100 flex items-center justify-center text-white font-semibold text-lg">
                  {(selected.patient_name||'P').split(' ').map(s=>s[0]).slice(0,2).join('').toUpperCase()}
                </div>
                <div>
                  <h2 className="text-xl font-bold">{selected.patient_name}</h2>
                  <p className="text-sm text-gray-600">Patient ID: {selected.patient_id}</p>
                </div>
              </div>
              <div className="text-right">
                <span className="inline-block px-3 py-1 rounded-full text-xs font-medium bg-brand-100 text-brand-700 capitalize">
                  {selected.status}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm text-gray-700 mb-6">
              <div className="flex items-center gap-2"><Calendar size={16} /><span>{new Date(selected.date).toLocaleDateString()}</span></div>
              <div className="flex items-center gap-2"><Clock size={16} /><span>{selected.time}</span></div>
              <div className="flex items-center gap-2"><FileText size={16} /><span>Created: {new Date(selected.created_at).toLocaleString()}</span></div>
            </div>

            {/* Consultation Summary from Prescriptions */}
            <div className="space-y-4">
              {loadingPrescriptions[selected.id] ? (
                <div className="p-4 bg-gray-50 rounded-lg">
                  <div className="animate-pulse">
                    <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-full mb-1"></div>
                    <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                  </div>
                </div>
              ) : prescriptions[selected.id]?.length > 0 ? (
                prescriptions[selected.id].map((prescription, index) => (
                  <div key={prescription.id} className="p-4 bg-gray-50 rounded-lg border">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-semibold text-gray-800 flex items-center gap-2">
                        <FileText size={18} className="text-blue-500" />
                        {prescription.title}
                      </h3>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-500">
                          {new Date(prescription.created_at).toLocaleDateString()}
                        </span>
                        <button
                          onClick={() => downloadConsultationSummary(selected, prescription)}
                          className="px-3 py-1 bg-blue-500 text-white rounded text-xs hover:bg-blue-600 transition-colors flex items-center gap-1"
                          title="Download this consultation summary"
                        >
                          <Download size={12} />
                          Download
                        </button>
                      </div>
                    </div>
                    
                    <div className="text-sm text-gray-700 whitespace-pre-wrap">
                      {prescription.note.split('\n\n').map((section: string, sectionIndex: number) => {
                        if (section.trim()) {
                          const lines = section.split('\n');
                          const header = lines[0];
                          const content = lines.slice(1).join('\n');
                          
                          if (header.includes(':')) {
                            return (
                              <div key={sectionIndex} className="mb-4">
                                <div className="font-semibold text-gray-800 mb-2 text-sm uppercase tracking-wide">
                                  {header.replace(':', '')}
                                </div>
                                <div className="pl-3 border-l-3 border-blue-200 bg-white p-3 rounded">
                                  {content || 'Not specified'}
                                </div>
                              </div>
                            );
                          }
                          return <div key={sectionIndex} className="mb-2">{section}</div>;
                        }
                        return null;
                      })}
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-4 bg-gray-50 rounded-lg text-center">
                  <FileText size={32} className="mx-auto text-gray-300 mb-2" />
                  <p className="text-gray-500 text-sm">No consultation summary available</p>
                  <p className="text-gray-400 text-xs mt-1">Summary will appear here after consultation is completed</p>
                </div>
              )}
            </div>

            {/* Original appointment description if available */}
            {selected.description && (
              <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                <h4 className="font-medium text-blue-800 mb-2">Original Appointment Description</h4>
                <p className="text-sm text-blue-700">{selected.description}</p>
              </div>
            )}

            <div className="mt-6 flex gap-2 justify-between">
              <div className="flex gap-2">
                {prescriptions[selected.id]?.length > 0 && (
                  <button
                    onClick={() => downloadAllSummariesForPatient(selected)}
                    className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors flex items-center gap-2"
                  >
                    <Download size={16} />
                    Download Complete Medical Record
                  </button>
                )}
              </div>
              <Button variant="secondary" onClick={() => setSelected(null)}>Close</Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};

export default DoctorHistory;
