import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { db } from '../utils/firebase';
import { collection, getDocs, deleteDoc, doc, query, orderBy, updateDoc } from 'firebase/firestore';
import { Search, Trash2, Eye, Filter, Package } from 'lucide-react';
import './ManageBooks.css';

const CATEGORIES = ['All', 'Fiction', 'Non-Fiction', 'Children', 'Thriller', 'Romance', 'Biography', 'History', 'Textbook', 'Kids', 'Adults'];

const ManageBooks = () => {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [catFilter, setCatFilter] = useState('All');
  const [stockFilter, setStockFilter] = useState('All'); // All | InStock | OutOfStock
  const [editingQty, setEditingQty] = useState(null); // { id, value }

  useEffect(() => {
    fetchBooks();
  }, []);

  const fetchBooks = async () => {
    setLoading(true);
    try {
      const q = query(collection(db, 'books'), orderBy('createdAt', 'desc'));
      const snap = await getDocs(q);
      setBooks(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to remove this book?')) return;
    await deleteDoc(doc(db, 'books', id));
    setBooks(prev => prev.filter(b => b.id !== id));
  };

  const handleQtySave = async (id) => {
    if (!editingQty) return;
    const newQty = Number(editingQty.value);
    await updateDoc(doc(db, 'books', id), { quantity: newQty });
    setBooks(prev => prev.map(b => b.id === id ? { ...b, quantity: newQty } : b));
    setEditingQty(null);
  };

  const filtered = useMemo(() => {
    return books.filter(b => {
      const matchSearch = !search ||
        b.title?.toLowerCase().includes(search.toLowerCase()) ||
        b.author?.toLowerCase().includes(search.toLowerCase());
      const matchCat = catFilter === 'All' || b.category === catFilter;
      const qty = Number(b.quantity ?? 0);
      const matchStock = stockFilter === 'All' ||
        (stockFilter === 'InStock' && qty > 0) ||
        (stockFilter === 'OutOfStock' && qty <= 0);
      return matchSearch && matchCat && matchStock;
    });
  }, [books, search, catFilter, stockFilter]);

  return (
    <main className="manage-page container fade-up">
      <div className="manage-header">
        <h1 className="manage-title">Manage Books <span style={{ fontSize: '1rem', fontWeight: '500', color: 'var(--text-3)' }}>({filtered.length} of {books.length})</span></h1>
        <Link to="/add-book" className="btn btn-navy">+ Add New Book</Link>
      </div>

      {/* Filters Bar */}
      <div className="manage-filters-bar">
        <div className="manage-search-wrap">
          <Search size={16} />
          <input
            type="text"
            placeholder="Search by title or author..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="manage-search-input"
          />
        </div>

        <select className="manage-filter-select" value={catFilter} onChange={e => setCatFilter(e.target.value)}>
          {CATEGORIES.map(c => <option key={c} value={c}>{c === 'All' ? '📂 All Categories' : c}</option>)}
        </select>

        <select className="manage-filter-select" value={stockFilter} onChange={e => setStockFilter(e.target.value)}>
          <option value="All">📦 All Stock</option>
          <option value="InStock">✅ In Stock</option>
          <option value="OutOfStock">❌ Out of Stock</option>
        </select>
      </div>

      <div className="manage-content">
        {loading ? (
          <div style={{ padding: '60px', textAlign: 'center', color: 'var(--text-3)' }}>Loading books...</div>
        ) : filtered.length === 0 ? (
          <div className="manage-empty">
            <p>No books found matching your filters.</p>
            <button className="btn btn-outline" onClick={() => { setSearch(''); setCatFilter('All'); setStockFilter('All'); }}>Clear Filters</button>
          </div>
        ) : (
          <div className="manage-table-wrap">
            <table className="manage-table">
              <thead>
                <tr>
                  <th>Book</th>
                  <th>Category</th>
                  <th>Price</th>
                  <th>Stock / Qty</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(b => {
                  const qty = Number(b.quantity ?? 0);
                  return (
                    <tr key={b.id} className={qty <= 0 ? 'row-out-of-stock' : ''}>
                      <td>
                        <div className="manage-book-cell">
                          <img src={b.coverUrl || b.image} alt={b.title} className="manage-thumb" onError={e => e.target.style.display='none'} />
                          <div className="manage-book-info">
                            <div className="manage-book-title">{b.title}</div>
                            <div className="manage-book-author">by {b.author}</div>
                          </div>
                        </div>
                      </td>
                      <td><span className="manage-cat-badge">{b.category}</span></td>
                      <td>
                        <div className="manage-price-col">
                          <span className="manage-price">₹{b.price}</span>
                          {b.oldPrice && <span className="manage-oldprice">₹{b.oldPrice}</span>}
                        </div>
                      </td>
                      <td>
                        {editingQty?.id === b.id ? (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <input
                              type="number"
                              min="0"
                              value={editingQty.value}
                              onChange={e => setEditingQty({ ...editingQty, value: e.target.value })}
                              style={{ width: '60px', padding: '4px 8px', border: '1px solid var(--border)', borderRadius: '4px' }}
                            />
                            <button onClick={() => handleQtySave(b.id)} style={{ padding: '4px 8px', background: '#16a34a', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '0.8rem' }}>Save</button>
                            <button onClick={() => setEditingQty(null)} style={{ padding: '4px 8px', background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: '4px', cursor: 'pointer', fontSize: '0.8rem' }}>Cancel</button>
                          </div>
                        ) : (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span className={`stock-badge ${qty <= 0 ? 'out' : qty <= 3 ? 'low' : 'ok'}`}>
                              {qty <= 0 ? '❌ Out' : qty <= 3 ? `⚠️ ${qty} left` : `✅ ${qty}`}
                            </span>
                            <button
                              onClick={() => setEditingQty({ id: b.id, value: String(qty) })}
                              style={{ padding: '3px 8px', background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: '4px', cursor: 'pointer', fontSize: '0.78rem' }}
                            >
                              Edit
                            </button>
                          </div>
                        )}
                      </td>
                      <td>
                        <div className="manage-actions">
                          <Link to={`/book/${b.id}`} className="btn-icon view-btn" title="View"><Eye size={16} /></Link>
                          <button className="btn-icon delete-btn" title="Delete" onClick={() => handleDelete(b.id)}><Trash2 size={16} /></button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </main>
  );
};

export default ManageBooks;
