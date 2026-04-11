import React, { useState, useEffect } from 'react';
import { AlertTriangle, CheckCircle, XCircle } from 'lucide-react';

interface ServerStatusProps {
  className?: string;
}

const ServerStatus: React.FC<ServerStatusProps> = ({ className = '' }) => {
  const [status, setStatus] = useState<'checking' | 'online' | 'offline'>('online');
  const [lastCheck, setLastCheck] = useState<Date | null>(null);

  const checkServerStatus = async () => {
    try {
      setStatus('checking');
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

      const response = await fetch('https://clinic-backend-s2lx.onrender.com/api/health', {
        method: 'GET',
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (response.ok) {
        setStatus('online');
      } else {
        setStatus('offline');
      }
    } catch (error) {
      console.error('Server status check failed:', error);
      setStatus('offline');
    } finally {
      setLastCheck(new Date());
    }
  };

  useEffect(() => {
    // Only check server status if there's an actual connection issue
    // Don't show checking state on initial load
    const checkOnlyIfNeeded = async () => {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout

        const response = await fetch('https://clinic-backend-s2lx.onrender.com/api/health', {
          method: 'GET',
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (response.ok) {
          setStatus('online');
        } else {
          setStatus('offline');
        }
      } catch (error) {
        // Only show offline status if there's a real connection error
        setStatus('offline');
      } finally {
        setLastCheck(new Date());
      }
    };

    // Check once on mount, but don't show checking state
    checkOnlyIfNeeded();
    
    // Check every 60 seconds (less frequent)
    const interval = setInterval(checkOnlyIfNeeded, 60000);
    
    return () => clearInterval(interval);
  }, []);

  const getStatusConfig = () => {
    switch (status) {
      case 'online':
        return {
          icon: CheckCircle,
          color: 'text-green-600',
          bgColor: 'bg-green-50',
          borderColor: 'border-green-200',
          text: 'Server Online',
          description: 'All systems operational'
        };
      case 'offline':
        return {
          icon: XCircle,
          color: 'text-red-600',
          bgColor: 'bg-red-50',
          borderColor: 'border-red-200',
          text: 'Server Offline',
          description: 'Backend server is not responding'
        };
      default:
        return {
          icon: AlertTriangle,
          color: 'text-yellow-600',
          bgColor: 'bg-yellow-50',
          borderColor: 'border-yellow-200',
          text: 'Checking...',
          description: 'Verifying server status'
        };
    }
  };

  const config = getStatusConfig();
  const Icon = config.icon;

  // Only show component when there's actually an offline status
  if (status === 'online' || status === 'checking') {
    return null;
  }

  return (
    <div className={`${config.bgColor} ${config.borderColor} border rounded-lg p-4 ${className}`}>
      <div className="flex items-center gap-3">
        <Icon className={`${config.color} flex-shrink-0`} size={20} />
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <h3 className={`font-medium ${config.color}`}>{config.text}</h3>
            <button
              onClick={checkServerStatus}
              className="text-sm text-gray-500 hover:text-gray-700 underline"
              disabled={status === 'checking'}
            >
              {status === 'checking' ? 'Checking...' : 'Retry'}
            </button>
          </div>
          <p className="text-sm text-gray-600 mt-1">{config.description}</p>
          {lastCheck && (
            <p className="text-xs text-gray-500 mt-1">
              Last checked: {lastCheck.toLocaleTimeString()}
            </p>
          )}
          {status === 'offline' && (
            <div className="mt-2 text-sm text-gray-600">
              <p>• The backend server may be sleeping (free tier)</p>
              <p>• Try refreshing the page in a few minutes</p>
              <p>• Contact support if the issue persists</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ServerStatus;