import { initializeApp } from 'firebase/app';
import { initializeAuth } from 'firebase/auth';
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';
import { getReactNativePersistence } from 'firebase/auth/react-native';
import { getFirestore,collection } from 'firebase/firestore';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyAIxECLRumBI_6PFulAx4kcxSbYcUg-fmU",
  authDomain: "kamala-2bb8d.firebaseapp.com",
  projectId: "kamala-2bb8d",
  storageBucket: "kamala-2bb8d.appspot.com",
  messagingSenderId: "202092173655",
  appId: "1:202092173655:android:f432c6cff4a9fed9410612",
};

const app = initializeApp(firebaseConfig);

const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(ReactNativeAsyncStorage)
});

const db = getFirestore(app); 

export { auth, db };

export const motherRef = collection(db, 'mothers');
export const psychologistRef = collection(db, 'psychologists');
