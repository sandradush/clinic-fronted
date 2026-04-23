import React, { useState, useEffect } from 'react';
import { FileText, Calendar, Clock, User, Download, Eye } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { makeApiRequest } from '../utils/api';
import toast from 'react-hot-toast';

interface Prescription {
  id: number;
  title: string;
  note: string;
  created_at: string;
  appointment_id: number;
  appointment?: {
    date: string;
    time: string;
    doctor_name: string;
    patient_name: string;
  };
}

const PatientPrescriptions: React.FC = () => {
  const { user } = useAuth();
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPrescription, setSelectedPrescription] = useState<Prescription | null>(null);

  useEffect(() => {
    fetchPatientPrescriptions();
  }, [user]);

  const fetchPatientPrescriptions = async () => {
    if (!user?.id) return;
    
    try {
      setLoading(true);
      // Fetch prescriptions for the current patient
      const data = await makeApiRequest(`/prescriptions/patient/${user.id}`);
      setPrescriptions(data || []);
    } catch (error) {
      console.error('Failed to fetch prescriptions:', error);
      toast.error('Failed to load prescriptions');
      setPrescriptions([]);
    } finally {
      setLoading(false);
    }
  };

  const formatSummarySection = (text: string) => {
    const sections = text.split('\n\n');
    return sections.map((section, index) => {
      if (section.trim()) {
        const lines = section.split('\n');
        const header = lines[0];
        const content = lines.slice(1).join('\n');
        
        if (header.includes(':')) {
          return (
            <div key={index} className="mb-4">
              <div className="font-semibold text-blue-800 mb-2 text-sm uppercase tracking-wide">
                {header.replace(':', '')}
              </div>
              <div className="pl-3 border-l-3 border-blue-200 text-gray-700 text-sm leading-relaxed">
                {content}
              </div>
            </div>
          );
        }
        return <div key={index} className="mb-3 text-sm text-gray-700">{section}</div>;
      }
      return null;
    });
  };

  const downloadPrescription = (prescription: Prescription) => {
    const content = `
PRESCRIPTION
${prescription.title}

Date: ${new Date(prescription.created_at).toLocaleDateString()}
Doctor: ${prescription.appointment?.doctor_name || 'N/A'}
Patient: ${prescription.appointment?.patient_name || user?.name || 'N/A'}

${prescription.note}

Generated on ${new Date().toLocaleString()}
Smarthealth Clinic Management System
    `.trim();

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `prescription-${prescription.id}-${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success('Prescription downloaded');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading prescriptions...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="px-4 py-4">
          <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <FileText className="text-blue-600" size={24} />
            My Consultation Summaries
          </h1>
          <p className="text-sm text-gray-600 mt-1">View your consultation summaries and prescriptions from your doctor</p>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        {prescriptions.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-8 text-center">
            <FileText size={48} className="mx-auto text-gray-300 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Consultation Summaries Yet</h3>
            <p className="text-gray-600">Your consultation summaries and prescriptions from your doctor will appear here after your appointments are completed.</p>
            <div className="mt-4 p-4 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-700">
                <strong>How it works:</strong> After your consultation with the doctor, they will create a summary with your diagnosis, treatment plan, and recommendations. You'll be able to view and download it here.
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {prescriptions.map((prescription) => (
              <div key={prescription.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                <div className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 mb-1">{prescription.title}</h3>
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <div className="flex items-center gap-1">
                          <Calendar size={14} />
                          <span>{new Date(prescription.created_at).toLocaleDateString()}</span>
                        </div>
                        {prescription.appointment?.doctor_name && (
                          <div className="flex items-center gap-1">
                            <User size={14} />
                            <span>Dr. {prescription.appointment.doctor_name}</span>
                          </div>
                        )}
                        <div className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                          New Summary
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setSelectedPrescription(prescription)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="View Details"
                      >
                        <Eye size={16} />
                      </button>
                      <button
                        onClick={() => downloadPrescription(prescription)}
                        className="p-2 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
                        title="Download"
                      >
                        <Download size={16} />
                      </button>
                    </div>
                  </div>
                  
                  {/* Preview */}
                  <div className="text-sm text-gray-700 line-clamp-3">
                    {prescription.note.length > 150 
                      ? `${prescription.note.substring(0, 150)}...` 
                      : prescription.note
                    }
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Prescription Detail Modal */}
      {selectedPrescription && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Prescription Details</h2>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => downloadPrescription(selectedPrescription)}
                  className="px-3 py-2 bg-blue-100 text-blue-700 rounded-lg flex items-center gap-2 hover:bg-blue-200 text-sm"
                >
                  <Download size={14} /> Download
                </button>
                <button
                  onClick={() => setSelectedPrescription(null)}
                  className="text-gray-500 hover:text-gray-700 p-1"
                >
                  ✕
                </button>
              </div>
            </div>

            <div className="overflow-y-auto max-h-[calc(90vh-80px)]">
              <div className="p-6">
                {/* Header Info */}
                <div className="bg-blue-50 rounded-lg p-4 mb-6">
                  <h3 className="text-lg font-semibold text-blue-900 mb-2">{selectedPrescription.title}</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                    <div>
                      <span className="text-blue-700 font-medium">Date:</span>
                      <span className="ml-2 text-gray-700">{new Date(selectedPrescription.created_at).toLocaleDateString()}</span>
                    </div>
                    {selectedPrescription.appointment?.doctor_name && (
                      <div>
                        <span className="text-blue-700 font-medium">Doctor:</span>
                        <span className="ml-2 text-gray-700">Dr. {selectedPrescription.appointment.doctor_name}</span>
                      </div>
                    )}
                    {selectedPrescription.appointment?.date && (
                      <div>
                        <span className="text-blue-700 font-medium">Appointment:</span>
                        <span className="ml-2 text-gray-700">
                          {new Date(selectedPrescription.appointment.date).toLocaleDateString()} at {selectedPrescription.appointment.time}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Prescription Content */}
                <div className="prose prose-sm max-w-none">
                  {selectedPrescription.note.includes('DIAGNOSIS:') ? (
                    <div className="space-y-4">
                      {formatSummarySection(selectedPrescription.note)}
                    </div>
                  ) : (
                    <div className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                      {selectedPrescription.note}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PatientPrescriptions;