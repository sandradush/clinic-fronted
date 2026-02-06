import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface User {
  email: string;
  name?: string;
  role: 'admin' | 'doctor';
}

interface AuthContextType {
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; message?: string; redirectPath?: string }>;
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

  const login = async (email: string, password: string): Promise<{ success: boolean; message?: string; redirectPath?: string }> => {
    try {
      const res = await fetch('https://clinic-backend-s2lx.onrender.com/api/auth/signin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          accept: 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      let data: any = null;
      let textBody = '';
      try {
        data = await res.json();
      } catch (e) {
        try {
          textBody = await res.text();
        } catch (_) {
          textBody = '';
        }
        data = null;
      }

      if (res.ok) {
        const token = data?.token;
        const userData = data?.user;
        if (token && userData) {
          localStorage.setItem('session', JSON.stringify({ token }));
          localStorage.setItem('user', JSON.stringify(userData));
          setIsAuthenticated(true);
          setUser(userData);
          return { success: true, redirectPath: userData.role === 'admin' ? '/admin-dashboard' : '/dashboard' };
        }
        const msg = data?.message || textBody || 'Invalid server response';
        console.error('Auth signin: unexpected ok response', { status: res.status, data, textBody });
        return { success: false, message: String(msg) };
      }

      const serverMessage = (data && data.message) ? String(data.message) : (textBody || `Request failed (${res.status})`);
      console.warn('Auth signin failed', { status: res.status, serverMessage, data, textBody });
      return { success: false, message: serverMessage };
    } catch (err: any) {
      console.error('Auth signin network error', err);
      return { success: false, message: 'Network error. Please check your connection or CORS settings.' };
    }
  };

  const register = async (name: string, email: string, password: string, role: 'admin' | 'doctor'): Promise<boolean> => {
    try {
      const res = await fetch('https://clinic-backend-s2lx.onrender.com/api/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          accept: 'application/json',
        },
        body: JSON.stringify({ email, password, name, role }),
      });

      if (res.status === 201) {
        return true;
      }

      return false;
    } catch (err) {
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