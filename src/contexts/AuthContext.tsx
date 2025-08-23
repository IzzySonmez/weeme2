// src/contexts/AuthContext.tsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, MembershipType } from '../types';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<boolean>;
  register: (username: string, email: string, password: string) => Promise<boolean>;
  logout: () => void;
  updateCredits: (credits: number) => void;     // eski API'yi koruyalım
  addCredits: (amount: number) => void;
  upgradeMembership: (type: MembershipType) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) setUser(JSON.parse(savedUser));
    setIsLoading(false);
  }, []);

  const persist = (u: User) => {
    setUser(u);
    localStorage.setItem('user', JSON.stringify(u));
  };

  const login = async (username: string, password: string) => {
    if (username === 'test' && password === 'test123') {
      const demo: User = {
        id: '1',
        username: 'test',
        email: 'test@example.com',
        membershipType: 'Free',
        credits: 3,
        createdAt: new Date().toISOString(),
      };
      persist(demo);
      return true;
    }
    return false;
  };

  const register = async (username: string, email: string, password: string) => {
    const u: User = {
      id: Date.now().toString(),
      username,
      email,
      membershipType: 'Free',
      credits: 3,
      createdAt: new Date().toISOString(),
    };
    persist(u);
    return true;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
  };

  const updateCredits = (credits: number) => {
    if (!user) return;
    persist({ ...user, credits });
  };

  const addCredits = (amount: number) => {
    if (!user) return;
    const next = { ...user, credits: Math.max(0, (user.credits ?? 0) + amount) };
    persist(next);
  };

  const upgradeMembership = (type: MembershipType) => {
    if (!user) return;
    // Free -> ProSub / AdvancedSun: Free kredileri korunur (isteğe göre 0'a da çekilebilir)
    // ProSub/AdvancedSun için krediler anlamsız, UI'da ∞ gösteriyoruz.
    persist({ ...user, membershipType: type });
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, register, logout, updateCredits, addCredits, upgradeMembership }}>
      {children}
    </AuthContext.Provider>
  );
};
