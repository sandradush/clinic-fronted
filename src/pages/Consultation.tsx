import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Video, 
  Phone, 
  MessageCircle, 
  User, 
  Calendar, 
  Clock, 
  FileText, 
  Mic, 
  MicOff, 
  VideoOff, 
  PhoneCall, 
  Send,
  Save,
  ArrowLeft,
  Activity,
  Thermometer,
  Heart,
  Stethoscope
} from 'lucide-react';
import { makeApiRequest } from '../utils/api';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';

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
}

const Consultation: React.FC = () => {
  const { appointmentId } = useParams<{ appointmentId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [appointment, setAppointment] = useState<Appointment | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'video' | 'voice' | 'chat'>('video');
  const [chatMessage, setChatMessage] = useState('');
  const [chatHistory, setChatHistory] = useState<Array<{id: number, message: string, sender: string, time: string}>>([]);
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [isMicOn, setIsMicOn] = useState(true);
  const [isCallActive, setIsCallActive] = useState(false);
  const [ws, setWs] = useState<WebSocket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [videoWs, setVideoWs] = useState<WebSocket | null>(null);
  const [isVideoConnected, setIsVideoConnected] = useState(false);

  // Video WebSocket connection handler
  const handleVideoCallToggle = () => {
    if (!isCallActive) {
      // Starting a call - establish WebSocket connection
      if (user?.id) {
        const videoWebsocket = new WebSocket(`wss://call-app-backend-g992.onrender.com/ws/${user.id}`);
        
        videoWebsocket.onopen = () => {
          console.log('Video WebSocket connected');
          setIsVideoConnected(true);
          toast.success('Video call connected');
        };

        videoWebsocket.onmessage = (event) => {
          console.log('Video WebSocket message:', event.data);
          try {
            const data = JSON.parse(event.data);
            // Handle incoming offer/answer messages
            if (data.type === 'offer' || data.type === 'answer') {
              console.log('Received signaling message:', data.type);
            }
          } catch (error) {
            console.log('Received non-JSON message:', event.data);
          }
        };

        videoWebsocket.onerror = (error) => {
          console.error('Video WebSocket error:', error);
          toast.error('Video connection error');
        };

        videoWebsocket.onclose = () => {
          console.log('Video WebSocket disconnected');
          setIsVideoConnected(false);
          setIsCallActive(false);
          toast.error('Video call disconnected');
        };

        setVideoWs(videoWebsocket);
      }
    } else {
      // Ending the call - close WebSocket connection
      if (videoWs) {
        videoWs.close();
        setVideoWs(null);
      }
      setIsVideoConnected(false);
    }
    setIsCallActive(!isCallActive);
  };

  // Symptoms form state
  const [showSymptomsForm, setShowSymptomsForm] = useState(false);
  const [symptomsLoading, setSymptomsLoading] = useState(false);
  const [symptoms, setSymptoms] = useState({
    name: '',
    value: '',
    description: ''
  });

  useEffect(() => {
    const fetchAppointment = async () => {
      if (!appointmentId) return;
      
      try {
        setLoading(true);
        const data = await makeApiRequest(`/appointments/${appointmentId}`);
        setAppointment(data);
      } catch (error) {
        console.error('Failed to fetch appointment:', error);
        toast.error('Failed to load appointment details');
        navigate('/doctor-dashboard');
      } finally {
        setLoading(false);
      }
    };

    fetchAppointment();
  }, [appointmentId, navigate]);

  // WebSocket connection with retry logic
  useEffect(() => {
    if (!appointment || !user) return;

    let reconnectAttempts = 0;
    const maxReconnectAttempts = 3;
    let reconnectTimeout: NodeJS.Timeout;

    const connectWebSocket = () => {
      try {
        const websocket = new WebSocket(`wss://chat.mababa.app/ws/${user?.id}`);
        
        websocket.onopen = () => {
          console.log('WebSocket connected');
          setIsConnected(true);
          reconnectAttempts = 0;
          toast.success('Chat connected');
        };

        websocket.onmessage = (event) => {
          console.log('Received message:', event.data);
          
          try {
            // Try to parse as JSON first
            const data = JSON.parse(event.data);
            
            const newMessage = {
              id: Date.now(),
              message: data.content || data.message || data.text || event.data,
              sender: data.sender_id === user.id || data.sender === user.id?.toString() ? 'You' : appointment.patient_name,
              time: new Date().toLocaleTimeString()
            };
            
            setChatHistory(prev => [...prev, newMessage]);
          } catch (error) {
            // Handle plain text messages
            const messageText = event.data.toString();
            
            if (messageText.trim()) {
              const newMessage = {
                id: Date.now(),
                message: messageText,
                sender: appointment.patient_name,
                time: new Date().toLocaleTimeString()
              };
              setChatHistory(prev => [...prev, newMessage]);
            }
          }
        };

        websocket.onerror = (error) => {
          console.error('WebSocket error:', error);
          setIsConnected(false);
          if (reconnectAttempts === 0) {
            toast.error('Chat connection failed');
          }
        };

        websocket.onclose = (event) => {
          console.log('WebSocket disconnected:', event.code, event.reason);
          setIsConnected(false);
          
          // Attempt to reconnect if not manually closed
          if (event.code !== 1000 && reconnectAttempts < maxReconnectAttempts) {
            reconnectAttempts++;
            console.log(`Attempting to reconnect... (${reconnectAttempts}/${maxReconnectAttempts})`);
            reconnectTimeout = setTimeout(connectWebSocket, 3000 * reconnectAttempts);
          } else if (reconnectAttempts >= maxReconnectAttempts) {
            toast.error('Chat connection lost. Please refresh the page.');
          }
        };

        setWs(websocket);
        
        return websocket;
      } catch (error) {
        console.error('Failed to create WebSocket:', error);
        toast.error('Failed to initialize chat');
        return null;
      }
    };

    const websocket = connectWebSocket();

    return () => {
      if (reconnectTimeout) {
        clearTimeout(reconnectTimeout);
      }
      if (websocket) {
        websocket.close(1000, 'Component unmounting');
      }
    };
  }, [appointment, user]);

  const handleSendMessage = () => {
    if (!chatMessage.trim()) {
      return;
    }
    
    if (!ws || !isConnected) {
      toast.error('Chat not connected. Please wait...');
      return;
    }
    
    if (!appointment) {
      toast.error('Appointment data not available');
      return;
    }

    try {
      // Try multiple message formats for compatibility
      const messageData = {
        type: 'message',
        sender_id: user?.id,
        receiver_id: appointment.patient_id,
        content: chatMessage.trim(),
        timestamp: new Date().toISOString()
      };
      
      console.log('Sending message:', messageData);
      ws.send(JSON.stringify(messageData));
      
      // Add to local chat history immediately
      const newMessage = {
        id: Date.now(),
        message: chatMessage.trim(),
        sender: 'You',
        time: new Date().toLocaleTimeString()
      };
      
      setChatHistory(prev => [...prev, newMessage]);
      setChatMessage('');
      
    } catch (error) {
      console.error('Failed to send message:', error);
      toast.error('Failed to send message. Please try again.');
    }
  };

  const handleSaveSymptoms = async () => {
    if (symptomsLoading) return;
    
    try {
      if (!symptoms.name.trim() || !symptoms.value.trim() || !symptoms.description.trim()) {
        toast.error('Please fill in all symptom fields');
        return;
      }

      setSymptomsLoading(true);

      const symptomData = {
        appointment_id: parseInt(appointmentId!),
        symptom_name: symptoms.name.trim(),
        value: symptoms.value.trim(),
        description: symptoms.description.trim()
      };

      const response = await makeApiRequest('/symptoms', {
        method: 'POST',
        body: JSON.stringify(symptomData)
      });

      console.log('Symptom saved:', response);
      toast.success('Symptoms recorded successfully');
      setShowSymptomsForm(false);
      setSymptoms({
        name: '',
        value: '',
        description: ''
      });
    } catch (error) {
      console.error('Failed to save symptoms:', error);
      toast.error('Failed to save symptoms');
    } finally {
      setSymptomsLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-8 h-8 border-4 border-brand-100 border-t-brand-700 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!appointment) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-600 mb-2">Appointment not found</h2>
          <button
            onClick={() => navigate('/doctor-dashboard')}
            className="px-4 py-2 bg-brand-700 text-white rounded hover:bg-brand-600"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/doctor-dashboard')}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft size={20} />
              </button>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Consultation Session</h1>
                <p className="text-sm text-gray-600">Appointment #{appointment.id}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                appointment.status === 'approved' ? 'bg-green-100 text-green-700' :
                appointment.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                'bg-red-100 text-red-700'
              }`}>
                {appointment.status}
              </span>
              <button
                onClick={async () => {
                  try {
                    // mark appointment completed and set payment status to pending
                    await makeApiRequest(`/appointments/${appointment.id}`, {
                      method: 'PATCH',
                      body: JSON.stringify({ status: 'completed', payment_status: 'pending' })
                    });
                    toast.success('Consultation completed. Please ask the patient to pay the consultation fee.');
                    // update local state
                    setAppointment({ ...appointment, status: 'completed', ...(appointment as any), payment_status: 'pending' } as any);
                  } catch (err) {
                    console.error('Failed to complete consultation', err);
                    toast.error('Failed to complete consultation');
                  }
                }}
                className="ml-3 px-3 py-1 rounded bg-brand-700 text-white text-sm hover:bg-brand-600"
              >
                Complete Consultation
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Appointment Info & Symptoms */}
          <div className="space-y-6">
            {/* Appointment Information Card */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <User className="text-brand-700" size={20} />
                Patient Information
              </h2>
              <div className="space-y-4">
                <div className="flex items-center gap-3 p-4 bg-brand-50 rounded-lg">
                  <div className="w-12 h-12 bg-brand-700 rounded-full flex items-center justify-center text-white font-semibold">
                    {appointment.patient_name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{appointment.patient_name}</h3>
                    <p className="text-sm text-gray-600">Patient ID: {appointment.patient_id}</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="text-green-500" size={16} />
                    <span>{new Date(appointment.date).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Clock className="text-brand-700" size={16} />
                    <span>{appointment.time}</span>
                  </div>
                </div>
                
                {appointment.description && (
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <h4 className="text-sm font-medium text-gray-700 mb-1">Description</h4>
                    <p className="text-sm text-gray-600">{appointment.description}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Symptoms Recording Card */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                  <Activity className="text-red-500" size={20} />
                  Record Symptoms
                </h2>
                <button
                  onClick={() => setShowSymptomsForm(!showSymptomsForm)}
                  className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors text-sm"
                >
                  {showSymptomsForm ? 'Hide Form' : 'Add Symptoms'}
                </button>
              </div>

              {showSymptomsForm && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Symptom Name</label>
                    <input
                      type="text"
                      value={symptoms.name}
                      onChange={(e) => setSymptoms({...symptoms, name: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                      placeholder="e.g. Headache, Fever, Cough..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Value</label>
                    <input
                      type="text"
                      value={symptoms.value}
                      onChange={(e) => setSymptoms({...symptoms, value: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                      placeholder="e.g. 38.5°C, Severe, 2 days..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                    <textarea
                      value={symptoms.description}
                      onChange={(e) => setSymptoms({...symptoms, description: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                      rows={4}
                      placeholder="Describe the symptom in detail..."
                    />
                  </div>

                  <button
                    onClick={handleSaveSymptoms}
                    disabled={symptomsLoading}
                    className="w-full px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
                  >
                    {symptomsLoading ? (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      <Save size={16} />
                    )}
                    {symptomsLoading ? 'Saving...' : 'Save Symptoms'}
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Right Column - Communication Interface */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 h-full flex flex-col">
              {/* Communication Tabs */}
              <div className="border-b border-gray-200 p-4">
                <div className="flex items-center gap-2 mb-4">
                  <Stethoscope className="text-brand-700" size={20} />
                  <h2 className="text-lg font-semibold text-gray-800">Consultation Interface</h2>
                </div>
                <div className="flex gap-2">
                  {(['video', 'voice', 'chat'] as const).map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${
                        activeTab === tab
                          ? 'bg-brand-100 text-brand-700'
                          : 'text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      {tab === 'video' && <Video size={16} />}
                      {tab === 'voice' && <Phone size={16} />}
                      {tab === 'chat' && <MessageCircle size={16} />}
                      {tab.charAt(0).toUpperCase() + tab.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Communication Content */}
              <div className="flex-1 p-4">
                {activeTab === 'video' && (
                  <div className="h-full flex flex-col">
                    <div className="flex-1 bg-gray-900 rounded-lg relative mb-4 min-h-[400px]">
                      <div className="absolute inset-0 flex items-center justify-center text-white">
                        <div className="text-center">
                          <Video size={48} className="mx-auto mb-4 opacity-50" />
                          <p className="text-lg">Video call interface</p>
                          <p className="text-sm opacity-75">Camera feed would appear here</p>
                        </div>
                      </div>
                      {/* Small self-view */}
                      <div className="absolute top-4 right-4 w-32 h-24 bg-gray-800 rounded-lg border-2 border-white">
                        <div className="w-full h-full flex items-center justify-center text-white text-xs">
                          Self View
                        </div>
                      </div>
                    </div>
                    <div className="flex justify-center gap-4">
                      <button
                        onClick={() => setIsMicOn(!isMicOn)}
                        className={`p-3 rounded-full ${isMicOn ? 'bg-gray-200' : 'bg-red-500 text-white'}`}
                      >
                        {isMicOn ? <Mic size={20} /> : <MicOff size={20} />}
                      </button>
                      <button
                        onClick={() => setIsVideoOn(!isVideoOn)}
                        className={`p-3 rounded-full ${isVideoOn ? 'bg-gray-200' : 'bg-red-500 text-white'}`}
                      >
                        {isVideoOn ? <Video size={20} /> : <VideoOff size={20} />}
                      </button>
                      <button
                        onClick={() => setIsCallActive(!isCallActive)}
                        className={`p-3 rounded-full ${isCallActive ? 'bg-red-500 text-white' : 'bg-green-500 text-white'}`}
                      >
                        <PhoneCall size={20} />
                      </button>
                    </div>
                  </div>
                )}

                {activeTab === 'voice' && (
                  <div className="h-full flex flex-col items-center justify-center">
                    <div className="text-center mb-8">
                      <div className="w-32 h-32 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Phone size={48} className="text-green-600" />
                      </div>
                      <h3 className="text-xl font-semibold text-gray-800 mb-2">Voice Call</h3>
                      <p className="text-gray-600">Audio consultation with {appointment.patient_name}</p>
                    </div>
                    <div className="flex gap-4">
                      <button
                        onClick={() => setIsMicOn(!isMicOn)}
                        className={`p-4 rounded-full ${isMicOn ? 'bg-gray-200' : 'bg-red-500 text-white'}`}
                      >
                        {isMicOn ? <Mic size={24} /> : <MicOff size={24} />}
                      </button>
                      <button
                        onClick={() => setIsCallActive(!isCallActive)}
                        className={`p-4 rounded-full ${isCallActive ? 'bg-red-500 text-white' : 'bg-green-500 text-white'}`}
                      >
                        <PhoneCall size={24} />
                      </button>
                    </div>
                  </div>
                )}

                {activeTab === 'chat' && (
                  <div className="h-full flex flex-col">
                    {/* Connection Status */}
                    <div className={`mb-2 px-3 py-1 rounded-lg text-xs flex items-center gap-2 ${
                      isConnected ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
                    }`}>
                      <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
                      {isConnected ? 'Connected' : 'Disconnected'}
                    </div>
                    
                    <div className="flex-1 border border-gray-200 rounded-lg p-4 mb-4 overflow-y-auto min-h-[400px] bg-gray-50">
                      {chatHistory.length === 0 ? (
                        <div className="text-center text-gray-500 mt-8">
                          <MessageCircle size={48} className="mx-auto mb-4 opacity-50" />
                          <p>No messages yet. Start the conversation!</p>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {chatHistory.map((msg) => (
                            <div key={msg.id} className={`flex flex-col ${msg.sender === 'You' ? 'items-end' : 'items-start'}`}>
                              <div className={`p-3 rounded-lg shadow-sm max-w-[80%] ${
                                msg.sender === 'You' 
                                  ? 'bg-brand-700 text-white' 
                                  : 'bg-white'
                              }`}>
                                <div className="flex justify-between items-start mb-1 gap-3">
                                  <span className={`font-medium text-sm ${
                                    msg.sender === 'You' ? 'text-brand-100' : 'text-gray-700'
                                  }`}>{msg.sender}</span>
                                  <span className={`text-xs ${
                                    msg.sender === 'You' ? 'text-brand-100' : 'text-gray-500'
                                  }`}>{msg.time}</span>
                                </div>
                                <p className={msg.sender === 'You' ? 'text-white' : 'text-gray-800'}>{msg.message}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={chatMessage}
                        onChange={(e) => setChatMessage(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-700 focus:border-transparent"
                        placeholder="Type your message..."
                        disabled={!isConnected}
                      />
                      <button
                        onClick={handleSendMessage}
                        disabled={!chatMessage.trim() || !isConnected}
                        className="px-4 py-2 bg-brand-700 text-white rounded-lg hover:bg-brand-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                      >
                        <Send size={16} />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Consultation;