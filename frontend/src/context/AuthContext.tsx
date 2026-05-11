import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, UserRole } from '../types';
import { apiUrl } from '../lib/api';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (uid: string, name: string, role: UserRole, pin?: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const STORAGE_KEY = 'kf_user';

function createLocalUser(uid: string, name: string, role: UserRole, pin?: string): User {
  return {
    id: `local-${uid}`,
    uid,
    name,
    role,
    pin,
  };
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const localUser = localStorage.getItem(STORAGE_KEY);
    if (localUser) {
      try {
        setUser(JSON.parse(localUser));
      } catch {
        localStorage.removeItem(STORAGE_KEY);
      }
    }
    setLoading(false);
  }, []);

  const signIn = async (uid: string, name: string, role: UserRole, pin?: string) => {
    try {
      const response = await fetch(apiUrl('/api/auth/login'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ uid, name, role, pin }),
      });

      if (response.ok) {
        const userData = (await response.json()) as User;
        setUser(userData);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(userData));
        return;
      }
    } catch {
      // Fall back to a local session when the backend is unavailable.
    }

    const userData = createLocalUser(uid, name, role, pin);
    setUser(userData);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(userData));
  };

  const signOut = async () => {
    localStorage.removeItem(STORAGE_KEY);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
