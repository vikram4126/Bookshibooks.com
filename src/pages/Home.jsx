import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { db } from '../utils/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { getBooks } from '../utils/storage';
import BookSlider from '../components/BookSlider';
import { 
  Book, Baby, Trophy, Zap, Heart, Clock, GraduationCap,
  Truck, ShieldCheck, RefreshCcw, Lock, ArrowRight
} from 'lucide-react';
import './Home.css';

const CATEGORY_SECTIONS = [
  { name: 'Fiction', icon: <Book size={22} />, color: '#4f46e5', label: 'Fiction & Literature' },
  { name: 'Children', icon: <Baby size={22} />, color: '#f59e0b', label: "Children's Books" },
  { name: 'Thriller', icon: <Zap size={22} />, color: '#ef4444', label: 'Thriller & Mystery' },
  { name: 'Romance', icon: <Heart size={22} />, color: '#ec4899', label: 'Romance' },
  { name: 'History', icon: <Clock size={22} />, color: '#8b5cf6', label: 'History & Politics' },
];

const Home = () => {
  const [books, setBooks] = useState([]);
  const [bannerText, setBannerText] = useState('Use Code WELCOME10 — Get 10% off your first order!  ·  Free delivery on orders above ₹999');
  const [promos, setPromos] = useState([]);

  useEffect(() => {
    getBooks().then(data => setBooks(data));
    getDoc(doc(db, 'settings', 'site')).then(docSnap => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        if (data.homeBannerText) setBannerText(data.homeBannerText);
        if (data.promos && data.promos.length > 0) {
          setPromos(data.promos.filter(p => p.image));
        } else {
          // Fallback to legacy structure if they haven't saved yet
          if (data.summerBanner || data.kidsBanner) {
            setPromos([
              { image: data.summerBanner || '/summer-banner.png', link: '/shop' },
              { image: data.kidsBanner || '/kids-banner.png', link: '/shop?category=Children' }
            ]);
          } else {
            setPromos([
              { image: '/summer-banner.png', link: '/shop' },
              { image: '/kids-banner.png', link: '/shop?category=Children' }
            ]);
          }
        }
      }
    });
  }, []);

  const bestsellers = books.filter(b => b.badge === 'Best');
  const newArrivals = books.filter(b => b.badge === 'New');
  const onSale = books.filter(b => b.oldPrice);

  const getCategoryBooks = (name) => books.filter(b => b.category === name);

  return (
    <main className="home">
      {/* ── Hero ── */}
      <section className="hero">
        <div className="container hero-inner">
          <div className="hero-content fade-up">
            <span className="hero-eyebrow">🇮🇳 Pan India Delivery &nbsp;·&nbsp; 🇬🇧 UK Imported Books</span>
            <h1 className="hero-title">
              Authentic UK Books<br /><span>Delivered to Your Door</span>
            </h1>
            <p className="hero-subtitle">
              Premium new &amp; pre-loved books imported directly from the UK. Kids' classics to adult bestsellers — all at India-friendly prices.
            </p>
            <div className="hero-actions">
              <Link to="/shop" className="btn btn-red">Shop All Books</Link>
              <Link to="/shop?category=Children" className="btn btn-outline-white">Kids' Books</Link>
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
            { icon: <Truck size={22} />, text: 'Free Delivery on ₹999+' },
            { icon: <Book size={22} />, text: 'Genuine UK Books' },
            { icon: <ShieldCheck size={22} />, text: 'Quality Checked' },
            { icon: <RefreshCcw size={22} />, text: '7-Day Easy Returns' },
            { icon: <Lock size={22} />, text: 'Secure Payments' },
          ].map(t => (
            <div key={t.text} className="trust-item">
              <span className="trust-icon">{t.icon}</span>
              <span>{t.text}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Promo Text Strip ── */}
      <div className="promo-strip">{bannerText}</div>

      {/* ── Bestsellers Slider ── */}
      {bestsellers.length > 0 && (
        <div className="container section-wrap">
          <div className="section-header">
            <div className="section-title-wrap">
              <Trophy size={24} className="section-icon" style={{color: '#f59e0b'}} />
              <h2 className="section-title">Bestsellers</h2>
            </div>
            <Link to="/shop" className="see-all-link">See All <ArrowRight size={16} /></Link>
          </div>
          <BookSlider books={bestsellers} />
        </div>
      )}

      {/* ── Dynamic Promo BANNERS ── */}
      {promos.length > 0 && (
        <div className="container dual-banner-wrap">
          {promos.map((promo, idx) => (
            <Link key={idx} to={promo.link || '/shop'} className="dual-banner-link">
              <img src={promo.image} alt={`Promo ${idx+1}`} className="dual-banner-img" />
            </Link>
          ))}
        </div>
      )}

      {/* ── Fiction Slider ── */}
      {getCategoryBooks('Fiction').length > 0 && (
        <div className="container section-wrap">
          <div className="section-header">
            <div className="section-title-wrap">
              <Book size={24} className="section-icon" style={{color: '#4f46e5'}} />
              <h2 className="section-title">Fiction &amp; Literature</h2>
            </div>
            <Link to="/shop?category=Fiction" className="see-all-link">See All <ArrowRight size={16} /></Link>
          </div>
          <BookSlider books={getCategoryBooks('Fiction')} />
        </div>
      )}

      {/* ── Children's Books Slider ── */}
      {getCategoryBooks('Children').length > 0 && (
        <div className="container section-wrap">
          <div className="section-header">
            <div className="section-title-wrap">
              <Baby size={24} className="section-icon" style={{color: '#f59e0b'}} />
              <h2 className="section-title">Children's Books</h2>
            </div>
            <Link to="/shop?category=Children" className="see-all-link">See All <ArrowRight size={16} /></Link>
          </div>
          <BookSlider books={getCategoryBooks('Children')} />
        </div>
      )}


      {/* ── Thriller Slider ── */}
      {getCategoryBooks('Thriller').length > 0 && (
        <div className="container section-wrap">
          <div className="section-header">
            <div className="section-title-wrap">
              <Zap size={24} className="section-icon" style={{color: '#ef4444'}} />
              <h2 className="section-title">Thriller &amp; Mystery</h2>
            </div>
            <Link to="/shop?category=Thriller" className="see-all-link">See All <ArrowRight size={16} /></Link>
          </div>
          <BookSlider books={getCategoryBooks('Thriller')} />
        </div>
      )}

      {/* ── Romance Slider ── */}
      {getCategoryBooks('Romance').length > 0 && (
        <div className="container section-wrap">
          <div className="section-header">
            <div className="section-title-wrap">
              <Heart size={24} className="section-icon" style={{color: '#ec4899'}} />
              <h2 className="section-title">Romance</h2>
            </div>
            <Link to="/shop?category=Romance" className="see-all-link">See All <ArrowRight size={16} /></Link>
          </div>
          <BookSlider books={getCategoryBooks('Romance')} />
        </div>
      )}

      {/* ── History Slider ── */}
      {getCategoryBooks('History').length > 0 && (
        <div className="container section-wrap">
          <div className="section-header">
            <div className="section-title-wrap">
              <Clock size={24} className="section-icon" style={{color: '#8b5cf6'}} />
              <h2 className="section-title">History &amp; Politics</h2>
            </div>
            <Link to="/shop?category=History" className="see-all-link">See All <ArrowRight size={16} /></Link>
          </div>
          <BookSlider books={getCategoryBooks('History')} />
        </div>
      )}

      {/* ── New Arrivals Slider ── */}
      {newArrivals.length > 0 && (
        <div className="container section-wrap">
          <div className="section-header">
            <div className="section-title-wrap">
              <GraduationCap size={24} className="section-icon" style={{color: '#10b981'}} />
              <h2 className="section-title">New Arrivals</h2>
            </div>
            <Link to="/shop" className="see-all-link">See All <ArrowRight size={16} /></Link>
          </div>
          <BookSlider books={newArrivals} />
        </div>
      )}

      {/* ── Why Choose Us ── */}
      <div className="container section-wrap">
        <div className="section-header">
          <div className="section-title-wrap">
            <h2 className="section-title">Why Choose BookshiBooks?</h2>
          </div>
        </div>
        <div className="why-grid">
          {[
            { icon: '📦', title: 'Genuine UK Books', desc: 'Every book imported directly from the UK — original editions, authentic quality.' },
            { icon: '✅', title: 'Quality Checked', desc: 'All books inspected before dispatch. Condition is exactly as listed.' },
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
