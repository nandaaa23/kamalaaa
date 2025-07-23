import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { User, UserProfile } from '../types';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut as firebaseSignOut } from 'firebase/auth';
import { auth, db } from '../firebase/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<User>;
  register: (name: string, email: string, password: string, role: 'mother' | 'psychologist') => Promise<User>;
  logout: () => Promise<void>;
  enterGuestMode: (role: 'mother' | 'psychologist') => User;
  updateProfile: (profile: UserProfile) => Promise<void>;
  completeOnboarding: () => Promise<void>;
}


const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const login = async (email: string, password: string): Promise<User> => {
    setIsLoading(true);
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const roleDoc = await getDoc(doc(db, 'roles', userCredential.user.uid));
      const role = roleDoc.exists() ? (roleDoc.data().role as 'mother' | 'psychologist') : 'mother';

      const userDoc = await getDoc(doc(db, role === 'mother' ? 'mothers' : 'psychologists', userCredential.user.uid));
      if (!userDoc.exists()) throw new Error('User data not found in Firestore.');

      const userData = userDoc.data() as User;
      setUser(userData);
      return userData;
    } catch (error) {
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (name: string, email: string, password: string, role: 'mother' | 'psychologist'): Promise<User> => {
    setIsLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);

      const newUser: User = {
        id: userCredential.user.uid,
        name,
        email,
        role,
        isGuest: false,
        onboardingComplete: false,
      };

      await setDoc(doc(db, 'roles', newUser.id), { role });
      await setDoc(doc(db, role === 'mother' ? 'mothers' : 'psychologists', newUser.id), newUser);
      setUser(newUser);
      return newUser;
    } catch (error) {
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    await firebaseSignOut(auth);
    setUser(null);
  };

  const enterGuestMode = (role: 'mother' | 'psychologist'): User => {
    const guestUser: User = {
      id: 'guest',
      name: 'Guest',
      email: '',
      role,
      isGuest: true,
      onboardingComplete: true,
    };
    setUser(guestUser);
    return guestUser;
  };

  const updateProfile = async (profile: UserProfile) => {
    if (!user) return;
    const updatedUser = { ...user, profile };
    setUser(updatedUser);
    await setDoc(doc(db, user.role === 'mother' ? 'mothers' : 'psychologists', user.id), updatedUser);
  };

  const completeOnboarding = async () => {
    if (!user) return;
    const updatedUser = { ...user, onboardingComplete: true };
    setUser(updatedUser);
    await setDoc(doc(db, user.role === 'mother' ? 'mothers' : 'psychologists', user.id), updatedUser);
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, register, logout, enterGuestMode, updateProfile, completeOnboarding }}>
      {children}
    </AuthContext.Provider>
  );
};
