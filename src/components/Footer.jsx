import { Link } from 'react-router-dom';
import './Footer.css';

const Footer = () => (
  <footer className="footer">
    <div className="container footer-grid">
      <div>
        <div className="footer-brand-name">📚 BookshiBooks</div>
        <p className="footer-brand-desc">India's destination for authentic UK-imported books. Premium new &amp; pre-loved books sourced directly from the UK — delivered to every corner of India.</p>
        <div className="footer-trust-badges">
          <span>🇮🇳 Pan India Delivery</span>
          <span>🇬🇧 Genuine UK Books</span>
          <span>✅ Quality Checked</span>
          <span>🔄 7-Day Returns</span>
        </div>
      </div>
      <div>
        <p className="footer-col-title">Our Links</p>
        <ul className="footer-links">
          {['About Us','Contact Us','Blog','Sell with Us','Wholesale'].map(l => (
            <li key={l}><Link to="/">{l}</Link></li>
          ))}
        </ul>
      </div>
      <div>
        <p className="footer-col-title">Quick Links</p>
        <ul className="footer-links">
          {['Track Order','FAQs','Privacy Policy','Terms & Conditions','Careers'].map(l => (
            <li key={l}><Link to="/">{l}</Link></li>
          ))}
        </ul>
      </div>
      <div>
        <p className="footer-col-title">Support</p>
        <ul className="footer-links">
          <li>📞 +44 20 0000 1234</li>
          <li>💬 WhatsApp Us</li>
          <li>✉️ hello@bookshibooks.com</li>
        </ul>
        <p className="footer-col-title" style={{marginTop:'20px'}}>Categories</p>
        <ul className="footer-links">
          {['Fiction','Non-Fiction','Children','Textbooks','Comics'].map(c => (
            <li key={c}><Link to={`/?cat=${c}`}>{c}</Link></li>
          ))}
        </ul>
      </div>
    </div>
    <div className="footer-bottom">
      <div className="container">
        © {new Date().getFullYear()} BookshiBooks.com · All rights reserved · Made with ❤️ for book lovers
      </div>
    </div>
  </footer>
);

export default Footer;
