import { initializeApp } from 'firebase/app';
import { getFirestore, doc } from 'firebase/firestore';

// Firebase configuration - using a shared project for universal data
const firebaseConfig = {
  apiKey: "AIzaSyA1B2C3D4E5F6G7H8I9J0K1L2M3N4O5P6Q7R8S",
  authDomain: "aardra-learnings.firebaseapp.com",
  projectId: "aardra-learnings",
  storageBucket: "aardra-learnings.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:abcdef1234567890"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);

// Helper to get the shared document reference
export const getSharedDataRef = () => doc(db, 'shared', 'data');
