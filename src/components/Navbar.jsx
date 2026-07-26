import { useState } from 'react';
import { Link, useLocation, useSearchParams } from 'react-router-dom';
import { useCart } from '../App';
import './Navbar.css';

const Navbar = () => {
  const { totalCount } = useCart();
  const [query, setQuery] = useState('');
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const activeCat = searchParams.get('cat') || '';

  const handleSearch = (e) => { e.preventDefault(); };

  const categories = [
    { label: '🏠 All Books', value: 'All' },
    { label: 'Fiction', value: 'Fiction' },
    { label: 'Non-Fiction', value: 'Non-Fiction' },
    { label: 'Children', value: 'Children' },
    { label: 'Thriller', value: 'Thriller' },
    { label: 'Romance', value: 'Romance' },
    { label: 'Biography', value: 'Biography' },
    { label: 'Science', value: 'Science' },
    { label: 'History', value: 'History' },
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
            <Link to="/manage" className="nav-action-link">
              <span className="nav-action-icon">⚙️</span>
              <span>Manage Books</span>
            </Link>
            <Link to="/add-book" className="nav-action-link">
              <span className="nav-action-icon">📋</span>
              <span>List a Book</span>
            </Link>
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
