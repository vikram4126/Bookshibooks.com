import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { getBooks } from '../utils/storage';
import BookCard from '../components/BookCard';
import BookSlider from '../components/BookSlider';
import { 
  Book, Baby, Trophy, Search, Heart, Clock, Briefcase, GraduationCap, 
  Truck, ShieldCheck, RefreshCcw, Lock, BookOpen
} from 'lucide-react';
import './Home.css';

const CATEGORIES = [
  { icon: <Book size={24} />, name: 'Fiction' },
  { icon: <Baby size={24} />, name: 'Children' },
  { icon: <Trophy size={24} />, name: 'Bestsellers' },
  { icon: <Search size={24} />, name: 'Thriller' },
  { icon: <Heart size={24} />, name: 'Romance' },
  { icon: <Clock size={24} />, name: 'History' },
  { icon: <Briefcase size={24} />, name: 'Business' },
  { icon: <GraduationCap size={24} />, name: 'Textbook' },
];

const Home = () => {
  const [books, setBooks] = useState([]);
  const [searchParams] = useSearchParams();
  const activeCat = searchParams.get('cat') || 'All';

  useEffect(() => {
    getBooks().then(data => setBooks(data));
  }, []);

  const bestsellers = books.filter(b => b.badge === 'Best');
  const newArrivals = books.filter(b => b.badge === 'New');
  const onSale     = books.filter(b => b.oldPrice);
  const kids       = books.filter(b => b.category === 'Kids');
  const adults     = books.filter(b => b.category === 'Adults');
  const textbooks  = books.filter(b => b.category === 'Textbook');

  // Active category filter for the "All Books" grid
  const filteredBooks = (() => {
    switch (activeCat) {
      case 'Kids':     return kids;
      case 'Adults':   return adults;
      case 'Textbook': return textbooks;
      case 'Sale':     return onSale;
      case 'New':      return newArrivals;
      case 'All':
      default:         return books;
    }
  })();

  const isFiltered = activeCat !== 'All';

  return (
    <main className="home">
      {/* ── Hero ── */}
      <section className="hero">
        <div className="container hero-inner">
          <div className="hero-content fade-up">
            <span className="hero-eyebrow">🇮🇳 Pan India Delivery Available &nbsp;·&nbsp; 🇬🇧 UK Imported Books</span>
            <h1 className="hero-title">
              Authentic UK Books<br /><span>Delivered to Your Door</span>
            </h1>
            <p className="hero-subtitle">
              Premium new &amp; pre-loved books imported directly from the UK. Kids' classics to adult bestsellers — all at India-friendly prices.
            </p>
            <div className="hero-actions">
              <Link to="/?cat=All" className="btn btn-red">Shop All Books</Link>
              <Link to="/add-book" className="btn btn-outline-white">List a Book</Link>
            </div>
            <div className="hero-stats">
              <div><div className="hero-stat-num">10K+</div><div className="hero-stat-label">UK Books Available</div></div>
              <div><div className="hero-stat-num">4.8★</div><div className="hero-stat-label">Avg Rating</div></div>
              <div><div className="hero-stat-num">Free</div><div className="hero-stat-label">Delivery Above ₹999</div></div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Trust bar ── */}
      <div className="trust-bar">
        <div className="container trust-bar-inner">
          {[
            { icon: <Truck size={24} />, text: 'Free Delivery on ₹999+' },
            { icon: <Book size={24} />, text: 'Genuine UK Books' },
            { icon: <ShieldCheck size={24} />, text: 'Quality Checked' },
            { icon: <RefreshCcw size={24} />, text: '7-Day Easy Returns' },
            { icon: <Lock size={24} />, text: 'Secure Payments' },
          ].map(t => (
            <div key={t.text} className="trust-item">
              <span className="trust-icon">{t.icon}</span>
              <span>{t.text}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── If a category is active from cat-bar, show filtered grid ── */}
      {isFiltered ? (
        <div className="container section-wrap">
          <div className="section-header">
            <h2 className="section-title">
              {activeCat === 'Kids' ? <Baby size={28} style={{marginRight: 8}} /> : activeCat === 'Adults' ? <Book size={28} style={{marginRight: 8}} /> : activeCat === 'Textbook' ? <GraduationCap size={28} style={{marginRight: 8}} /> : activeCat === 'Sale' ? <Trophy size={28} style={{marginRight: 8}} /> : <BookOpen size={28} style={{marginRight: 8}} />} {activeCat === 'Textbook' ? 'Textbooks' : `${activeCat} Books`}
            </h2>
            <Link to="/" className="see-all-link">← Back to All</Link>
          </div>
          {filteredBooks.length === 0 ? (
            <div className="no-books">No books found in this category.</div>
          ) : (
            <div className="books-grid">
              {filteredBooks.map(b => <BookCard key={b.id} book={b} />)}
            </div>
          )}
        </div>
      ) : (
        <>
          {/* ── Shop by Category tiles ── */}
          <div className="container section-wrap">
            <div className="section-header">
              <h2 className="section-title">Shop by Category</h2>
            </div>
            <div className="cat-tiles">
              {CATEGORIES.map(c => (
                <Link to={`/?cat=${c.name}`} key={c.name} className="cat-tile">
                  <div className="cat-tile-icon">{c.icon}</div>
                  <div className="cat-tile-name">{c.name}</div>
                </Link>
              ))}
            </div>
          </div>

          {/* ── Promo banners ── */}
          <div className="container" style={{paddingBottom: '28px'}}>
            <div className="promo-grid">
              <div className="promo-card red">
                <span className="promo-emoji">📚</span>
                <div className="promo-label">Limited Time</div>
                <div className="promo-title">Summer Sale<br/>Up to 60% Off</div>
                <Link to="/?cat=Sale" className="btn btn-sm" style={{background:'#1e3a8a', color:'white', width:'fit-content'}}>Shop Now →</Link>
              </div>
              <div className="promo-card navy">
                <span className="promo-emoji">🧒</span>
                <div className="promo-label">For Little Readers</div>
                <div className="promo-title">Kids' Books<br/>Starting ₹299</div>
                <Link to="/?cat=Kids" className="btn btn-sm" style={{background:'rgba(255,255,255,0.2)', color:'white', width:'fit-content', border:'1px solid rgba(255,255,255,0.5)'}}>Explore →</Link>
              </div>
            </div>
          </div>

          {/* ── Bestsellers SLIDER ── */}
          {bestsellers.length > 0 && (
            <div className="container section-wrap">
              <div className="section-header">
                <h2 className="section-title">🏆 Bestsellers</h2>
                <Link to="/?cat=All" className="see-all-link">See All →</Link>
              </div>
              <BookSlider books={bestsellers} />
            </div>
          )}

          {/* ── Promo strip ── */}
          <div className="promo-strip">
            🎉 Use Code <span>WELCOME10</span> — Get 10% off your first order! &nbsp;·&nbsp; Free delivery on orders above ₹999
          </div>

          {/* ── New Arrivals SLIDER ── */}
          {newArrivals.length > 0 && (
            <div className="container section-wrap">
              <div className="section-header">
                <h2 className="section-title">✨ New Arrivals</h2>
                <Link to="/?cat=New" className="see-all-link">See All →</Link>
              </div>
              <BookSlider books={newArrivals} />
            </div>
          )}

          {/* ── Kids SLIDER ── */}
          {kids.length > 0 && (
            <div className="container section-wrap">
              <div className="section-header">
                <h2 className="section-title">🧒 Kids' Books</h2>
                <Link to="/?cat=Kids" className="see-all-link">See All →</Link>
              </div>
              <BookSlider books={kids} />
            </div>
          )}

          {/* ── Adults SLIDER ── */}
          {adults.length > 0 && (
            <div className="container section-wrap">
              <div className="section-header">
                <h2 className="section-title">📗 Adult Reads</h2>
                <Link to="/?cat=Adults" className="see-all-link">See All →</Link>
              </div>
              <BookSlider books={adults} />
            </div>
          )}

          {/* ── Textbooks SLIDER ── */}
          {textbooks.length > 0 && (
            <div className="container section-wrap">
              <div className="section-header">
                <h2 className="section-title">🎓 Textbooks</h2>
                <Link to="/?cat=Textbook" className="see-all-link">See All →</Link>
              </div>
              <BookSlider books={textbooks} />
            </div>
          )}

          {/* ── All Books grid (default) ── */}
          <div className="container section-wrap">
            <div className="section-header">
              <h2 className="section-title">All Books</h2>
            </div>
            <div className="books-grid">
              {books.map(b => <BookCard key={b.id} book={b} />)}
            </div>
          </div>
        </>
      )}

      {/* ── Why Choose Us ── */}
      <div className="container section-wrap">
        <div className="section-header">
          <h2 className="section-title">Why Choose BookshiBooks?</h2>
        </div>
        <div className="why-grid">
          {[
            { icon: '📦', title: 'Genuine UK Books', desc: 'Every book is imported directly from the UK — original editions, authentic quality.' },
            { icon: '✅', title: 'Quality Checked', desc: 'All books are inspected before dispatch. Condition is exactly as listed.' },
            { icon: '₹', title: 'India-Friendly Prices', desc: 'Best prices on UK imported books in India. Save big compared to Indian MRP.' },
            { icon: '🚀', title: 'Pan India Delivery', desc: 'Fast, reliable delivery to every corner of India. Free shipping above ₹999.' },
          ].map(w => (
            <div key={w.title} className="why-card">
              <div className="why-icon">{w.icon}</div>
              <div className="why-title">{w.title}</div>
              <div className="why-desc">{w.desc}</div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
};

export default Home;
