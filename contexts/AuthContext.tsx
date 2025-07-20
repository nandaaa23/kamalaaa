import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { User, UserProfile } from '../types';
import * as WebBrowser from 'expo-web-browser';
import * as Google from 'expo-auth-session/providers/google';

WebBrowser.maybeCompleteAuthSession();

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  enterGuestMode: () => void;
  updateProfile: (profile: UserProfile) => Promise<void>;
  completeOnboarding: () => Promise<void>;
  setUserWithRole: (userData: any, role: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const [request, response, promptAsync] = Google.useAuthRequest({
    androidClientId: '202092173655-tkca4lpftb83klgu037uitietr9cauqg.apps.googleusercontent.com',
    webClientId: '202092173655-tpvfjko4r2cc4odqf47kdqa0j5rkcr5t.apps.googleusercontent.com',
  });

  useEffect(() => {
    loadUserFromStorage();
  }, []);

  useEffect(() => {
    if (response?.type === 'success') {
      const { authentication } = response;
      fetchUserInfo(authentication?.accessToken);
    }
  }, [response]);

  const loadUserFromStorage = async () => {
    try {
      const userData = await AsyncStorage.getItem('user');
      if (userData) setUser(JSON.parse(userData));
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
      await promptAsync();
    } catch (error) {
      console.error('Google Sign-In error:', error);
    }
  };

  const fetchUserInfo = async (token: string | undefined) => {
    try {
      if (!token) return;

      const res = await fetch('https://www.googleapis.com/userinfo/v2/me', {
        headers: { Authorization: `Bearer ${token}` },
      });

      const userInfo = await res.json();

      if (!userInfo || !userInfo.id || !userInfo.email) {
        throw new Error('Invalid user info from Google');
      }

      const selectedRole = await AsyncStorage.getItem('selected_role');

      const newUser: User = {
        id: userInfo.id,
        name: userInfo.name,
        email: userInfo.email,
        role: (selectedRole as 'mother' | 'psychologist') || 'mother', 
        isGuest: false,
        onboardingComplete: selectedRole === 'psychologist', 
      };

      setUser(newUser);
      await saveUserToStorage(newUser);
    } catch (error) {
      console.error('Failed to fetch user info:', error);
    }
  };

  const signOut = async () => {
    try {
      await AsyncStorage.removeItem('user');
      await AsyncStorage.removeItem('selected_role');
      await AsyncStorage.removeItem('intro_complete');
      setUser(null);
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  const enterGuestMode = async () => {
    const selectedRole = await AsyncStorage.getItem('selected_role');
    const guestUser: User = {
      id: 'guest',
      name: 'Guest',
      email: '',
      role: (selectedRole as 'mother' | 'psychologist') || 'mother', 
      isGuest: true,
      onboardingComplete: true,
    };
    setUser(guestUser);
    await saveUserToStorage(guestUser);
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

  const setUserWithRole = async (userData: any, role: string) => {
    const newUser: User = {
      id: userData.uid || userData.id,
      name: userData.displayName || userData.name || 'User',
      email: userData.email,
      role: role as 'mother' | 'psychologist', 
      isGuest: false,
      onboardingComplete: role === 'psychologist', 
    };
    
    setUser(newUser);
    await saveUserToStorage(newUser);
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
        setUserWithRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};