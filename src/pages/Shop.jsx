import { useState, useEffect, useMemo } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { getBooks } from '../utils/storage';
import BookCard from '../components/BookCard';
import { SlidersHorizontal, X, ChevronDown, ChevronUp } from 'lucide-react';
import './Shop.css';

const CATEGORIES = ['Fiction', 'Non-Fiction', 'Children', 'Thriller', 'Romance', 'Biography', 'History', 'Textbook'];
const CONDITIONS = ['New', 'Like New', 'Good', 'Acceptable'];
const LANGUAGES = ['English', 'Hindi', 'French', 'German', 'Spanish'];
const PRICE_RANGES = [
  { label: 'Under ₹300', min: 0, max: 300 },
  { label: '₹300 – ₹600', min: 300, max: 600 },
  { label: '₹600 – ₹1000', min: 600, max: 1000 },
  { label: 'Above ₹1000', min: 1000, max: Infinity },
];

const SORT_OPTIONS = [
  { label: 'Newest First', value: 'newest' },
  { label: 'Price: Low to High', value: 'price_asc' },
  { label: 'Price: High to Low', value: 'price_desc' },
  { label: 'Name: A–Z', value: 'name_asc' },
];

const FilterSection = ({ title, children, defaultOpen = true }) => {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="filter-section">
      <button className="filter-section-title" onClick={() => setOpen(o => !o)}>
        <span>{title}</span>
        {open ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
      </button>
      {open && <div className="filter-section-body">{children}</div>}
    </div>
  );
};

