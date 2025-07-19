// utils/auth.ts
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, UserCredential } from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth } from '../firebase/firebase';
import { getFirestore } from 'firebase/firestore';

const firestore = getFirestore();

export const registerWithEmail = async (
  email: string,
  password: string,
  role: string
): Promise<UserCredential> => {
  const userCredential = await createUserWithEmailAndPassword(auth, email, password);

  const uid = userCredential.user.uid;
  const userRef = doc(firestore, 'users', uid);

  await setDoc(userRef, {
    email,
    role,
    onboardingComplete: false,
    isGuest: false,
  });

  return userCredential;
};

export const loginWithEmail = async (
  email: string,
  password: string
): Promise<UserCredential> => {
  return await signInWithEmailAndPassword(auth, email, password);
};

export const logoutUser = async (): Promise<void> => {
  await signOut(auth);
};

export const getUserRole = async (uid: string): Promise<string | null> => {
  const userDoc = await getDoc(doc(firestore, 'users', uid));
  if (userDoc.exists()) {
    const data = userDoc.data();
    return data?.role ?? null;
  }
  return null;
};