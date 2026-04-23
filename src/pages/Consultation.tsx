import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  User, 
  Calendar, 
  Clock, 
  FileText, 
  Send,
  Save,
  ArrowLeft,
  Activity,
  MessageCircle,
  CheckCircle2,
  Download
} from 'lucide-react';
import { makeApiRequest } from '../utils/api';
import { sendConsultationSummaryToMobile, sendMobilePushNotification } from '../utils/mobileApi';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';

interface ChatMessage {
  id: number;
  message: string;
  sender: string;
  sender_id: number;
  sender_type: 'doctor' | 'patient';
  time: string;
  timestamp: string;
  delivered: boolean;
}

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
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const [chatMessage, setChatMessage] = useState('');
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [sendingMessage, setSendingMessage] = useState(false);
  const [chatPolling, setChatPolling] = useState<NodeJS.Timeout | null>(null);
  const [summaryForm, setSummaryForm] = useState({
    diagnosis: '',
    treatment: '',
    recommendations: '',
    followUp: '',
    notes: ''
  });
  const [summarySubmitting, setSummarySubmitting] = useState(false);
  const [showSummaryForm, setShowSummaryForm] = useState(false);

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

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [chatHistory]);

  // Load chat history when appointment loads
  useEffect(() => {
    if (appointment?.patient_id && user?.id) {
      loadChatHistory();
      // Start polling for new messages every 3 seconds
      const interval = setInterval(loadChatHistory, 3000);
      setChatPolling(interval);
      
      return () => {
        if (interval) clearInterval(interval);
      };
    }
  }, [appointment?.patient_id, user?.id]);

  // Cleanup polling on unmount
  useEffect(() => {
    return () => {
      if (chatPolling) {
        clearInterval(chatPolling);
      }
    };
  }, [chatPolling]);

  const loadChatHistory = async () => {
    if (!appointment?.patient_id || !user?.id) return;
    
    try {
      const response = await fetch(`http://localhost:3001/api/chat/history?patient_id=${appointment.patient_id}&doctor_id=${user.id}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Accept': 'application/json'
        }
      });
      
      if (response.ok) {
        const messages = await response.json();
        const formattedMessages: ChatMessage[] = messages.map((msg: any) => ({
          id: msg.id,
          message: msg.content,
          sender: msg.sender === user?.id ? 'You' : appointment.patient_name,
          sender_id: msg.sender,
          sender_type: msg.sender === user?.id ? 'doctor' : 'patient',
          time: new Date(msg.timestamp).toLocaleTimeString(),
          timestamp: msg.timestamp,
          delivered: true
        }));
        
        setChatHistory(formattedMessages);
      }
    } catch (error) {
      console.error('Failed to load chat history:', error);
    }
  };

  const handleSendMessage = async () => {
    if (!chatMessage.trim() || sendingMessage) {
      return;
    }
    
    if (!appointment) {
      toast.error('Appointment data not available');
      return;
    }

    if (!user?.id) {
      toast.error('User not authenticated');
      return;
    }

    setSendingMessage(true);
    const messageText = chatMessage.trim();
    const tempId = Date.now();
    
    // Add message to UI immediately for better UX
    const tempMessage: ChatMessage = {
      id: tempId,
      message: messageText,
      sender: 'You',
      sender_id: user.id,
      sender_type: 'doctor',
      time: new Date().toLocaleTimeString(),
      timestamp: new Date().toISOString(),
      delivered: false
    };
    
    setChatHistory(prev => [...prev, tempMessage]);
    setChatMessage('');

    try {
      const response = await fetch('http://localhost:3001/api/chat/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          sender_id: user.id,
          receiver_id: appointment.patient_id,
          content: messageText
        })
      });

      if (response.ok) {
        const data = await response.json();
        
        // Update the temporary message with real data
        setChatHistory(prev => prev.map(msg => 
          msg.id === tempId 
            ? { ...msg, id: data.id, delivered: true, timestamp: data.timestamp }
            : msg
        ));
        
        console.log('Message sent successfully:', data);
      } else {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
    } catch (error) {
      console.error('Failed to send message:', error);
      
      // Mark message as failed and show error
      setChatHistory(prev => prev.filter(msg => msg.id !== tempId));
      setChatMessage(messageText); // Restore message text
      toast.error('Failed to send message. Please try again.');
    } finally {
      setSendingMessage(false);
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

  const downloadSummary = (summaryText: string) => {
    const content = `
CONSULTATION SUMMARY
${'='.repeat(50)}

Patient: ${appointment?.patient_name}
Doctor: Dr. ${user?.name || 'Doctor'}
Date: ${new Date().toLocaleDateString()}
Time: ${new Date().toLocaleTimeString()}
Appointment ID: ${appointment?.id}

${summaryText}

${'='.repeat(50)}
Generated on ${new Date().toLocaleString()}
SmartHealth Clinic Management System
    `.trim();

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `consultation-summary-${appointment?.patient_name?.replace(/\s+/g, '-')}-${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleSaveSummary = async () => {
    if (!appointment || !user) {
      toast.error('Missing appointment or user data');
      return;
    }

    if (!summaryForm.diagnosis.trim() || !summaryForm.treatment.trim()) {
      toast.error('Please provide at least diagnosis and treatment');
      return;
    }

    setSummarySubmitting(true);
    try {
      // Create comprehensive summary text
      const summaryText = `
DIAGNOSIS:
${summaryForm.diagnosis.trim()}

TREATMENT:
${summaryForm.treatment.trim()}

RECOMMENDATIONS:
${summaryForm.recommendations.trim() || 'None specified'}

FOLLOW-UP:
${summaryForm.followUp.trim() || 'None specified'}

ADDITIONAL NOTES:
${summaryForm.notes.trim() || 'None'}
      `.trim();

      // Download the summary
      downloadSummary(summaryText);

      // Save to prescriptions
      await makeApiRequest('/prescriptions', {
        method: 'POST',
        body: JSON.stringify({
          appointment_id: appointment.id,
          title: `Consultation Summary - ${appointment.patient_name}`,
          note: summaryText
        })
      });

      // Update appointment with summary and mark as completed
      await makeApiRequest(`/appointments/${appointment.id}`, {
        method: 'PATCH',
        body: JSON.stringify({ 
          status: 'completed', 
          summary: summaryText,
          payment_status: 'pending'
        })
      });

      // Send notification to patient about completed consultation
      try {
        // Send web notification
        await makeApiRequest('/notifications', {
          method: 'POST',
          body: JSON.stringify({
            title: 'Consultation Completed',
            message: `Your consultation with Dr. ${user.name || 'Doctor'} has been completed. Your prescription and summary are now available.`,
            type: 'consultation_completed',
            user_id: appointment.patient_id,
            sent_by_id: user.id,
            sent_by: user.name || 'Doctor'
          })
        });

        // Send consultation summary to mobile app
        await sendConsultationSummaryToMobile(
          appointment.id,
          appointment.patient_id,
          user.name || 'Doctor',
          {
            diagnosis: summaryForm.diagnosis,
            treatment: summaryForm.treatment,
            recommendations: summaryForm.recommendations,
            followUp: summaryForm.followUp,
            notes: summaryForm.notes
          }
        );

        // Send mobile push notification
        await sendMobilePushNotification({
          user_id: appointment.patient_id,
          title: 'New Consultation Summary Available',
          body: `Dr. ${user.name || 'Doctor'} has completed your consultation. Tap to view your summary and prescription.`,
          data: {
            type: 'consultation_summary',
            appointment_id: appointment.id,
            doctor_name: user.name || 'Doctor',
            date: new Date().toISOString(),
            action_url: `smarthealth://consultation/${appointment.id}`
          },
          priority: 'high',
          sound: 'default'
        });

        console.log('Mobile notifications sent successfully');
      } catch (notifError) {
        console.error('Failed to send notification:', notifError);
        // Don't fail the whole operation if notification fails
      }

      toast.success('Consultation summary saved and downloaded! Redirecting to prescriptions...');
      
      // Update local state
      setAppointment({ 
        ...appointment, 
        status: 'completed', 
        summary: summaryText,
        payment_status: 'pending' 
      } as any);
      
      // Reset form and hide it
      setSummaryForm({
        diagnosis: '',
        treatment: '',
        recommendations: '',
        followUp: '',
        notes: ''
      });
      setShowSummaryForm(false);
      
      // Redirect to prescriptions page after a short delay
      setTimeout(() => {
        navigate('/doctor-prescriptions');
      }, 2000);
      
    } catch (error) {
      console.error('Failed to save consultation summary:', error);
      toast.error('Failed to save consultation summary. Please try again.');
    } finally {
      setSummarySubmitting(false);
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
                onClick={() => setShowSummaryForm(true)}
                className="ml-3 px-3 py-1 rounded bg-brand-700 text-white text-sm hover:bg-brand-600"
              >
                Complete Consultation
              </button>
              <button
                onClick={() => navigate('/doctor-history')}
                className="ml-2 px-3 py-1 rounded bg-gray-600 text-white text-sm hover:bg-gray-700 flex items-center gap-1"
              >
                <FileText size={14} />
                View History
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

            {/* Consultation Summary Card */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                  <FileText className="text-blue-500" size={20} />
                  Consultation Summary
                </h2>
                <button
                  onClick={() => setShowSummaryForm(!showSummaryForm)}
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm"
                >
                  {showSummaryForm ? 'Hide Form' : 'Write Summary'}
                </button>
              </div>

              {showSummaryForm && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Diagnosis *</label>
                    <textarea
                      value={summaryForm.diagnosis}
                      onChange={(e) => setSummaryForm({...summaryForm, diagnosis: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      rows={3}
                      placeholder="Primary diagnosis and findings..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Treatment Plan *</label>
                    <textarea
                      value={summaryForm.treatment}
                      onChange={(e) => setSummaryForm({...summaryForm, treatment: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      rows={3}
                      placeholder="Prescribed medications, procedures, therapy..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Recommendations</label>
                    <textarea
                      value={summaryForm.recommendations}
                      onChange={(e) => setSummaryForm({...summaryForm, recommendations: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      rows={2}
                      placeholder="Lifestyle changes, precautions, diet recommendations..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Follow-up Instructions</label>
                    <textarea
                      value={summaryForm.followUp}
                      onChange={(e) => setSummaryForm({...summaryForm, followUp: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      rows={2}
                      placeholder="Next appointment, monitoring instructions..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Additional Notes</label>
                    <textarea
                      value={summaryForm.notes}
                      onChange={(e) => setSummaryForm({...summaryForm, notes: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      rows={2}
                      placeholder="Any additional observations or notes..."
                    />
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={() => {
                        if (summaryForm.diagnosis.trim() || summaryForm.treatment.trim()) {
                          const previewText = `
DIAGNOSIS:
${summaryForm.diagnosis.trim() || 'Not specified'}

TREATMENT:
${summaryForm.treatment.trim() || 'Not specified'}

RECOMMENDATIONS:
${summaryForm.recommendations.trim() || 'None specified'}

FOLLOW-UP:
${summaryForm.followUp.trim() || 'None specified'}

ADDITIONAL NOTES:
${summaryForm.notes.trim() || 'None'}
                          `.trim();
                          downloadSummary(previewText);
                          toast.success('Summary preview downloaded');
                        } else {
                          toast.error('Please add diagnosis and treatment first');
                        }
                      }}
                      className="flex-1 px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors flex items-center justify-center gap-2"
                    >
                      <Download size={16} />
                      Download Preview
                    </button>
                    <button
                      onClick={handleSaveSummary}
                      disabled={summarySubmitting}
                      className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
                    >
                      {summarySubmitting ? (
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      ) : (
                        <Save size={16} />
                      )}
                      {summarySubmitting ? 'Saving Summary...' : 'Save & Complete'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Column - Chat Interface */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 h-full flex flex-col">
              {/* Chat Header */}
              <div className="border-b border-gray-200 p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <MessageCircle className="text-brand-700" size={20} />
                    <h2 className="text-lg font-semibold text-gray-800">Chat with {appointment.patient_name}</h2>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <div className="w-2 h-2 rounded-full bg-green-500"></div>
                    <span>Live Chat</span>
                  </div>
                </div>
              </div>

              {/* Chat Content */}
              <div className="flex-1 p-4">
                <div className="h-full flex flex-col">
                  <div 
                    ref={chatContainerRef}
                    className="flex-1 border border-gray-200 rounded-lg p-4 mb-4 overflow-y-auto min-h-[400px] max-h-[500px] bg-gray-50"
                  >
                    {chatHistory.length === 0 ? (
                      <div className="text-center text-gray-500 mt-8">
                        <MessageCircle size={48} className="mx-auto mb-4 opacity-50" />
                        <p className="text-lg font-medium mb-2">Start the conversation</p>
                        <p className="text-sm">Send a message to begin chatting with {appointment.patient_name}</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {chatHistory.map((msg) => (
                          <div key={msg.id} className={`flex ${msg.sender === 'You' ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-[75%] rounded-2xl px-4 py-3 shadow-sm ${
                              msg.sender === 'You' 
                                ? 'bg-brand-700 text-white rounded-br-md' 
                                : 'bg-white border border-gray-200 text-gray-800 rounded-bl-md'
                            }`}>
                              <div className="flex items-center justify-between mb-1">
                                <span className={`font-medium text-xs ${
                                  msg.sender === 'You' ? 'text-brand-100' : 'text-gray-600'
                                }`}>
                                  {msg.sender === 'You' ? 'Dr. You' : msg.sender}
                                </span>
                                <div className="flex items-center gap-1">
                                  <span className={`text-xs ${
                                    msg.sender === 'You' ? 'text-brand-200' : 'text-gray-500'
                                  }`}>
                                    {msg.time}
                                  </span>
                                  {msg.sender === 'You' && (
                                    <CheckCircle2 
                                      size={12} 
                                      className={msg.delivered ? 'text-brand-200' : 'text-brand-300 opacity-50'}
                                    />
                                  )}
                                </div>
                              </div>
                              <p className={`text-sm leading-relaxed ${
                                msg.sender === 'You' ? 'text-white' : 'text-gray-800'
                              }`}>
                                {msg.message}
                              </p>
                            </div>
                          </div>
                        ))}
                        {sendingMessage && (
                          <div className="flex justify-end">
                            <div className="max-w-[75%] rounded-2xl px-4 py-3 bg-brand-600 text-white rounded-br-md opacity-70">
                              <div className="flex items-center gap-2">
                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                <span className="text-sm">Sending...</span>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                  
                  {/* Message Input */}
                  <div className="flex gap-3 items-end">
                    <div className="flex-1">
                      <textarea
                        value={chatMessage}
                        onChange={(e) => setChatMessage(e.target.value)}
                        onKeyPress={(e) => {
                          if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            handleSendMessage();
                          }
                        }}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-brand-700 focus:border-transparent resize-none"
                        placeholder="Type your message... (Press Enter to send, Shift+Enter for new line)"
                        rows={2}
                        disabled={sendingMessage}
                      />
                    </div>
                    <button
                      onClick={handleSendMessage}
                      disabled={!chatMessage.trim() || sendingMessage}
                      className="px-6 py-3 bg-brand-700 text-white rounded-xl hover:bg-brand-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2 font-medium"
                    >
                      {sendingMessage ? (
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      ) : (
                        <Send size={18} />
                      )}
                      {sendingMessage ? 'Sending' : 'Send'}
                    </button>
                  </div>
                </div>
              </div>
              {/* Quick Actions */}
              <div className="border-t border-gray-200 p-4">
                <div className="flex gap-2 flex-wrap">
                  <button
                    onClick={() => setChatMessage('How are you feeling today?')}
                    className="px-3 py-1 text-xs bg-gray-100 text-gray-700 rounded-full hover:bg-gray-200 transition-colors"
                  >
                    How are you feeling?
                  </button>
                  <button
                    onClick={() => setChatMessage('Please describe your symptoms in detail.')}
                    className="px-3 py-1 text-xs bg-gray-100 text-gray-700 rounded-full hover:bg-gray-200 transition-colors"
                  >
                    Describe symptoms
                  </button>
                  <button
                    onClick={() => setChatMessage('Do you have any questions about your treatment?')}
                    className="px-3 py-1 text-xs bg-gray-100 text-gray-700 rounded-full hover:bg-gray-200 transition-colors"
                  >
                    Questions about treatment?
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Consultation;