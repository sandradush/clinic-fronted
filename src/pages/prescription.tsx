import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Activity, User, Clock, Calendar, Plus, Eye, Download, Printer, QrCode } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { makeApiRequest } from '../utils/api';
import toast from 'react-hot-toast';

interface AppointmentItem {
  id: number;
  date: string;
  time: string;
  description?: string;
  status?: string;
  patient_id?: number;
  patient_name?: string;
  doctor_id?: number;
  doctor_name?: string;
}

const Prescription: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [appointments, setAppointments] = useState<AppointmentItem[]>([]);
  const [selectedSymptoms, setSelectedSymptoms] = useState<any[] | null>(null);
  const [symptomsModalOpen, setSymptomsModalOpen] = useState(false);
  const [patientVitals, setPatientVitals] = useState<any | null>(null);
  const [vitalsLoading, setVitalsLoading] = useState(false);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [prescriptionTitle, setPrescriptionTitle] = useState('');
  const [prescriptionNotes, setPrescriptionNotes] = useState('');
  const [activeAppointment, setActiveAppointment] = useState<AppointmentItem | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [medModalOpen, setMedModalOpen] = useState(false);
  const [medForm, setMedForm] = useState({ name: '', dosage: '', frequency: '', notes: '' });
  const [medSubmitting, setMedSubmitting] = useState(false);
  const [prescriptionsModalOpen, setPrescriptionsModalOpen] = useState(false);
  const [prescriptions, setPrescriptions] = useState<any[] | null>(null);
  const [medicalsModalOpen, setMedicalsModalOpen] = useState(false);
  const [medicals, setMedicals] = useState<any[] | null>(null);
  const [summaryModalOpen, setSummaryModalOpen] = useState(false);
  const [summaryData, setSummaryData] = useState<any>(null);
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [perceptionModalOpen, setPerceptionModalOpen] = useState(false);
  const [perceptionForm, setPerceptionForm] = useState({ title: '', note: '' });
  const [perceptionSubmitting, setPerceptionSubmitting] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      if (!user?.id) return;
      setLoading(true);
      try {
        const data = await makeApiRequest(`/symptoms/doctor/${user.id}/appointments/today`);
        setAppointments(data || []);
      } catch (err) {
        console.error('Failed to load prescription data', err);
        toast.error('Failed to load data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  const openSymptoms = async (appt: AppointmentItem) => {
    setActiveAppointment(appt);
    setSymptomsModalOpen(true);
    setSelectedSymptoms(null);
    setPatientVitals(null);
    setVitalsLoading(true);
    try {
      const resp = await makeApiRequest(`/symptoms/appointment/${appt.id}`);
      setSelectedSymptoms(resp || []);
    } catch (err) {
      console.error('Failed to fetch symptoms', err);
      toast.error('Failed to load symptoms');
      setSelectedSymptoms([]);
    }
    try {
      if (appt.patient_id) {
        const vr = await makeApiRequest(`/devices/patient/${appt.patient_id}/readings?limit=1`);
        if (Array.isArray(vr) && vr.length > 0) setPatientVitals(vr[0]);
        else setPatientVitals(null);
      } else {
        setPatientVitals(null);
      }
    } catch (err) {
      console.error('Failed to fetch patient vitals', err);
      // don't show a toast here to avoid spamming; vitals are optional
      setPatientVitals(null);
    } finally {
      setVitalsLoading(false);
    }
  };


  const submitPrescription = async () => {
    if (!activeAppointment) return;
    if (!prescriptionTitle.trim() || !prescriptionNotes.trim()) {
      toast.error('Please provide title and notes');
      return;
    }
    setActionLoading(true);
    try {
      const payload = {
        appointment_id: activeAppointment.id,
        title: prescriptionTitle.trim(),
        note: prescriptionNotes.trim()
      };
      await makeApiRequest('/prescriptions', { method: 'POST', body: JSON.stringify(payload) });
      toast.success('Prescription saved');
      setAddModalOpen(false);
    } catch (err) {
      console.error('Failed to save prescription', err);
      toast.error('Failed to save prescription');
    } finally {
      setActionLoading(false);
    }
  };

  const submitPerception = async () => {
    if (!activeAppointment) return;
    if (!perceptionForm.title.trim() || !perceptionForm.note.trim()) {
      toast.error('Please provide title and note');
      return;
    }
    setPerceptionSubmitting(true);
    try {
      const payload = {
        appointment_id: activeAppointment.id,
        title: perceptionForm.title.trim(),
        note: perceptionForm.note.trim()
      };
      await makeApiRequest('/perceptions', { method: 'POST', body: JSON.stringify(payload) });
      toast.success('Perception saved');
      setPerceptionModalOpen(false);
      setPerceptionForm({ title: '', note: '' });
    } catch (err) {
      console.error('Failed to save perception', err);
      toast.error('Failed to save perception');
    } finally {
      setPerceptionSubmitting(false);
    }
  };

  const openPrescriptions = async (appt: AppointmentItem) => {
    setActiveAppointment(appt);
    setPrescriptions(null);
    setPrescriptionsModalOpen(true);
    try {
      const resp = await makeApiRequest(`/prescriptions/appointment/${appt.id}`);
      setPrescriptions(resp || []);
    } catch (err) {
      console.error('Failed to load prescriptions', err);
      toast.error('Failed to load prescriptions');
      setPrescriptions([]);
    }
  };

  const openMedicals = async (appt: AppointmentItem) => {
    setActiveAppointment(appt);
    setMedicals(null);
    setMedicalsModalOpen(true);
    try {
      const resp = await makeApiRequest(`/medicals/appointment/${appt.id}`);
      setMedicals(resp || []);
    } catch (err) {
      console.error('Failed to load medicals', err);
      toast.error('Failed to load medicals');
      setMedicals([]);
    }
  };

  const openSummary = async (appt: AppointmentItem) => {
    setActiveAppointment(appt);
    setSummaryData(null);
    setSummaryModalOpen(true);
    setSummaryLoading(true);
    
    try {
      const resp = await makeApiRequest(`/appointments/${appt.id}/summary`);
      setSummaryData(resp);
      
      // Generate QR code URL
      const baseUrl = window.location.origin;
      const summaryUrl = `${baseUrl}/appointment-summary/${appt.id}`;
      setQrCodeUrl(summaryUrl);
    } catch (err) {
      console.error('Failed to load summary', err);
      toast.error('Failed to load summary');
      setSummaryData(null);
    } finally {
      setSummaryLoading(false);
    }
  };

  const generateQRCode = (text: string) => {
    const canvas = document.createElement('canvas');
    const size = 150;
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');
    
    if (ctx) {
      // Simple QR code placeholder - you'd typically use a QR library here
      ctx.fillStyle = '#000';
      ctx.fillRect(0, 0, size, size);
      ctx.fillStyle = '#fff';
      ctx.font = '12px Arial';
      ctx.fillText('QR', size/2 - 10, size/2);
    }
    
    return canvas.toDataURL();
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPDF = async () => {
    if (!summaryData) return;
    
    try {
      // Create HTML content for PDF
      const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>Appointment Summary - ${summaryData.appointment?.patient_name}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; color: #333; }
            .header { text-align: center; border-bottom: 2px solid #2563eb; padding-bottom: 20px; margin-bottom: 30px; }
            .header h1 { color: #2563eb; margin: 0; }
            .section { margin-bottom: 30px; page-break-inside: avoid; }
            .section-header { background: #f8fafc; padding: 10px; border-left: 4px solid #2563eb; margin-bottom: 15px; }
            .appointment-info { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 20px; }
            .info-item { margin-bottom: 10px; }
            .info-label { font-weight: bold; color: #666; font-size: 14px; }
            .info-value { font-size: 16px; margin-top: 5px; }
            .item { background: #fff; border: 1px solid #e5e7eb; padding: 15px; margin-bottom: 10px; border-radius: 5px; }
            .item-title { font-weight: bold; color: #1f2937; margin-bottom: 8px; }
            .item-meta { font-size: 12px; color: #6b7280; margin-top: 10px; }
            .qr-section { float: right; text-align: center; margin: 0 0 20px 20px; }
            .qr-placeholder { width: 100px; height: 100px; border: 2px solid #ddd; display: flex; align-items: center; justify-content: center; font-size: 12px; color: #666; }
            @media print {
              body { margin: 0; }
              .no-print { display: none; }
            }
          </style>
        </head>
        <body>
          <div class="qr-section">
            <div class="qr-placeholder">QR Code</div>
            <p style="font-size: 10px; margin: 5px 0 0 0;">Scan to view online</p>
          </div>
          
          <div class="header">
            <h1>Appointment Summary</h1>
            <p style="margin: 10px 0 0 0; color: #666;">Appointment #${summaryData.appointment?.id}</p>
          </div>

          <div class="section">
            <div class="section-header">
              <h2 style="margin: 0; color: #2563eb;">Appointment Information</h2>
            </div>
            <div class="appointment-info">
              <div>
                <div class="info-item">
                  <div class="info-label">Patient</div>
                  <div class="info-value">${summaryData.appointment?.patient_name || 'N/A'}</div>
                </div>
                <div class="info-item">
                  <div class="info-label">Date</div>
                  <div class="info-value">${new Date(summaryData.appointment?.date).toLocaleDateString()}</div>
                </div>
              </div>
              <div>
                <div class="info-item">
                  <div class="info-label">Doctor</div>
                  <div class="info-value">${summaryData.appointment?.doctor_name || 'N/A'}</div>
                </div>
                <div class="info-item">
                  <div class="info-label">Time</div>
                  <div class="info-value">${summaryData.appointment?.time || 'N/A'}</div>
                </div>
              </div>
            </div>
            <div class="info-item">
              <div class="info-label">Description</div>
              <div class="info-value">${summaryData.appointment?.description || 'N/A'}</div>
            </div>
          </div>

          <div class="section">
            <div class="section-header">
              <h2 style="margin: 0; color: #dc2626;">Symptoms (${summaryData.symptoms?.length || 0})</h2>
            </div>
            ${summaryData.symptoms?.length ? 
              summaryData.symptoms.map((symptom: any) => `
                <div class="item">
                  <div class="item-title">${symptom.symptom_name}</div>
                  <p><strong>Value:</strong> ${symptom.value}</p>
                  <p>${symptom.description}</p>
                  <div class="item-meta">Recorded: ${new Date(symptom.created_at).toLocaleString()}</div>
                </div>
              `).join('') : 
              '<p style="color: #6b7280; font-style: italic;">No symptoms recorded</p>'
            }
          </div>

          <div class="section">
            <div class="section-header">
              <h2 style="margin: 0; color: #d97706;">Doctor's Perceptions (${summaryData.perceptions?.length || 0})</h2>
            </div>
            ${summaryData.perceptions?.length ? 
              summaryData.perceptions.map((perception: any) => `
                <div class="item">
                  <div class="item-title">${perception.title}</div>
                  <p>${perception.note}</p>
                  <div class="item-meta">Created: ${new Date(perception.created_at).toLocaleString()}</div>
                </div>
              `).join('') : 
              '<p style="color: #6b7280; font-style: italic;">No perceptions recorded</p>'
            }
          </div>

          <div class="section">
            <div class="section-header">
              <h2 style="margin: 0; color: #059669;">Prescribed Medications (${summaryData.medicals?.length || 0})</h2>
            </div>
            ${summaryData.medicals?.length ? 
              summaryData.medicals.map((medical: any) => `
                <div class="item">
                  <div class="item-title">${medical.medical_name}</div>
                  <p><strong>Dosage:</strong> ${medical.dosage}</p>
                  <p><strong>Frequency:</strong> ${medical.frequency}</p>
                  <p>${medical.note}</p>
                  <div class="item-meta">Prescribed: ${new Date(medical.created_at).toLocaleString()}</div>
                </div>
              `).join('') : 
              '<p style="color: #6b7280; font-style: italic;">No medications prescribed</p>'
            }
          </div>

          <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #e5e7eb; text-align: center; color: #6b7280; font-size: 12px;">
            Generated on ${new Date().toLocaleString()} | Clinic Management System
          </div>
        </body>
        </html>
      `;

      // Create a new window for printing/PDF generation
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(htmlContent);
        printWindow.document.close();
        
        // Wait for content to load then trigger print
        printWindow.onload = () => {
          setTimeout(() => {
            printWindow.print();
            printWindow.close();
          }, 100);
        };
        
        toast.success('PDF generation started');
      } else {
        toast.error('Unable to open print window. Please check popup settings.');
      }
    } catch (err) {
      console.error('Failed to generate PDF:', err);
      toast.error('Failed to generate PDF');
    }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="p-2 rounded hover:bg-gray-100">
            <ArrowLeft size={18} />
          </button>
          <h1 className="text-2xl font-semibold">Prescription</h1>
        </div>
       
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center gap-3 mb-4">
          <Activity className="text-indigo-600" size={20} />
          <h2 className="text-lg font-medium">Today's Appointments</h2>
        </div>

        {loading ? (
          <div className="text-center py-8">Loading...</div>
        ) : (
          <div className="space-y-3">
            {appointments.map((appt) => (
              <div key={appt.id} className="bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                <div className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4 flex-1">
                      <div className="w-14 h-14 bg-gradient-to-br from-brand-50 to-brand-100 rounded-xl flex items-center justify-center">
                        <User size={24} className="text-brand-700" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-semibold text-lg text-gray-900">{appt.patient_name}</h3>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            appt.status === 'approved' ? 'bg-green-100 text-green-700' :
                            appt.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                            'bg-gray-100 text-gray-700'
                          }`}>
                            {appt.status}
                          </span>
                        </div>
                        <div className="grid grid-cols-2 gap-4 text-sm text-gray-600 mb-3">
                          <div className="flex items-center gap-2">
                            <Calendar size={16} className="text-gray-400" />
                            <span>{new Date(appt.date).toLocaleDateString()}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Clock size={16} className="text-gray-400" />
                            <span>{appt.time}</span>
                          </div>
                        </div>
                        <p className="text-sm text-gray-700 bg-gray-50 p-2 rounded">{appt.description}</p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 flex flex-wrap items-center gap-2">
                    <button onClick={() => openSummary(appt)} className="px-4 py-2 bg-indigo-600 text-white rounded-lg flex items-center gap-2 hover:bg-indigo-700">
                      <Eye size={16} /> View Summary
                    </button>
                    <button onClick={() => { setActiveAppointment(appt); setMedForm({ name: '', dosage: '', frequency: '', notes: '' }); setMedModalOpen(true); }} className="px-3 py-2 bg-emerald-500 text-white rounded-lg flex items-center gap-2 hover:bg-emerald-600">
                      <Plus size={16} /> Add Med
                    </button>
                    <button onClick={() => { setActiveAppointment(appt); setPerceptionForm({ title: '', note: '' }); setPerceptionModalOpen(true); }} className="px-3 py-2 bg-orange-500 text-white rounded-lg flex items-center gap-2 hover:bg-orange-600">
                      <Plus size={16} /> Add prescription
                    </button>
                    <button onClick={() => openSymptoms(appt)} className="px-3 py-2 bg-brand-50 text-brand-700 border border-brand-100 rounded-lg flex items-center gap-2 hover:bg-brand-100">
                      <Eye size={16} /> View Symptoms
                    </button>
                  </div>
                </div>
              </div>
            ))}

            {appointments.length === 0 && (
              <div className="text-center text-gray-500 py-8">No appointments found for today.</div>
            )}
          </div>
        )}
      </div>

      {/* Symptoms Modal */}
      {symptomsModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Symptoms for Appointment #{activeAppointment?.id}</h3>
              <button onClick={() => setSymptomsModalOpen(false)} className="text-gray-500">Close</button>
            </div>
            <div className="mb-4">
              <h4 className="text-sm font-medium">Latest Vitals</h4>
              {vitalsLoading ? (
                <div className="text-sm text-gray-600">Loading vitals...</div>
              ) : patientVitals ? (
                <div className="flex gap-3 mt-2">
                  <div className="p-3 bg-gray-50 rounded">
                    <div className="text-xs text-gray-500">Heart Rate</div>
                    <div className="font-medium">{patientVitals.heart_rate_bpm} bpm</div>
                  </div>
                  <div className="p-3 bg-gray-50 rounded">
                    <div className="text-xs text-gray-500">SpO₂</div>
                    <div className="font-medium">{patientVitals.spo2}%</div>
                  </div>
                  <div className="p-3 bg-gray-50 rounded">
                    <div className="text-xs text-gray-500">Temperature</div>
                    <div className="font-medium">{patientVitals.temperature} °C</div>
                  </div>
                  <div className="p-3 bg-gray-50 rounded">
                    <div className="text-xs text-gray-500">Recorded</div>
                    <div className="text-xs text-gray-600">{new Date(patientVitals.created_at).toLocaleString()}</div>
                  </div>
                </div>
              ) : (
                <div className="text-sm text-gray-500 mt-2">No vitals available</div>
              )}
            </div>
            {selectedSymptoms === null ? (
              <div>Loading...</div>
            ) : selectedSymptoms.length === 0 ? (
              <div className="text-gray-500">No symptoms recorded.</div>
            ) : (
              <div className="space-y-3">
                {selectedSymptoms.map((s: any) => (
                  <div key={s.id} className="border p-3 rounded">
                    <div className="font-medium">{s.symptom_name}</div>
                    <div className="text-sm text-gray-600">Value: {s.value}</div>
                    <div className="text-sm mt-1">{s.description}</div>
                    <div className="text-xs text-gray-400 mt-2">Recorded: {new Date(s.created_at).toLocaleString()}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Add Prescription Modal */}
      {addModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Add Prescription for #{activeAppointment?.id}</h3>
              <button onClick={() => setAddModalOpen(false)} className="text-gray-500">Close</button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium mb-1">Title</label>
                <input value={prescriptionTitle} onChange={(e) => setPrescriptionTitle(e.target.value)} className="w-full px-3 py-2 border rounded" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Notes</label>
                <textarea value={prescriptionNotes} onChange={(e) => setPrescriptionNotes(e.target.value)} className="w-full px-3 py-2 border rounded" rows={4} />
              </div>

              <div className="flex items-center gap-2">
                <button onClick={submitPrescription} disabled={actionLoading} className="px-4 py-2 bg-indigo-600 text-white rounded disabled:opacity-50">
                  {actionLoading ? 'Saving...' : 'Save Prescription'}
                </button>
                <button onClick={() => setAddModalOpen(false)} className="px-4 py-2 border rounded">Cancel</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* View Prescriptions Modal */}
      {prescriptionsModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Prescriptions for Appointment #{activeAppointment?.id}</h3>
              <button onClick={() => setPrescriptionsModalOpen(false)} className="text-gray-500">Close</button>
            </div>

            {prescriptions === null ? (
              <div>Loading...</div>
            ) : prescriptions.length === 0 ? (
              <div className="text-gray-500">No prescriptions recorded.</div>
            ) : (
              <div className="space-y-3">
                {prescriptions.map((p: any) => (
                  <div key={p.id} className="border p-3 rounded">
                    <div className="font-medium">{p.title}</div>
                    <div className="text-sm text-gray-700 mt-1">{p.note}</div>
                    <div className="text-xs text-gray-400 mt-2">{new Date(p.created_at).toLocaleString()}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* View Medicals Modal */}
      {medicalsModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Medicals for Appointment #{activeAppointment?.id}</h3>
              <button onClick={() => setMedicalsModalOpen(false)} className="text-gray-500">Close</button>
            </div>

            {medicals === null ? (
              <div>Loading...</div>
            ) : medicals.length === 0 ? (
              <div className="text-gray-500">No medicals recorded.</div>
            ) : (
              <div className="space-y-3">
                {medicals.map((m: any) => (
                  <div key={m.id} className="border p-3 rounded">
                    <div className="font-medium">{m.medical_name}</div>
                    <div className="text-sm text-gray-700 mt-1">Dosage: {m.dosage} • {m.frequency}</div>
                    <div className="text-sm text-gray-700 mt-1">{m.note}</div>
                    <div className="text-xs text-gray-400 mt-2">{new Date(m.created_at).toLocaleString()}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Comprehensive Summary Modal */}
      {summaryModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold">Appointment Summary #{activeAppointment?.id}</h2>
              <div className="flex items-center gap-2">
                <button onClick={handlePrint} className="px-3 py-2 bg-gray-100 text-gray-700 rounded-lg flex items-center gap-2 hover:bg-gray-200">
                  <Printer size={16} /> Print
                </button>
                <button onClick={handleDownloadPDF} className="px-3 py-2 bg-brand-100 text-brand-700 rounded-lg flex items-center gap-2 hover:bg-brand-50">
                  <Download size={16} /> Download
                </button>
                <button onClick={() => setSummaryModalOpen(false)} className="text-gray-500 hover:text-gray-700">
                  Close
                </button>
              </div>
            </div>

            <div className="overflow-y-auto max-h-[calc(90vh-80px)]">
              {summaryLoading ? (
                <div className="flex items-center justify-center p-12">
                  <div className="text-center">
                    <div className="w-8 h-8 border-2 border-brand-100 border-t-brand-700 rounded-full animate-spin mx-auto mb-2"></div>
                    <p>Loading summary...</p>
                  </div>
                </div>
              ) : summaryData ? (
                <div className="p-6 space-y-6">
                  {/* QR Code Section */}
                  <div className="flex justify-end">
                    <div className="text-center">
                      <div className="w-32 h-32 bg-gray-100 rounded-lg flex items-center justify-center mb-2">
                        <QrCode size={80} className="text-gray-500" />
                      </div>
                      <p className="text-xs text-gray-600">Scan to view online</p>
                    </div>
                  </div>

                  {/* Appointment Details */}
                  <div className="bg-brand-50 rounded-lg p-4">
                    <h3 className="text-lg font-semibold mb-3 text-brand-700">Appointment Information</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-600">Patient</p>
                        <p className="font-medium">{summaryData.appointment?.patient_name}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Doctor</p>
                        <p className="font-medium">{summaryData.appointment?.doctor_name}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Date</p>
                        <p className="font-medium">{new Date(summaryData.appointment?.date).toLocaleDateString()}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Time</p>
                        <p className="font-medium">{summaryData.appointment?.time}</p>
                      </div>
                    </div>
                    <div className="mt-3">
                      <p className="text-sm text-gray-600">Description</p>
                      <p className="font-medium">{summaryData.appointment?.description}</p>
                    </div>
                  </div>

                  {/* Symptoms Section */}
                  <div className="bg-red-50 rounded-lg p-4">
                    <h3 className="text-lg font-semibold mb-3 text-red-800">Symptoms ({summaryData.symptoms?.length || 0})</h3>
                    {summaryData.symptoms?.length ? (
                      <div className="space-y-3">
                        {summaryData.symptoms.map((symptom: any) => (
                          <div key={symptom.id} className="bg-white rounded-lg p-3 border border-red-100">
                            <h4 className="font-medium text-red-700">{symptom.symptom_name}</h4>
                            <p className="text-sm text-gray-600 mt-1">Value: {symptom.value}</p>
                            <p className="text-sm text-gray-700 mt-1">{symptom.description}</p>
                            <p className="text-xs text-gray-400 mt-2">{new Date(symptom.created_at).toLocaleString()}</p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-600">No symptoms recorded</p>
                    )}
                  </div>

                  {/* Perceptions Section */}
                  <div className="bg-yellow-50 rounded-lg p-4">
                    <h3 className="text-lg font-semibold mb-3 text-yellow-800">Doctor's Perceptions ({summaryData.perceptions?.length || 0})</h3>
                    {summaryData.perceptions?.length ? (
                      <div className="space-y-3">
                        {summaryData.perceptions.map((perception: any) => (
                          <div key={perception.id} className="bg-white rounded-lg p-3 border border-yellow-100">
                            <h4 className="font-medium text-yellow-700">{perception.title}</h4>
                            <p className="text-sm text-gray-700 mt-1">{perception.note}</p>
                            <p className="text-xs text-gray-400 mt-2">{new Date(perception.created_at).toLocaleString()}</p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-600">No perceptions recorded</p>
                    )}
                  </div>

                  {/* Medications Section */}
                  <div className="bg-green-50 rounded-lg p-4">
                    <h3 className="text-lg font-semibold mb-3 text-green-800">Prescribed Medications ({summaryData.medicals?.length || 0})</h3>
                    {summaryData.medicals?.length ? (
                      <div className="space-y-3">
                        {summaryData.medicals.map((medical: any) => (
                          <div key={medical.id} className="bg-white rounded-lg p-3 border border-green-100">
                            <h4 className="font-medium text-green-700">{medical.medical_name}</h4>
                            <p className="text-sm text-gray-600 mt-1">Dosage: {medical.dosage}</p>
                            <p className="text-sm text-gray-600">Frequency: {medical.frequency}</p>
                            <p className="text-sm text-gray-700 mt-1">{medical.note}</p>
                            <p className="text-xs text-gray-400 mt-2">{new Date(medical.created_at).toLocaleString()}</p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-600">No medications prescribed</p>
                    )}
                  </div>
                </div>
              ) : (
                <div className="p-12 text-center">
                  <p className="text-gray-500">Failed to load summary data</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Add Medication Modal */}
      {medModalOpen && activeAppointment && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Add Medication for {activeAppointment.patient_name}</h2>
              <button onClick={() => setMedModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                Close
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Medication Name *</label>
                <input value={medForm.name} onChange={(e) => setMedForm({...medForm, name: e.target.value})} className="w-full px-3 py-2 border rounded" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Dosage *</label>
                <input value={medForm.dosage} onChange={(e) => setMedForm({...medForm, dosage: e.target.value})} className="w-full px-3 py-2 border rounded" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Frequency *</label>
                <select value={medForm.frequency} onChange={(e) => setMedForm({...medForm, frequency: e.target.value})} className="w-full px-3 py-2 border rounded">
                  <option value="">Select frequency</option>
                  <option value="Once daily">Once daily</option>
                  <option value="Twice daily">Twice daily</option>
                  <option value="3 times daily">3 times daily</option>
                  <option value="As needed">As needed</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                <textarea value={medForm.notes} onChange={(e) => setMedForm({...medForm, notes: e.target.value})} className="w-full px-3 py-2 border rounded" rows={3} />
              </div>

              <div className="flex gap-3 pt-2">
                <button onClick={() => setMedModalOpen(false)} className="flex-1 px-4 py-2 border rounded">Cancel</button>
                <button
                  onClick={async () => {
                    if (!activeAppointment) return;
                    if (!medForm.name.trim() || !medForm.dosage.trim() || !medForm.frequency.trim()) {
                      toast.error('Please fill medication fields');
                      return;
                    }
                    setMedSubmitting(true);
                    try {
                      await makeApiRequest('/medicals', {
                        method: 'POST',
                        body: JSON.stringify({
                          appointment_id: activeAppointment.id,
                          medical_name: medForm.name.trim(),
                          dosage: medForm.dosage.trim(),
                          frequency: medForm.frequency.trim(),
                          note: medForm.notes.trim()
                        })
                      });
                      toast.success('Medication added');
                      setMedModalOpen(false);
                    } catch (err) {
                      console.error('Failed to add medication', err);
                      toast.error('Failed to add medication');
                    } finally {
                      setMedSubmitting(false);
                    }
                  }}
                  disabled={medSubmitting}
                  className="flex-1 px-4 py-2 bg-emerald-600 text-white rounded disabled:opacity-50"
                >
                  {medSubmitting ? 'Saving...' : 'Add Medication'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Perception Modal */}
      {perceptionModalOpen && activeAppointment && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Add Perception for {activeAppointment.patient_name}</h2>
              <button onClick={() => setPerceptionModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                Close
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
                <input 
                  value={perceptionForm.title} 
                  onChange={(e) => setPerceptionForm({...perceptionForm, title: e.target.value})} 
                  className="w-full px-3 py-2 border rounded" 
                  placeholder="e.g., fever, cough, etc."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Notes *</label>
                <textarea 
                  value={perceptionForm.note} 
                  onChange={(e) => setPerceptionForm({...perceptionForm, note: e.target.value})} 
                  className="w-full px-3 py-2 border rounded" 
                  rows={4}
                  placeholder="e.g., drink malaria tabs and sleep under mosquito net"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button onClick={() => setPerceptionModalOpen(false)} className="flex-1 px-4 py-2 border rounded">Cancel</button>
                <button
                  onClick={submitPerception}
                  disabled={perceptionSubmitting}
                  className="flex-1 px-4 py-2 bg-orange-600 text-white rounded disabled:opacity-50"
                >
                  {perceptionSubmitting ? 'Saving...' : 'Add Perception'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Prescription;
