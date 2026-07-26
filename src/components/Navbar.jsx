import { useState } from 'react';
import { Link, useLocation, useSearchParams, useNavigate } from 'react-router-dom';
import { useCart } from '../App';
import { useAdmin } from '../utils/AdminContext';
import './Navbar.css';

const Navbar = () => {
  const { totalCount } = useCart();
  const { isAdmin, logout } = useAdmin();
  const [query, setQuery] = useState('');
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const activeCat = searchParams.get('cat') || '';

  const handleSearch = (e) => { e.preventDefault(); };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const categories = [
    { label: '🏠 All Books', value: 'All' },
    { label: 'Fiction', value: 'Fiction' },
    { label: 'Non-Fiction', value: 'Non-Fiction' },
    { label: 'Children', value: 'Children' },
    { label: 'Thriller', value: 'Thriller' },
    { label: 'Romance', value: 'Romance' },
    { label: 'Biography', value: 'Biography' },
    { label: 'History', value: 'History' },
    { label: 'Textbooks', value: 'Textbook' },
  ];

  return (
    <header className="site-header">
      {/* Announcement bar */}
      <div className="announce-bar">
        <div className="container announce-inner">
          <span>🇮🇳 Pan India Delivery Available | 🇬🇧 UK Imported Books</span>
          <div className="announce-links">
            <Link to="/">Track Order</Link>
            <Link to="/">FAQs</Link>
            <Link to="/">Contact Us</Link>
            {isAdmin && <span className="admin-badge-bar">🔑 Admin Mode</span>}
          </div>
        </div>
      </div>

      {/* Main nav */}
      <nav className="main-nav">
        <div className="container main-nav-inner">
          <Link to="/" className="site-logo">
            <span className="logo-icon">📚</span>
            <div>
              <div className="logo-name">BookshiBooks</div>
              <div className="logo-sub">UK Books · India Delivery</div>
            </div>
          </Link>

          <form className="nav-search" onSubmit={handleSearch}>
            <input
              id="global-search"
              type="text"
              placeholder="Search books, authors..."
              value={query}
              onChange={e => setQuery(e.target.value)}
            />
            <button type="submit" className="search-submit">🔍 Search</button>
          </form>

          <div className="nav-right">
            {isAdmin ? (
              <>
                <Link to="/manage" className="nav-action-link admin-link">
                  <span className="nav-action-icon">⚙️</span>
                  <span>Manage</span>
                </Link>
                <Link to="/add-book" className="nav-action-link admin-link">
                  <span className="nav-action-icon">📋</span>
                  <span>Add Book</span>
                </Link>
                <button className="nav-action-link nav-logout-btn" onClick={handleLogout}>
                  <span className="nav-action-icon">🚪</span>
                  <span>Logout</span>
                </button>
              </>
            ) : (
              <Link to="/admin" className="nav-action-link" title="Admin Login">
                <span className="nav-action-icon">👤</span>
                <span>Admin</span>
              </Link>
            )}
            <Link to="/cart" className="nav-cart-btn" id="nav-cart-btn">
              <span className="cart-icon-wrap">
                🛒
                {totalCount > 0 && <span className="cart-count">{totalCount}</span>}
              </span>
              <span>Cart</span>
            </Link>
          </div>
        </div>
      </nav>

      {/* Category bar */}
      <div className="cat-bar">
        <div className="container cat-bar-inner">
          {categories.map(c => (
            <Link
              key={c.value}
              to={`/?cat=${c.value}`}
              className={`cat-bar-link ${
                activeCat === c.value ||
                (c.value === 'All' && !activeCat && location.pathname === '/')
                  ? 'active' : ''
              }`}
            >
              {c.label}
            </Link>
          ))}
          <Link to="/?cat=Sale" className={`cat-bar-link sale-link ${activeCat === 'Sale' ? 'active' : ''}`}>🔥 Sale</Link>
          <Link to="/?cat=Kids" className={`cat-bar-link kids-link ${activeCat === 'Kids' ? 'active' : ''}`}>🧒 Kids</Link>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
