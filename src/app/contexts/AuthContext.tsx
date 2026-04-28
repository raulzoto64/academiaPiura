import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { hitpolyApi } from '../lib/hitpolyApi';

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
    // Load authentication state from localStorage without remote validation.
    const token = localStorage.getItem('authToken');
    const storedUser = localStorage.getItem('user');
    if (token && storedUser) {
      try {
        const userData = JSON.parse(storedUser);
        setUser(userData);
      } catch (e) {
        console.error('Error parsing stored user data', e);
        localStorage.removeItem('authToken');
        localStorage.removeItem('user');
      }
    }
    setLoading(false);
  }, []);

  const signIn = async (email: string, password: string) => {
    const result = await hitpolyApi.login(email, password);
    if (result) {
      setUser(result.user);
      // Token and user are already saved in localStorage by hitpolyApi.login()
    } else {
      throw new Error('Login failed');
    }
  };

  const signUp = async (email: string, password: string, name: string, role: string = 'customer') => {
    const result = await hitpolyApi.register({ email, password, name });
    if (result) {
      setUser(result.user);
      // Token and user are already saved in localStorage by hitpolyApi.register()
    } else {
      throw new Error('Registration failed');
    }
  };

  const signOut = async () => {
    setUser(null);
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
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