import { useState, createContext, useContext } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import AddBook from './pages/AddBook';
import CartPage from './pages/CartPage';
import BookDetail from './pages/BookDetail';
import ManageBooks from './pages/ManageBooks';
import './App.css';

export const CartContext = createContext(null);

export const useCart = () => useContext(CartContext);

function App() {
  const [cartItems, setCartItems] = useState([]);
  const [toastMsg, setToastMsg] = useState('');

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 2500);
  };

  const addToCart = (book) => {
    setCartItems(prev => {
      const exists = prev.find(i => i.id === book.id);
      if (exists) {
        return prev.map(i => i.id === book.id ? { ...i, qty: i.qty + 1 } : i);
      }
      return [...prev, { ...book, qty: 1 }];
    });
    showToast(`"${book.title}" added to cart!`);
  };

  const removeFromCart = (id) => setCartItems(prev => prev.filter(i => i.id !== id));
  const updateQty = (id, qty) => {
    if (qty < 1) { removeFromCart(id); return; }
    setCartItems(prev => prev.map(i => i.id === id ? { ...i, qty } : i));
  };

  const totalCount = cartItems.reduce((s, i) => s + i.qty, 0);

  return (
    <CartContext.Provider value={{ cartItems, addToCart, removeFromCart, updateQty, totalCount }}>
      <Router>
        <div className="app-shell">
          <Navbar />
          <main className="app-main">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/book/:id" element={<BookDetail />} />
              <Route path="/manage" element={<ManageBooks />} />
              <Route path="/add-book" element={<AddBook />} />
              <Route path="/cart" element={<CartPage />} />
            </Routes>
          </main>
          <Footer />
        </div>
        {toastMsg && (
          <div className="toast fade-up">
            <span className="toast-icon">🛒</span> {toastMsg}
          </div>
        )}
      </Router>
    </CartContext.Provider>
  );
}

export default App;
