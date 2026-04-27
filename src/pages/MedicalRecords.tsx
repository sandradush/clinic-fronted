import React, { useState, useEffect } from 'react';
import { Search, FileText, ExternalLink, Download, Eye, X, ZoomIn, ZoomOut } from 'lucide-react';
import toast from 'react-hot-toast';

interface MedicalRecord {
  record_id: number;
  consultation_id: number;
  patient_id: number;
  file_url: string;
  description: string;
  patient_name: string | null;
  doctor_id?: number;
  doctor_name?: string | null;
}

const MedicalRecords: React.FC = () => {
  const [records, setRecords] = useState<MedicalRecord[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRecord, setSelectedRecord] = useState<MedicalRecord | null>(null);
  const [viewingFile, setViewingFile] = useState<{record: MedicalRecord, fileType: string} | null>(null);
  const [zoom, setZoom] = useState(100);

  useEffect(() => {
    fetchMedicalRecords();
  }, []);

  const fetchMedicalRecords = async () => {
    try {
      // Fetch medical records with doctor information
      const response = await fetch('http://localhost:3001/api/medical-records?include_doctor=true');
      const data = await response.json();
      console.log('Medical records with doctor info:', data);
      setRecords(data);
    } catch (error) {
      console.error('Error fetching medical records:', error);
      toast.error('Failed to fetch medical records');
    }
  };

  const getFileType = (fileUrl: string): string => {
    const extension = fileUrl.split('.').pop()?.toLowerCase() || '';
    
    if (['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp'].includes(extension)) {
      return 'image';
    } else if (['pdf'].includes(extension)) {
      return 'pdf';
    } else if (['txt', 'md'].includes(extension)) {
      return 'text';
    } else if (['doc', 'docx'].includes(extension)) {
      return 'document';
    } else if (['mp4', 'avi', 'mov', 'wmv'].includes(extension)) {
      return 'video';
    } else {
      return 'unknown';
    }
  };

  const handleViewFileInline = (record: MedicalRecord) => {
    const fileType = getFileType(record.file_url);
    setViewingFile({ record, fileType });
    setZoom(100);
  };

  const handleCloseViewer = () => {
    setViewingFile(null);
    setZoom(100);
  };

  const handleZoomIn = () => {
    setZoom(prev => Math.min(prev + 25, 200));
  };

  const handleZoomOut = () => {
    setZoom(prev => Math.max(prev - 25, 50));
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
                         (record.patient_name && record.patient_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
                         (record.doctor_name && record.doctor_name.toLowerCase().includes(searchTerm.toLowerCase()));
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
            placeholder="Search by description, patient name, or doctor name..."
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
                  Doctor
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
                  <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
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
                      {record.doctor_name ? `Dr. ${record.doctor_name}` : (record.doctor_id ? `Doctor ID: ${record.doctor_id}` : 'N/A')}
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
                          onClick={() => handleViewFileInline(record)}
                          className="flex items-center gap-1 px-2 py-1 text-purple-600 hover:text-purple-900 hover:bg-purple-50 rounded transition-colors"
                          title="View File Inline"
                        >
                          <Eye size={14} />
                          View
                        </button>
                        <button
                          onClick={() => handleViewFile(record.file_url)}
                          className="flex items-center gap-1 px-2 py-1 text-blue-600 hover:text-blue-900 hover:bg-blue-50 rounded transition-colors"
                          title="Open in New Tab"
                        >
                          <ExternalLink size={14} />
                          Open
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
                  <p className="text-sm text-gray-600">Doctor: {selectedRecord.doctor_name ? `Dr. ${selectedRecord.doctor_name}` : (selectedRecord.doctor_id ? `Doctor ID: ${selectedRecord.doctor_id}` : 'N/A')}</p>
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
                      onClick={() => handleViewFileInline(selectedRecord)}
                      className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                    >
                      <Eye size={16} />
                      View Inline
                    </button>
                    <button
                      onClick={() => handleViewFile(selectedRecord.file_url)}
                      className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      <ExternalLink size={16} />
                      Open in Tab
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

      {/* File Viewer Modal */}
      {viewingFile && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-6xl max-h-[95vh] overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gray-50">
              <div className="flex items-center gap-3">
                <h2 className="text-lg font-semibold text-gray-900">File Viewer</h2>
                <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                  {viewingFile.fileType.toUpperCase()}
                </span>
              </div>
              
              <div className="flex items-center gap-2">
                {/* Zoom Controls for Images */}
                {viewingFile.fileType === 'image' && (
                  <>
                    <button
                      onClick={handleZoomOut}
                      className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
                      title="Zoom Out"
                    >
                      <ZoomOut size={18} />
                    </button>
                    <span className="text-sm text-gray-600 min-w-[60px] text-center">
                      {zoom}%
                    </span>
                    <button
                      onClick={handleZoomIn}
                      className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
                      title="Zoom In"
                    >
                      <ZoomIn size={18} />
                    </button>
                  </>
                )}
                
                <button
                  onClick={handleCloseViewer}
                  className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
                  title="Close"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* File Content */}
            <div className="flex-1 overflow-auto" style={{ maxHeight: 'calc(95vh - 80px)' }}>
              <div className="p-4">
                {/* File Info */}
                <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                  <h3 className="font-medium text-gray-900 mb-1">
                    Record #{viewingFile.record.record_id} - {viewingFile.record.patient_name || `Patient ID: ${viewingFile.record.patient_id}`}
                  </h3>
                  <p className="text-sm text-gray-600 mb-1">{viewingFile.record.description}</p>
                  <p className="text-xs text-gray-500">Doctor: {viewingFile.record.doctor_name ? `Dr. ${viewingFile.record.doctor_name}` : (viewingFile.record.doctor_id ? `Doctor ID: ${viewingFile.record.doctor_id}` : 'N/A')}</p>
                </div>

                {/* File Display */}
                <div className="flex justify-center">
                  {viewingFile.fileType === 'image' && (
                    <img
                      src={viewingFile.record.file_url}
                      alt="Medical Record"
                      style={{ 
                        transform: `scale(${zoom / 100})`,
                        transformOrigin: 'center',
                        maxWidth: '100%',
                        height: 'auto'
                      }}
                      className="border border-gray-200 rounded-lg shadow-sm"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjNmNGY2Ii8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzk5YTNhZiIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkltYWdlIG5vdCBmb3VuZDwvdGV4dD48L3N2Zz4=';
                      }}
                    />
                  )}

                  {viewingFile.fileType === 'pdf' && (
                    <iframe
                      src={viewingFile.record.file_url}
                      className="w-full h-[600px] border border-gray-200 rounded-lg"
                      title="PDF Viewer"
                    />
                  )}

                  {viewingFile.fileType === 'text' && (
                    <div className="w-full max-w-4xl">
                      <iframe
                        src={viewingFile.record.file_url}
                        className="w-full h-[500px] border border-gray-200 rounded-lg bg-white p-4"
                        title="Text File Viewer"
                      />
                    </div>
                  )}

                  {viewingFile.fileType === 'video' && (
                    <video
                      controls
                      className="max-w-full h-auto border border-gray-200 rounded-lg"
                      style={{ maxHeight: '500px' }}
                    >
                      <source src={viewingFile.record.file_url} type="video/mp4" />
                      Your browser does not support the video tag.
                    </video>
                  )}

                  {viewingFile.fileType === 'document' && (
                    <div className="w-full max-w-4xl text-center p-8">
                      <FileText size={64} className="mx-auto text-gray-400 mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">Document Preview</h3>
                      <p className="text-gray-600 mb-4">
                        This document type cannot be previewed inline. Use the buttons below to view or download.
                      </p>
                      <div className="flex justify-center gap-3">
                        <button
                          onClick={() => handleViewFile(viewingFile.record.file_url)}
                          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                          <ExternalLink size={16} />
                          Open in New Tab
                        </button>
                        <button
                          onClick={() => handleDownloadFile(viewingFile.record.file_url, viewingFile.record.record_id)}
                          className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                        >
                          <Download size={16} />
                          Download
                        </button>
                      </div>
                    </div>
                  )}

                  {viewingFile.fileType === 'unknown' && (
                    <div className="w-full max-w-4xl text-center p-8">
                      <FileText size={64} className="mx-auto text-gray-400 mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">Unknown File Type</h3>
                      <p className="text-gray-600 mb-4">
                        This file type cannot be previewed. Use the buttons below to view or download.
                      </p>
                      <div className="flex justify-center gap-3">
                        <button
                          onClick={() => handleViewFile(viewingFile.record.file_url)}
                          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                          <ExternalLink size={16} />
                          Try to Open
                        </button>
                        <button
                          onClick={() => handleDownloadFile(viewingFile.record.file_url, viewingFile.record.record_id)}
                          className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                        >
                          <Download size={16} />
                          Download
                        </button>
                      </div>
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

export default MedicalRecords;