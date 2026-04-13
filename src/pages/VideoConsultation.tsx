import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Video, Phone, Clock, User, FileText, X } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import VideoCall from '../components/VideoCall';
import toast from 'react-hot-toast';

interface Appointment {
  id: number;
  patient_name: string;
  doctor_name: string;
  date: string;
  time: string;
  description: string;
  status: string;
  patient_id: number;
  doctor_id: number;
}

const VideoConsultation: React.FC = () => {
  const { appointmentId } = useParams<{ appointmentId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [appointment, setAppointment] = useState<Appointment | null>(null);
  const [loading, setLoading] = useState(true);
  const [showVideoCall, setShowVideoCall] = useState(false);
  const [callNotes, setCallNotes] = useState('');

  useEffect(() => {
    if (appointmentId) {
      fetchAppointment();
    }
  }, [appointmentId]);

  const fetchAppointment = async () => {
    try {
      const response = await fetch(`http://localhost:3001/api/appointments/${appointmentId}`);
      if (response.ok) {
        const data = await response.json();
        setAppointment(data);
      } else {
        toast.error('Failed to fetch appointment details');
        navigate('/dashboard');
      }
    } catch (error) {
      console.error('Error fetching appointment:', error);
      toast.error('Failed to fetch appointment details');
      navigate('/dashboard');
    } finally {
      setLoading(false);
    }
  };

  const startVideoCall = () => {
    setShowVideoCall(true);
  };

  const endVideoCall = () => {
    setShowVideoCall(false);
    // Save call notes if any
    if (callNotes.trim()) {
      saveCallNotes();
    }
  };

  const saveCallNotes = async () => {
    try {
      await fetch(`http://localhost:3001/api/appointments/${appointmentId}/notes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          notes: callNotes,
          created_by: user?.id
        }),
      });
      toast.success('Call notes saved');
    } catch (error) {
      console.error('Error saving call notes:', error);
      toast.error('Failed to save call notes');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!appointment) {
    return (
      <div className="p-6 text-center">
        <p className="text-gray-600">Appointment not found</p>
      </div>
    );
  }

  if (showVideoCall) {
    return (
      <div className="h-screen bg-gray-900 relative">
        <VideoCall
          appointmentId={parseInt(appointmentId!)}
          patientId={appointment.patient_id}
          doctorId={appointment.doctor_id}
          onCallEnd={endVideoCall}
        />
        
        {/* Call Notes Panel */}
        <div className="absolute top-4 left-4 w-80 bg-white rounded-lg shadow-lg p-4 max-h-96 overflow-y-auto">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-gray-900">Call Notes</h3>
            <button
              onClick={() => setCallNotes('')}
              className="text-gray-400 hover:text-gray-600"
            >
              <X size={16} />
            </button>
          </div>
          <textarea
            value={callNotes}
            onChange={(e) => setCallNotes(e.target.value)}
            placeholder="Take notes during the call..."
            className="w-full h-32 p-2 border border-gray-300 rounded-md resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <button
            onClick={saveCallNotes}
            className="mt-2 w-full px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm"
          >
            Save Notes
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Video Consultation</h1>
          <p className="text-gray-600">Appointment #{appointment.id}</p>
        </div>

        {/* Appointment Details */}
        <div className="bg-white rounded-lg shadow border p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Appointment Details</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <User className="text-blue-600" size={20} />
                <div>
                  <p className="text-sm text-gray-600">
                    {user?.role === 'doctor' ? 'Patient' : 'Doctor'}
                  </p>
                  <p className="font-medium text-gray-900">
                    {user?.role === 'doctor' ? appointment.patient_name : appointment.doctor_name}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Clock className="text-green-600" size={20} />
                <div>
                  <p className="text-sm text-gray-600">Date & Time</p>
                  <p className="font-medium text-gray-900">
                    {new Date(appointment.date).toLocaleDateString()} at {appointment.time}
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <FileText className="text-purple-600 mt-1" size={20} />
                <div>
                  <p className="text-sm text-gray-600">Description</p>
                  <p className="font-medium text-gray-900">{appointment.description}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center">
                  <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Status</p>
                  <p className="font-medium text-green-600 capitalize">{appointment.status}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Video Call Controls */}
        <div className="bg-white rounded-lg shadow border p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Video Consultation</h2>
          
          <div className="text-center">
            <div className="mb-6">
              <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Video className="text-blue-600" size={32} />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Ready to start consultation?</h3>
              <p className="text-gray-600">
                Click the button below to start your video consultation with{' '}
                {user?.role === 'doctor' ? appointment.patient_name : appointment.doctor_name}
              </p>
            </div>

            <div className="flex items-center justify-center gap-4">
              <button
                onClick={startVideoCall}
                className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                <Video size={20} />
                Start Video Call
              </button>
              
              <button
                onClick={() => navigate('/dashboard')}
                className="flex items-center gap-2 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
              >
                <X size={20} />
                Cancel
              </button>
            </div>
          </div>

          {/* Pre-call Checklist */}
          <div className="mt-8 p-4 bg-gray-50 rounded-lg">
            <h4 className="font-medium text-gray-900 mb-3">Before you start:</h4>
            <ul className="space-y-2 text-sm text-gray-600">
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-blue-600 rounded-full"></div>
                Ensure your camera and microphone are working
              </li>
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-blue-600 rounded-full"></div>
                Find a quiet, well-lit location
              </li>
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-blue-600 rounded-full"></div>
                Have any relevant documents ready
              </li>
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-blue-600 rounded-full"></div>
                Check your internet connection
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoConsultation;