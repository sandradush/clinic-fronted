import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { makeApiRequest } from '../utils/api';

interface User {
  id?: string;
  email: string;
  name?: string;
  role: string;
  status?: string;
  profileCompleted?: boolean;
  doctorStatus?: string;
}

interface AuthContextType {
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; message?: string; redirectPath?: string; role?: string }>;
  register: (name: string, email: string, password: string, role: 'admin' | 'doctor') => Promise<boolean>;
  logout: () => void;
  user: User | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const session = localStorage.getItem('session');
    const userData = localStorage.getItem('user');
    if (session && userData) {
      setIsAuthenticated(true);
      setUser(JSON.parse(userData));
    }
  }, []);

  const login = async (email: string, password: string): Promise<{ success: boolean; message?: string; redirectPath?: string; role?: string }> => {
    try {
      const data: any = await makeApiRequest('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password })
      });

      // Handle successful response with user data
      const userData = data?.user;
      if (userData) {
        // Check if role is supported in web app
        if (userData.role !== 'admin' && userData.role !== 'doctor') {
          return { 
            success: false, 
            message: 'Please use our mobile application to access your account.',
            role: userData.role 
          };
        }

        // Create a token if not provided (for compatibility)
        const token = data?.token || `session-${Date.now()}`;
        
        localStorage.setItem('session', JSON.stringify({ token }));
        localStorage.setItem('user', JSON.stringify(userData));
        setIsAuthenticated(true);
        setUser(userData);

        // Check if doctor profile doesn't exist - redirect to profile setup
        if (userData.role === 'doctor' && userData.doctorStatus === 'not exist') {
          return { success: true, redirectPath: '/profilesetup', role: userData.role };
        }

        // Check if doctor has pending status - show message and redirect to dashboard
        if (userData.role === 'doctor' && userData.doctorStatus === 'pending') {
          return { 
            success: true, 
            redirectPath: '/dashboard',
            message: 'Your profile is pending admin approval. You will have limited access until approved.',
            role: userData.role 
          };
        }

        // Check if doctor is approved
        if (userData.role === 'doctor' && userData.status !== 'APPROVED' && userData.doctorStatus !== 'pending') {
          return { 
            success: false, 
            message: 'Your account is not approved. Please contact admin.',
            role: userData.role 
          };
        }

        const dashboardPath = userData.role === 'admin' ? '/admin-dashboard' : '/dashboard';
        return { success: true, redirectPath: dashboardPath, role: userData.role };
      }

      const serverMessage = data?.message || 'Invalid server response';
      return { success: false, message: String(serverMessage) };
    } catch (err: any) {
      console.error('Auth signin error', err);
      return { success: false, message: err?.message || 'Network error. Please check your connection or CORS settings.' };
    }
  };

  const register = async (name: string, email: string, password: string, role: 'admin' | 'doctor'): Promise<boolean> => {
    try {
      const res = await makeApiRequest('/auth/Re', {
        method: 'POST',
        body: JSON.stringify({ name, email, password, role })
      });
      return Boolean(res);
    } catch (err) {
      console.error('Register error', err);
      return false;
    }
  };

  const logout = () => {
    localStorage.clear();
    setIsAuthenticated(false);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, login, register, logout, user }}>
      {children}
    </AuthContext.Provider>
  );
};