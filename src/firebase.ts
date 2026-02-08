import { initializeApp } from 'firebase/app';
import { getFirestore, doc } from 'firebase/firestore';

// Firebase configuration - using a shared project for universal data
const firebaseConfig = {
    apiKey: "AIzaSyC85dN6fj2Q7kF_GT431PPsMDfeXvl69Wc",
    authDomain: "aardra-learnings.firebaseapp.com",
    projectId: "aardra-learnings",
    storageBucket: "aardra-learnings.firebasestorage.app",
    messagingSenderId: "35379545367",
    appId: "1:35379545367:web:65774168a97840c4ece352",
    measurementId: "G-YRN64WGZPG"
  };

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);

// Helper to get the shared document reference
export const getSharedDataRef = () => doc(db, 'shared', 'data');
