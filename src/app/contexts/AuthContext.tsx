import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { authAPI } from '../lib/api';

interface User {
  id: string;
  email: string;
  name: string;
  role: string;
}

interface AuthContextType {
  user: User | null;
  profile: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, name: string, role: string) => Promise<void>;
  signOut: () => Promise<void>;
  isInstructor: boolean;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in
    const checkAuth = async () => {
      const token = localStorage.getItem('authToken');
      if (token) {
        try {
          const { user } = await authAPI.getCurrentUser();
          setUser(user);
        } catch (error) {
          console.error('Error fetching user:', error);
          localStorage.removeItem('authToken');
        }
      }
      setLoading(false);
    };

    checkAuth();
  }, []);

  const signIn = async (email: string, password: string) => {
    const { user, token } = await authAPI.signIn(email, password);
    setUser(user);
    localStorage.setItem('authToken', token);
  };

  const signUp = async (email: string, password: string, name: string, role: string = 'student') => {
    const { user } = await authAPI.signUp(email, password, name, role);
    // Auto sign in after signup
    const { token } = await authAPI.signIn(email, password);
    setUser(user);
    localStorage.setItem('authToken', token);
  };

  const signOut = async () => {
    setUser(null);
    localStorage.removeItem('authToken');
  };

  const isInstructor = user?.role === 'instructor' || user?.role === 'admin';
  const isAdmin = user?.role === 'admin';

  return (
    <AuthContext.Provider
      value={{ 
        user, 
        profile: user, 
        loading, 
        signIn, 
        signUp, 
        signOut, 
        isInstructor, 
        isAdmin 
      }}
    >
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
