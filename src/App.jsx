import { useState, createContext, useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './utils/AuthContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import AddBook from './pages/AddBook';
import CartPage from './pages/CartPage';
import BookDetail from './pages/BookDetail';
import ManageBooks from './pages/ManageBooks';
import AdminLogin from './pages/AdminLogin';
import Profile from './pages/Profile';
import AdminSettings from './pages/AdminSettings';
import Shop from './pages/Shop';
import './App.css';

export const CartContext = createContext(null);
export const useCart = () => useContext(CartContext);

// Protected route wrapper for admin pages
const AdminRoute = ({ element }) => {
  const { isAdmin } = useAuth();
  return isAdmin ? element : <Navigate to="/admin" replace />;
};

function AppContent() {
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
  
  const clearCart = () => setCartItems([]);

  const totalCount = cartItems.reduce((s, i) => s + i.qty, 0);

  return (
    <CartContext.Provider value={{ cartItems, addToCart, removeFromCart, updateQty, clearCart, totalCount }}>
      <Router>
        <div className="app-shell">
          <Navbar />
          <main className="app-main">
            <Routes>
              {/* User Routes */}
              <Route path="/" element={<Home />} />
              <Route path="/shop" element={<Shop />} />
              <Route path="/book/:id" element={<BookDetail />} />
              <Route path="/cart" element={<CartPage />} />
              <Route path="/profile" element={<Profile />} />

              {/* Admin Login */}
              <Route path="/admin" element={<AdminLogin />} />

              {/* Protected Admin Routes */}
              <Route path="/manage" element={<AdminRoute element={<ManageBooks />} />} />
              <Route path="/add-book" element={<AdminRoute element={<AddBook />} />} />
              <Route path="/settings" element={<AdminRoute element={<AdminSettings />} />} />
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

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
