import { Link } from 'react-router-dom';
import { Phone, Mail, MapPin } from 'lucide-react';
import './Footer.css';

const Footer = () => (
  <footer className="footer">
    <div className="container footer-grid">
      <div>
        <div className="footer-brand-name">📚 BookshiBooks</div>
        <p className="footer-brand-desc">India's destination for authentic UK-imported books. Sourced directly from the UK — delivered to every corner of India.</p>
        <div className="footer-parent-company">A unit of <strong>Anmol Tradings</strong></div>
        <div className="footer-socials" style={{ marginTop: '16px', display: 'flex', gap: '12px' }}>
          <a href="https://instagram.com" target="_blank" rel="noreferrer" className="social-icon-link" aria-label="Instagram">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
          </a>
          <a href="https://facebook.com" target="_blank" rel="noreferrer" className="social-icon-link" aria-label="Facebook">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path></svg>
          </a>
          <a href="https://twitter.com" target="_blank" rel="noreferrer" className="social-icon-link" aria-label="Twitter">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z"></path></svg>
          </a>
          <a href="https://linkedin.com" target="_blank" rel="noreferrer" className="social-icon-link" aria-label="LinkedIn">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path><rect x="2" y="9" width="4" height="12"></rect><circle cx="4" cy="4" r="2"></circle></svg>
          </a>
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
          {['Track Order','FAQs','Privacy Policy','Terms & Conditions'].map(l => (
            <li key={l}><Link to="/">{l}</Link></li>
          ))}
          <li><Link to="/admin">🔑 Admin Portal</Link></li>
        </ul>
      </div>
      <div>
        <p className="footer-col-title">Contact Support</p>
        <ul className="footer-links" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Phone size={16} /> <span>+91 8750777784 (Rohit Kumar)</span>
          </li>
          <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Mail size={16} /> <span>hello@bookshibooks.com</span>
          </li>
          <li style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', lineHeight: '1.4' }}>
            <MapPin size={16} style={{ flexShrink: 0, marginTop: '2px' }} /> 
            <span>S 363 A school block shakarpur, near water plant, Delhi</span>
          </li>
        </ul>
      </div>
    </div>
    <div className="footer-bottom">
      <div className="container">
        © {new Date().getFullYear()} BookshiBooks.com · All rights reserved · Unit of Anmol Tradings
      </div>
    </div>
  </footer>
);

export default Footer;
