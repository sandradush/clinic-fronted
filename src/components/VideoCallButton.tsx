import React from 'react';
import { Video, Phone } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface VideoCallButtonProps {
  appointmentId: number;
  status: string;
  variant?: 'primary' | 'secondary';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const VideoCallButton: React.FC<VideoCallButtonProps> = ({ 
  appointmentId, 
  status, 
  variant = 'primary',
  size = 'md',
  className = '' 
}) => {
  const navigate = useNavigate();

  const handleStartCall = () => {
    // Detect if user is on mobile
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    
    if (isMobile) {
      navigate(`/mobile-video/${appointmentId}`);
    } else {
      navigate(`/video-consultation/${appointmentId}`);
    }
  };

  // Only show video call button for approved appointments
  if (status.toLowerCase() !== 'approved') {
    return null;
  }

  const baseClasses = 'flex items-center gap-2 font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2';
  
  const variantClasses = {
    primary: 'bg-green-600 text-white hover:bg-green-700 focus:ring-green-500',
    secondary: 'border border-green-600 text-green-600 hover:bg-green-50 focus:ring-green-500'
  };

  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base'
  };

  const iconSizes = {
    sm: 16,
    md: 18,
    lg: 20
  };

  return (
    <button
      onClick={handleStartCall}
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
      title="Start video consultation"
    >
      <Video size={iconSizes[size]} />
      Start Video Call
    </button>
  );
};

export default VideoCallButton;