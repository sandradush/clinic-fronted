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
            message: "Please use our mobile application to access your account.",
            role: userData.role,
            downloadLink:
              "https://expo.dev/accounts/sandradush1/projects/smart-health-consultation/builds/8bdfa7f8-26cc-4d61-81c0-aba9fd425faa"
          };
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