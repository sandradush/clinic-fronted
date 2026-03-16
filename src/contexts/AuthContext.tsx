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

interface AuthResponse {
  success: boolean;
  message?: string;
  redirectPath?: string;
  role?: string;
  downloadLink?: string;
}

interface AuthContextType {
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<AuthResponse>;
  register: (name: string, email: string, password: string, role: 'admin' | 'doctor' | 'receptionist') => Promise<boolean>;
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
    const validateSession = async () => {
      const session = localStorage.getItem('session');
      const userData = localStorage.getItem('user');

      if (session && userData) {
        try {
          await makeApiRequest('/profile');
          setIsAuthenticated(true);
          setUser(JSON.parse(userData));
        } catch {
          localStorage.removeItem('session');
          localStorage.removeItem('user');
          setIsAuthenticated(false);
          setUser(null);
        }
      }
    };

    validateSession();
  }, []);

  const login = async (email: string, password: string): Promise<AuthResponse> => {

    try {

      const data: any = await makeApiRequest('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password })
      });

      const userData = data?.user;

      if (userData) {

        // BLOCK unsupported roles
        if (userData.role !== 'admin' && userData.role !== 'doctor') {
          return {
            success: false,
            message: `Please use our mobile application to access your account. <a href="https://play.google.com/store/apps/details?id=com.clinic.app" target="_blank" class="text-blue-600 underline">Download here</a>`,
            role: userData.role
          };
        }

        // Handle doctor registration flow
        if (userData.role === 'doctor') {
          // If doctor hasn't completed profile setup
          if (userData.doctorStatus === 'not exist') {
            const token = data?.token || `session-${Date.now()}`;
            localStorage.setItem('session', JSON.stringify({ token }));
            localStorage.setItem('user', JSON.stringify(userData));
            setIsAuthenticated(true);
            setUser(userData);
            
            return {
              success: true,
              redirectPath: '/profilesetup',
              message: 'Please complete your profile setup',
              role: userData.role
            };
          }
          
          // If doctor profile is pending approval - block access completely
          if (userData.doctorStatus === 'pending') {
            return {
              success: false,
              message: 'Your profile is pending admin approval. Please wait for verification before accessing the system.',
              role: userData.role
            };
          }
          
          // If doctor is not approved - block access
          if (userData.status !== 'APPROVED' && userData.status !== 'approved') {
            return {
              success: false,
              message: 'Your account is not approved yet. Please contact admin or wait for approval.',
              role: userData.role
            };
          }
        }

        const token = data?.token || `session-${Date.now()}`;

        localStorage.setItem('session', JSON.stringify({ token }));
        localStorage.setItem('user', JSON.stringify(userData));

        setIsAuthenticated(true);
        setUser(userData);

        const dashboardPath =
          userData.role === 'admin' ? '/admin-dashboard' : '/dashboard';

        return {
          success: true,
          redirectPath: dashboardPath,
          role: userData.role
        };
      }

      return {
        success: false,
        message: 'Invalid server response'
      };

    } catch (err: any) {

      return {
        success: false,
        message: err?.message || 'Network error'
      };

    }
  };

  const register = async (
    name: string,
    email: string,
    password: string,
    role: 'admin' | 'doctor' | 'receptionist'
  ): Promise<boolean> => {

    try {

      const res = await makeApiRequest('/auth/Register', {
        method: 'POST',
        body: JSON.stringify({ name, email, password, role })
      });

      return Boolean(res);

    } catch {

      return false;

    }
  };

  const logout = () => {

    localStorage.clear();
    setIsAuthenticated(false);
    setUser(null);

  };

  return (
    <AuthContext.Provider
      value={{ isAuthenticated, login, register, logout, user }}
    >
      {children}
    </AuthContext.Provider>
  );
};