import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';

export type MembershipType = 'Free' | 'Pro' | 'Advanced';

export interface User {
  id: string;
  username: string;
  email: string;
  membershipType: MembershipType;
  credits: number; // Free için anlamlı; Pro/Advanced'te UI'da ∞ gösterebilirsin
  createdAt: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<boolean>;
  register: (username: string, email: string, password: string) => Promise<boolean>;
  logout: () => void;

  // Eski API'n kalsın (bazı yerlerde kullanılıyor olabilir)
  updateCredits: (credits: number) => void;

  // Sprint 1 ekleri:
  addCredits: (amount: number) => void;
  upgradeMembership: (type: MembershipType) => void;

  // İleride gerçek backend'e geçtiğinde işine yarar:
  refreshUser: () => void;
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

  // ---- local persist helpers ----
  const persist = (u: User) => {
    setUser(u);
    localStorage.setItem('user', JSON.stringify(u));
  };

  const load = () => {
    const saved = localStorage.getItem('user');
    if (saved) {
      try {
        const parsed = JSON.parse(saved) as User;
        setUser(parsed);
      } catch {
        localStorage.removeItem('user');
        setUser(null);
      }
    } else {
      setUser(null);
    }
  };

  useEffect(() => {
    load();
    setIsLoading(false);
    // Çoklu sekme senkronizasyonu
    const onStorage = (e: StorageEvent) => {
      if (e.key === 'user') load();
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ---- public actions ----
  const login = async (username: string, password: string) => {
    // DEMO: test hesabı
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
    // Kendi login akışın yoksa false dön
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
    const next = { ...user, credits: Math.max(0, credits) };
    persist(next);
  };

  // Sprint 1: kredi ekleme (paket satın alma simülasyonu)
  const addCredits = (amount: number) => {
    if (!user) return;
    const next = { ...user, credits: Math.max(0, (user.credits ?? 0) + amount) };
    persist(next);
  };

  // Sprint 1: üyelik yükseltme (Pro/Advanced)
  const upgradeMembership = (type: MembershipType) => {
    if (!user) return;
    const next = { ...user, membershipType: type };
    persist(next);
  };

  const refreshUser = () => {
    load();
  };

  const value = useMemo<AuthContextType>(
    () => ({
      user,
      isLoading,
      login,
      register,
      logout,
      updateCredits,
      addCredits,
      upgradeMembership,
      refreshUser,
    }),
    [user, isLoading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
