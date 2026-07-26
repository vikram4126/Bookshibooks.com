import { useState } from 'react';
import { Link } from 'react-router-dom';
import './BookCard.css';

const BookCard = ({ book }) => {
  const [liked, setLiked] = useState(false);

  const discount = book.oldPrice
    ? Math.round((1 - book.price / book.oldPrice) * 100)
    : null;

  return (
    <Link to={`/book/${book.id}`} className="bcard">
      {/* Image */}
      <div className="bcard-img-wrap">
        <img
          src={book.coverUrl || 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&q=80&w=240&h=360'}
          alt={book.title}
          className="bcard-img"
          loading="lazy"
        />
        {discount && <span className="bcard-discount">-{discount}%</span>}
        {book.badge && !discount && (
          <span className={`bcard-badge bcard-badge-${book.badge.toLowerCase()}`}>{book.badge}</span>
        )}
        <button
          className={`bcard-wish ${liked ? 'wished' : ''}`}
          onClick={(e) => {
            e.preventDefault(); // Prevent navigating when liking
            setLiked(l => !l);
          }}
          aria-label="Wishlist"
        >
          {liked ? '❤️' : '🤍'}
        </button>
      </div>

      {/* Info */}
      <div className="bcard-body">
        <h3 className="bcard-title" title={book.title}>{book.title}</h3>
        
        <div className="bcard-price-row">
          <span className="bcard-price">₹{Number(book.price).toLocaleString('en-IN')}</span>
          {book.oldPrice && <span className="bcard-mrp">₹{Number(book.oldPrice).toLocaleString('en-IN')}</span>}
          {discount && <span className="bcard-discount-text">({discount}% off)</span>}
        </div>
      </div>
    </Link>
  );
};

export default BookCard;
