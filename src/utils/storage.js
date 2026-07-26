// Prices in INR — UK imported books
const INITIAL_BOOKS = [
  { id: 1, title: "The Gruffalo", author: "Julia Donaldson", category: "Kids", price: "599", oldPrice: "899", badge: "Best", rating: 4.8, reviews: 1240, coverUrl: "https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&q=80&w=240&h=360" },
  { id: 2, title: "Harry Potter and the Philosopher's Stone", author: "J.K. Rowling", category: "Kids", price: "749", oldPrice: "1099", badge: "Best", rating: 4.9, reviews: 3200, coverUrl: "https://images.unsplash.com/photo-1618666012174-83b441c0bc76?auto=format&fit=crop&q=80&w=240&h=360" },
  { id: 3, title: "1984", author: "George Orwell", category: "Adults", price: "849", oldPrice: "1299", badge: "Sale", rating: 4.7, reviews: 890, coverUrl: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&q=80&w=240&h=360" },
  { id: 4, title: "Where the Wild Things Are", author: "Maurice Sendak", category: "Kids", price: "649", badge: "New", rating: 4.6, reviews: 540, coverUrl: "https://images.unsplash.com/photo-1476275466078-4007374efbbe?auto=format&fit=crop&q=80&w=240&h=360" },
  { id: 5, title: "Pride and Prejudice", author: "Jane Austen", category: "Adults", price: "699", oldPrice: "999", badge: "Sale", rating: 4.8, reviews: 1540, coverUrl: "https://images.unsplash.com/photo-1603284569248-821525309698?auto=format&fit=crop&q=80&w=240&h=360" },
  { id: 6, title: "The BFG", author: "Roald Dahl", category: "Kids", price: "549", badge: "New", rating: 4.7, reviews: 760, coverUrl: "https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?auto=format&fit=crop&q=80&w=240&h=360" },
  { id: 7, title: "Sapiens: A Brief History of Humankind", author: "Yuval Noah Harari", category: "Adults", price: "999", oldPrice: "1599", badge: "Best", rating: 4.6, reviews: 2100, coverUrl: "https://images.unsplash.com/photo-1589829085413-56de8ae18c73?auto=format&fit=crop&q=80&w=240&h=360" },
  { id: 8, title: "Matilda", author: "Roald Dahl", category: "Kids", price: "549", badge: "Best", rating: 4.9, reviews: 1850, coverUrl: "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?auto=format&fit=crop&q=80&w=240&h=360" },
  { id: 9, title: "Atomic Habits", author: "James Clear", category: "Adults", price: "899", oldPrice: "1399", badge: "Best", rating: 4.8, reviews: 4200, coverUrl: "https://images.unsplash.com/photo-1535905557558-afc4877a26fc?auto=format&fit=crop&q=80&w=240&h=360" },
  { id: 10, title: "Charlotte's Web", author: "E.B. White", category: "Kids", price: "499", badge: "New", rating: 4.7, reviews: 980, coverUrl: "https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?auto=format&fit=crop&q=80&w=240&h=360" },
  { id: 11, title: "The Great Gatsby", author: "F. Scott Fitzgerald", category: "Adults", price: "649", oldPrice: "899", badge: "Sale", rating: 4.5, reviews: 1320, coverUrl: "https://images.unsplash.com/photo-1551029506-0807df4e2031?auto=format&fit=crop&q=80&w=240&h=360" },
  { id: 12, title: "Charlie and the Chocolate Factory", author: "Roald Dahl", category: "Kids", price: "599", badge: "Best", rating: 4.9, reviews: 2200, coverUrl: "https://images.unsplash.com/photo-1504903271097-d7e7c7f5f7f7?auto=format&fit=crop&q=80&w=240&h=360" },
  { id: 13, title: "To Kill a Mockingbird", author: "Harper Lee", category: "Adults", price: "749", oldPrice: "1099", badge: "Best", rating: 4.8, reviews: 2800, coverUrl: "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&q=80&w=240&h=360" },
  { id: 14, title: "The Very Hungry Caterpillar", author: "Eric Carle", category: "Kids", price: "449", badge: "New", rating: 4.8, reviews: 3100, coverUrl: "https://images.unsplash.com/photo-1550399105-c4db5fb85c18?auto=format&fit=crop&q=80&w=240&h=360" },
  { id: 15, title: "Thinking, Fast and Slow", author: "Daniel Kahneman", category: "Adults", price: "1199", oldPrice: "1799", badge: "Best", rating: 4.6, reviews: 1650, coverUrl: "https://images.unsplash.com/photo-1506880018603-83d5b814b5a6?auto=format&fit=crop&q=80&w=240&h=360" },
  { id: 16, title: "Winnie-the-Pooh", author: "A.A. Milne", category: "Kids", price: "529", badge: "New", rating: 4.7, reviews: 890, coverUrl: "https://images.unsplash.com/photo-1532012197267-da84d127e765?auto=format&fit=crop&q=80&w=240&h=360" },
  { id: 17, title: "The Hobbit", author: "J.R.R. Tolkien", category: "Fiction", price: "849", oldPrice: "1199", badge: "Best", rating: 4.9, reviews: 4500, coverUrl: "https://images.unsplash.com/photo-1629196914275-357e62d478a5?auto=format&fit=crop&q=80&w=240&h=360" },
  { id: 18, title: "Dune", author: "Frank Herbert", category: "Science", price: "799", badge: "New", rating: 4.8, reviews: 2900, coverUrl: "https://images.unsplash.com/photo-1522002302302-613d96df2bd0?auto=format&fit=crop&q=80&w=240&h=360" },
  { id: 19, title: "The Diary of a Young Girl", author: "Anne Frank", category: "Biography", price: "649", oldPrice: "899", badge: "Sale", rating: 4.9, reviews: 3100, coverUrl: "https://images.unsplash.com/photo-1588666309990-d68f08e3d4a6?auto=format&fit=crop&q=80&w=240&h=360" },
  { id: 20, title: "Good to Great", author: "Jim Collins", category: "Business", price: "999", badge: "Best", rating: 4.7, reviews: 1500, coverUrl: "https://images.unsplash.com/photo-1589829085413-56de8ae18c73?auto=format&fit=crop&q=80&w=240&h=360" },
  { id: 21, title: "Gone Girl", author: "Gillian Flynn", category: "Thriller", price: "749", oldPrice: "1099", badge: "Sale", rating: 4.6, reviews: 2200, coverUrl: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&q=80&w=240&h=360" },
  { id: 22, title: "The Notebook", author: "Nicholas Sparks", category: "Romance", price: "599", badge: "New", rating: 4.7, reviews: 1800, coverUrl: "https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&q=80&w=240&h=360" },
  { id: 23, title: "A Brief History of Time", author: "Stephen Hawking", category: "Science", price: "899", oldPrice: "1299", badge: "Best", rating: 4.8, reviews: 3400, coverUrl: "https://images.unsplash.com/photo-1618666012174-83b441c0bc76?auto=format&fit=crop&q=80&w=240&h=360" },
  { id: 24, title: "Guns, Germs, and Steel", author: "Jared Diamond", category: "History", price: "949", badge: "Sale", rating: 4.6, reviews: 1200, coverUrl: "https://images.unsplash.com/photo-1603284569248-821525309698?auto=format&fit=crop&q=80&w=240&h=360" }
];

export const getBooks = () => {
  const stored = localStorage.getItem('bookshibooks_v4');
  if (stored) {
    const data = JSON.parse(stored);
    // if old data has fewer books, refresh
    if (data.length < 24) {
      localStorage.setItem('bookshibooks_v4', JSON.stringify(INITIAL_BOOKS));
      return INITIAL_BOOKS;
    }
    return data;
  }
  localStorage.setItem('bookshibooks_v4', JSON.stringify(INITIAL_BOOKS));
  return INITIAL_BOOKS;
};

export const addBook = (book) => {
  const books = getBooks();
  const newBook = { ...book, id: Date.now() };
  const updated = [newBook, ...books];
  localStorage.setItem('bookshibooks_v4', JSON.stringify(updated));
  return newBook;
};

export const getBookById = (id) => {
  const books = getBooks();
  return books.find(b => b.id === Number(id));
};

export const deleteBook = (id) => {
  const books = getBooks();
  const updated = books.filter(b => b.id !== Number(id));
  localStorage.setItem('bookshibooks_v4', JSON.stringify(updated));
  return updated;
};
