import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { User, UserProfile } from '../types';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  enterGuestMode: () => void;
  updateProfile: (profile: UserProfile) => Promise<void>;
  completeOnboarding: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadUserFromStorage();
  }, []);

  const loadUserFromStorage = async () => {
    try {
      const userData = await AsyncStorage.getItem('user');
      if (userData) {
        setUser(JSON.parse(userData));
      }
    } catch (error) {
      console.error('Error loading user from storage:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const saveUserToStorage = async (userData: User) => {
    try {
      await AsyncStorage.setItem('user', JSON.stringify(userData));
    } catch (error) {
      console.error('Error saving user to storage:', error);
    }
  };

  const signInWithGoogle = async () => {
    try {
      // Mock Google sign-in for development
      const mockUser: User = {
        id: 'mock-user-id',
        name: 'Mock User',
        email: 'mock@example.com',
        isGuest: false,
        onboardingComplete: false,
      };
      
      setUser(mockUser);
      await saveUserToStorage(mockUser);
    } catch (error) {
      console.error('Google sign-in error:', error);
    }
  };

  const signOut = async () => {
    try {
      await AsyncStorage.removeItem('user');
      setUser(null);
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  const enterGuestMode = () => {
    const guestUser: User = {
      id: 'guest',
      name: 'Guest',
      email: '',
      isGuest: true,
      onboardingComplete: true,
    };
    setUser(guestUser);
  };

  const updateProfile = async (profile: UserProfile) => {
    if (!user) return;
    
    const updatedUser = { ...user, profile };
    setUser(updatedUser);
    await saveUserToStorage(updatedUser);
  };

  const completeOnboarding = async () => {
    if (!user) return;
    
    const updatedUser = { ...user, onboardingComplete: true };
    setUser(updatedUser);
    await saveUserToStorage(updatedUser);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        signInWithGoogle,
        signOut,
        enterGuestMode,
        updateProfile,
        completeOnboarding,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};