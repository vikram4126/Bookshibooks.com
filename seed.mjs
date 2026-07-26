import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyAbH4prm6lZ7mLVyEWL9IXMuqoRhWwnW9k",
  authDomain: "bookshibooks-173a8.firebaseapp.com",
  projectId: "bookshibooks-173a8",
  storageBucket: "bookshibooks-173a8.firebasestorage.app",
  messagingSenderId: "482782975779",
  appId: "1:482782975779:web:7bb60306a9fc5abbb81e96"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const categories = ['Fiction', 'Non-Fiction', 'Children', 'Thriller', 'Romance', 'Biography', 'History', 'Textbook'];
const books = [];
const covers = [
  "https://images.unsplash.com/photo-1544947950-fa07a98d237f?q=80&w=600&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1512820790803-83ca734da794?q=80&w=600&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1618666012174-83b441c0bc76?q=80&w=600&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1589829085413-56de8ae18c73?q=80&w=600&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1495446815901-a7297e633e8d?q=80&w=600&auto=format&fit=crop"
];

categories.forEach(cat => {
  for (let i = 1; i <= 20; i++) {
    books.push({
      title: `${cat} Masterpiece Vol ${i}`,
      author: `Bestselling Author ${i}`,
      category: cat,
      isbn: `97800000${cat.slice(0,3).toUpperCase()}${i.toString().padStart(2, '0')}`,
      price: Math.floor(Math.random() * 500) + 150, // Between 150 and 649
      mrp: Math.floor(Math.random() * 800) + 700, // Between 700 and 1499
      condition: i % 3 === 0 ? 'Good' : 'New',
      language: 'English',
      pages: Math.floor(Math.random() * 300) + 200,
      format: 'Paperback',
      publisher: 'UK Premier Books',
      quantity: Math.floor(Math.random() * 10) + 1,
      image: covers[i % covers.length],
      createdAt: Date.now() - (Math.random() * 10000000000) // Randomize dates
    });
  }
});

async function seed() {
  console.log(`Starting to seed ${books.length} books...`);
  let count = 0;
  for (const book of books) {
    try {
      await addDoc(collection(db, 'books'), book);
      count++;
      if (count % 20 === 0) console.log(`Inserted ${count} books...`);
    } catch(err) {
      console.error(err);
    }
  }
  console.log("Done seeding.");
  process.exit(0);
}
seed();
