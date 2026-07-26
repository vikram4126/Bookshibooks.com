import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { addBook } from '../utils/storage';
import './AddBook.css';

const AddBook = () => {
  const navigate = useNavigate();
  const [isbn, setIsbn] = useState('');
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ 
    title: '', author: '', category: 'Kids', condition: 'New', 
    price: '', oldPrice: '', coverUrl: '', badge: '', quantity: '1'
  });
  const [submitted, setSubmitted] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleChange = e => setForm(p => ({ ...p, [e.target.name]: e.target.value }));

  // Magic ISBN Fetcher with Fallback (Google -> Open Library)
  const handleFetchIsbn = async () => {
    if (!isbn) {
      setErrorMsg("Please enter an ISBN number first.");
      return;
    }
    setLoading(true);
    setErrorMsg('');
    try {
      // Step 1: Try Google Books API
      const googleRes = await fetch(`https://www.googleapis.com/books/v1/volumes?q=isbn:${isbn}`);
      const googleData = await googleRes.json();

      if (googleData.items && googleData.items.length > 0) {
        const bookData = googleData.items[0].volumeInfo;
        let cover = bookData.imageLinks?.thumbnail || form.coverUrl;
        if (cover && cover.startsWith('http:')) cover = cover.replace('http:', 'https:');

        setForm(prev => ({
          ...prev,
          title: bookData.title || prev.title,
          author: bookData.authors ? bookData.authors.join(', ') : prev.author,
          coverUrl: cover,
        }));
        setLoading(false);
        return; // Success, exit here
      }
      
      // Step 2: If Google fails, try Open Library API (Fallback)
      const olRes = await fetch(`https://openlibrary.org/api/books?bibkeys=ISBN:${isbn}&jscmd=data&format=json`);
      const olData = await olRes.json();
      const olBook = olData[`ISBN:${isbn}`];

      if (olBook) {
        setForm(prev => ({
          ...prev,
          title: olBook.title || prev.title,
          author: olBook.authors ? olBook.authors.map(a => a.name).join(', ') : prev.author,
          coverUrl: olBook.cover ? olBook.cover.large : prev.coverUrl,
        }));
      } else {
        setErrorMsg("Book not found in any database. You can still enter details manually.");
      }

    } catch (err) {
      setErrorMsg("Failed to fetch book data. Enter manually.");
    }
    setLoading(false);
  };

  const handleSubmit = async e => {
    e.preventDefault();
    await addBook(form);
    setSubmitted(true);
    setTimeout(() => navigate('/'), 1500);
  };

  return (
    <main className="addbook-page">
      <div className="container addbook-container">
        {/* Sidebar info */}
        <div className="addbook-info fade-up">
          <h2>📋 Auto-List Book</h2>
          <p>Scan or type the ISBN barcode to instantly fetch the book's title, author, and cover image from our global database.</p>
          <div className="addbook-tips">
            <div className="tip-item">📠 <strong>ISBN Scan</strong> — The barcode number on the back of the book</div>
            <div className="tip-item">🔍 <strong>Condition</strong> — Be honest about the physical condition</div>
            <div className="tip-item">₹ <strong>Pricing</strong> — Compare with Original MRP to show a discount</div>
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
            <div className="addbook-form-wrapper">
              
              {/* ISBN Fetch Section */}
              <div className="isbn-section">
                <h3 className="form-heading">Smart ISBN Scan</h3>
                <div className="isbn-input-group">
                  <input 
                    type="text" 
                    placeholder="Enter ISBN (e.g. 9780439554930)" 
                    value={isbn} 
                    onChange={e => setIsbn(e.target.value)}
                  />
                  <button type="button" onClick={handleFetchIsbn} disabled={loading} className="btn btn-navy">
                    {loading ? 'Fetching...' : '🔍 Fetch Book'}
                  </button>
                </div>
                {errorMsg && <p className="error-text" style={{color: 'var(--red)', fontSize: '0.85rem', marginTop: '8px'}}>{errorMsg}</p>}
              </div>

              <hr className="form-divider" />

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
                    <label htmlFor="condition">Condition *</label>
                    <select id="condition" name="condition" value={form.condition} onChange={handleChange}>
                      <option value="New">New</option>
                      <option value="Like New">Like New (Unread)</option>
                      <option value="Good">Good (Minor wear)</option>
                      <option value="Acceptable">Acceptable (Damaged/Old)</option>
                    </select>
                  </div>
                </div>

                <div className="form-row-2">
                  <div className="form-group">
                    <label htmlFor="price">Selling Price (₹) *</label>
                    <input id="price" name="price" type="number" step="1" min="0" placeholder="e.g. 299" value={form.price} onChange={handleChange} required />
                  </div>
                  <div className="form-group">
                    <label htmlFor="oldPrice">Original MRP (₹)</label>
                    <input id="oldPrice" name="oldPrice" type="number" step="1" min="0" placeholder="Optional" value={form.oldPrice} onChange={handleChange} />
                  </div>
                </div>

                <div className="form-row-2">
                  <div className="form-group">
                    <label htmlFor="quantity">Quantity in Stock *</label>
                    <input id="quantity" name="quantity" type="number" step="1" min="1" placeholder="e.g. 3" value={form.quantity} onChange={handleChange} required />
                    <small style={{color:'#64748b', fontSize:'0.78rem'}}>Kitni copies hain aapke paas?</small>
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

                <div className="form-group">
                  <label htmlFor="coverUrl">Cover Image URL</label>
                  <input id="coverUrl" name="coverUrl" type="url" placeholder="https://..." value={form.coverUrl} onChange={handleChange} />
                </div>

                {form.coverUrl && (
                  <div className="cover-preview" style={{ marginTop: '10px' }}>
                    <img src={form.coverUrl} alt="Preview" style={{maxHeight: '150px', borderRadius: '8px'}} onError={e => e.target.style.display='none'} />
                  </div>
                )}

                <button type="submit" className="btn btn-red btn-full" style={{marginTop:'16px', fontSize:'1rem', padding:'14px'}}>
                  📋 List Book Now
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </main>
  );
};

export default AddBook;
