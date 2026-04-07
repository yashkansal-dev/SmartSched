import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole } from '../types';
import api from '../services/api';
import { BackendUser, mapBackendUser } from '../utils/auth';

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
    // Validate stored token with backend and restore the profile.
    const storedAccessToken = localStorage.getItem('access_token');
    const restoreSession = async () => {
      if (!storedAccessToken) {
        setLoading(false);
        return;
      }

      try {
        const response = await api.getUserProfile();
        const mappedUser = mapBackendUser(response.data as BackendUser);

        setAccessToken(storedAccessToken);
        setUser(mappedUser);
        localStorage.setItem('smartsched_user', JSON.stringify(mappedUser));
      } catch (error) {
        console.error('Session validation failed:', error);
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('smartsched_user');
        setAccessToken(null);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    restoreSession();
  }, []);

  const googleLogin = async (token: string) => {
    try {
      const response = await api.googleAuth(token);
      const { access, refresh, user: userData } = response.data;
      const mappedUser = mapBackendUser(userData as BackendUser);
      
      // Store tokens
      localStorage.setItem('access_token', access);
      localStorage.setItem('refresh_token', refresh);
      localStorage.setItem('smartsched_user', JSON.stringify(mappedUser));
      
      setAccessToken(access);
      setUser(mappedUser);
    } catch (error) {
      console.error('Google login failed:', error);
      throw error;
    }
  };

  const login = async (email: string, password: string) => {
    const response = await api.credentialLogin(email, password);
    const { access, refresh, user: userData } = response.data;
    const mappedUser = mapBackendUser(userData as BackendUser);

    localStorage.setItem('access_token', access);
    localStorage.setItem('refresh_token', refresh);
    localStorage.setItem('smartsched_user', JSON.stringify(mappedUser));

    setAccessToken(access);
    setUser(mappedUser);
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