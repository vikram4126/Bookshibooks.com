import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 5001;
const DATA_FILE = path.join(__dirname, 'data.json');

// Middleware
app.use(cors());
app.use(express.json());

// Helper to read data
const readData = () => {
  try {
    const data = fs.readFileSync(DATA_FILE, 'utf8');
    return JSON.parse(data);
  } catch (err) {
    return [];
  }
};

// Helper to write data
const writeData = (data) => {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
};

// GET all books
app.get('/api/books', (req, res) => {
  const books = readData();
  res.json(books);
});

// POST add a book
app.post('/api/books', (req, res) => {
  const books = readData();
  const newBook = {
    ...req.body,
    id: Date.now() // Unique ID
  };
  books.unshift(newBook);
  writeData(books);
  res.json(newBook);
});

// DELETE a book
app.delete('/api/books/:id', (req, res) => {
  const books = readData();
  const updatedBooks = books.filter(b => b.id !== Number(req.params.id));
  writeData(updatedBooks);
  res.json({ success: true });
});

app.listen(PORT, () => {
  console.log(`🚀 Backend Server running on http://localhost:${PORT}`);
  // Keep alive timer to prevent Node from exiting the event loop prematurely
  setInterval(() => {}, 1000 * 60 * 60);
});
