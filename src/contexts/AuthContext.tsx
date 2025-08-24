import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import {
  migrateStorage,
  getUserIndex,
  setUserIndex,
  loadCurrentUser,
  loadUserById,
  saveUserById,
  setCurrentSessionUserId,
} from '../lib/storage';

export type MembershipType = 'Free' | 'Pro' | 'Advanced';

export interface User {
  id: string;
  username: string;
  email: string;
  membershipType: MembershipType;
  credits: number;
  createdAt: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<boolean>;
  register: (username: string, email: string, password: string) => Promise<boolean>;
  logout: () => void;

  updateCredits: (credits: number) => void;
  addCredits: (amount: number) => void;
  upgradeMembership: (type: MembershipType) => void;

  refreshUser: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
};

const toPersisted = (u: User) => u;
const toRuntime = (u: User) => u;

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    try {
      migrateStorage();
      const u = loadCurrentUser();
      setUser(u ? toRuntime(u) : null);
    } finally {
      setIsLoading(false);
    }

    const onStorage = (e: StorageEvent) => {
      const key = e.key || '';
      if (key === 'currentSessionUserId' || key === 'userIndex' || key.startsWith('user_')) {
        const u = loadCurrentUser();
        setUser(u ? toRuntime(u) : null);
      }
    };

    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const persistAndSet = (u: User) => {
    saveUserById(toPersisted(u));
    setCurrentSessionUserId(u.id);
    setUser(u);
  };

  const login = async (username: string, password: string) => {
    if (!username || !password) return false;
    const index = getUserIndex();
    const existingId = index[username];

    if (existingId) {
      const existing = loadUserById(existingId);
      if (existing) {
        persistAndSet(existing);
        return true;
      }
    }

    const id = Date.now().toString();
    const fresh: User = {
      id,
      username,
      email: `${username}@example.com`,
      membershipType: 'Free',
      credits: 3,
      createdAt: new Date().toISOString(),
    };

    index[username] = id;
    setUserIndex(index);
    persistAndSet(fresh);
    return true;
  };

  const register = async (username: string, email: string, password: string) => {
    const index = getUserIndex();

    // username var mı?
    if (index[username]) {
      alert('Bu kullanıcı adı zaten kayıtlı.');
      return false;
    }

    // email var mı? (tüm user kayıtlarını tara)
    for (const uid of Object.values(index)) {
      const u = loadUserById(uid as string);
      if (u && u.email === email) {
        alert('Bu e-posta adresi zaten kayıtlı.');
        return false;
      }
    }

    const id = Date.now().toString();
    const fresh: User = {
      id,
      username,
      email,
      membershipType: 'Free',
      credits: 3,
      createdAt: new Date().toISOString(),
    };

    index[username] = id;
    setUserIndex(index);
    persistAndSet(fresh);
    return true;
  };

  const logout = () => {
    setCurrentSessionUserId(null);
    setUser(null);
  };

  const updateCredits = (credits: number) => {
    if (!user) return;
    const next = { ...user, credits: Math.max(0, credits) };
    persistAndSet(next);
  };

  const addCredits = (amount: number) => {
    if (!user) return;
    const next = { ...user, credits: Math.max(0, (user.credits ?? 0) + amount) };
    persistAndSet(next);
  };

  const upgradeMembership = (type: MembershipType) => {
    if (!user) return;
    const next = { ...user, membershipType: type };
    persistAndSet(next);
  };

  const refreshUser = () => {
    const u = loadCurrentUser();
    setUser(u ? toRuntime(u) : null);
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
