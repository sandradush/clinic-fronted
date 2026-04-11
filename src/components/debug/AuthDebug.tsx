import React from 'react';
import { useAuth } from '../../contexts/AuthContext';

const AuthDebug: React.FC = () => {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated || !user) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 bg-black/80 text-white p-4 rounded-lg text-xs max-w-sm">
      <h4 className="font-bold mb-2">Auth Debug Info:</h4>
      <div className="space-y-1">
        <div>Email: {user.email}</div>
        <div>Role: {user.role}</div>
        <div>Status: {user.status || 'undefined'}</div>
        <div>Doctor Status: {user.doctorStatus || 'undefined'}</div>
        <div>Authenticated: {isAuthenticated ? 'Yes' : 'No'}</div>
      </div>
    </div>
  );
};

export default AuthDebug;