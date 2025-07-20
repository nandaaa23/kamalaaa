import { initializeApp } from 'firebase/app';
import { initializeAuth } from 'firebase/auth';
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';
import { getReactNativePersistence } from 'firebase/auth/react-native';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyAxReYVX7F1YzTsMRHHPl7MDkAQDLRk4HU",
  authDomain: "kamala-final.firebaseapp.com",
  projectId: "kamala-final",
  storageBucket: "kamala-final.appspot.com", 
  messagingSenderId: "662602967907",
  appId: "1:662602967907:web:afcea5a1698c215f8fc156",
  measurementId: "G-JYJK0G0QM6", 
};

const app = initializeApp(firebaseConfig);

const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(ReactNativeAsyncStorage)
});

const db = getFirestore(app); 

export { auth, db };
