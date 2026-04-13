import React, { useState, useEffect, useRef } from 'react';
import { Video, VideoOff, Mic, MicOff, Phone, PhoneOff, RotateCcw, Maximize2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';

// Mobile-optimized Video Call Component for Patients
interface MobileVideoCallProps {
  appointmentId: number;
  doctorId?: number;
  onCallEnd?: () => void;
}

const MobileVideoCall: React.FC<MobileVideoCallProps> = ({ 
  appointmentId, 
  doctorId, 
  onCallEnd 
}) => {
  const { user } = useAuth();
  const [callSession, setCallSession] = useState<any>(null);
  const [isJoined, setIsJoined] = useState(false);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [remoteUsers, setRemoteUsers] = useState<any[]>([]);
  const [callDuration, setCallDuration] = useState(0);
  const [callStartTime, setCallStartTime] = useState<Date | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('user');
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'disconnected'>('connecting');

  const localVideoRef = useRef<HTMLDivElement>(null);
  const remoteVideoRef = useRef<HTMLDivElement>(null);
  const durationInterval = useRef<NodeJS.Timeout>();

  // Mobile-specific states
  const [orientation, setOrientation] = useState<'portrait' | 'landscape'>('portrait');
  const [isMinimized, setIsMinimized] = useState(false);

  useEffect(() => {
    // Handle orientation changes
    const handleOrientationChange = () => {
      setOrientation(window.innerHeight > window.innerWidth ? 'portrait' : 'landscape');
    };

    window.addEventListener('orientationchange', handleOrientationChange);
    window.addEventListener('resize', handleOrientationChange);
    
    // Initial check
    handleOrientationChange();

    // Prevent screen lock during call
    if ('wakeLock' in navigator) {
      (navigator as any).wakeLock.request('screen').catch(() => {
        console.log('Wake lock not supported');
      });
    }

    initializeCall();
    
    return () => {
      window.removeEventListener('orientationchange', handleOrientationChange);
      window.removeEventListener('resize', handleOrientationChange);
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
      setConnectionStatus('connecting');
      
      // Create or join call session
      const sessionResponse = await fetch('http://localhost:3001/api/video/sessions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          appointment_id: appointmentId,
          doctor_id: doctorId,
          patient_id: user?.id,
          user_id: user?.id
        }),
      });

      if (sessionResponse.ok) {
        const session = await sessionResponse.json();
        setCallSession(session);
        await joinCall(session);
        setConnectionStatus('connected');
      } else {
        setConnectionStatus('disconnected');
        toast.error('Failed to initialize video call');
      }
    } catch (error) {
      console.error('Error initializing call:', error);
      setConnectionStatus('disconnected');
      toast.error('Failed to initialize video call');
    }
  };

  const joinCall = async (session: any) => {
    try {
      // For mobile web, we'll use a simplified WebRTC approach
      // In a real implementation, you'd use Agora SDK here
      
      // Simulate joining call
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
          user_type: 'patient'
        }),
      });

      // Get user media with mobile-optimized constraints
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: facingMode,
            width: { ideal: 640 },
            height: { ideal: 480 }
          },
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true
          }
        });

        if (localVideoRef.current) {
          const video = document.createElement('video');
          video.srcObject = stream;
          video.autoplay = true;
          video.muted = true;
          video.playsInline = true; // Important for iOS
          localVideoRef.current.appendChild(video);
        }
      } catch (mediaError) {
        console.error('Error accessing media:', mediaError);
        toast.error('Could not access camera/microphone');
      }

    } catch (error) {
      console.error('Error joining call:', error);
      toast.error('Failed to join video call');
    }
  };

  const toggleVideo = async () => {
    setIsVideoEnabled(!isVideoEnabled);
    // In real implementation, toggle video track
  };

  const toggleAudio = async () => {
    setIsAudioEnabled(!isAudioEnabled);
    // In real implementation, toggle audio track
  };

  const switchCamera = async () => {
    const newFacingMode = facingMode === 'user' ? 'environment' : 'user';
    setFacingMode(newFacingMode);
    
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: newFacingMode },
        audio: true
      });
      
      if (localVideoRef.current) {
        const video = localVideoRef.current.querySelector('video');
        if (video) {
          video.srcObject = stream;
        }
      }
    } catch (error) {
      console.error('Error switching camera:', error);
      toast.error('Could not switch camera');
    }
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const leaveCall = async () => {
    try {
      // Stop all media tracks
      if (localVideoRef.current) {
        const video = localVideoRef.current.querySelector('video');
        if (video && video.srcObject) {
          const stream = video.srcObject as MediaStream;
          stream.getTracks().forEach(track => track.stop());
        }
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
      <div className="flex items-center justify-center h-screen bg-gray-900 text-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-lg">Connecting to doctor...</p>
          <p className="text-sm text-gray-400 mt-2">Please wait</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-gray-900 relative overflow-hidden ${
      orientation === 'landscape' ? 'h-screen w-screen' : 'h-screen'
    }`}>
      {/* Status Bar */}
      <div className="absolute top-0 left-0 right-0 z-20 bg-gradient-to-b from-black/70 to-transparent p-4 safe-area-top">
        <div className="flex items-center justify-between text-white text-sm">
          <div className="flex items-center gap-3">
            <div className={`w-3 h-3 rounded-full animate-pulse ${
              connectionStatus === 'connected' ? 'bg-green-500' : 
              connectionStatus === 'connecting' ? 'bg-yellow-500' : 'bg-red-500'
            }`}></div>
            <span className="font-medium">
              {connectionStatus === 'connected' ? 'CONNECTED' : 
               connectionStatus === 'connecting' ? 'CONNECTING...' : 'DISCONNECTED'}
            </span>
            {isJoined && <span>{formatDuration(callDuration)}</span>}
          </div>
          <button
            onClick={toggleFullscreen}
            className="p-2 rounded-full bg-black/30 hover:bg-black/50 transition-colors"
          >
            <Maximize2 size={16} />
          </button>
        </div>
      </div>

      {/* Video Container */}
      <div className="relative h-full">
        {/* Remote Video (Doctor) - Main View */}
        <div className="w-full h-full bg-gray-800 flex items-center justify-center">
          <div ref={remoteVideoRef} className="w-full h-full">
            {remoteUsers.length === 0 && (
              <div className="flex items-center justify-center h-full text-white">
                <div className="text-center px-4">
                  <div className="w-20 h-20 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl font-bold">Dr</span>
                  </div>
                  <p className="text-lg font-medium">Waiting for doctor...</p>
                  <p className="text-sm text-gray-400 mt-2">
                    The doctor will join shortly
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Local Video (Patient) - Picture-in-Picture */}
        <div className={`absolute ${
          orientation === 'landscape' 
            ? 'top-20 right-4 w-32 h-24' 
            : 'top-20 right-4 w-24 h-32'
        } bg-gray-700 rounded-lg overflow-hidden border-2 border-white/20 ${
          isMinimized ? 'w-16 h-12' : ''
        }`}>
          <div 
            ref={localVideoRef} 
            className="w-full h-full relative"
            onClick={() => setIsMinimized(!isMinimized)}
          >
            {!isVideoEnabled && (
              <div className="flex items-center justify-center h-full bg-gray-600 text-white">
                <VideoOff size={isMinimized ? 12 : 20} />
              </div>
            )}
          </div>
          <div className="absolute bottom-1 left-1 text-white text-xs bg-black/50 px-1 rounded">
            You
          </div>
        </div>
      </div>

      {/* Mobile Controls */}
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6 safe-area-bottom">
        <div className="flex items-center justify-center gap-4">
          {/* Audio Toggle */}
          <button
            onClick={toggleAudio}
            className={`p-4 rounded-full transition-all ${
              isAudioEnabled 
                ? 'bg-gray-600/80 hover:bg-gray-700/80 text-white' 
                : 'bg-red-600 hover:bg-red-700 text-white'
            }`}
            title={isAudioEnabled ? 'Mute' : 'Unmute'}
          >
            {isAudioEnabled ? <Mic size={24} /> : <MicOff size={24} />}
          </button>

          {/* Video Toggle */}
          <button
            onClick={toggleVideo}
            className={`p-4 rounded-full transition-all ${
              isVideoEnabled 
                ? 'bg-gray-600/80 hover:bg-gray-700/80 text-white' 
                : 'bg-red-600 hover:bg-red-700 text-white'
            }`}
            title={isVideoEnabled ? 'Turn off camera' : 'Turn on camera'}
          >
            {isVideoEnabled ? <Video size={24} /> : <VideoOff size={24} />}
          </button>

          {/* End Call */}
          <button
            onClick={leaveCall}
            className="p-4 rounded-full bg-red-600 hover:bg-red-700 text-white transition-all"
            title="End call"
          >
            <PhoneOff size={24} />
          </button>

          {/* Switch Camera (Mobile only) */}
          <button
            onClick={switchCamera}
            className="p-4 rounded-full bg-gray-600/80 hover:bg-gray-700/80 text-white transition-all"
            title="Switch camera"
          >
            <RotateCcw size={24} />
          </button>
        </div>
      </div>

      {/* Connection Status Overlay */}
      {connectionStatus !== 'connected' && (
        <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-30">
          <div className="bg-white rounded-lg p-6 text-center max-w-sm mx-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <h3 className="text-lg font-semibold mb-2">
              {connectionStatus === 'connecting' ? 'Connecting...' : 'Connection Lost'}
            </h3>
            <p className="text-gray-600 text-sm">
              {connectionStatus === 'connecting' 
                ? 'Please wait while we connect you to the doctor'
                : 'Trying to reconnect to the call'
              }
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default MobileVideoCall;