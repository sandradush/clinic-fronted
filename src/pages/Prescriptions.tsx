import React, { useMemo, useState } from 'react';
import { FileText, Search, Plus, Printer, Edit, Trash2, X } from 'lucide-react';
import { format } from 'date-fns';
import { api } from '../services/api';
import { usePrescriptions } from '../hooks/useApiData';
import toast from 'react-hot-toast';

type Prescription = {
  id: string;
  patientName: string;
  date: string;
  medications: { name: string; dosage: string; frequency: string }[];
  status: 'active' | 'completed' | 'cancelled' | string;
  doctor?: string;
};

interface NewPrescriptionForm {
  patientName: string;
  medications: { name: string; dosage: string; frequency: string }[];
  notes: string;
}

const statusStyles: Record<string, { bg: string; text: string }> = {
  active: { bg: 'bg-green-100', text: 'text-green-800' },
  completed: { bg: 'bg-gray-100', text: 'text-gray-700' },
  cancelled: { bg: 'bg-red-100', text: 'text-red-700' },
};

const Prescriptions: React.FC = () => {
  const { prescriptions: apiPrescriptions = [], refetch } = usePrescriptions();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | string>('all');
  const [showNewPrescription, setShowNewPrescription] = useState(false);
  const [formData, setFormData] = useState<NewPrescriptionForm>({
    patientName: '',
    medications: [{ name: '', dosage: '', frequency: '' }],
    notes: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [editingPrescription, setEditingPrescription] = useState<Prescription | null>(null);
  const [editForm, setEditForm] = useState<NewPrescriptionForm>({
    patientName: '',
    medications: [{ name: '', dosage: '', frequency: '' }],
    notes: ''
  });

  const handlePrint = (prescription: Prescription) => {
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>Prescription - ${prescription.id}</title>
            <style>
              body { font-family: Arial, sans-serif; padding: 40px; }
              h1 { color: #2563eb; }
              .header { border-bottom: 2px solid #2563eb; padding-bottom: 10px; margin-bottom: 20px; }
              .medication { background: #f3f4f6; padding: 10px; margin: 10px 0; border-radius: 5px; }
            </style>
          </head>
          <body>
            <div class="header">
              <h1>Medical Prescription</h1>
              <p><strong>Prescription ID:</strong> ${prescription.id}</p>
              <p><strong>Patient:</strong> ${prescription.patientName}</p>
              <p><strong>Date:</strong> ${format(new Date(prescription.date), 'MMMM dd, yyyy')}</p>
              <p><strong>Doctor:</strong> ${prescription.doctor || 'N/A'}</p>
            </div>
            <h2>Medications:</h2>
            ${prescription.medications.map(m => `
              <div class="medication">
                <strong>${m.name}</strong><br/>
                Dosage: ${m.dosage}<br/>
                Frequency: ${m.frequency}
              </div>
            `).join('')}
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.print();
    }
  };

  const handleEdit = (prescription: Prescription) => {
    setEditingPrescription(prescription);
    setEditForm({
      patientName: prescription.patientName,
      medications: prescription.medications,
      notes: ''
    });
  };

  const handleUpdatePrescription = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPrescription) return;
    setSubmitting(true);
    
    try {
      await api.updatePrescription(editingPrescription.id, {
        patientName: editForm.patientName,
        medications: editForm.medications.filter(med => med.name && med.dosage),
        notes: editForm.notes
      });
      
      toast.success('Prescription updated successfully!');
      setEditingPrescription(null);
      refetch();
    } catch (error) {
      console.error('Failed to update prescription:', error);
      toast.error('Failed to update prescription. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = async (prescriptionId: string) => {
    if (!window.confirm('Are you sure you want to delete this prescription?')) return;
    
    try {
      await api.deletePrescription(prescriptionId);
      toast.success('Prescription deleted successfully!');
      refetch();
    } catch (error) {
      console.error('Failed to delete prescription:', error);
      toast.error('Failed to delete prescription. Please try again.');
    }
  };

  // Fallback data for development
  const fallbackPrescriptions: Prescription[] = [
    { id: 'RX-001', patientName: 'Jean de Dieu', date: '2024-01-15', medications: [{ name: 'Amoxicillin', dosage: '500mg', frequency: '3 times daily' }, { name: 'Paracetamol', dosage: '500mg', frequency: 'As needed' }], status: 'active', doctor: 'Dr. Sandra' },
    { id: 'RX-002', patientName: 'Marie Claire', date: '2024-01-10', medications: [{ name: 'Metformin', dosage: '850mg', frequency: '2 times daily' }], status: 'completed', doctor: 'Dr. Sandra' },
  ];

  const prescriptions = apiPrescriptions.length ? apiPrescriptions : fallbackPrescriptions;

  const addMedication = () => {
    setFormData({
      ...formData,
      medications: [...formData.medications, { name: '', dosage: '', frequency: '' }]
    });
  };

  const removeMedication = (index: number) => {
    setFormData({
      ...formData,
      medications: formData.medications.filter((_, i) => i !== index)
    });
  };

  const updateMedication = (index: number, field: string, value: string) => {
    const updatedMedications = formData.medications.map((med, i) => 
      i === index ? { ...med, [field]: value } : med
    );
    setFormData({ ...formData, medications: updatedMedications });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    
    try {
      await api.createPrescription({
        patientName: formData.patientName,
        medications: formData.medications.filter(med => med.name && med.dosage),
        notes: formData.notes
      });
      
      toast.success('Prescription created successfully!');
      
      setFormData({
        patientName: '',
        medications: [{ name: '', dosage: '', frequency: '' }],
        notes: ''
      });
      setShowNewPrescription(false);
      refetch();
    } catch (error) {
      console.error('Failed to create prescription:', error);
      toast.error('Failed to create prescription. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const filtered = useMemo(() => {
    return prescriptions.filter(p => {
      const hay = [p.id, p.patientName, p.doctor, p.medications.map(m => m.name).join(' ')].join(' ').toLowerCase();
      const matchesSearch = hay.includes(searchTerm.toLowerCase());
      const matchesStatus = filterStatus === 'all' || p.status === filterStatus;
      return matchesSearch && matchesStatus;
    });
  }, [prescriptions, searchTerm, filterStatus]);

  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold">Prescriptions</h1>
          <p className="text-sm text-gray-600">Write and manage patient prescriptions</p>
        </div>

        <div className="flex items-center gap-2">
          <button 
            onClick={() => setShowNewPrescription(true)}
            className="inline-flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded text-sm"
          >
            <Plus size={16} /> New Prescription
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg p-4 shadow-sm mb-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div className="flex items-center gap-3 flex-1">
            <div className="relative w-full max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                className="pl-10 pr-3 py-2 w-full border rounded focus:outline-none focus:ring-2 focus:ring-blue-200"
                placeholder="Search by patient, id, medication, or doctor"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <select className="ml-2 px-3 py-2 border rounded text-sm" value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
              <option value="all">All statuses</option>
              <option value="active">Active</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>

          <div className="text-sm text-gray-600">{filtered.length} prescriptions</div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {filtered.map(p => (
          <div key={p.id} className="bg-white rounded-lg shadow-sm p-4 flex flex-col md:flex-row md:items-center md:justify-between">
            <div className="flex items-start gap-4 flex-1">
              <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 font-semibold">
                <FileText size={18} />
              </div>
              <div>
                <div className="flex items-center gap-3">
                  <div className="font-medium">{p.patientName}</div>
                  <div className="text-xs text-gray-400">{format(new Date(p.date), 'MMM dd, yyyy')}</div>
                  <div className={`ml-2 px-2 py-1 rounded-full text-xs font-semibold ${statusStyles[p.status]?.bg || 'bg-gray-100'} ${statusStyles[p.status]?.text || 'text-gray-700'}`}>
                    {p.status}
                  </div>
                </div>

                <div className="mt-2 text-sm text-gray-600">
                  <div className="text-xs text-gray-500">Medications</div>
                  <div className="mt-1 flex flex-wrap gap-2">
                    {p.medications.map((m, i) => (
                      <div key={i} className="bg-gray-50 border rounded px-2 py-1 text-xs text-gray-700">
                        <span className="font-medium">{m.name}</span> • {m.dosage}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-4 md:mt-0 flex items-center gap-2">
              <div className="text-sm text-gray-600 mr-4">{p.doctor}</div>
              <button 
                onClick={() => handlePrint(p)}
                className="px-3 py-2 bg-white border rounded text-sm flex items-center gap-2 hover:bg-gray-50"
              >
                <Printer size={14} /> Print
              </button>
              <button 
                onClick={() => handleEdit(p)}
                className="px-3 py-2 bg-white border rounded text-sm flex items-center gap-2 hover:bg-gray-50"
              >
                <Edit size={14} /> Edit
              </button>
              <button 
                onClick={() => handleCancel(p.id)}
                className="px-3 py-2 bg-red-600 text-white rounded text-sm flex items-center gap-2 hover:bg-red-700"
              >
                <Trash2 size={14} /> Cancel
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* New Prescription Modal */}
      {showNewPrescription && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">New Prescription</h2>
              <button 
                onClick={() => setShowNewPrescription(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Patient Name *</label>
                <input
                  type="text"
                  value={formData.patientName}
                  onChange={(e) => setFormData({ ...formData, patientName: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium text-gray-700">Medications *</label>
                  <button
                    type="button"
                    onClick={addMedication}
                    className="text-blue-600 text-sm hover:text-blue-800"
                  >
                    + Add Medication
                  </button>
                </div>
                
                <div className="space-y-3">
                  {formData.medications.map((medication, index) => (
                    <div key={index} className="grid grid-cols-3 gap-3 p-3 border rounded">
                      <div>
                        <input
                          type="text"
                          placeholder="Medication name"
                          value={medication.name}
                          onChange={(e) => updateMedication(index, 'name', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          required
                        />
                      </div>
                      <div>
                        <input
                          type="text"
                          placeholder="Dosage (e.g., 500mg)"
                          value={medication.dosage}
                          onChange={(e) => updateMedication(index, 'dosage', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          required
                        />
                      </div>
                      <div className="flex gap-2">
                        <select
                          value={medication.frequency}
                          onChange={(e) => updateMedication(index, 'frequency', e.target.value)}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          required
                        >
                          <option value="">Select frequency</option>
                          <option value="Once daily">Once daily</option>
                          <option value="Twice daily">Twice daily</option>
                          <option value="3 times daily">3 times daily</option>
                          <option value="4 times daily">4 times daily</option>
                          <option value="As needed">As needed</option>
                          <option value="Before meals">Before meals</option>
                          <option value="After meals">After meals</option>
                        </select>
                        {formData.medications.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeMedication(index)}
                            className="px-2 py-2 text-red-600 hover:bg-red-50 rounded"
                          >
                            <Trash2 size={16} />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Additional Notes</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Special instructions, warnings, etc..."
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowNewPrescription(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                >
                  {submitting ? 'Creating...' : 'Create Prescription'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Prescription Modal */}
      {editingPrescription && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Edit Prescription</h2>
              <button 
                onClick={() => setEditingPrescription(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleUpdatePrescription} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Patient Name *</label>
                <input
                  type="text"
                  value={editForm.patientName}
                  onChange={(e) => setEditForm({ ...editForm, patientName: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium text-gray-700">Medications *</label>
                  <button
                    type="button"
                    onClick={() => setEditForm({...editForm, medications: [...editForm.medications, { name: '', dosage: '', frequency: '' }]})}
                    className="text-blue-600 text-sm hover:text-blue-800"
                  >
                    + Add Medication
                  </button>
                </div>
                
                <div className="space-y-3">
                  {editForm.medications.map((medication, index) => (
                    <div key={index} className="grid grid-cols-3 gap-3 p-3 border rounded">
                      <div>
                        <input
                          type="text"
                          placeholder="Medication name"
                          value={medication.name}
                          onChange={(e) => {
                            const updated = editForm.medications.map((m, i) => i === index ? {...m, name: e.target.value} : m);
                            setEditForm({...editForm, medications: updated});
                          }}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          required
                        />
                      </div>
                      <div>
                        <input
                          type="text"
                          placeholder="Dosage"
                          value={medication.dosage}
                          onChange={(e) => {
                            const updated = editForm.medications.map((m, i) => i === index ? {...m, dosage: e.target.value} : m);
                            setEditForm({...editForm, medications: updated});
                          }}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          required
                        />
                      </div>
                      <div className="flex gap-2">
                        <select
                          value={medication.frequency}
                          onChange={(e) => {
                            const updated = editForm.medications.map((m, i) => i === index ? {...m, frequency: e.target.value} : m);
                            setEditForm({...editForm, medications: updated});
                          }}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          required
                        >
                          <option value="">Select frequency</option>
                          <option value="Once daily">Once daily</option>
                          <option value="Twice daily">Twice daily</option>
                          <option value="3 times daily">3 times daily</option>
                          <option value="4 times daily">4 times daily</option>
                          <option value="As needed">As needed</option>
                        </select>
                        {editForm.medications.length > 1 && (
                          <button
                            type="button"
                            onClick={() => setEditForm({...editForm, medications: editForm.medications.filter((_, i) => i !== index)})}
                            className="px-2 py-2 text-red-600 hover:bg-red-50 rounded"
                          >
                            <Trash2 size={16} />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setEditingPrescription(null)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                >
                  {submitting ? 'Updating...' : 'Update Prescription'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Prescriptions;