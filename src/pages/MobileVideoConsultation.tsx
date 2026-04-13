import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Video, Phone, Clock, User, ArrowLeft, Wifi, WifiOff } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import MobileVideoCall from '../components/MobileVideoCall';
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
  doctor_phone?: string;
}

const MobileVideoConsultation: React.FC = () => {
  const { appointmentId } = useParams<{ appointmentId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [appointment, setAppointment] = useState<Appointment | null>(null);
  const [loading, setLoading] = useState(true);
  const [showVideoCall, setShowVideoCall] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [deviceInfo, setDeviceInfo] = useState({
    isMobile: false,
    isIOS: false,
    isAndroid: false,
    browser: ''
  });

  useEffect(() => {
    // Detect device and browser
    const userAgent = navigator.userAgent;
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);
    const isIOS = /iPad|iPhone|iPod/.test(userAgent);
    const isAndroid = /Android/.test(userAgent);
    
    let browser = 'Unknown';
    if (userAgent.includes('Chrome')) browser = 'Chrome';
    else if (userAgent.includes('Firefox')) browser = 'Firefox';
    else if (userAgent.includes('Safari')) browser = 'Safari';
    else if (userAgent.includes('Edge')) browser = 'Edge';

    setDeviceInfo({ isMobile, isIOS, isAndroid, browser });

    // Handle online/offline status
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    if (appointmentId) {
      fetchAppointment();
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [appointmentId]);

  const fetchAppointment = async () => {
    try {
      const response = await fetch(`http://localhost:3001/api/appointments/${appointmentId}/video`);
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

  const startVideoCall = async () => {
    // Check permissions first
    try {
      await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      setShowVideoCall(true);
    } catch (error) {
      console.error('Media permission error:', error);
      toast.error('Please allow camera and microphone access to start the call');
    }
  };

  const endVideoCall = () => {
    setShowVideoCall(false);
    navigate('/dashboard');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading appointment...</p>
        </div>
      </div>
    );
  }

  if (!appointment) {
    return (
      <div className="p-6 text-center min-h-screen bg-gray-50 flex items-center justify-center">
        <div>
          <p className="text-gray-600 mb-4">Appointment not found</p>
          <button
            onClick={() => navigate('/dashboard')}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  if (showVideoCall) {
    return (
      <MobileVideoCall
        appointmentId={parseInt(appointmentId!)}
        doctorId={appointment.doctor_id}
        onCallEnd={endVideoCall}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="flex items-center justify-between p-4">
          <button
            onClick={() => navigate('/dashboard')}
            className="p-2 rounded-full hover:bg-gray-100"
          >
            <ArrowLeft size={24} />
          </button>
          <h1 className="text-lg font-semibold">Video Consultation</h1>
          <div className="flex items-center gap-2">
            {isOnline ? (
              <Wifi size={20} className="text-green-600" />
            ) : (
              <WifiOff size={20} className="text-red-600" />
            )}
          </div>
        </div>
      </div>

      {/* Offline Warning */}
      {!isOnline && (
        <div className="bg-red-100 border-l-4 border-red-500 p-4 m-4 rounded">
          <div className="flex items-center">
            <WifiOff size={20} className="text-red-600 mr-2" />
            <p className="text-red-700 text-sm">
              You're offline. Please check your internet connection.
            </p>
          </div>
        </div>
      )}

      <div className="p-4 space-y-6">
        {/* Appointment Details Card */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Appointment Details</h2>
          
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <User className="text-blue-600" size={24} />
              </div>
              <div>
                <p className="text-sm text-gray-600">Doctor</p>
                <p className="font-medium text-gray-900">{appointment.doctor_name}</p>
                {appointment.doctor_phone && (
                  <p className="text-sm text-gray-500">{appointment.doctor_phone}</p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <Clock className="text-green-600" size={24} />
              </div>
              <div>
                <p className="text-sm text-gray-600">Date & Time</p>
                <p className="font-medium text-gray-900">
                  {new Date(appointment.date).toLocaleDateString()}
                </p>
                <p className="text-sm text-gray-500">{appointment.time}</p>
              </div>
            </div>

            {appointment.description && (
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm text-gray-600 mb-1">Description</p>
                <p className="text-gray-900">{appointment.description}</p>
              </div>
            )}
          </div>
        </div>

        {/* Device Compatibility Check */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="font-semibold text-gray-900 mb-3">Device Check</h3>
          <div className="space-y-2 text-sm">
            <div className="flex items-center justify-between">
              <span>Device Type:</span>
              <span className={`px-2 py-1 rounded text-xs ${
                deviceInfo.isMobile ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
              }`}>
                {deviceInfo.isMobile ? 'Mobile' : 'Desktop'}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span>Browser:</span>
              <span className="text-gray-600">{deviceInfo.browser}</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Connection:</span>
              <span className={`px-2 py-1 rounded text-xs ${
                isOnline ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
              }`}>
                {isOnline ? 'Online' : 'Offline'}
              </span>
            </div>
          </div>
        </div>

        {/* Pre-call Instructions */}
        <div className="bg-blue-50 rounded-lg p-6">
          <h3 className="font-semibold text-blue-900 mb-3">Before you start:</h3>
          <ul className="space-y-2 text-sm text-blue-800">
            <li className="flex items-start gap-2">
              <div className="w-1.5 h-1.5 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
              <span>Make sure you're in a quiet, well-lit area</span>
            </li>
            <li className="flex items-start gap-2">
              <div className="w-1.5 h-1.5 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
              <span>Check that your camera and microphone work</span>
            </li>
            <li className="flex items-start gap-2">
              <div className="w-1.5 h-1.5 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
              <span>Keep your phone charged or plugged in</span>
            </li>
            <li className="flex items-start gap-2">
              <div className="w-1.5 h-1.5 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
              <span>Use headphones for better audio quality</span>
            </li>
          </ul>
        </div>

        {/* Call Button */}
        <div className="space-y-4">
          <button
            onClick={startVideoCall}
            disabled={!isOnline || appointment.status !== 'approved'}
            className="w-full flex items-center justify-center gap-3 py-4 bg-green-600 text-white rounded-lg font-medium text-lg disabled:bg-gray-400 disabled:cursor-not-allowed hover:bg-green-700 transition-colors"
          >
            <Video size={24} />
            {appointment.status === 'approved' ? 'Join Video Call' : 'Waiting for Approval'}
          </button>

          {appointment.status !== 'approved' && (
            <p className="text-center text-sm text-gray-600">
              Your appointment needs to be approved by the doctor before you can start the video call.
            </p>
          )}

          <button
            onClick={() => navigate('/dashboard')}
            className="w-full py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
          >
            Back to Dashboard
          </button>
        </div>

        {/* Emergency Contact */}
        <div className="bg-red-50 rounded-lg p-4 text-center">
          <p className="text-sm text-red-800 mb-2">
            Having technical issues?
          </p>
          <a 
            href="tel:+1234567890" 
            className="text-red-600 font-medium text-sm underline"
          >
            Call Support: +1 (234) 567-890
          </a>
        </div>
      </div>
    </div>
  );
};

export default MobileVideoConsultation;