import React, { useState, useEffect, useRef } from 'react';
import { Video, VideoOff, Mic, MicOff, Phone, PhoneOff, Settings, Users } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';

// Simplified Video Call Component without Agora SDK
// This is a placeholder implementation for development

interface VideoCallProps {
  appointmentId: number;
  patientId?: number;
  doctorId?: number;
  onCallEnd?: () => void;
}

interface CallSession {
  id: number;
  appointment_id: number;
  channel_name: string;
  status: string;
}

const VideoCall: React.FC<VideoCallProps> = ({ 
  appointmentId, 
  patientId, 
  doctorId, 
  onCallEnd 
}) => {
  const { user } = useAuth();
  const [callSession, setCallSession] = useState<CallSession | null>(null);
  const [isJoined, setIsJoined] = useState(false);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [callDuration, setCallDuration] = useState(0);
  const [callStartTime, setCallStartTime] = useState<Date | null>(null);
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);

  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const durationInterval = useRef<NodeJS.Timeout>();

  useEffect(() => {
    initializeCall();
    return () => {
      leaveCall();
    };
  }, [appointmentId]);

  useEffect(() => {
    if (callStartTime) {
      durationInterval.current = setInterval(() => {
        setCallDuration(Math.floor((Date.now() - callStartTime.getTime()) / 1000));
      }, 1000);
    }
    return () => {
      if (durationInterval.current) {
        clearInterval(durationInterval.current);
      }
    };
  }, [callStartTime]);

  const initializeCall = async () => {
    try {
      // Create or join call session
      const sessionResponse = await fetch('http://localhost:3001/api/video/sessions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          appointment_id: appointmentId,
          doctor_id: doctorId || user?.id,
          patient_id: patientId,
          user_id: user?.id
        }),
      });

      if (sessionResponse.ok) {
        const session = await sessionResponse.json();
        setCallSession(session);
        await joinCall(session);
      } else {
        toast.error('Failed to initialize video call');
      }
    } catch (error) {
      console.error('Error initializing call:', error);
      toast.error('Failed to initialize video call');
    }
  };

  const joinCall = async (session: CallSession) => {
    try {
      // Get user media
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true
      });
      
      setLocalStream(stream);
      
      // Display local video
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }

      setIsJoined(true);
      setCallStartTime(new Date());
      toast.success('Joined video call successfully');

      // Update session status
      await fetch(`http://localhost:3001/api/video/sessions/${session.id}/join`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: user?.id,
          user_type: user?.role
        }),
      });

    } catch (error) {
      console.error('Error joining call:', error);
      toast.error('Failed to join video call. Please check camera/microphone permissions.');
    }
  };

  const toggleVideo = async () => {
    if (localStream) {
      const videoTrack = localStream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !isVideoEnabled;
        setIsVideoEnabled(!isVideoEnabled);
      }
    }
  };

  const toggleAudio = async () => {
    if (localStream) {
      const audioTrack = localStream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !isAudioEnabled;
        setIsAudioEnabled(!isAudioEnabled);
      }
    }
  };

  const leaveCall = async () => {
    try {
      // Stop local stream
      if (localStream) {
        localStream.getTracks().forEach(track => track.stop());
        setLocalStream(null);
      }

      setIsJoined(false);

      // Update session status
      if (callSession) {
        await fetch(`http://localhost:3001/api/video/sessions/${callSession.id}/end`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            ended_by: user?.id,
            duration: callDuration
          }),
        });
      }

      if (durationInterval.current) {
        clearInterval(durationInterval.current);
      }

      toast.success('Call ended');
      if (onCallEnd) {
        onCallEnd();
      }
    } catch (error) {
      console.error('Error leaving call:', error);
      toast.error('Error ending call');
    }
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  if (!callSession) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Initializing video call...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-900 rounded-lg overflow-hidden h-full min-h-[600px] relative">
      {/* Call Header */}
      <div className="absolute top-0 left-0 right-0 z-10 bg-gradient-to-b from-black/50 to-transparent p-4">
        <div className="flex items-center justify-between text-white">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
              <span className="text-sm font-medium">LIVE</span>
            </div>
            <span className="text-sm">{formatDuration(callDuration)}</span>
          </div>
          <div className="flex items-center gap-2">
            <Users size={16} />
            <span className="text-sm">Video Call</span>
          </div>
        </div>
      </div>

      {/* Video Container */}
      <div className="relative h-full">
        {/* Remote Video Placeholder (Main) */}
        <div className="w-full h-full bg-gray-800 flex items-center justify-center">
          <video 
            ref={remoteVideoRef} 
            className="w-full h-full object-cover"
            style={{ display: 'none' }} // Hidden until we have remote stream
          />
          <div className="flex items-center justify-center h-full text-white">
            <div className="text-center">
              <div className="w-20 h-20 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users size={32} className="text-white" />
              </div>
              <p className="text-lg">Waiting for other participant...</p>
              <p className="text-sm text-gray-400 mt-2">
                {user?.role === 'doctor' ? 'Patient will join shortly' : 'Doctor will join shortly'}
              </p>
            </div>
          </div>
        </div>

        {/* Local Video (Picture-in-Picture) */}
        <div className="absolute top-20 right-4 w-48 h-36 bg-gray-700 rounded-lg overflow-hidden border-2 border-white/20">
          <video
            ref={localVideoRef}
            autoPlay
            muted
            playsInline
            className="w-full h-full object-cover"
            style={{ display: isVideoEnabled ? 'block' : 'none' }}
          />
          {!isVideoEnabled && (
            <div className="flex items-center justify-center h-full bg-gray-600 text-white">
              <VideoOff size={24} />
            </div>
          )}
          <div className="absolute bottom-2 left-2 text-white text-xs bg-black/50 px-2 py-1 rounded">
            You
          </div>
        </div>
      </div>

      {/* Call Controls */}
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-6">
        <div className="flex items-center justify-center gap-4">
          <button
            onClick={toggleAudio}
            className={`p-4 rounded-full transition-colors ${
              isAudioEnabled 
                ? 'bg-gray-600 hover:bg-gray-700 text-white' 
                : 'bg-red-600 hover:bg-red-700 text-white'
            }`}
            title={isAudioEnabled ? 'Mute' : 'Unmute'}
          >
            {isAudioEnabled ? <Mic size={24} /> : <MicOff size={24} />}
          </button>

          <button
            onClick={toggleVideo}
            className={`p-4 rounded-full transition-colors ${
              isVideoEnabled 
                ? 'bg-gray-600 hover:bg-gray-700 text-white' 
                : 'bg-red-600 hover:bg-red-700 text-white'
            }`}
            title={isVideoEnabled ? 'Turn off camera' : 'Turn on camera'}
          >
            {isVideoEnabled ? <Video size={24} /> : <VideoOff size={24} />}
          </button>

          <button
            onClick={leaveCall}
            className="p-4 rounded-full bg-red-600 hover:bg-red-700 text-white transition-colors"
            title="End call"
          >
            <PhoneOff size={24} />
          </button>

          <button
            className="p-4 rounded-full bg-gray-600 hover:bg-gray-700 text-white transition-colors"
            title="Settings"
          >
            <Settings size={24} />
          </button>
        </div>
      </div>

      {/* Development Notice */}
      <div className="absolute top-16 left-4 bg-yellow-500 text-black px-3 py-1 rounded text-xs">
        Development Mode - Install Agora SDK for full functionality
      </div>
    </div>
  );
};

export default VideoCall;