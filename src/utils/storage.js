// ============================================================
//  FIREBASE STORAGE — Books CRUD
//  Ye file json-server ki jagah Firebase Firestore use karti hai
// ============================================================

import {
  collection,
  getDocs,
  addDoc,
  deleteDoc,
  doc,
  query,
  orderBy
} from 'firebase/firestore';
import { db } from './firebase';

const BOOKS_COLLECTION = 'books';

// GET all books (sorted newest first)
export const getBooks = async () => {
  try {
    const q = query(collection(db, BOOKS_COLLECTION), orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
  } catch (err) {
    console.error('Failed to fetch books', err);
    return [];
  }
};

// GET single book by ID
export const getBookById = async (id) => {
  try {
    const books = await getBooks();
    return books.find(b => b.id === id) || null;
  } catch (err) {
    console.error('Failed to fetch book', err);
    return null;
  }
};

// ADD a book
export const addBook = async (bookData) => {
  try {
    const docRef = await addDoc(collection(db, BOOKS_COLLECTION), {
      ...bookData,
      createdAt: Date.now()
    });
    return { id: docRef.id, ...bookData };
  } catch (err) {
    console.error('Failed to add book', err);
    throw err;
  }
};

// DELETE a book
export const deleteBook = async (id) => {
  try {
    await deleteDoc(doc(db, BOOKS_COLLECTION, id));
    return await getBooks();
  } catch (err) {
    console.error('Failed to delete book', err);
    throw err;
  }
};
