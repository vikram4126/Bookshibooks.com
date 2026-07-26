import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getBookById } from '../utils/storage';
import { useCart } from '../App';
import './BookDetail.css';

const PLACEHOLDER = 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&q=80&w=400&h=600';

const BookDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const [book, setBook] = useState(null);
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);
  const [imgSrc, setImgSrc] = useState(PLACEHOLDER);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    getBookById(id).then(data => {
      setBook(data);
      setImgSrc(data?.coverUrl || PLACEHOLDER);
    });
  }, [id]);

  if (!book) return <div className="container" style={{padding: '100px 20px', textAlign: 'center'}}>Loading...</div>;

  const discount = book.oldPrice
    ? Math.round((1 - book.price / book.oldPrice) * 100)
    : null;

  const handleAdd = () => {
    for (let i = 0; i < qty; i++) {
      addToCart(book);
    }
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  return (
    <article className="book-detail-page container fade-up">
      <button className="back-btn" onClick={() => navigate(-1)}>← Back</button>
      
      <div className="bd-layout">
        {/* Left: Image */}
        <div className="bd-image-col">
          <div className="bd-image-wrap">
            <img 
              src={imgSrc} 
              alt={book.title}
              className="bdetail-img"
              onError={() => setImgSrc(PLACEHOLDER)}
            />
            {book.badge && <span className={`bd-badge bd-badge-${book.badge.toLowerCase()}`}>{book.badge}</span>}
          </div>
        </div>

        {/* Right: Info & Actions */}
        <div className="bd-info-col">
          <p className="bd-category">{book.category}</p>
          <h1 className="bd-title">{book.title}</h1>
          <p className="bd-author">by <span>{book.author}</span></p>
          
          {book.rating && (
            <div className="bd-rating">
              <span className="bd-stars">{'★'.repeat(Math.floor(book.rating))}</span>
              <span className="bd-rating-num">{book.rating}</span>
              <span className="bd-reviews">({book.reviews} ratings)</span>
            </div>
          )}

          <div className="bd-divider" />

          <div className="bd-price-box">
            <div className="bd-price-row">
              <span className="bd-price">₹{Number(book.price).toLocaleString('en-IN')}</span>
              {book.oldPrice && (
                <>
                  <span className="bd-mrp">MRP: ₹{Number(book.oldPrice).toLocaleString('en-IN')}</span>
                  <span className="bd-discount">({discount}% OFF)</span>
                </>
              )}
            </div>
            <p className="bd-tax-note">Inclusive of all taxes</p>
          </div>

          <div className="bd-trust-strip">
            <span>🚚 Free Delivery on ₹999+</span>
            <span>✅ Quality Checked</span>
            <span>🇬🇧 UK Imported</span>
          </div>

          {book.quantity && (
            <div className="bd-stock-row">
              {Number(book.quantity) <= 3
                ? <span className="bd-stock bd-stock-low">⚠️ Only {book.quantity} left in stock!</span>
                : <span className="bd-stock bd-stock-ok">✅ {book.quantity} copies available</span>
              }
            </div>
          )}

          <div className="bd-actions">
            <div className="bd-qty">
              <button onClick={() => setQty(q => Math.max(1, q - 1))}>−</button>
              <span>{qty}</span>
              <button onClick={() => setQty(q => q + 1)}>+</button>
            </div>
            <button 
              className="btn bd-add-btn btn-red"
              disabled
              style={{ opacity: 0.7, cursor: 'not-allowed' }}
            >
              ⏳ Coming Soon
            </button>
          </div>

          <div className="bd-details-box">
            <h3>Book Details</h3>
            <div className="bd-detail-grid">
              <div className="bd-detail-item"><span>Format</span><span>Paperback</span></div>
              <div className="bd-detail-item"><span>Language</span><span>English</span></div>
              <div className="bd-detail-item"><span>Condition</span><span>{book.condition || 'Like New'}</span></div>
              <div className="bd-detail-item"><span>Origin</span><span>United Kingdom</span></div>
            </div>
          </div>

        </div>
      </div>
    </article>
  );
};

export default BookDetail;
