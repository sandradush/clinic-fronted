import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface User {
  email: string;
  name?: string;
}

interface AuthContextType {
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  register: (name: string, email: string, password: string) => Promise<boolean>;
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
    if (session) {
      setIsAuthenticated(true);
      const userData = localStorage.getItem('user');
      if (userData) {
        setUser(JSON.parse(userData));
      }
    }
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    // Mock login - always succeeds
    const mockUser = { email, name: email.split('@')[0] };
    localStorage.setItem('session', JSON.stringify({ token: 'mock-token' }));
    localStorage.setItem('user', JSON.stringify(mockUser));
    setIsAuthenticated(true);
    setUser(mockUser);
    return true;
  };

  const register = async (name: string, email: string, password: string): Promise<boolean> => {
    // Mock register - always succeeds
    const mockUser = { email, name };
    localStorage.setItem('session', JSON.stringify({ token: 'mock-token' }));
    localStorage.setItem('user', JSON.stringify(mockUser));
    setIsAuthenticated(true);
    setUser(mockUser);
    return true;
  };

  const logout = () => {
    localStorage.removeItem('session');
    localStorage.removeItem('user');
    setIsAuthenticated(false);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, login, register, logout, user }}>
      {children}
    </AuthContext.Provider>
  );
};