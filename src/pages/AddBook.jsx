import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { addBook } from '../utils/storage';
import './AddBook.css';

const AddBook = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({ title: '', author: '', category: 'Kids', price: '', oldPrice: '', coverUrl: '', badge: '' });
  const [submitted, setSubmitted] = useState(false);

  const handleChange = e => setForm(p => ({ ...p, [e.target.name]: e.target.value }));

  const handleSubmit = e => {
    e.preventDefault();
    addBook(form);
    setSubmitted(true);
    setTimeout(() => navigate('/'), 1500);
  };

  return (
    <div className="addbook-page">
      <div className="container addbook-container">
        {/* Sidebar info */}
        <div className="addbook-info fade-up">
          <h2>📋 List Your Book</h2>
          <p>Add your book to the BookshiBooks catalogue and reach thousands of readers across the UK.</p>
          <div className="addbook-tips">
            <div className="tip-item">📸 <strong>Cover Image</strong> — Paste a direct image URL for best display</div>
            <div className="tip-item">💷 <strong>Price</strong> — Set a competitive price for faster sales</div>
            <div className="tip-item">🏷️ <strong>Old Price</strong> — Shows discount to attract buyers</div>
            <div className="tip-item">📌 <strong>Badge</strong> — Mark as New, Sale, or Best to highlight</div>
          </div>
        </div>

        {/* Form */}
        <div className="addbook-form-card fade-up">
          {submitted ? (
            <div className="success-msg">
              <div style={{fontSize:'3rem'}}>✅</div>
              <h3>Book Listed Successfully!</h3>
              <p>Redirecting to homepage...</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="addbook-form">
              <h3 className="form-heading">Book Details</h3>

              <div className="form-group">
                <label htmlFor="title">Book Title *</label>
                <input id="title" name="title" type="text" placeholder="e.g. The Gruffalo" value={form.title} onChange={handleChange} required />
              </div>

              <div className="form-group">
                <label htmlFor="author">Author *</label>
                <input id="author" name="author" type="text" placeholder="e.g. Julia Donaldson" value={form.author} onChange={handleChange} required />
              </div>

              <div className="form-row-2">
                <div className="form-group">
                  <label htmlFor="category">Category *</label>
                  <select id="category" name="category" value={form.category} onChange={handleChange}>
                    <option value="Kids">Kids</option>
                    <option value="Adults">Adults</option>
                    <option value="Fiction">Fiction</option>
                    <option value="Non-Fiction">Non-Fiction</option>
                    <option value="Textbook">Textbook</option>
                  </select>
                </div>
                <div className="form-group">
                  <label htmlFor="badge">Badge</label>
                  <select id="badge" name="badge" value={form.badge} onChange={handleChange}>
                    <option value="">None</option>
                    <option value="New">New</option>
                    <option value="Sale">Sale</option>
                    <option value="Best">Bestseller</option>
                  </select>
                </div>
              </div>

              <div className="form-row-2">
                <div className="form-group">
                  <label htmlFor="price">Price (£) *</label>
                  <input id="price" name="price" type="number" step="0.01" min="0" placeholder="0.00" value={form.price} onChange={handleChange} required />
                </div>
                <div className="form-group">
                  <label htmlFor="oldPrice">Original Price (£)</label>
                  <input id="oldPrice" name="oldPrice" type="number" step="0.01" min="0" placeholder="Optional" value={form.oldPrice} onChange={handleChange} />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="coverUrl">Cover Image URL</label>
                <input id="coverUrl" name="coverUrl" type="url" placeholder="https://example.com/cover.jpg" value={form.coverUrl} onChange={handleChange} />
                {form.coverUrl && (
                  <div className="cover-preview">
                    <img src={form.coverUrl} alt="Preview" onError={e => e.target.style.display='none'} />
                  </div>
                )}
              </div>

              <button type="submit" className="btn btn-red btn-full" style={{marginTop:'8px', fontSize:'1rem', padding:'14px'}}>
                📋 List Book Now
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default AddBook;
