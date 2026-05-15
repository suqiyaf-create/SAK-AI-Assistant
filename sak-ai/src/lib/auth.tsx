import React, { createContext, useContext, useEffect, useState } from 'react';

interface User {
  id: string;
  name: string;
  email: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, pass: string) => Promise<void>;
  register: (name: string, email: string, pass: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem('sak_user');
    if (stored) {
      try {
        setUser(JSON.parse(stored));
      } catch (e) {
        localStorage.removeItem('sak_user');
      }
    }
    setLoading(false);
  }, []);

  const login = async (email: string, pass: string) => {
    // Simulate API call
    await new Promise(r => setTimeout(r, 800));
    const mockUser = { id: 'u1', name: 'Demo User', email };
    setUser(mockUser);
    localStorage.setItem('sak_user', JSON.stringify(mockUser));
  };

  const register = async (name: string, email: string, pass: string) => {
    // Simulate API call
    await new Promise(r => setTimeout(r, 800));
    const mockUser = { id: `u${Date.now()}`, name, email };
    setUser(mockUser);
    localStorage.setItem('sak_user', JSON.stringify(mockUser));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('sak_user');
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
