import React, { useState, useEffect } from 'react';
import { Search, FileText, ExternalLink, Download } from 'lucide-react';
import toast from 'react-hot-toast';

interface MedicalRecord {
  record_id: number;
  consultation_id: number;
  patient_id: number;
  file_url: string;
  description: string;
  patient_name: string | null;
}

const MedicalRecords: React.FC = () => {
  const [records, setRecords] = useState<MedicalRecord[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRecord, setSelectedRecord] = useState<MedicalRecord | null>(null);

  useEffect(() => {
    fetchMedicalRecords();
  }, []);

  const fetchMedicalRecords = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/medical-records');
      const data = await response.json();
      setRecords(data);
    } catch (error) {
      console.error('Error fetching medical records:', error);
      toast.error('Failed to fetch medical records');
    }
  };

  const handleViewFile = (fileUrl: string) => {
    if (!fileUrl) {
      toast.error('No file URL available');
      return;
    }

    // Handle different file URL formats
    if (fileUrl.startsWith('http://') || fileUrl.startsWith('https://')) {
      // Direct HTTP URL - open in new tab
      window.open(fileUrl, '_blank');
    } else if (fileUrl.startsWith('file:///')) {
      // Local file path - show info message
      toast.error('Cannot open local file paths in browser. File location: ' + fileUrl.replace('file:///', ''));
    } else {
      // Assume it's a relative path on the server
      const fullUrl = fileUrl.startsWith('/') ? `http://localhost:3001${fileUrl}` : `http://localhost:3001/${fileUrl}`;
      window.open(fullUrl, '_blank');
    }
  };

  const handleDownloadFile = (fileUrl: string, recordId: number) => {
    if (!fileUrl.startsWith('http')) {
      toast.error('Download only available for uploaded files');
      return;
    }

    try {
      const link = document.createElement('a');
      link.href = fileUrl;
      link.download = `medical-record-${recordId}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success('Download started');
    } catch (error) {
      toast.error('Failed to download file');
    }
  };

  const filteredRecords = records.filter(record => {
    const matchesSearch = record.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (record.patient_name && record.patient_name.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesSearch;
  });

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Medical Records</h1>
        <p className="text-gray-600">View and manage medical records</p>
      </div>

      {/* Search */}
      <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
        <div className="relative">
          <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search by description or patient name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Records Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Record ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Patient
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Consultation ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Description
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  File Actions
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredRecords.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                    <FileText size={48} className="mx-auto text-gray-400 mb-4" />
                    <p>No medical records found</p>
                  </td>
                </tr>
              ) : (
                filteredRecords.map((record) => (
                  <tr key={record.record_id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {record.record_id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {record.patient_name || `Patient ID: ${record.patient_id}`}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {record.consultation_id}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {record.description}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleViewFile(record.file_url)}
                          className="flex items-center gap-1 px-2 py-1 text-blue-600 hover:text-blue-900 hover:bg-blue-50 rounded transition-colors"
                          title="View File"
                        >
                          <ExternalLink size={14} />
                          View
                        </button>
                        {record.file_url.startsWith('http') && (
                          <button
                            onClick={() => handleDownloadFile(record.file_url, record.record_id)}
                            className="flex items-center gap-1 px-2 py-1 text-green-600 hover:text-green-900 hover:bg-green-50 rounded transition-colors"
                            title="Download File"
                          >
                            <Download size={14} />
                            Download
                          </button>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => setSelectedRecord(record)}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        Details
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Record Detail Modal */}
      {selectedRecord && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900">Medical Record Details</h2>
                <button
                  onClick={() => setSelectedRecord(null)}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  ×
                </button>
              </div>
            </div>
            
            <div className="p-6">
              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-medium text-gray-900 mb-2">Record Information</h4>
                  <p className="text-sm text-gray-600">Record ID: {selectedRecord.record_id}</p>
                  <p className="text-sm text-gray-600">Patient: {selectedRecord.patient_name || `Patient ID: ${selectedRecord.patient_id}`}</p>
                  <p className="text-sm text-gray-600">Consultation ID: {selectedRecord.consultation_id}</p>
                </div>
                
                <div>
                  <h4 className="text-sm font-medium text-gray-900 mb-2">Description</h4>
                  <p className="text-sm text-gray-600">{selectedRecord.description}</p>
                </div>
                
                <div>
                  <h4 className="text-sm font-medium text-gray-900 mb-2">File Actions</h4>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => handleViewFile(selectedRecord.file_url)}
                      className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      <ExternalLink size={16} />
                      View File
                    </button>
                    {selectedRecord.file_url.startsWith('http') && (
                      <button
                        onClick={() => handleDownloadFile(selectedRecord.file_url, selectedRecord.record_id)}
                        className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                      >
                        <Download size={16} />
                        Download
                      </button>
                    )}
                  </div>
                  <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                    <p className="text-xs text-gray-500 font-medium">File URL:</p>
                    <p className="text-xs text-gray-700 break-all">{selectedRecord.file_url}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MedicalRecords;