import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyAbH4prm6lZ7mLVyEWL9IXMuqoRhWwnW9k",
  authDomain: "bookshibooks-173a8.firebaseapp.com",
  projectId: "bookshibooks-173a8",
  storageBucket: "bookshibooks-173a8.firebasestorage.app",
  messagingSenderId: "482782975779",
  appId: "1:482782975779:web:7bb60306a9fc5abbb81e96",
  measurementId: "G-PHD0PG20Q3"
};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);
export const auth = getAuth(app);

export default app;
