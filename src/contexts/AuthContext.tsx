import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole } from '../types';
import api from '../services/api';

interface AuthContextType {
  user: User | null;
  accessToken: string | null;
  loading: boolean;
  googleLogin: (token: string) => Promise<void>;
  logout: () => void;
  switchRole: (role: UserRole) => void;
  login: (email: string, password: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for stored tokens and restore session
    const storedAccessToken = localStorage.getItem('access_token');
    const storedUser = localStorage.getItem('smartsched_user');
    
    if (storedAccessToken && storedUser) {
      setAccessToken(storedAccessToken);
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const googleLogin = async (token: string) => {
    try {
      const response = await api.googleAuth(token);
      const { access, refresh, user: userData } = response.data;
      
      // Store tokens
      localStorage.setItem('access_token', access);
      localStorage.setItem('refresh_token', refresh);
      localStorage.setItem('smartsched_user', JSON.stringify(userData));
      
      setAccessToken(access);
      setUser(userData);
    } catch (error) {
      console.error('Google login failed:', error);
      throw error;
    }
  };

  // Keep mock login for demo purposes
  const login = async (email: string, password: string) => {
    // In production, this would call a real login endpoint
    // For now, we'll use it for demo credentials
    let role: UserRole = 'faculty';
    let name = 'User';
    let department = 'General';

    if (email.includes('coordinator')) {
      role = 'tt_coordinator';
      name = 'Dr. Sarah Johnson';
      department = 'Computer Science';
    } else if (email.includes('faculty')) {
      role = 'faculty';
      name = 'Prof. Michael Chen';
      department = 'Computer Science';
    } else if (email.includes('student')) {
      role = 'student';
      name = 'John Smith';
      department = 'Computer Science';
    } else if (email.includes('examiner')) {
      role = 'exam_incharge';
      name = 'Dr. Emily Davis';
      department = 'Computer Science';
    } else if (email.includes('hod')) {
      role = 'hod';
      name = 'Prof. David Wilson';
      department = 'Computer Science';
    } else if (email.includes('principal')) {
      role = 'principal';
      name = 'Dr. Lisa Zhang';
      department = 'Administration';
    }

    const mockUser: User = {
      id: Date.now().toString(),
      name,
      email,
      role,
      department,
      phone: '+1-555-0123'
    };
    
    localStorage.setItem('smartsched_user', JSON.stringify(mockUser));
    setUser(mockUser);
  };

  const logout = () => {
    setUser(null);
    setAccessToken(null);
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('smartsched_user');
  };

  const switchRole = (role: UserRole) => {
    if (user) {
      const updatedUser = { ...user, role };
      setUser(updatedUser);
      localStorage.setItem('smartsched_user', JSON.stringify(updatedUser));
    }
  };

  return (
    <AuthContext.Provider value={{ user, accessToken, loading, googleLogin, logout, switchRole, login }}>
      {children}
    </AuthContext.Provider>
  );
};