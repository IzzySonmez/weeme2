import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';

interface AuthContextType {
  user: User | null;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  register: (username: string, email: string, password: string) => Promise<boolean>;
  updateCredits: (credits: number) => void;
  isLoading: boolean;
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
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setIsLoading(false);
  }, []);

  const login = async (username: string, password: string): Promise<boolean> => {
    // Demo login - in real app, this would be an API call
    if (username === 'test' && password === 'test123') {
      const demoUser: User = {
        id: '1',
        username: 'test',
        email: 'test@example.com',
        membershipType: 'Free',
        credits: 3,
        createdAt: new Date().toISOString(),
      };
      setUser(demoUser);
      localStorage.setItem('user', JSON.stringify(demoUser));
      return true;
    }
    return false;
  };

  const register = async (username: string, email: string, password: string): Promise<boolean> => {
    // Demo registration
    const newUser: User = {
      id: Date.now().toString(),
      username,
      email,
      membershipType: 'Free',
      credits: 3,
      createdAt: new Date().toISOString(),
    };
    setUser(newUser);
    localStorage.setItem('user', JSON.stringify(newUser));
    return true;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
  };

  const updateCredits = (credits: number) => {
    if (user) {
      const updatedUser = { ...user, credits };
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, register, updateCredits, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};