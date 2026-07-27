import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { db } from '../utils/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { useCart } from '../App';
import { useAuth } from '../utils/AuthContext';
import { Truck, CheckCircle, MapPin, AlertTriangle, Heart, Check } from 'lucide-react';
import './BookDetail.css';

const PLACEHOLDER = 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&q=80&w=400&h=600';

const BookDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { wishlistIds, toggleWishlist } = useAuth();
  const [book, setBook] = useState(null);
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);
  const [imgSrc, setImgSrc] = useState(PLACEHOLDER);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    const docRef = doc(db, 'books', id);
    getDoc(docRef).then(docSnap => {
      if (docSnap.exists()) {
        const data = { id: docSnap.id, ...docSnap.data() };
        setBook(data);
        setImgSrc(data.coverUrl || data.image || PLACEHOLDER);
      } else {
        setBook(null);
      }
    }).catch(err => {
      console.error(err);
      setBook(null);
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
            <span><Truck size={16} style={{marginRight: 6}}/> Free Delivery on ₹999+</span>
            <span><CheckCircle size={16} style={{marginRight: 6}}/> Quality Checked</span>
            <span><MapPin size={16} style={{marginRight: 6}}/> UK Imported</span>
          </div>

          {book.quantity !== undefined && (
            <div className="bd-stock-row">
              {Number(book.quantity) <= 0 ? (
                <span className="bd-stock bd-stock-out" style={{ color: '#ef4444', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: '600' }}>
                  <AlertTriangle size={16} /> Out of Stock
                </span>
              ) : Number(book.quantity) <= 3 ? (
                <span className="bd-stock bd-stock-low"><AlertTriangle size={16} style={{marginRight: 4}}/> Only {book.quantity} left in stock!</span>
              ) : (
                <span className="bd-stock bd-stock-ok"><CheckCircle size={16} style={{marginRight: 4}}/> {book.quantity} copies available</span>
              )}
            </div>
          )}

          <div className="bd-actions">
            {Number(book.quantity) > 0 && (
              <div className="bd-qty">
                <button onClick={() => setQty(q => Math.max(1, q - 1))}>−</button>
                <span>{qty}</span>
                <button onClick={() => setQty(q => q + 1)}>+</button>
              </div>
            )}
            <button 
              className="btn bd-add-btn btn-navy"
              onClick={handleAdd}
              disabled={Number(book.quantity) <= 0}
            >
              {Number(book.quantity) <= 0 ? 'Out of Stock' : added ? <><Check size={18} style={{marginRight: 4}}/> Added</> : 'Add to Cart'}
            </button>
            <button
              className="btn bd-wish-btn btn-outline"
              onClick={() => toggleWishlist(book.id)}
              title="Add to Wishlist"
            >
              <Heart size={20} fill={wishlistIds.includes(book.id) ? 'currentColor' : 'none'} />
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
