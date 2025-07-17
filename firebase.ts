

// firebase.ts
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

// Your Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyAxReYVX7F1YzTsMRHHPl7MDkAQDLRk4HU",
  authDomain: "kamala-final.firebaseapp.com",
  projectId: "kamala-final",
  storageBucket: "kamala-final.appspot.com", // fix: ".app" ➝ ".appspot.com"
  messagingSenderId: "662602967907",
  appId: "1:662602967907:web:afcea5a1698c215f8fc156",
  measurementId: "G-JYJK0G0QM6", 
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

export { auth };