const Shop = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [allBooks, setAllBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const catParam = searchParams.get('category') || '';
  const [selectedCats, setSelectedCats] = useState(catParam ? [catParam] : []);
  const [selectedConditions, setSelectedConditions] = useState([]);
  const [selectedLanguages, setSelectedLanguages] = useState([]);
  const [selectedPrice, setSelectedPrice] = useState(null);
  const [sort, setSort] = useState('newest');
  const [search, setSearch] = useState(searchParams.get('q') || '');

  useEffect(() => {
    getBooks().then(data => { setAllBooks(data); setLoading(false); });
  }, []);

  // Sync category from URL param on first load
  useEffect(() => {
    const cat = searchParams.get('category');
    if (cat) setSelectedCats([cat]);
  }, []);

  const toggleFilter = (arr, setArr, val) => {
    setArr(prev => prev.includes(val) ? prev.filter(v => v !== val) : [...prev, val]);
  };

  const clearAll = () => {
    setSelectedCats([]);
    setSelectedConditions([]);
    setSelectedLanguages([]);
    setSelectedPrice(null);
    setSearch('');
  };

  const hasFilters = selectedCats.length > 0 || selectedConditions.length > 0 || selectedLanguages.length > 0 || selectedPrice || search;

  const filteredBooks = useMemo(() => {
    let books = [...allBooks];

    if (search) {
      const q = search.toLowerCase();
      books = books.filter(b => b.title?.toLowerCase().includes(q) || b.author?.toLowerCase().includes(q));
    }
    if (selectedCats.length > 0) {
      books = books.filter(b => selectedCats.includes(b.category));
    }
    if (selectedConditions.length > 0) {
      books = books.filter(b => selectedConditions.includes(b.condition));
    }
    if (selectedPrice) {
      books = books.filter(b => b.price >= selectedPrice.min && b.price < selectedPrice.max);
    }

    switch (sort) {
      case 'price_asc': books.sort((a, b) => a.price - b.price); break;
      case 'price_desc': books.sort((a, b) => b.price - a.price); break;
      case 'name_asc': books.sort((a, b) => a.title?.localeCompare(b.title)); break;
      default: books.sort((a, b) => b.createdAt - a.createdAt); break;
    }

    return books;
  }, [allBooks, search, selectedCats, selectedConditions, selectedPrice, sort]);

  return (
    <div className="shop-page container fade-up">
      {/* Breadcrumb */}
      <div className="shop-breadcrumb">
        <Link to="/">Home</Link> <span>/</span> <span>Shop</span>
        {selectedCats.length === 1 && <><span>/</span> <span>{selectedCats[0]}</span></>}
      </div>

      <div className="shop-layout">
        {/* Sidebar */}
        <aside className={`shop-sidebar ${sidebarOpen ? 'open' : ''}`}>
          <div className="sidebar-header">
            <h3>Filters</h3>
            <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
              {hasFilters && (
                <button className="clear-filters-btn" onClick={clearAll}>
                  <X size={14} /> Clear All
                </button>
              )}
              <button className="sidebar-close-btn" onClick={() => setSidebarOpen(false)}>
                <X size={20} />
              </button>
            </div>
          </div>

          {/* Search */}
          <div className="filter-search-wrap">
            <input
              type="text"
              placeholder="Search books, authors..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="filter-search-input"
            />
          </div>

          <FilterSection title="Category">
            {CATEGORIES.map(cat => (
              <label key={cat} className="filter-checkbox">
                <input
                  type="checkbox"
                  checked={selectedCats.includes(cat)}
                  onChange={() => toggleFilter(selectedCats, setSelectedCats, cat)}
                />
                <span>{cat}</span>
              </label>
            ))}
          </FilterSection>

          <FilterSection title="Price Range">
            {PRICE_RANGES.map(range => (
              <label key={range.label} className="filter-radio">
                <input
                  type="radio"
                  name="price"
                  checked={selectedPrice?.label === range.label}
                  onChange={() => setSelectedPrice(selectedPrice?.label === range.label ? null : range)}
                />
                <span>{range.label}</span>
              </label>
            ))}
          </FilterSection>

          <FilterSection title="Condition" defaultOpen={false}>
            {CONDITIONS.map(cond => (
              <label key={cond} className="filter-checkbox">
                <input
                  type="checkbox"
                  checked={selectedConditions.includes(cond)}
                  onChange={() => toggleFilter(selectedConditions, setSelectedConditions, cond)}
                />
                <span>{cond}</span>
              </label>
            ))}
          </FilterSection>

          <FilterSection title="Language" defaultOpen={false}>
            {LANGUAGES.map(lang => (
              <label key={lang} className="filter-checkbox">
                <input
                  type="checkbox"
                  checked={selectedLanguages.includes(lang)}
                  onChange={() => toggleFilter(selectedLanguages, setSelectedLanguages, lang)}
                />
                <span>{lang}</span>
              </label>
            ))}
          </FilterSection>
        </aside>

        {/* Overlay for mobile */}
        {sidebarOpen && <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)} />}

        {/* Main content */}
        <div className="shop-main">
          <div className="shop-toolbar">
            <button className="filter-toggle-btn" onClick={() => setSidebarOpen(true)}>
              <SlidersHorizontal size={18} /> Filters
              {hasFilters && <span className="filter-count-badge">{selectedCats.length + selectedConditions.length + selectedLanguages.length + (selectedPrice ? 1 : 0)}</span>}
            </button>

            <div className="shop-results-info">
              {loading ? 'Loading...' : `${filteredBooks.length} books found`}
            </div>

            <select
              className="sort-select"
              value={sort}
              onChange={e => setSort(e.target.value)}
            >
              {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>

          {/* Active filters */}
          {hasFilters && (
            <div className="active-filters">
              {selectedCats.map(cat => (
                <span key={cat} className="filter-tag" onClick={() => toggleFilter(selectedCats, setSelectedCats, cat)}>
                  {cat} <X size={12} />
                </span>
              ))}
              {selectedConditions.map(cond => (
                <span key={cond} className="filter-tag" onClick={() => toggleFilter(selectedConditions, setSelectedConditions, cond)}>
                  {cond} <X size={12} />
                </span>
              ))}
              {selectedPrice && (
                <span className="filter-tag" onClick={() => setSelectedPrice(null)}>
                  {selectedPrice.label} <X size={12} />
                </span>
              )}
            </div>
          )}

          {loading ? (
            <div className="shop-loading">
              {[...Array(8)].map((_, i) => <div key={i} className="skeleton-card" />)}
            </div>
          ) : filteredBooks.length === 0 ? (
            <div className="shop-empty">
              <p>No books found matching your filters.</p>
              <button className="btn btn-outline" onClick={clearAll}>Clear Filters</button>
            </div>
          ) : (
            <div className="shop-grid">
              {filteredBooks.map(book => <BookCard key={book.id} book={book} />)}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Shop;
