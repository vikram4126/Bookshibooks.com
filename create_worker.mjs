import { initializeApp } from 'firebase/app';
import { getFirestore, doc, setDoc } from 'firebase/firestore';
import { getAuth, createUserWithEmailAndPassword } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyAbH4prm6lZ7mLVyEWL9IXMuqoRhWwnW9k",
  authDomain: "bookshibooks-173a8.firebaseapp.com",
  projectId: "bookshibooks-173a8"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

async function createWorker() {
  const email = "tempBooks2767@bookshibooks.com";
  const password = "anmolTemp@2667";
  
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    await setDoc(doc(db, "users", user.uid), {
      email: user.email,
      displayName: "BookshiBooks Worker",
      role: "worker",
      createdAt: Date.now(),
      wishlist: []
    });
    
    console.log("Worker created successfully: ", user.uid);
    process.exit(0);
  } catch (error) {
    console.error("Error creating worker: ", error);
    process.exit(1);
  }
}

createWorker();
