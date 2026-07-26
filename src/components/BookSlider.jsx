import { useRef } from 'react';
import BookCard from './BookCard';
import './BookSlider.css';

const BookSlider = ({ books }) => {
  const sliderRef = useRef(null);

  const scroll = (dir) => {
    const cardWidth = 195; // ~card width + gap
    sliderRef.current.scrollBy({ left: dir * cardWidth * 3, behavior: 'smooth' });
  };

  return (
    <div className="book-slider-wrap">
      <button className="slider-arrow slider-prev" onClick={() => scroll(-1)} aria-label="Previous">‹</button>
      <div className="book-slider" ref={sliderRef}>
        {books.map(b => (
          <div key={b.id} className="slider-card">
            <BookCard book={b} />
          </div>
        ))}
      </div>
      <button className="slider-arrow slider-next" onClick={() => scroll(1)} aria-label="Next">›</button>
    </div>
  );
};

export default BookSlider;
