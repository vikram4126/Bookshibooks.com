// ─────────────────────────────────────────────────────────
// ONE-TIME SCRIPT: Make any Firebase user an Admin
// Run with: node set_admin.mjs <email>
// Example:  node set_admin.mjs rohit@example.com
// ─────────────────────────────────────────────────────────

import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, doc, updateDoc } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyAbH4prm6lZ7mLVyEWL9IXMuqoRhWwnW9k",
  authDomain: "bookshibooks-173a8.firebaseapp.com",
  projectId: "bookshibooks-173a8",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const targetEmail = process.argv[2];

if (!targetEmail) {
  console.error('❌  Please provide an email. Usage: node set_admin.mjs your@email.com');
  process.exit(1);
}

console.log(`🔍  Looking for user with email: ${targetEmail}`);

const snap = await getDocs(collection(db, 'users'));
let found = false;

for (const docSnap of snap.docs) {
  const data = docSnap.data();
  if (data.email === targetEmail) {
    await updateDoc(doc(db, 'users', docSnap.id), { role: 'admin' });
    console.log(`✅  SUCCESS! "${data.displayName || data.email}" is now an Admin.`);
    found = true;
    break;
  }
}

if (!found) {
  console.log(`❌  User "${targetEmail}" not found in Firestore.`);
  console.log(`ℹ️   Make sure this user has logged in to the website at least once.`);
}

process.exit(0);
