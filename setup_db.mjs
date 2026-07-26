import { initializeApp } from 'firebase/app';
import { getFirestore, doc, setDoc } from 'firebase/firestore';

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
const db = getFirestore(app);

async function setupDB() {
  try {
    // Set initial site settings
    await setDoc(doc(db, 'settings', 'site'), {
      homeBannerText: 'Use Code WELCOME10 — Get 10% off your first order!  ·  Free delivery on orders above ₹999'
    });
    console.log("Site settings created.");

    // Set initial coupon
    await setDoc(doc(db, 'coupons', 'WELCOME10'), {
      code: 'WELCOME10',
      type: 'percentage', // percentage or fixed
      discountValue: 10,
      active: true,
      createdAt: Date.now()
    });
    console.log("WELCOME10 coupon created.");

  } catch (err) {
    console.error("Error setting up DB:", err);
  }
  process.exit();
}

setupDB();
